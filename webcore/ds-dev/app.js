
var uiCurrentMode = 'welcome'
var plugins = {}
var body = document.getElementsByTagName("body")[0]
var html = document.getElementsByTagName("html")[0]
var config = {
    swapTopBottom: false,
    swapTopBottomL: false,
    powerSave: true,
    micWhenR: true,
    vkEnabled: true,
}

function loadConfig() {
    var cfg = JSON.parse(window.localStorage['config'] || '{}')
    for (var k in cfg) {
        config[k] = cfg[k]
    }
    $id('power-save').checked = config.powerSave
    $id('vk-enabled').checked = config.vkEnabled
}
loadConfig()

function uiSaveConfig() {
    config.powerSave = !!($id('power-save').checked)
    config.vkEnabled = !!($id('vk-enabled').checked)
    window.localStorage['config'] = JSON.stringify(config)
}


function uiMenuBack() {
    uiSaveConfig()
    if (emuIsGameLoaded) {
        uiSwitchTo('player')
    } else {
        uiSwitchTo('welcome')
    }
}

function uiSaveBackup() {
    var u8Arr = emuCopySavBuffer()
    var blob = new Blob([u8Arr], { type: "application/binary" });
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = 'sav-' + gameID + '.dsv';
    link.click();
}

async function uiSaveRestore() {
    var file = $id('restore-file').files[0]
    if (!file) {
        return
    }
    if (file.size > 2.2 * 1024 * 1024) {
        alert('Too large!');
        return
    }
    // Only .dsv files are supported
    if (!file.name.endsWith('.dsv')) {
        alert('Only .dsv files are supported.\nUse an online converter if your save is in different format.');
        return
    }
    var u8 = new Uint8Array(await file.arrayBuffer())
    localforage.setItem('sav-' + gameID, u8).then(() => {
        alert('Save data updated. \nThis page will be reloaded to apply the changes.')
        setTimeout(() => {
            location.href = 'https://ds.44670.org'
        }, 1000)
    })
}



function $id(id) {
    return document.getElementById(id);
}

var isIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
var isMacOS = !!navigator.platform && /Mac/.test(navigator.platform);
if (isMacOS) {
    if (navigator.maxTouchPoints > 2) {
        // Nah, it is an iPad pretending to be a Mac
        isIOS = true
        isMacOS = false
    }
}
var isWebApp = navigator.standalone || false
var isSaveSupported = true
var isSaveNagAppeared = false
if (isIOS) {
    //document.getElementById('romFile').files = null;
    if (!isWebApp) {
        // On iOS Safari, the indexedDB will be cleared after 7 days. 
        // To prevent users from frustration, we don't allow savegame on iOS unless the we are in the PWA mode.
        isSaveSupported = false
        var divIosHint = $id('ios-hint')
        divIosHint.hidden = false
        divIosHint.style = 'position: absolute; bottom: ' + divIosHint.clientHeight + 'px;'
    }
}
if (isMacOS) {
    // Check if it is Safari
    if (navigator.userAgent.indexOf('Chrome') < 0) {
        $id('mac-warning').hidden = false
    }
}

var emuKeyState = new Array(14)
const emuKeyNames = ["right", "left", "down", "up", "select", "start", "b", "a", "y", "x", "l", "r", "debug", "lid"]
var vkMap = {}
var vkState = {}
var keyNameToKeyId = {}
var vkStickPos
for (var i = 0; i < emuKeyNames.length; i++) {
    keyNameToKeyId[emuKeyNames[i]] = i
}
var isLandscape = false

const emuKeyboradMapping = [39, 37, 40, 38, 16, 13, 90, 88, 65, 83, 81, 87, -1, 8]
var emuGameID = 'unknown'
var emuIsRunning = false
var emuIsGameLoaded = false
var fps = 0
var divFPS = $id('fps')
var fileInput = $id('rom')
var romSize = 0

var FB = [0, 0]
var screenCanvas = [document.getElementById('top'), document.getElementById('bottom')]
var ctx2d = screenCanvas.map((v) => { return v.getContext('2d', { alpha: false }) })

var audioContext
var audioBuffer
var tmpAudioBuffer = new Int16Array(16384 * 2)
var audioWorkletNode

var frameCount = 0
var prevCalcFPSTime = 0
var touched = 0
var touchX = 0
var touchY = 0
var prevSaveFlag = 0
var lastTwoFrameTime = 10
var fbSize


