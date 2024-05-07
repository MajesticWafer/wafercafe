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

function encodePasskey(passkey) {
    return btoa(passkey);
}

function decodePasskey(encodedPasskey) {
    return atob(encodedPasskey);
}
