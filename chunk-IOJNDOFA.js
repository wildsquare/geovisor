import {
  inflate_1
} from "./chunk-6NNRQQ2U.js";
import {
  BaseDecoder
} from "./chunk-2A6MJEIX.js";
import "./chunk-4MWRP73S.js";

// node_modules/geotiff/dist-module/compression/deflate.js
var DeflateDecoder = class extends BaseDecoder {
  decodeBlock(buffer) {
    return inflate_1(new Uint8Array(buffer)).buffer;
  }
};
export {
  DeflateDecoder as default
};
//# sourceMappingURL=chunk-IOJNDOFA.js.map
