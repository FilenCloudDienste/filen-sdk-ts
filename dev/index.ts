import FilenSDK from "../src"
import config from "./dev.config.json"
import type { AuthVersion } from "../src/types"
import fs from "fs-extra"
import pathModule from "path"
import { generateRandomString } from "../src/crypto/utils"

const filen = new FilenSDK({
	email: config.email,
	password: config.password,
	masterKeys: config.masterKeys,
	apiKey: config.apiKey,
	publicKey: config.publicKey,
	privateKey: config.privateKey,
	authVersion: config.authVersion as AuthVersion,
	baseFolderUUID: config.baseFolderUUID,
	userId: config.userId
})

const main = async () => {
	const content = await filen.api(3).dir().content({ uuid: "6fc3d024-083f-41ba-906e-638a12a13a71" })

	for (const folders of content.folders) {
		console.log(await filen.crypto().decrypt().folderMetadata({ metadata: folders.name }))
	}

	for (const file of content.uploads) {
		console.log(await filen.crypto().decrypt().fileMetadata({ metadata: file.metadata }))
	}

	const inputFile = pathModule.join(__dirname, "dev.config.json")
	const outputFile = pathModule.join(__dirname, "dev.config.json.encrypted")

	await Promise.all([
		fs.rm(pathModule.join(__dirname, "dev.config.json.decrypted"), {
			force: true,
			maxRetries: 60 * 10,
			recursive: true,
			retryDelay: 100
		}),
		fs.rm(pathModule.join(__dirname, "dev.config.json.encrypted"), {
			force: true,
			maxRetries: 60 * 10,
			recursive: true,
			retryDelay: 100
		})
	])

	const key = await generateRandomString({ length: 32 })

	await filen.crypto().encrypt().dataStream({ inputFile, outputFile, key })
	await filen
		.crypto()
		.decrypt()
		.dataStream({ inputFile: outputFile, outputFile: pathModule.join(__dirname, "dev.config.json.decrypted"), key, version: 2 })
}

main()
