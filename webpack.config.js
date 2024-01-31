// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path")

module.exports = [
	{
		// Browser Configuration
		mode: "production",
		entry: "./src/index.ts",
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "bundle.browser.js",
			libraryTarget: "umd",
			globalObject: "this"
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/
				}
			]
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
			fallback: {
				crypto: require.resolve("crypto-browserify"),
				path: require.resolve("path-browserify"),
				stream: require.resolve("stream-browserify"),
				assert: require.resolve("assert/"),
				zlib: require.resolve("browserify-zlib"),
				os: require.resolve("os-browserify"),
				http: require.resolve("http-browserify"),
				https: require.resolve("https-browserify")
			}
		},
		target: "web",
		devtool: "source-map" // Enable sourcemaps for debugging
	},
	{
		// Node.js Configuration
		mode: "production",
		entry: "./src/index.ts",
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "bundle.node.js",
			libraryTarget: "umd",
			globalObject: "global"
		},
		module: {
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/
				}
			]
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"]
		},
		target: "node",
		devtool: "source-map" // Enable sourcemaps for debugging
	}
]
