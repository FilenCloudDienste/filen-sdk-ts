import type { NoteType } from "../api/v3/notes";
export declare function createNotePreviewFromContentText({ content, type }: {
    content: string;
    type: NoteType;
}): string;
export declare const utils: {
    createNotePreviewFromContentText: typeof createNotePreviewFromContentText;
};
export default utils;
