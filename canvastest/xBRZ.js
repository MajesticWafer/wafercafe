import {Scaler6x, Scaler5x, Scaler4x, Scaler3x, Scaler2x} from "./scalers/index.js";

const redMask = 0xff0000;
const greenMask = 0x00ff00;
const blueMask = 0x0000ff;

class IntPtr {
    constructor(intArray) {
        this.arr = intArray;
        this.ptr = 0;
    }

    position(pos) {
        this.ptr = pos;
    }

    get() {
        return this.arr[this.ptr];
    }

    set(val) {
        this.arr[this.ptr] = val;
    }
}

class BlendResult {
    constructor() {
        this.f = 0;
        this.g = 0;
        this.j = 0;
        this.k = 0;
    }

    reset() {
        this.f = 0;
        this.g = 0;
        this.j = 0;
        this.k = 0;
    }
}

const maxRots = 4;
const maxScale = 6;
const maxScaleSq = maxScale * maxScale;

class OutputMatrix {
    constructor(scale, out, outWidth) {
        this.out = new IntPtr(out);
        this.n = (scale - 2) * (maxRots * maxScaleSq);
        this.outWidth = outWidth;
        this.outi = 0;
        this.nr = 0
    }

    move(rotDeg, outi) {
        this.nr = this.n + rotDeg * maxScaleSq;
        this.outi = outi;
    }

    ref(i, j) {
        i = parseInt(i);
        j = parseInt(j);
        const rot = matrixRotation[this.nr + i * maxScale + j];
        this.out.position(this.outi + rot.J + rot.I * this.outWidth);
        return this.out;
    }
}


const Rot = (function () {
    /*
    |0|6|8|2|1|3|
    |7|5|2|0|6|8|
    |3|8|5|1|4|4|
    |4|4|5|1|3|7|
    |6|8|2|0|7|5|
    |1|3|8|2|0|7|
     */
    let arr = [];
    const
        a = 0, b = 1, c = 2,
        d = 3, e = 4, f = 5,
        g = 6, h = 7, i = 8;

    const deg0 = [
        a, b, c,
        d, e, f,
        g, h, i
    ];

    const deg90 = [
        g, d, a,
        h, e, b,
        i, f, c
    ];

    const deg180 = [
        i, h, g,
        f, e, d,
        c, b, a
    ];

    const deg270 = [
        c, f, i,
        b, e, h,
        a, d, g
    ];

    const rotation = [
        deg0, deg90, deg180, deg270
    ];

    for (let rotDeg = 0; rotDeg < 4; rotDeg++)
        for (let x = 0; x < 9; x++)
            arr[(x << 2) + rotDeg] = rotation[rotDeg][x];
    return arr;
})();

const BlendType = {
    'BLEND_NONE': 0,
    'BLEND_NORMAL': 1,
    'BLEND_DOMINANT': 2
};


const blendResult = new BlendResult();

function square(value) {
    return value * value;
}

// 用指定颜色填充区块
function fillBlock(trg, trgi, pitch, col, blockSize) {
    for (let y = 0; y < blockSize; ++y, trgi += pitch)
        for (let x = 0; x < blockSize; ++x)
            trg[trgi + x] = col
}

function distYCbCr(pix1, pix2, lumaWeight) {
    const r_diff = ((pix1 & redMask) - (pix2 & redMask)) >> 16;
    const g_diff = ((pix1 & greenMask) - (pix2 & greenMask)) >> 8;
    const b_diff = ((pix1 & blueMask) - (pix2 & blueMask));

    const k_b = 0.0722, k_r = 0.2126, k_g = 1 - k_b - k_r;
    const scale_b = 0.5 / (1 - k_b), scale_r = 0.5 / (1 - k_r);

    const y = k_r * r_diff + k_g * g_diff + k_b * b_diff;
    const c_b = scale_b * (b_diff - y);
    const c_r = scale_r * (r_diff - y);
    return square(lumaWeight * y) + square(c_b) + square(c_r);
}

function colorDist(pix1, pix2, luminanceWeight) {
    if (pix1 === pix2)
        return 0;
    return distYCbCr(pix1, pix2, luminanceWeight);
}

let config = {
    dominantDirectionThreshold: 3.6,
    luminanceWeight: 1.0,
    equalColorTolerance: 30.0,
    steepDirectionThreshold: 2.2
};

