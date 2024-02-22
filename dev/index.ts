/* eslint-disable @typescript-eslint/no-unused-vars */

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
	const dir = await filen.cloud().getDirectoryTree({ uuid: "fc7f2ba0-619c-4a75-8a72-91f5ad31fff7", skipCache: true })

	console.log(Object.keys(dir).length)

	const dir2 = await filen.cloud().getDirectoryTree({ uuid: "fc7f2ba0-619c-4a75-8a72-91f5ad31fff7", skipCache: true })

	console.log(Object.keys(dir2).length)
}

main()
