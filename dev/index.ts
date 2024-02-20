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
	const dir = await filen.cloud().listDirectory({ uuid: config.baseFolderUUID })

	console.log(dir)
}

main()