function preProcessCorners_colorDist_(col1, col2) {
    col1 = col1 & 0xffffffff;
    col2 = col2 & 0xffffffff;
    return colorDist(col1, col2, config.luminanceWeight)
}

const eqColorThres = square(config.equalColorTolerance);

function scalePixel_colorEq_(col1, col2) {
    return colorDist(col1, col2, config.luminanceWeight) < eqColorThres
}

function scalePixel_colorDist_(col1, col2) {
    return colorDist(col1, col2, config.luminanceWeight)
}

function buildMatrixRotation(rotDeg, I, J, N) {
    let I_old = 0, J_old = 0;
    if (rotDeg === 0) {
        I_old = I;
        J_old = J;
    } else {
        const old = buildMatrixRotation(rotDeg - 1, I, J, N);
        I_old = N - 1 - old.J;
        J_old = old.I;
    }
    return {I: I_old, J: J_old}
}

let matrixRotation = (function () {
    let matrixRotation = [];
    for (let n = 2; n < maxScale + 1; n++) {
        for (let r = 0; r < maxRots; r++) {
            let nr = (n - 2) * (maxRots * maxScaleSq) + r * maxScaleSq;
            for (let i = 0; i < maxScale; i++) {
                for (let j = 0; j < maxScale; j++) {
                    matrixRotation[nr + i * maxScale + j] = buildMatrixRotation(r, i, j, n);
                }
            }
        }
    }
    return matrixRotation;
})();

function preProcessCorners(ker4x4) {
    blendResult.reset();
    if ((ker4x4.f === ker4x4.g && ker4x4.j === ker4x4.k) ||
        (ker4x4.f === ker4x4.j && ker4x4.g === ker4x4.k))
        return;

    const dist = preProcessCorners_colorDist_;

    const weight = 4;
    const jg =
        dist(ker4x4.i, ker4x4.f) +
        dist(ker4x4.f, ker4x4.c) +
        dist(ker4x4.n, ker4x4.k) +
        dist(ker4x4.k, ker4x4.h) +
        weight * dist(ker4x4.j, ker4x4.g);
    const fk =
        dist(ker4x4.e, ker4x4.j) +
        dist(ker4x4.j, ker4x4.o) +
        dist(ker4x4.b, ker4x4.g) +
        dist(ker4x4.g, ker4x4.l) +
        weight * dist(ker4x4.f, ker4x4.k);

    if (jg < fk) {
        const dominantGradient = config.dominantDirectionThreshold * jg < fk;
        if (ker4x4.f !== ker4x4.g && ker4x4.f !== ker4x4.j)
            blendResult.f = dominantGradient ? BlendType.BLEND_DOMINANT : BlendType.BLEND_NORMAL;
        if (ker4x4.k !== ker4x4.g && ker4x4.k !== ker4x4.j)
            blendResult.k = dominantGradient ? BlendType.BLEND_DOMINANT : BlendType.BLEND_NORMAL;
    } else if (fk < jg) {
        const dominantGradient = config.dominantDirectionThreshold * fk < jg;
        if (ker4x4.j !== ker4x4.f && ker4x4.j !== ker4x4.k)
            blendResult.j = dominantGradient ? BlendType.BLEND_DOMINANT : BlendType.BLEND_NORMAL;
        if (ker4x4.g !== ker4x4.f && ker4x4.g !== ker4x4.k)
            blendResult.g = dominantGradient ? BlendType.BLEND_DOMINANT : BlendType.BLEND_NORMAL;
    }
}

const BlendInfo = {
    getTopL(b) {
        return (b & 0x3) & 0xff;
    },
    getTopR(b) {
        return ((b >> 2) & 0x3) & 0xff;
    },
    getBottomR(b) {
        return ((b >> 4) & 0x3) & 0xff;
    },
    getBottomL(b) {
        return ((b >> 6) & 0x3) & 0xff;
    },
    setTopL(b, bt) {
        return (b | bt) & 0xff
    },
    setTopR(b, bt) {
        return (b | bt << 2) & 0xff
    },
    setBottomR(b, bt) {
        return (b | bt << 4) & 0xff
    },
    setBottomL(b, bt) {
        return (b | (bt << 6)) & 0xff
    },
    rotate(b, rotDeg) {
        // assert rotDeg >= 0 && rotDeg < 4 : "RotationDegree enum does not have type: " + rotDeg;
        const l = rotDeg << 1;
        const r = 8 - l;
        return (b << l | b >> r) & 0xff;
    }
};

