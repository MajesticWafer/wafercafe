const context = new (window.AudioContext || window.webkitAudioContext)();
const output = document.getElementById('output');
let microphone, analyser, dataArray, source;
let isListening = false;

document.getElementById('initialize').addEventListener('click', initialize);
document.getElementById('send').addEventListener('click', sendMessage);

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        microphone = context.createMediaStreamSource(stream);
        analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        microphone.connect(analyser);
        source = context.createBufferSource();
        isListening = true;
        listenForResponse();
    })
    .catch(err => {
        console.error('Error accessing microphone:', err);
        output.textContent = 'Error accessing microphone: ' + err.message;
    });

function initialize() {
    sendSignal('111111');
}

function sendMessage() {
    const message = document.getElementById('message').value;
    const encodedMessage = encodeMessage(message);
    sendSignal(encodedMessage);
}

function encodeMessage(message) {
    return message.split('').map(char => {
        let code = char.charCodeAt(0) - 'a'.charCodeAt(0);
        return code.toString(2).padStart(6, '0');
    }).join('');
}

function sendSignal(binaryString) {
    binaryString.split('').forEach((bit, index) => {
        setTimeout(() => {
            playTone(bit === '0' ? 18000 : 20000, 0.01);
        }, index * 10);
    });
}

function playTone(frequency, duration) {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
}

function listenForResponse() {
    if (!isListening) return;
    analyser.getByteFrequencyData(dataArray);
    const maxAmplitudeIndex = dataArray.indexOf(Math.max(...dataArray));
    const frequency = maxAmplitudeIndex * context.sampleRate / analyser.fftSize;
    
    if (frequency >= 17900 && frequency <= 18100) {
        processSignal('0');
    } else if (frequency >= 19900 && frequency <= 20100) {
        processSignal('1');
    }

    requestAnimationFrame(listenForResponse);
}

let receivedBits = '';
function processSignal(bit) {
    receivedBits += bit;
    if (receivedBits.length === 6) {
        const charCode = parseInt(receivedBits, 2) + 'a'.charCodeAt(0);
        const char = String.fromCharCode(charCode);
        output.textContent += char;
        receivedBits = '';
    }
}
