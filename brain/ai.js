// Create the neural network
const net = new brain.recurrent.LSTM();

// Train the neural network with example conversations
net.train([
    { input: "hello", output: "Hi there!" },
    { input: "how are you", output: "I'm just a program, but I'm doing well!" },
    { input: "what is your name", output: "I am a simple AI" },
    { input: "what can you do", output: "I can talk to you with a few words" },
    { input: "bye", output: "Goodbye!" }
]);

// Function to get response from AI
function getResponse() {
    const input = document.getElementById("userInput").value.toLowerCase();
    const response = net.run(input) || "I don't understand that.";
    document.getElementById("response").innerText = response;
}
