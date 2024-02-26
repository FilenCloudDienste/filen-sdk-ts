/* eslint-disable @typescript-eslint/no-unused-vars */

import FilenSDK from "../src"
import config from "./dev.config.json"
import type { AuthVersion } from "../src/types"
import fs from "fs-extra"
import pathModule from "path"
import { generateRandomString } from "../src/crypto/utils"
import os from "os"

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
	const dir = await filen.fs().readdir({ path: "/Pictures" })

	console.log(dir)
	const proms: Promise<void>[] = []

	for (const file of dir) {
		proms.push(
			new Promise((resolve, reject) => {
				filen
					.fs()
					.stat({ path: "/Pictures/" + file })
					.then(stats => {
						if (stats.isDirectory()) {
							resolve()

							return
						}

						filen
							.fs()
							.download({ path: "/Pictures/" + file, destination: pathModule.join(os.tmpdir(), file) })
							.then(() => resolve())
							.catch(reject)
					})
					.catch(reject)
			})
		)
	}

	await Promise.all(proms)
}

main()
