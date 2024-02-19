/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const webpack = require("webpack")
const TerserPlugin = require("terser-webpack-plugin")

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
			noParse: /browserfs\.js/,
			rules: [
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/
				}
			]
		},
		plugins: [
			new NodePolyfillPlugin({
				excludeAliases: ["fs", "buffer", "Buffer", "path", "process"]
			}),
			new webpack.ProvidePlugin({ BrowserFS: "bfsGlobal", process: "processGlobal", Buffer: "bufferGlobal" })
		],
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
			fallback: {
				process: require.resolve("process/browser")
			},
			alias: {
				fs: "browserfs/dist/shims/fs.js",
				buffer: "browserfs/dist/shims/buffer.js",
				path: "browserfs/dist/shims/path.js",
				processGlobal: "process/browser",
				process: "process/browser",
				bufferGlobal: "browserfs/dist/shims/bufferGlobal.js",
				bfsGlobal: require.resolve("browserfs")
			}
		},
		target: "web",
		optimization: {
			nodeEnv: "production",
			minimize: true,
			minimizer: [
				new TerserPlugin({
					parallel: true
				})
			]
		},
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
		optimization: {
			nodeEnv: "production",
			minimize: true,
			minimizer: [
				new TerserPlugin({
					parallel: true
				})
			]
		},
		devtool: "source-map" // Enable sourcemaps for debugging
	}
]
