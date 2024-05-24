import striptags from "striptags";
export function createNotePreviewFromContentText({ content, type }) {
    if (content.length === 0) {
        return "";
    }
    const contentEx = content.split("\n");
    if (!contentEx[0]) {
        return "";
    }
    if (type === "rich") {
        if (content.indexOf("<p><br></p>") === -1) {
            return striptags(contentEx[0].slice(0, 128));
        }
        const contentExEx = content.split("<p><br></p>");
        if (!contentExEx[0]) {
            return "";
        }
        return striptags(contentExEx[0].slice(0, 128));
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
                return striptags(listPointEx[0].trim());
            }
        }
        return "";
    }
    return striptags(contentEx[0].slice(0, 128));
}
export const utils = {
    createNotePreviewFromContentText
};
export default utils;
//# sourceMappingURL=utils.js.map