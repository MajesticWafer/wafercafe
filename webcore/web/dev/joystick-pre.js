Module['arguments'] = ['0'];
//Gamepads don't appear until a button is pressed and the joystick/gamepad tests expect one to be connected
var found = false;

Module['preRun'].push(function() {
    Module['print']("Waiting for gamepad...");
    Module['addRunDependency']("gamepad");

    setTimeout(() => {
        if(!found){
            Module['print']("Failed to find controller in 5 seconds");
            Module['removeRunDependency']("gamepad");
        }
    }, 3000);

    window.addEventListener('gamepadconnected', function() {
        //OK, got one
        Module['removeRunDependency']("gamepad");
        found = true;
    }, false);

    //chrome
    if(!!navigator.webkitGetGamepads)
    {
        var timeout = function()
        {
            if(navigator.webkitGetGamepads()[0] !== undefined)
                Module['removeRunDependency']("gamepad");
            else
                setTimeout(timeout, 100);
        }
        setTimeout(timeout, 100);
    }
});