function callPlugin(type, arg) {
    for (var k in plugins) {
        if (plugins[k].handler) {
            plugins[k].handler(type, arg)
        }
    }
}

function showMsg(msg) {
    document.getElementById('msg-text').innerText = msg
    document.getElementById('msg-layer').hidden = false
    setTimeout(function () {
        document.getElementById('msg-layer').hidden = true
    }, 1000)
}

function emuRunFrame() {
    processGamepadInput()
    var keyMask = 0;
    for (var i = 0; i < 14; i++) {
        if (emuKeyState[i]) {
            keyMask |= 1 << i
        }
    }
    var mic = emuKeyState[11]
    if (mic) {
        console.log('mic')
        keyMask |= 1 << 14
    }


    if (config.powerSave) {
        Module._runFrame(0, keyMask, touched, touchX, touchY)
    }
    Module._runFrame(1, keyMask, touched, touchX, touchY)

    ctx2d[0].putImageData(FB[0], 0, 0)
    ctx2d[1].putImageData(FB[1], 0, 0)
    if (audioWorkletNode) {
        try {
            var samplesRead = Module._fillAudioBuffer(4096)
            tmpAudioBuffer.set(audioBuffer.subarray(0, samplesRead * 2))
            audioWorkletNode.port.postMessage(tmpAudioBuffer.subarray(0, samplesRead * 2))
        } catch (error) {
            // tmpAudioBuffer may be detached if previous message is still processing 
            console.log(error)
        }
    }

    frameCount += 1
    if (frameCount % 120 == 0) {
        var time = performance.now()
        fps = 120 / ((time - prevCalcFPSTime) / 1000)
        prevCalcFPSTime = time
        divFPS.innerText = 'fps:' + ('' + fps).substring(0, 5)
    }
    if (frameCount % 30 == 0) {
        checkSaveGame()
    }
}


function wasmReady() {
    Module._setSampleRate(47860)
    setTimeout(() => {
        if ($id('loading').hidden == true) {
            return;
        }
        $id('loading').hidden = true
        $id('loadrom').hidden = false
        var btn = $id('btn-choose-file')
        if (!btn.onclick) {
            btn.onclick = () => {
                $id('rom').click()
            }
        }
    }, 2000)
}

function emuCopySavBuffer() {
    var size = Module._savGetSize()
    if (size > 0) {
        var ptr = Module._savGetPointer(0)
        var tmpSaveBuf = new Uint8Array(size)
        tmpSaveBuf.set(Module.HEAPU8.subarray(ptr, ptr + size))
        return tmpSaveBuf
    } else {
        return new Uint8Array(0)
    }
}

function checkSaveGame() {
    if (!isSaveSupported) {
        return
    }
    var saveUpdateFlag = Module._savUpdateChangeFlag()
    if ((saveUpdateFlag == 0) && (prevSaveFlag == 1)) {
        var savBuf = emuCopySavBuffer()
        if (savBuf.length > 0) {
            localforage.setItem('sav-' + gameID, savBuf)
            showMsg('Auto saving...')
        }
    }
    prevSaveFlag = saveUpdateFlag
}

async function tryLoadROM(file) {
    if (!file) {
        return
    }
    if (file.size < 1024) {
        return
    }
    var header = new Uint8Array(await (file.slice(0, 1024)).arrayBuffer())
    gameID = ''
    for (var i = 0; i < 0x10; i++) {
        gameID += (header[i] == 0) ? ' ' : String.fromCharCode(header[i])
    }
    if (gameID[0xC] == '#') {
        // a homebrew!
        gameID = file.name
    }
    console.log('gameID', gameID)
    romSize = file.size
    var romBufPtr = Module._prepareRomBuffer(romSize)
    console.log(romSize, romBufPtr)
    const blockSize = 4 * 1024 * 1024
    // Load the file by small chunks, to make browser heap happier
    for (var pos = 0; pos < romSize; pos += blockSize) {
        var chunk = await (file.slice(pos, pos + blockSize)).arrayBuffer()
        Module.HEAPU8.set(new Uint8Array(chunk), romBufPtr + pos)
    }
    var saveData = await localforage.getItem('sav-' + gameID)
    if (saveData) {
        Module.HEAPU8.set(saveData, Module._savGetPointer(saveData.length))
    }
    Module._savUpdateChangeFlag()
    var ret = Module._loadROM(romSize);
    if (ret != 1) {
        alert('LoadROM failed.')
        return;
    }
    ptrFrontBuffer = Module._getSymbol(5)
    var fb = Module._getSymbol(4)
    for (var i = 0; i < 2; i++) {
        FB[i] = new ImageData(new Uint8ClampedArray(Module.HEAPU8.buffer).subarray(fb + 256 * 192 * 4 * i, fb + 256 * 192 * 4 * (i + 1)), 256, 192)
    }
    var ptrAudio = Module._getSymbol(6)
    audioBuffer = new Int16Array(Module.HEAPU8.buffer).subarray(ptrAudio / 2, ptrAudio / 2 + 16384 * 2)

    emuIsGameLoaded = true
    callPlugin('loaded', gameID)
    if (window.eaRunHook) {
        window.eaRunHook();
    } else {
        emuStart();
    }
}

