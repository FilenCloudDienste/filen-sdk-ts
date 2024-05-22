/* eslint-disable no-constant-condition */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

import FilenSDK, { UPLOAD_CHUNK_SIZE } from "../src"
import config from "./dev.config.json"
import type { AuthVersion } from "../src/types"
import fs from "fs-extra"
import pathModule from "path"
import { generateRandomString } from "../src/crypto/utils"
import os from "os"
import axios from "axios"
import https from "https"
import { calculateChunkIndices } from "../src/cloud/utils"
import { Readable } from "stream"

const filen = new FilenSDK({
	email: config.email,
	password: config.password,
	masterKeys: config.masterKeys,
	apiKey: config.apiKey,
	publicKey: config.publicKey,
	privateKey: config.privateKey,
	authVersion: config.authVersion as AuthVersion,
	baseFolderUUID: config.baseFolderUUID,
	userId: config.userId,
	connectToSocket: false
})

const main = async () => {
	console.log(
		await filen
			.cloud()
			.filePublicLinkInfo({
				uuid: "fce3c11f-1b0c-499b-91b2-e7d25f0241d6",
				password: "xd",
				salt: "rmP769wLwcQ0v8fTIVgQ56r3yiNegWF5",
				key: "LVGUkFfIwYoSgakTr5yYI9ZRH8nvweQr"
			})
	)
}

main()
