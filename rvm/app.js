// Replace 'your-backend-ip' with the actual IP address or domain of your backend server
const socket = new WebSocket('ws://your-backend-ip:3000');

// Display status when the WebSocket connection is established
socket.onopen = () => {
    console.log('WebSocket connection established.');
    document.getElementById('status').innerText = 'WebSocket connection established.';
};

// Handling incoming messages from the server
socket.onmessage = (event) => {
    console.log('Message from server:', event.data);
    document.getElementById('status').innerText = `Server says: ${event.data}`;
};

// Handling WebSocket errors
socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    document.getElementById('status').innerText = 'WebSocket error occurred.';
};

// Display message when the WebSocket connection is closed
socket.onclose = () => {
    console.log('WebSocket connection closed.');
    document.getElementById('status').innerText = 'WebSocket connection closed.';
};

// Event listener for the Start VM button
document.getElementById('start-vm').addEventListener('click', () => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send('start-vm'); // Send a command to start the VM
        document.getElementById('status').innerText = 'Sent start command to server.';
    } else {
        document.getElementById('status').innerText = 'WebSocket not connected.';
    }
});