// Allow drag and drop of files on entire window
window.ondragover = function (e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
}
window.ondrop = function (e) {
    e.preventDefault()
    tryLoadROM(e.dataTransfer.files[0])
}

function emuStart() {
    if (!emuIsGameLoaded) {
        return
    }
    console.log('Start!')
    emuIsRunning = true
    uiSwitchTo('player')
}

function initVK() {
    var vks = document.getElementsByClassName('vk')
    for (var i = 0; i < vks.length; i++) {
        var vk = vks[i]
        var k = vks[i].getAttribute('data-k')
        if (k) {
            vkMap[k] = vk
            vkState[k] = [0, 0]
        }
    }
}
initVK()

function makeVKStyle(top, left, w, h, fontSize) {
    return 'top:' + top + 'px;left:' + left + 'px;width:' + w + 'px;height:' + h + 'px;' + 'font-size:' + fontSize + 'px;line-height:' + h + 'px;'
}

function uiAdjustVKLayout() {
    var baseSize = window.innerWidth * 0.14
    var fontSize = baseSize * 0.7
    var offTop = Math.min(fbSize[0][1] + fbSize[1][1], window.innerHeight - Math.ceil(baseSize * 3.62))
    var offLeft = 0
    var abxyWidth = baseSize * 3
    var abxyHeight = baseSize * 3
    var vkw = baseSize
    var vkh = baseSize

    vkw = baseSize * 1.5
    vkh = baseSize * 0.6
    fontSize = baseSize * 0.5
    vkMap['l'].style = makeVKStyle(
        // Y position on screen
        offTop,
        // X position on screen
        0,
        // General sizing
        vkw, vkh, fontSize)
    
    vkMap['r'].style = makeVKStyle(
        // Y position on screen
        offTop,
        // X position on screen
        window.innerWidth - vkw,
        // General sizing
        vkw, vkh, fontSize)
    
    $id('vk-menu').style = makeVKStyle(
        // Y position on screen
        offTop,
        // X position on screen
        window.innerWidth / 2 - vkw / 2,
        // General sizing
        vkw, vkh, fontSize)


    offTop += baseSize * 0.62
    vkw = baseSize * 0.78
    vkh = baseSize * 0.78
    offLeft = window.innerWidth - abxyWidth
    vkMap['a'].style = makeVKStyle(
        // Y position on screen
        offTop + abxyHeight / 2 - vkh / 2,
        // X position on screen
        offLeft + abxyWidth - vkw,
        // General sizing
        vkw, vkh, fontSize)
    
    vkMap['b'].style = makeVKStyle(
        // Y position on screen
        offTop + abxyHeight - vkh * 2,
        // X position on screen
        offLeft + abxyWidth / 2 - vkw * 2 / 2,
        // General sizing
        vkw, vkh, fontSize)
    
    vkMap['x'].style = makeVKStyle(
        // Y position on screen
        offTop + abxyHeight - vkh * 0.5,
        // X position on screen
        offLeft + abxyWidth / 2 - vkw * 2 / 2,
        // General sizing
        vkw, vkh, fontSize)
    
    vkMap['y'].style = makeVKStyle(
        // Y position on screen
        offTop + abxyHeight / 2 - vkh / 2,
        // X position on screen
        offLeft + abxyWidth / 2 - vkw * 2 / 2,
        // General styling
        vkw, vkh, fontSize)

    vkw = baseSize * 1.0
    vkh = baseSize * 1.0
    offLeft = 0
    $id('vk-stick').style = makeVKStyle(
        // Y position on screen
        offTop + abxyHeight / 2 - vkh / 2,
        // X position on screen
        offLeft + abxyHeight / 2 - vkw / 2,
        // General styling
        vkw, vkh, fontSize)
    
    vkStickPos = [offTop + abxyHeight / 2, offLeft + abxyHeight / 2, vkw, vkh, fontSize]

    vkw = baseSize * 0.4
    vkh = baseSize * 0.4
    fontSize = baseSize * 0.4
    vkMap['select'].style = makeVKStyle(offTop + abxyHeight - vkh, window.innerWidth / 2 - vkw * 1.5, vkw, vkh, fontSize)
    vkMap['start'].style = makeVKStyle(offTop + abxyHeight - vkh, window.innerWidth / 2 + vkw * 0.5, vkw, vkh, fontSize)
}

