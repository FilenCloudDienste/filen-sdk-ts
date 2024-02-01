export {}

// Global declarations for the ReactNative <-> Node.JS bridge
// Keep it in sync (only the needed functions) with the actual app at all times

declare global {
	// eslint-disable-next-line no-var
	var nodeThread: {
		encryptData: (params: { base64: string; key: string }) => Promise<Uint8Array>
		decryptData: (params: { base64: string; key: string; version: number }) => Promise<Uint8Array>
		deriveKeyFromPassword: (params: {
			password: string
			salt: string
			iterations: number
			hash: string
			bitLength: number
			returnHex: boolean
		}) => Promise<Uint8Array | string>
		encryptMetadata: (params: { data: string; key: string }) => Promise<string>
		decryptMetadata: (params: { data: string; key: string }) => Promise<string>
		encryptMetadataPublicKey: (params: { data: string; publicKey: string }) => Promise<string>
		decryptMetadataPrivateKey: (params: { data: string; privateKey: string }) => Promise<string>
		generateKeypair: () => Promise<{ publicKey: string; privateKey: string }>
		hashPassword: (params: { password: string }) => Promise<string>
		hashFn: (params: { string: string }) => Promise<string>
		generateRandomString: (params: { charLength?: number }) => Promise<string>
	}
}
