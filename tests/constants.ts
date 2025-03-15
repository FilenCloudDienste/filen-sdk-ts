export const txtCompatFile = {
	lastModified: new Date("January 11, 2025, 12:13:14.016 UTC").getTime(),
	creation: new Date("January 11, 2025, 12:13:14.015 UTC").getTime(),
	encryptionKey: "0123456789abcdefghijklmnopqrstuv",
	name: "large_sample-20mb.txt",
	path: "/compat-ts/large_sample-20mb.txt",
	content: Buffer.from(
		new Array(2700000)
			.fill(0)
			.map((_, index) => `${index}\n`)
			.join(""),
		"utf-8"
	)
}
