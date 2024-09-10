function convertToBookmarklet() {
    const inputText = document.getElementById('inputBox').value;
    if (!inputText) {
        showMessage("Please enter some text to convert.");
        return;
    }
    const bookmarklet = `javascript:(function(){let text="${encodeURIComponent(inputText)}";navigator.clipboard.writeText(decodeURIComponent(text)).then(()=>{alert('Copied to clipboard!');})})();`;
    navigator.clipboard.writeText(bookmarklet)
        .then(() => showMessage("Bookmarklet copied to clipboard!"))
        .catch(err => showMessage("Error copying to clipboard."));
}

function saveAsTextFile() {
    const inputText = document.getElementById('inputBox').value;
    if (!inputText) {
        showMessage("Please enter some text to save.");
        return;
    }
    const blob = new Blob([inputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'save.txt';
    a.click();
    URL.revokeObjectURL(url);
    showMessage("File saved successfully.");
}

function showMessage(message) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    setTimeout(() => { statusMessage.textContent = ''; }, 3000);
}
