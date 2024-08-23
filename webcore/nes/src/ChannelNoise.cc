/*
Copyright (c) 2012-2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
Copyright (c) 2006-2011 Jamie Sanders
A NES emulator in WebAssembly. Based on vNES.
Licensed under GPLV3 or later
Hosted at: https://github.com/workhorsy/SaltyNES
*/

#include "SaltyNES.h"


ChannelNoise::ChannelNoise() {
}

ChannelNoise::ChannelNoise(shared_ptr<PAPU>  papu) {
	this->papu = papu;

	_isEnabled = false;
	envDecayDisable = false;
	envDecayLoopEnable = false;
	lengthCounterEnable = false;
	envReset = false;
	shiftNow = false;
	lengthCounter = 0;
	progTimerCount = 0;
	progTimerMax = 0;
	envDecayRate = 0;
	envDecayCounter = 0;
	envVolume = 0;
	masterVolume = 0;
	shiftReg = 1 << 14;
	randomBit = 0;
	randomMode = 0;
	sampleValue = 0;
	accValue = 0;
	accCount = 1;
	tmp = 0;
}

ChannelNoise::~ChannelNoise() {
	papu = nullptr;
}

void ChannelNoise::clockLengthCounter() {
	if(lengthCounterEnable && lengthCounter > 0) {
		--lengthCounter;
		if(lengthCounter == 0) {
			updateSampleValue();
		}
	}
}

void ChannelNoise::clockEnvDecay() {
	if(envReset) {
		// Reset envelope:
		envReset = false;
		envDecayCounter = envDecayRate + 1;
		envVolume = 0xF;
	} else if(--envDecayCounter <= 0) {
		// Normal handling:
		envDecayCounter = envDecayRate + 1;
		if(envVolume > 0) {
			--envVolume;
		} else {
			envVolume = envDecayLoopEnable ? 0xF : 0;
		}
	}

	masterVolume = envDecayDisable ? envDecayRate : envVolume;
	updateSampleValue();
}

void ChannelNoise::updateSampleValue() {
	if(_isEnabled && lengthCounter > 0) {
		sampleValue = randomBit * masterVolume;
	}
}

void ChannelNoise::writeReg(int address, int value) {
	if(address == 0x400C) {
		// Volume/Envelope decay:
		envDecayDisable = ((value & 0x10) != 0);
		envDecayRate = value & 0xF;
		envDecayLoopEnable = ((value & 0x20) != 0);
		lengthCounterEnable = ((value & 0x20) == 0);
		masterVolume = envDecayDisable ? envDecayRate : envVolume;

	} else if(address == 0x400E) {

		// Programmable timer:
		progTimerMax = papu->getNoiseWaveLength(value & 0xF);
		randomMode = value >> 7;

	} else if(address == 0x400F) {

		// Length counter
		lengthCounter = papu->getLengthMax(value & 248);
		envReset = true;

	}

// Update:
//updateSampleValue();
}

void ChannelNoise::setEnabled(bool value) {
	_isEnabled = value;
	if(!value) {
		lengthCounter = 0;
	}
	updateSampleValue();
}

bool ChannelNoise::isEnabled() {
	return _isEnabled;
}

int ChannelNoise::getLengthStatus() {
	return ((lengthCounter == 0 || !_isEnabled) ? 0 : 1);
}

void ChannelNoise::reset() {
	progTimerCount = 0;
	progTimerMax = 0;
	_isEnabled = false;
	lengthCounter = 0;
	lengthCounterEnable = false;
	envDecayDisable = false;
	envDecayLoopEnable = false;
	shiftNow = false;
	envDecayRate = 0;
	envDecayCounter = 0;
	envVolume = 0;
	masterVolume = 0;
	shiftReg = 1;
	randomBit = 0;
	randomMode = 0;
	sampleValue = 0;
	tmp = 0;
}