function uiUpdateLayout() {
    isLandscape = window.innerWidth > window.innerHeight
    var maxWidth = window.innerWidth
    var maxHeight = window.innerHeight / 2
    var w = maxWidth
    var h = w / 256 * 192
    if (h > maxHeight) {
        h = maxHeight
        w = h / 192 * 256
    }
    var left = 0
    left += (window.innerWidth - w) / 2;
    var top = 0

    fbSize = [[w, h], [w, h]]
    for (var i = 0; i < 2; i++) {
        screenCanvas[i].style = 'left:' + left + 'px;top:' + top + "px;width:" + w + "px;height:" + h + "px;"
        top += h
    }
    uiAdjustVKLayout()
}


function uiSwitchTo(mode) {
    if (mode == uiCurrentMode) {
        return
    }
    uiCurrentMode = mode
    $id('welcome').hidden = true
    $id('vk-layer').hidden = true
    $id('menu').hidden = true
    $id('player').hidden = true
    body.style = ''
    html.style = ''
    emuIsRunning = false

    if (mode == 'player') {
        body.style = 'touch-action: none;'
        html.style = 'position: fixed;overflow:hidden;touch-action: none;'
        for (var i = 0; i < 14; i++) {
            emuKeyState[i] = false
        }
        if (config.vkEnabled) {
            $id('vk-layer').hidden = false
        }
        uiUpdateLayout()
        if (emuIsGameLoaded) {
            emuIsRunning = true
        }
        $id('player').hidden = false
    }
    if (mode == 'menu') {
        $id('player').hidden = false
        $id('menu').hidden = false
        $id('menu-savegame').hidden = emuIsGameLoaded ? false : true
    }
    if (mode == 'welcome') {
        $id('welcome').hidden = false
    }

}

fileInput.onchange = async () => {
    tryInitSound()
    var file = fileInput.files[0]
    if (!file) {
        return
    }
    var fileNameLower = file.name.toLowerCase()
    if (fileNameLower.endsWith('.json')) {
        var obj = JSON.parse(await file.text())
        var pluginName = obj.name || 'unknown'
        plugins[pluginName] = obj
        if (obj.js) {
            plugins[pluginName].handler = eval(obj.js)(obj)
        }
        alert('plugin loaded!')
        return
    } else if (fileNameLower.endsWith('.gba')) {
        alert('This is a GBA file, redirecting to the GBA player...')
        window.location.href = '/gba';
    } else if (fileNameLower.endsWith('.zip')) {
        alert('ZIP file not supported yet!')
    } else if (fileNameLower.endsWith('.nds')) {
        tryLoadROM(file)
        return
    } else {
        alert('Unknown file type!')
    }
}


// must be called in user gesture
function tryInitSound() {
    try {
        if (audioContext) {
            if (audioContext.state != 'running') {
                audioContext.resume()
            }
            return;
        }
        audioContext = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 0.0001, sampleRate: 48000 });
        if (!audioContext.audioWorklet) {
            alert('AudioWorklet is not supported in your browser...')
        } else {
            audioContext.audioWorklet.addModule("audio-worklet.js").then(() => {
                audioWorkletNode = new AudioWorkletNode(audioContext, "my-worklet", { outputChannelCount: [2] })
                audioWorkletNode.connect(audioContext.destination)
            })
        }

        audioContext.resume()
    } catch (e) {
        console.log(e)
        //alert('Cannnot init sound ')
    }
}

var prevRunFrameTime = performance.now()
function emuLoop() {
    window.requestAnimationFrame(emuLoop)

    if (emuIsRunning) {
        if (config.powerSave) {
            if (performance.now() - prevRunFrameTime < 32) {
                return
            }
        }
        prevRunFrameTime = performance.now()
        emuRunFrame()
    }
}
emuLoop()

var stickTouchID = null
var tpadTouchID = null

