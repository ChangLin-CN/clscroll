"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.throwError = throwError;
function throwError(desc) {
    throw new Error("CLScroll:" + desc);
}