let outputMatrix;

function scalePixel(scaler, rotDeg, ker3x3, trg, trgi, trgWidth, blendInfo) {
    const b = ker3x3[Rot[(1 << 2) + rotDeg]];
    const c = ker3x3[Rot[(2 << 2) + rotDeg]];
    const d = ker3x3[Rot[(3 << 2) + rotDeg]];
    const e = ker3x3[Rot[(4 << 2) + rotDeg]];
    const f = ker3x3[Rot[(5 << 2) + rotDeg]];
    const g = ker3x3[Rot[(6 << 2) + rotDeg]];
    const h = ker3x3[Rot[(7 << 2) + rotDeg]];
    const i = ker3x3[Rot[(8 << 2) + rotDeg]];

    const blend = BlendInfo.rotate(blendInfo, rotDeg);
    if (BlendInfo.getBottomR(blend) === BlendType.BLEND_NONE)
        return;

    const eq = scalePixel_colorEq_;
    const dist = scalePixel_colorDist_;

    let doLineBlend;

    if (BlendInfo.getBottomR(blend) >= BlendType.BLEND_DOMINANT)
        doLineBlend = true;
    else if (BlendInfo.getTopR(blend) !== BlendType.BLEND_NONE && !eq(e, g))
        doLineBlend = false;
    else if (BlendInfo.getBottomL(blend) !== BlendType.BLEND_NONE && !eq(e, c))
        doLineBlend = false;
    else if (eq(g, h) && eq(h, i) && eq(i, f) && eq(f, c) && !eq(e, i))
        doLineBlend = false;
    else
        doLineBlend = true;

    const px = dist(e, f) <= dist(e, h) ? f : h;

    const out = outputMatrix;
    out.move(rotDeg, trgi);

    if (!doLineBlend) {
        scaler.blendCorner(px, out);
        return;
    }

    const fg = dist(f, g);
    const hc = dist(h, c);

    const haveShallowLine = config.steepDirectionThreshold * fg <= hc && e !== g && d !== g;
    const haveSteepLine = config.steepDirectionThreshold * hc <= fg && e !== c && b !== c;

    if (haveShallowLine) {
        if (haveSteepLine) {
            scaler.blendLineSteepAndShallow(px, out);
        } else {
            scaler.blendLineShallow(px, out);
        }
    } else {
        if (haveSteepLine) {
            scaler.blendLineSteep(px, out);
        } else {
            scaler.blendLineDiagonal(px, out);
        }
    }
}

