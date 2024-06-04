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
	...config,
	authVersion: config.authVersion as AuthVersion
})

const main = async () => {
	console.log("starting")

	console.log("done")
}

main()