function isPointInRect(x, y, r) {
    if ((x >= r.x) && (x < r.x + r.width)) {
        if ((y >= r.y) && (y < r.y + r.height)) {
            return true
        }
    }
    return false
}

function clamp01(a) {
    if (a < 0) {
        return 0
    }
    if (a > 1) {
        return 1
    }
    return a
}

function handleTouch(event) {
    tryInitSound()
    if (!emuIsRunning) {
        return
    }
    event.preventDefault();
    event.stopPropagation();

    var isDown = false
    var x = 0
    var y = 0

    var needUpdateStick = false
    var stickY = vkStickPos[0]
    var stickX = vkStickPos[1]
    var stickW = vkStickPos[2]
    var stickH = vkStickPos[3]

    var stickPressed = false
    var stickDeadZone = stickW * 0.4

    var nextStickTouchID = null
    var nextTpadTouchID = null

    var tsRect = screenCanvas[1].getBoundingClientRect()

    for (var i = 0; i < emuKeyState.length; i++) {
        emuKeyState[i] = false
    }
    for (var k in vkState) {
        vkState[k][1] = 0
    }

    for (var i = 0; i < event.touches.length; i++) {
        var t = event.touches[i];
        var tid = t.identifier
        var dom = document.elementFromPoint(t.clientX, t.clientY)
        var k = dom ? dom.getAttribute('data-k') : null

        if ((tid === stickTouchID) || ((dom == vkMap['stick']) && (tid != tpadTouchID))) {
            stickPressed = true

            vkState['stick'][1] = 1
            var sx = t.clientX
            var sy = t.clientY
            if (sx < stickX - stickDeadZone) {
                emuKeyState[1] = true
            }
            if (sx > stickX + stickDeadZone) {
                emuKeyState[0] = true
            }
            if (sy < stickY - stickDeadZone) {
                emuKeyState[3] = true
            }
            if (sy > stickY + stickDeadZone) {
                emuKeyState[2] = true
            }
            sx = Math.max(stickX - stickW / 2, sx)
            sx = Math.min(stickX + stickW / 2, sx)
            sy = Math.max(stickY - stickH / 2, sy)
            sy = Math.min(stickY + stickH / 2, sy)
            stickX = sx
            stickY = sy
            needUpdateStick = true
            nextStickTouchID = tid
            continue
        }
        if ((tid === tpadTouchID) || (isPointInRect(t.clientX, t.clientY, tsRect) && (!k))) {
            isDown = true
            x = clamp01((t.clientX - tsRect.x) / tsRect.width) * 256
            y = clamp01((t.clientY - tsRect.y) / tsRect.height) * 192
            nextTpadTouchID = tid
            continue
        }
        if (k) {

            vkState[k][1] = 1
            continue
        }
    }

    touched = isDown ? 1 : 0;
    touchX = x
    touchY = y

    for (var k in vkState) {
        if (vkState[k][0] != vkState[k][1]) {
            var dom = vkMap[k]
            vkState[k][0] = vkState[k][1]
            if (vkState[k][1]) {
                dom.classList.add('vk-touched')
                if (k == 'menu') {
                    uiSwitchTo('menu')
                }
            } else {
                dom.classList.remove('vk-touched')
                if (k == "stick") {
                    needUpdateStick = true
                }
            }

        }
    }

    for (var i = 0; i < emuKeyState.length; i++) {
        var k = emuKeyNames[i]
        if (vkState[k]) {
            if (vkState[k][1]) {
                emuKeyState[i] = true
            }
        }
    }

    if (needUpdateStick) {
        vkMap['stick'].style = makeVKStyle(stickY - stickW / 2, stickX - stickW / 2, stickW, stickH, vkStickPos[4])
    }

    stickTouchID = nextStickTouchID
    tpadTouchID = nextTpadTouchID
}
['touchstart', 'touchmove', 'touchend', 'touchcancel', 'touchenter', 'touchleave'].forEach((val) => {
    window.addEventListener(val, handleTouch)
})




window.onmousedown = window.onmouseup = window.onmousemove = (e) => {
    if (!emuIsRunning) {
        return
    }
    if (e.type == 'mousedown') {
        tryInitSound()
    }

    var r = screenCanvas[1].getBoundingClientRect()

    e.preventDefault()
    e.stopPropagation()

    var isDown = (e.buttons != 0) && (isPointInRect(e.clientX, e.clientY, r))
    var x = (e.clientX - r.x) / r.width * 256
    var y = (e.clientY - r.y) / r.height * 192

    touched = isDown ? 1 : 0;
    touchX = x
    touchY = y
}

