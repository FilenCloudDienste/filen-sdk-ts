// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require("webpack")

module.exports = [
	{
		// Browser Configuration
		mode: "production",
		entry: "./src/index.ts",
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: "bundle.browser.js",
			libraryTarget: "umd",
			globalObject: "globalThis"
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
		plugins: [
			new webpack.ProvidePlugin({
				Buffer: ["buffer", "Buffer"]
			})
		],
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
				https: require.resolve("https-browserify"),
				util: require.resolve("util"),
				buffer: require.resolve("buffer/")
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
