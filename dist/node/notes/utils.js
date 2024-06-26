"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.createNotePreviewFromContentText = void 0;
const striptags_1 = __importDefault(require("striptags"));
function createNotePreviewFromContentText({ content, type }) {
    if (content.length === 0) {
        return "";
    }
    const contentEx = content.split("\n");
    if (!contentEx[0]) {
        return "";
    }
    if (type === "rich") {
        if (content.indexOf("<p><br></p>") === -1) {
            return (0, striptags_1.default)(contentEx[0].slice(0, 128));
        }
        const contentExEx = content.split("<p><br></p>");
        if (!contentExEx[0]) {
            return "";
        }
        return (0, striptags_1.default)(contentExEx[0].slice(0, 128));
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
                return "";
            }
            if (listPointEx[0].trim().length > 0) {
                return (0, striptags_1.default)(listPointEx[0].trim());
            }
        }
        return "";
    }
    return (0, striptags_1.default)(contentEx[0].slice(0, 128));
}
exports.createNotePreviewFromContentText = createNotePreviewFromContentText;
exports.utils = {
    createNotePreviewFromContentText
};
exports.default = exports.utils;
//# sourceMappingURL=utils.js.map