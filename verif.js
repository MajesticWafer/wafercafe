// Function to get the external IP address
function getExternalIP(callback){
    // Make a request to an external service to get the IP address
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.ipify.org?format=json", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            var ipAddress = response.ip;
            callback(ipAddress);
        }
    };
    xhr.send();
}

// Function to get location information based on IP address
function getLocation(ipAddress, callback){
    // Make a request to an external service to get location information
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ipapi.co/" + ipAddress + "/json/", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            callback(response);
        }
    };
    xhr.send();
}

// Function to execute the script if user is in Ohio
function executeScript(location){
    if(location.region == "Ohio"){
        alert("In Ohio!")
        var now = new Date();
        var currentHour = now.getHours();
        var currentMinute = now.getMinutes();

        var encodedPasskey = "dHgz";

        if (
            (currentHour > 7 || (currentHour === 7 && currentMinute >= 55)) &&
            (currentHour < 14 || (currentHour === 14 && currentMinute <= 45))
        ) {
            var passkeyEnteredEncoded = localStorage.getItem('allowed_for_day');
            if (passkeyEnteredEncoded === encodedPasskey) {
                console.log('User already entered the correct passkey today.');
            } else {
                var passkey = prompt('School is now in session. You will need a passkey to continue.');
                if (passkey === decodePasskey(encodedPasskey)) {
                    localStorage.setItem('allowed_for_day', encodedPasskey);
                    console.log('User entered correct passkey.');
                } else {
                    alert('Incorrect passkey. Redirecting to registration.');
                    location.href = 'register/';
                }
            }
        } else {
            console.log('Outside of school hours.');
        }
    } else {
        alert("User is not in Ohio. Dismissing the script.");
    }
}

// Call the main function to get external IP, then get location and execute script
function main(){
    getExternalIP(function(ipAddress){
        getLocation(ipAddress, executeScript);
    });
}

// Call the main function
main();

// Function to decode the passkey
function decodePasskey(encodedPasskey) {
    return atob(encodedPasskey);
}
