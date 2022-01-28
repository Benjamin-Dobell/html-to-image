var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cloneNode } from './cloneNode';
import { embedImages } from './embedImages';
import { applyStyleWithOptions } from './applyStyleWithOptions';
import { embedWebFonts, getWebFontCSS } from './embedWebFonts';
import { canvasToBlob, imageToCanvas, createImage, getImageSize, nodeToDataURL, } from './util';
export function toSvg(node, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { width, height } = getImageSize(node, options);
        return Promise.resolve(node)
            .then((nativeNode) => cloneNode(nativeNode, options, true))
            .then((clonedNode) => embedWebFonts(clonedNode, options))
            .then((clonedNode) => embedImages(clonedNode, options))
            .then((clonedNode) => applyStyleWithOptions(clonedNode, options))
            .then((clonedNode) => nodeToDataURL(clonedNode, width, height));
    });
}
export function toCanvas(node, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return toSvg(node, options)
            .then(createImage)
            .then((img) => imageToCanvas(node, img, options));
    });
}
export function toPixelData(node, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { width, height } = getImageSize(node, options);
        return toCanvas(node, options).then((canvas) => {
            const ctx = canvas.getContext('2d');
            return ctx.getImageData(0, 0, width, height).data;
        });
    });
}
export function toPng(node, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return toCanvas(node, options).then((canvas) => canvas.toDataURL());
    });
}
export function toJpeg(node, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return toCanvas(node, options).then((canvas) => canvas.toDataURL('image/jpeg', options.quality || 1));
    });
}
export function toBlob(node, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return toCanvas(node, options).then(canvasToBlob);
    });
}
export function getFontEmbedCSS(node, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return getWebFontCSS(node, options);
    });
}
//# sourceMappingURL=index.js.map