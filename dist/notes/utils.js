"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = exports.createNotePreviewFromContentText = void 0;
function createNotePreviewFromContentText({ content, type }) {
    if (content.length === 0) {
        return "";
    }
    if (type === "rich") {
        if (content.indexOf("<p><br></p>") === -1) {
            return content.split("\n")[0].slice(0, 128);
        }
        return content.split("<p><br></p>")[0].slice(0, 128);
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
            if (listPointEx[0].trim().length > 0) {
                return listPointEx[0].trim();
            }
        }
        return "";
    }
    return content.split("\n")[0].slice(0, 128);
}
exports.createNotePreviewFromContentText = createNotePreviewFromContentText;
exports.utils = {
    createNotePreviewFromContentText
};
exports.default = exports.utils;
//# sourceMappingURL=utils.js.map