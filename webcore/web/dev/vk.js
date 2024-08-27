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
    var fontSize = baseSize * 0.6
    var offTop = Math.min(fbSize[0][1] + fbSize[1][1], window.innerHeight - Math.ceil(baseSize * 3.62))
    var offLeft = 0
    var abxyWidth = baseSize * 3
    var abxyHeight = baseSize * 3
    var vkw = baseSize
    var vkh = baseSize

    vkw = baseSize * 1.5
    vkh = baseSize * 0.6
    fontSize = baseSize * 0.5
    vkMap['l'].style = makeVKStyle(offTop, 0, vkw * 0.775, vkh * 0.775, fontSize * 0.775)
    vkMap['r'].style = makeVKStyle(offTop, window.innerWidth - vkw * 0.775, vkw * 0.775, vkh * 0.775, fontSize * 0.775)
    vkMap['mic'].style = makeVKStyle(window.innerHeight - (vkh * 0.675), window.innerwidth * 0.5, vkw * 0.675, vkh * 0.675, fontSize * 0.675,)
    $id('vk-menu').style = makeVKStyle(window.innerHeight - (vkh * 1.425), window.innerwidth * 0.5, vkw * 0.675, vkh * 0.675, fontSize * 0.675)
    $id('vk-menu').style.left = '0px';

    
    offTop += baseSize * 0.62
    vkw = baseSize
    vkh = baseSize
    offLeft = window.innerWidth - abxyWidth
    vkMap['a'].style = makeVKStyle(offTop + abxyHeight / 2 - vkh * 0.425, offLeft + abxyWidth * 0.675, vkw * 0.85, vkw * 0.85, vkh * 0.85, fontSize * 0)
    vkMap['b'].style = makeVKStyle(offTop + abxyHeight - vkh * 0.975, offLeft + abxyWidth / 2 - vkw * 0.425, vkw * 0.85, vkh * 0.85, fontSize * 0.85);
    vkMap['x'].style = makeVKStyle(offTop + abxyHeight * 0.025, offLeft + abxyWidth / 2 - vkw * 0.425, vkw * 0.85, vkh * 0.85, fontSize * 0.85);
    vkMap['y'].style = makeVKStyle(offTop + abxyHeight / 2 - vkh * 0.425, offLeft + abxyWidth * 0.025, vkw * 0.85, vkh * 0.85, fontSize * 0.85);


    vkw = baseSize * 1.0
    vkh = baseSize * 1.0
    offLeft = 0
    $id('vk-stick').style = makeVKStyle(offTop + abxyHeight / 2 - vkh * 0.9 / 2, offLeft + abxyHeight / 2 - vkw * 0.9 / 2, vkw * 0.9, vkh * 0.9, fontSize * 0.85)
    vkStickPos = [offTop + abxyHeight / 2, offLeft + abxyHeight / 2, vkw * 0.9, vkh * 0.9, fontSize * 0.9]

    vkw = baseSize * 0.4
    vkh = baseSize * 0.4
    fontSize = baseSize * 0.4
    vkMap['select'].style = makeVKStyle(offTop + abxyHeight - vkh, window.innerWidth / 2 - vkw * 2.35 - 13.25 * window.innerHeight / 100, vkw, vkh, fontSize);
    vkMap['start'].style = makeVKStyle(offTop + abxyHeight - vkh, window.innerWidth / 2 + vkw * 1.35 + 13.25 * window.innerHeight / 100, vkw, vkh, fontSize);

}

function gameLoop() {
    uiAdjustVKLayout();  // Update the virtual keyboard state
    requestAnimationFrame(gameLoop);  // Schedule the next frame
}

// Start the loop
requestAnimationFrame(gameLoop);
console.log('running game loop done');