window.onresize = window.onorientationchange = () => {
    uiUpdateLayout()
}
function convertKeyCode(keyCode) {
    for (var i = 0; i < 14; i++) {
        if (keyCode == emuKeyboradMapping[i]) {
            return i
        }
    }
    return -1
}
window.onkeydown = window.onkeyup = (e) => {
    if (!emuIsRunning) {
        return
    }
    e.preventDefault()
    var isDown = (e.type === "keydown")
    var k = convertKeyCode(e.keyCode)
    if (k >= 0) {
        emuKeyState[k] = isDown
    }
    if (e.keyCode == 27) {
        uiSwitchTo('menu')
    }
}

var currentConnectedGamepad = -1
var gamePadKeyMap = {
    a: 1,
    b: 0,
    x: 3,
    y: 2,
    l: 4,
    r: 5,
    'select': 8,
    'start': 9,
    'up': 12,
    'down': 13,
    'left': 14,
    'right': 15
}

window.addEventListener("gamepadconnected", function (e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
    showMsg('Gamepad connected.')
    currentConnectedGamepad = e.gamepad.index
    $id('a-gamepad').innerText = 'Gamepad connected'
});

function processGamepadInput() {
    if (currentConnectedGamepad < 0) {
        return
    }
    var gamepad = navigator.getGamepads()[currentConnectedGamepad]
    if (!gamepad) {
        showMsg('Gamepad disconnected.')
        currentConnectedGamepad = -1
        return
    }
    for (var i = 0; i < emuKeyState.length; i++) {
        emuKeyState[i] = false
    }
    for (var k in gamePadKeyMap) {
        if (gamepad.buttons[gamePadKeyMap[k]].pressed) {
            emuKeyState[keyNameToKeyId[k]] = true
        }
    }
    if (gamepad.axes[0] < -0.5) {
        emuKeyState[keyNameToKeyId['left']] = true
    }
    if (gamepad.axes[0] > 0.5) {
        emuKeyState[keyNameToKeyId['right']] = true
    }
    if (gamepad.axes[1] < -0.5) {
        emuKeyState[keyNameToKeyId['up']] = true
    }
    if (gamepad.axes[1] > 0.5) {
        emuKeyState[keyNameToKeyId['down']] = true
    }
}

function whatsNew() {
    alert(`
1. Improve auto-save, export/import save.
2. Add gamepad guide.
3. Add link to gba player.
4. Cheat support. (Early Access)
`)
}


var isMicrophoneEnabled = false
function enableMicrophone() {
    if (isMicrophoneEnabled) {
        alert('Microphone is already enabled.')
        return
    }
    isMicrophoneEnabled = true
    var micPtr = Module._realloc(0, 0x1000)
    var micBuf = Module.HEAPU8.subarray(micPtr, micPtr + 0x1000)
    console.log(micPtr, micBuf)
    // Request access to the Microphone, and get raw PCM samples at 8000Hz, use WebAudio API
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function (stream) {
            // Create an new AudioContext, which is required for WebAudio API
            var audioCtx = new AudioContext();
            // Create a MediaStreamSource from the stream
            var source = audioCtx.createMediaStreamSource(stream);
            // Create a ScriptProcessorNode with a bufferSize of 2048
            var scriptNode = audioCtx.createScriptProcessor(2048, 1, 1);
            // Connect the ScriptProcessorNode to the MediaStreamSource
            source.connect(scriptNode);
            // Connect the ScriptProcessorNode to the destination
            scriptNode.onaudioprocess = function (e) {
                var buf = e.inputBuffer.getChannelData(0) // 48000Hz mono float
                // Convert to 16000Hz 7bit mono PCM
                var dstPtr = 0;
                for (var i = 0; i <= 2045; i+=3) {
                    var val = Math.floor(((buf[i] + buf[i + 1] + buf[i + 2]) / 3 + 1) * 64)
                    if (val > 127) {
                        val = 127
                    } else if (val < 0) {
                        val = 0
                    }
                    micBuf[dstPtr++] = val
                }
                // Write to the buffer
                Module._micWriteSamples(micPtr, 682)
                for (var outputChan = 0; outputChan < 1; outputChan++) {
                    var buf = e.outputBuffer.getChannelData(outputChan)
                    for (var i = 0; i < 2048; i++) {
                        buf[i] = 0
                    }
                }
            }
            scriptNode.connect(audioCtx.destination);
           
        });
}


