function addScript(src, id, onload) {
	if (document.getElementById(id)) return;
	let fjs = document.getElementsByTagName("script")[0];
	let js = document.createElement("script");
	js.id = id;
	fjs.parentNode.insertBefore(js, fjs);
	js.onload = onload;
	js.src = src;
}

addScript('js/poki-sdk.js', "poki-sdk", () => {
	PokiSDK.init().then(
    () => {
        console.log("Poki SDK successfully initialized");
        globalThis.PokiHasInitialised = true;

    }
	).catch(
		() => {
			console.log("Initialized, but the user likely has adblock");
			globalThis.PokiHasInitialised = true;
		}
	);
	PokiSDK.setDebug(false);
})

window.addEventListener('keydown', ev => {
    if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
        ev.preventDefault();
    }
});
window.addEventListener('wheel', ev => ev.preventDefault(), { passive: false });


 var _0x4e87=[
	// 'LmNvbQ==', // .com
	'LmdpdGh1Yi5pbw==', // .github.io
	'bG9jYWxob3N0',
	'139KObtWR',
	'6505XySddN',
	'1187125jopCbV',
	'913662FnvCIe',
	'740825sNyBkZ',
	'459327dmigPF',
	'335606FqHNeg',
	'770186hYUBAW',
	'some',
	'top',
	'I3ViZzIzNQ==',
	'location',
	'length',
	'href'];
	var _0x3b7c=function(_0x286367,_0x417686){_0x286367=_0x286367-0x154;var _0x4e87dc=_0x4e87[_0x286367];return _0x4e87dc;};(function(_0x5930ec,_0x5bbb0f){var _0x5734eb=_0x3b7c;while(!![]){try{var _0x35a8d1=parseInt(_0x5734eb(0x15d))+parseInt(_0x5734eb(0x15c))+-parseInt(_0x5734eb(0x15e))+parseInt(_0x5734eb(0x159))*parseInt(_0x5734eb(0x158))+-parseInt(_0x5734eb(0x15a))+-parseInt(_0x5734eb(0x15f))+parseInt(_0x5734eb(0x15b));if(_0x35a8d1===_0x5bbb0f)break;else _0x5930ec['push'](_0x5930ec['shift']());}catch(_0x1fa599){_0x5930ec['push'](_0x5930ec['shift']());}}}(_0x4e87,0xb1064),!function(){'use strict';var _0x304169=_0x3b7c;var _0x459911=window['xlocation']['hostname'];[_0x304169(0x157),_0x304169(0x156),'LnBva2ktZ2RuLmNvbQ==']['map'](function(_0x144582){return atob(_0x144582);})[_0x304169(0x160)](function(_0x2b5e70){return function(_0x35a858,_0x8834ae){var _0x4bed7b=_0x3b7c;return'.'===_0x8834ae['charAt'](0x0)?-0x1!==_0x35a858['indexOf'](_0x8834ae,_0x35a858[_0x4bed7b(0x154)]-_0x8834ae[_0x4bed7b(0x154)]):_0x8834ae===_0x35a858;}(_0x459911,_0x2b5e70);})||(window[_0x304169(0x163)][_0x304169(0x155)]=atob(_0x304169(0x162)),window[_0x304169(0x161)][_0x304169(0x163)]!==window[_0x304169(0x163)]&&(window[_0x304169(0x161)][_0x304169(0x163)]==window[_0x304169(0x163)]));}());

