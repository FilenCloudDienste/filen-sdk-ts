import FilenSDK from ".."
import config from "./dev.config.json"
import type { AuthVersion } from "../src/types"

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
	console.log(await filen.api(3).dir().linked().fetch({ uuid: "3c90310b-dc15-47ef-b931-149414aedfe2" }))
}

main()
