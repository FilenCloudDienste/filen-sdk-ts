import type { NoteType } from "../api/v3/notes"

export function createNotePreviewFromContentText({ content, type }: { content: string; type: NoteType }) {
	if (content.length === 0) {
		return ""
	}

	if (type === "rich") {
		if (content.indexOf("<p><br></p>") === -1) {
			return content.split("\n")[0].slice(0, 128)
		}

		return content.split("<p><br></p>")[0].slice(0, 128)
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
			.split("<li>")

		for (const listPoint of ex) {
			const listPointEx = listPoint.split("</li>")

			if (listPointEx[0].trim().length > 0) {
				return listPointEx[0].trim()
			}
		}

		return ""
	}

	return content.split("\n")[0].slice(0, 128)
}

export const utils = {
	createNotePreviewFromContentText
}

export default utils
