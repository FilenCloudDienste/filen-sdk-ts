<br/>
<p align="center">
  <h3 align="center">Filen SDK</h3>

  <p align="center">
    SDK to interact with Filen for Node.JS, Browsers and React Native.
    <br/>
    <br/>
    <a href="https://sdk-ts-docs.filen.io"><strong>Explore the docs »</strong></a>
    <br/>
    <br/>
  </p>
</p>

![Contributors](https://img.shields.io/github/contributors/FilenCloudDienste/filen-sdk-ts?color=dark-green) ![Forks](https://img.shields.io/github/forks/FilenCloudDienste/filen-sdk-ts?style=social) ![Stargazers](https://img.shields.io/github/stars/FilenCloudDienste/filen-sdk-ts?style=social) ![Issues](https://img.shields.io/github/issues/FilenCloudDienste/filen-sdk-ts) ![License](https://img.shields.io/github/license/FilenCloudDienste/filen-sdk-ts)

### Installation

1. Install using NPM

```sh
npm install @filen/sdk@latest
```

2. Initialize the SDK.

```typescript
import { FilenSDK } from "@filen/sdk"
import path from "path"
import os from "os"

type FilenSDKConfig = {
	email?: string
	password?: string
	twoFactorCode?: string
	masterKeys?: string[]
	apiKey?: string
	publicKey?: string
	privateKey?: string
	authVersion?: AuthVersion
	baseFolderUUID?: string
	userId?: number
	metadataCache?: boolean // Cache decrypted metadata in memory. Recommended.
	tmpPath?: string // Temporary local path used to store metadata and chunks. Only available in Node.JS.,
	connectToSocket?: boolean // Recommended if you are using the virtual FS class. Keeps the internal item tree up to date with remote changes.
}

// You can either directly supply all needed config parameters to the constructor or call the .login() function to fetch them using your login information.
const filen = new FilenSDK({
	metadataCache: true,
	connectToSocket: true,
	tmpPath: path.join(os.tmpdir(), "filen-sdk")
})

await filen.login({
	email: "your@email.com",
	password: "supersecret123",
	twoFactorCode: "123456"
})
```

3. Interact with the cloud

```typescript
// Create a directory
await filen.fs().mkdir({
	path: "/Pictures"
})

// Upload a file
await filen.fs().upload({
	path: "/Pictures",
	source: "/Local/path/to/a/file.jpg"
})

// Read contents of the directory
const content: string[] = await filen.fs().readdir({
	path: "/Pictures"
})

// Stat a file
const stats: FSStats = await filen.fs().stat({
	path: "/Pictures/file.jpg"
})

// Download a file
await filen.fs().download({
	path: "/Pictures/file.jpg",
	destination: "/Local/path/to/a/file.jpg"
})

// Read a file
const content: Buffer = await filen.fs().readFile({
	path: "/Pictures/file.jpg"
})

// Write to a path
await filen.fs().writeFile({
	path: "/text.txt",
	content: Buffer.from("foobar", "utf-8")
})
```

## License

Distributed under the AGPL-3.0 License. See [LICENSE](https://github.com/FilenCloudDienste/filen-sdk-ts/blob/main/LICENSE.md) for more information.
