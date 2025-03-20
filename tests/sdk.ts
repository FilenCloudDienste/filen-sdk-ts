import "dotenv/config"
import FilenSDK from "../src"
import { Semaphore } from "../src/semaphore"

const sdk = new FilenSDK()
const mutex = new Semaphore(1)

export async function getSDK(): Promise<FilenSDK> {
	await mutex.acquire()

	try {
		if (typeof sdk.config.apiKey === "string" && sdk.config.apiKey.length > 0 && sdk.config.apiKey !== "anonymous") {
			return sdk
		}

		if (!process.env.TEST_ACC_EMAIL || !process.env.TEST_ACC_PASS) {
			throw new Error("Test environment variables not defined.")
		}

		await sdk.login({
			email: process.env.TEST_ACC_EMAIL ?? "",
			password: process.env.TEST_ACC_PASS ?? ""
		})

		return sdk
	} finally {
		mutex.release()
	}
}