export function scaleImage(scaleSize, src, trg, srcWidth, srcHeight, yFirst, yLast) {
    yFirst = Math.max(yFirst, 0);
    yLast = Math.min(yLast, srcHeight);

    if (yFirst >= yLast || srcWidth <= 0)
        return;

    const trgWidth = srcWidth * scaleSize;

    let preProcBuffer = [];
    let ker4 = {
        a: 0, b: 0, c: 0, d: 0,
        e: 0, f: 0, g: 0, h: 0,
        i: 0, j: 0, k: 0, l: 0,
        m: 0, n: 0, o: 0, p: 0,
    };

    if (yFirst > 0) {
        const y = yFirst - 1;
        const s_m1 = srcWidth * Math.max(y - 1, 0);
        const s_0 = srcWidth * y;
        const s_p1 = srcWidth * Math.min(y + 1, srcHeight - 1);
        const s_p2 = srcWidth * Math.min(y + 2, srcHeight - 1);

        for (let x = 0; x < srcWidth; ++x) {
            const x_m1 = Math.max(x - 1, 0);
            const x_p1 = Math.min(x + 1, srcWidth - 1);
            const x_p2 = Math.min(x + 2, srcWidth - 1);

            ker4.a = src[s_m1 + x_m1];
            ker4.b = src[s_m1 + x];
            ker4.c = src[s_m1 + x_p1];
            ker4.d = src[s_m1 + x_p2];

            ker4.e = src[s_0 + x_m1];
            ker4.f = src[s_0 + x];
            ker4.g = src[s_0 + x_p1];
            ker4.h = src[s_0 + x_p2];

            ker4.i = src[s_p1 + x_m1];
            ker4.j = src[s_p1 + x];
            ker4.k = src[s_p1 + x_p1];
            ker4.l = src[s_p1 + x_p2];

            ker4.m = src[s_p2 + x_m1];
            ker4.n = src[s_p2 + x];
            ker4.o = src[s_p2 + x_p1];
            ker4.p = src[s_p2 + x_p2];

            preProcessCorners(ker4);

            preProcBuffer[x] = BlendInfo.setTopR(preProcBuffer[x], blendResult.j);
            if (x + 1 < srcWidth)
                preProcBuffer[x + 1] = BlendInfo.setTopL(preProcBuffer[x + 1] & 0xff, blendResult.k);
        }
    }

    outputMatrix = new OutputMatrix(scaleSize, trg, trgWidth);

    let blend_xy = 0;
    let blend_xy1 = 0;

    let ker3 = [];

    for (let y = yFirst; y < yLast; ++y) {
        let trgi = scaleSize * y * trgWidth;
        const s_m1 = srcWidth * Math.max(y - 1, 0);
        const s_0 = srcWidth * y;
        const s_p1 = srcWidth * Math.min(y + 1, srcHeight - 1);
        const s_p2 = srcWidth * Math.min(y + 2, srcHeight - 1);

        blend_xy1 = 0;

        for (let x = 0; x < srcWidth; ++x, trgi += scaleSize) {
            const x_m1 = Math.max(x - 1, 0);
            const x_p1 = Math.min(x + 1, srcWidth - 1);
            const x_p2 = Math.min(x + 2, srcWidth - 1);
            {
                ker4.a = src[s_m1 + x_m1];
                ker4.b = src[s_m1 + x];
                ker4.c = src[s_m1 + x_p1];
                ker4.d = src[s_m1 + x_p2];

                ker4.e = src[s_0 + x_m1];
                ker4.f = src[s_0 + x];
                ker4.g = src[s_0 + x_p1];
                ker4.h = src[s_0 + x_p2];

                ker4.i = src[s_p1 + x_m1];
                ker4.j = src[s_p1 + x];
                ker4.k = src[s_p1 + x_p1];
                ker4.l = src[s_p1 + x_p2];

                ker4.m = src[s_p2 + x_m1];
                ker4.n = src[s_p2 + x];
                ker4.o = src[s_p2 + x_p1];
                ker4.p = src[s_p2 + x_p2];
                preProcessCorners(ker4);

                blend_xy = BlendInfo.setBottomR(preProcBuffer[x], blendResult.f);
                blend_xy1 = BlendInfo.setTopR(blend_xy1, blendResult.j);
                preProcBuffer[x] = blend_xy1;

                blend_xy1 = BlendInfo.setTopL(0, blendResult.k);
                if (x + 1 < srcWidth)
                    preProcBuffer[x + 1] = BlendInfo.setBottomL(preProcBuffer[x + 1], blendResult.g);
            }

            fillBlock(trg, trgi, trgWidth, src[s_0 + x], scaleSize);

            if (blend_xy === 0)
                continue;

            const a = 0, b = 1, c = 2, d = 3, e = 4, f = 5, g = 6, h = 7, i = 8;

            ker3[a] = src[s_m1 + x_m1];
            ker3[b] = src[s_m1 + x];
            ker3[c] = src[s_m1 + x_p1];

            ker3[d] = src[s_0 + x_m1];
            ker3[e] = src[s_0 + x];
            ker3[f] = src[s_0 + x_p1];

            ker3[g] = src[s_p1 + x_m1];
            ker3[h] = src[s_p1 + x];
            ker3[i] = src[s_p1 + x_p1];

            let scaler;
            switch (scaleSize) {
                case 2:
                    scaler = new Scaler2x();
                    break;
                case 3:
                    scaler = new Scaler3x();
                    break;
                case 4:
                    scaler = new Scaler4x();
                    break;
                case 5:
                    scaler = new Scaler5x();
                    break;
                case 6:
                    scaler = new Scaler6x();
                    break;
                default:
                    scaler = new Scaler6x();
                    break;
            }

            scalePixel(scaler, 0, ker3, trg, trgi, trgWidth, blend_xy);
            scalePixel(scaler, 1, ker3, trg, trgi, trgWidth, blend_xy);
            scalePixel(scaler, 2, ker3, trg, trgi, trgWidth, blend_xy);
            scalePixel(scaler, 3, ker3, trg, trgi, trgWidth, blend_xy);
        }
    }
}














