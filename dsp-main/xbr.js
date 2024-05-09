/**
* 2xBR Filter
*
* Javascript implementation of the 2xBR filter.
*
* This is a rewrite of the previous 0.2.5 version, it outputs the same quality,
* however this version is about a magnitude **slower** than its predecessor. 
*
* Use this version if you want to learn how the algorithms works, as the code is 
* much more readable.
*
* @version 0.3.0
* @author Ascari <carlos.ascari.x@gmail.com>
*/
var xBR = (function () {
    "use strict";

    // Applies the xBR filter.
    function execute(context, srcX, srcY, srcW, srcH) {
        // Resolve arguments
        srcX = srcX | 0,
            srcY = srcY | 0,
            srcW = srcW || context.canvas.width,
            srcH = srcH || context.canvas.height;

        // Return the original image data without any processing
        return context.getImageData(srcX, srcY, srcW, srcH);
    }

    return execute;
})();
