export const txtCompatFile = {
	lastModified: new Date("January 11, 2025, 12:13:14.016 UTC").getTime(),
	creation: new Date("January 11, 2025, 12:13:14.015 UTC").getTime(),
	key: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
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
