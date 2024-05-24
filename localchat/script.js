document.addEventListener('DOMContentLoaded', () => {
    const peer = new Peer();
    let conn;

    function logToConsole(message) {
        const consoleDiv = document.getElementById('console');
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        consoleDiv.appendChild(messageElement);
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }

    peer.on('open', (id) => {
        logToConsole('My peer ID is: ' + id);
        alert('Share this ID with your friend: ' + id);
    });

    peer.on('connection', (connection) => {
        logToConsole('Received connection');
        conn = connection;
        setupConnection();
    });

    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const messagesDiv = document.getElementById('messages');

    sendButton.addEventListener('click', () => {
        const message = messageInput.value;
        if (message) {
            displayMessage('You', message);
            conn.send(message);
            messageInput.value = '';
        }
    });

    function displayMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${sender}: ${message}`;
        messagesDiv.appendChild(messageElement);
    }

    function setupConnection() {
        logToConsole('Setting up connection');
        conn.on('data', (data) => {
            logToConsole('Received data: ' + data);
            displayMessage('Friend', data);
        });

        conn.on('open', () => {
            logToConsole('Connection opened');
            sendButton.disabled = false;
            messageInput.disabled = false;
        });
    }

    const friendId = prompt('Enter your friend\'s ID:');
    logToConsole('Friend ID: ' + friendId);
    if (friendId) {
        conn = peer.connect(friendId);
        conn.on('open', setupConnection);
    }
});
