/*
Copyright (c) 2012-2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
Copyright (c) 2006-2011 Jamie Sanders
A NES emulator in WebAssembly. Based on vNES.
Licensed under GPLV3 or later
Hosted at: https://github.com/workhorsy/SaltyNES
*/

#include "SaltyNES.h"

string Parameters::p1_up = "VK_UP";
string Parameters::p1_down = "VK_DOWN";
string Parameters::p1_left = "VK_LEFT";
string Parameters::p1_right = "VK_RIGHT";
string Parameters::p1_a = "VK_Z";
string Parameters::p1_b = "VK_X";
string Parameters::p1_start = "VK_ENTER";
string Parameters::p1_select = "VK_CONTROL";

string Parameters::p2_up = "VK_NUMPAD8";
string Parameters::p2_down = "VK_NUMPAD2";
string Parameters::p2_left = "VK_NUMPAD4";
string Parameters::p2_right = "VK_NUMPAD6";
string Parameters::p2_a = "VK_NUMPAD7";
string Parameters::p2_b = "VK_NUMPAD9";
string Parameters::p2_start = "VK_NUMPAD1";
string Parameters::p2_select = "VK_NUMPAD3";
