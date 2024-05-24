<script src="https://cdn.jsdelivr.net/npm/peerjs@1.3.1/dist/peerjs.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const peer = new Peer();
    let conn;

    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        alert('Share this ID with your friend: ' + id);
    });

    peer.on('connection', (connection) => {
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
        conn.on('data', (data) => {
            displayMessage('Friend', data);
        });

        conn.on('open', () => {
            sendButton.disabled = false;
            messageInput.disabled = false;
        });
    }

    const friendId = prompt('Enter your friend\'s ID:');
    if (friendId) {
        conn = peer.connect(friendId);
        conn.on('open', setupConnection);
    }
});
</script>
