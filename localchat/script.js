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

    function enableChat() {
        sendButton.disabled = false;
        messageInput.disabled = false;
        logToConsole('Chat enabled: send button and message input are now active.');
    }

    function disableChat() {
        sendButton.disabled = true;
        messageInput.disabled = true;
        logToConsole('Chat disabled: send button and message input are now inactive.');
    }

    function setupConnection(connection) {
        logToConsole('Setting up connection');
        conn = connection;
        conn.on('data', (data) => {
            logToConsole('Received data: ' + data);
            displayMessage('Friend', data);
        });

        conn.on('open', () => {
            logToConsole('Connection opened');
            enableChat();
        });

        conn.on('close', () => {
            logToConsole('Connection closed');
            disableChat();
        });

        conn.on('error', (err) => {
            logToConsole('Connection error: ' + err);
            disableChat();
        });

        if (conn.open) {
            enableChat();
        }
    }

    function displayMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${sender}: ${message}`;
        messagesDiv.appendChild(messageElement);
    }

    peer.on('open', (id) => {
        logToConsole('My peer ID is: ' + id);
    });

    peer.on('connection', (connection) => {
        logToConsole('Received connection');
        setupConnection(connection);
    });

    const menuContainer = document.getElementById('menu-container');
    const chatContainer = document.getElementById('chat-container');
    const hostButton = document.getElementById('host-button');
    const joinButton = document.getElementById('join-button');
    const joinIdInput = document.getElementById('join-id-input');
    const joinIdButton = document.getElementById('join-id-button');
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const messagesDiv = document.getElementById('messages');

    hostButton.addEventListener('click', () => {
        menuContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        alert('Your room ID is: ' + peer.id);
    });

    joinButton.addEventListener('click', () => {
        joinIdInput.style.display = 'block';
        joinIdButton.style.display = 'block';
    });

    joinIdButton.addEventListener('click', () => {
        const friendId = joinIdInput.value;
        logToConsole('Friend ID: ' + friendId);
        if (friendId) {
            const connection = peer.connect(friendId);
            connection.on('open', () => {
                logToConsole('Connection to host opened');
                setupConnection(connection);
            });
            connection.on('error', (err) => {
                logToConsole('Connection error: ' + err);
            });
        }
        menuContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
    });

    sendButton.addEventListener('click', () => {
        const message = messageInput.value;
        if (message) {
            displayMessage('You', message);
            conn.send(message);
            messageInput.value = '';
        }
    });
});
