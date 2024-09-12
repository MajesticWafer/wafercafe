// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
}

// Function to get a cookie by name
function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

// Function to check if a week has passed since the last acknowledgment
function shouldShowAlert() {
    const messageSent = getCookie("messageSent");
    const messageSentDate = getCookie("messageSentDate");

    if (messageSent === "1" && messageSentDate) {
        const sentDate = new Date(messageSentDate);
        const now = new Date();
        const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;

        // Check if a week has passed
        if (now - sentDate >= oneWeekInMs) {
            // A week has passed, reset messageSent to 0
            setCookie("messageSent", "0", 7);
            return true; // Show alert again
        }
        return false; // Do not show alert if within a week
    }

    return true; // Show alert if messageSent is not set or is 0
}

// Function to show the modal
function showModal() {
    const modal = document.getElementById("vmAlertModal");
    modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("vmAlertModal");
    modal.style.display = "none";
}

// Event listeners for buttons
document.getElementById("acknowledgeBtn").addEventListener("click", function() {
    console.log("User acknowledged the message.");
    const date = new Date();
    setCookie("messageSent", "1", 7); // Set messageSent to 1 for 7 days
    setCookie("messageSentDate", date.toISOString(), 7); // Store the current date
    closeModal();
});

document.getElementById("remindLaterBtn").addEventListener("click", function() {
    console.log("User selected to be reminded later.");
    closeModal(); // Just close the modal, no cookies set
});

// Check if the alert should be shown and display the modal if necessary
if (shouldShowAlert()) {
    showModal();
}
