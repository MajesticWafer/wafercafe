// device.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if the device supports multiple touch points
    if (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints > 1) {
        // Add "mobile" class to the button-container div
        var buttonContainer = document.getElementById('button-container');
        if (buttonContainer) {
            buttonContainer.classList.add('mobile');
        }
    }
});
