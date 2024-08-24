"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.createNotePreviewFromContentText = void 0;
const striptags_1 = __importDefault(require("striptags"));
function createNotePreviewFromContentText({ content, type }) {
    var _a, _b;
    try {
        if (content.length === 0) {
            return "";
        }
        if (type === "rich") {
            if (content.indexOf("<p><br></p>") === -1) {
                return (0, striptags_1.default)((_a = content.split("\n")[0]) !== null && _a !== void 0 ? _a : "").slice(0, 128);
            }
            return (0, striptags_1.default)((_b = content.split("<p><br></p>")[0]) !== null && _b !== void 0 ? _b : "").slice(0, 128);
        }
        if (type === "checklist") {
            const ex = content
                // eslint-disable-next-line quotes
                .split('<ul data-checked="false">')
                .join("")
                // eslint-disable-next-line quotes
                .split('<ul data-checked="true">')
                .join("")
                .split("\n")
                .join("")
                .split("<li>");
            for (const listPoint of ex) {
                const listPointEx = listPoint.split("</li>");
                if (!listPointEx[0]) {
                    continue;
                }
                if (listPointEx[0].trim().length > 0) {
                    return (0, striptags_1.default)(listPointEx[0].trim());
                }
            }
            return "";
        }
        return (0, striptags_1.default)(content.split("\n")[0].slice(0, 128));
    }
    catch (_c) {
        return "";
    }
}
exports.createNotePreviewFromContentText = createNotePreviewFromContentText;
exports.utils = {
    createNotePreviewFromContentText
};
exports.default = exports.utils;
//# sourceMappingURL=utils.js.map