const context = new (window.AudioContext || window.webkitAudioContext)();
const output = document.getElementById('output');

document.getElementById('initialize').addEventListener('click', initialize);
document.getElementById('send').addEventListener('click', sendMessage);

function initialize() {
    sendSignal('111111');
    listenForResponse(5000, response => {
        if (response === 'null') {
            output.textContent = 'No users found.';
        } else if (response.startsWith('111111')) {
            output.textContent = 'One or more users found.';
        } else {
            output.textContent = 'Unknown error!';
        }
    });
}

function sendMessage() {
    const message = document.getElementById('message').value;
    const encodedMessage = encodeMessage(message);
    sendSignal(encodedMessage);
    listenForResponse(1000, response => {
        if (response === 'null') {
            console.log('Message sent.');
        } else if (response.startsWith('111111')) {
            const parts = response.split(',');
            const result = parts[2];
            if (result === 'a') {
                sendSignal(encodedMessage);
            } else {
                output.textContent = 'Unknown error.';
            }
        }
    });
}

function encodeMessage(message) {
    // Convert message to binary string and pad to 6 bits
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

function listenForResponse(timeout, callback) {
    // Simulate response listening with a timeout
    setTimeout(() => {
        // Here you would normally have code to detect the received signal
        // For demonstration purposes, we'll simulate a 'null' response
        callback('null');
    }, timeout);
}
