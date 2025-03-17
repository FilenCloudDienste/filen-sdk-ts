import eslint from "@eslint/js"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import globals from "globals"

export default [
	eslint.configs.recommended,
	{
		files: ["**/*.ts", "**/*.tsx"],
		plugins: {
			"@typescript-eslint": tseslint
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module"
			},
			globals: {
				...globals.node,
				...globals.browser,
				Buffer: "readonly",
				BufferEncoding: "readonly",
				AbortSignal: "readonly",
				ReadableStream: "readonly",
				ReadableStreamDefaultController: "readonly",
				URLSearchParams: "readonly",
				URL: "readonly",
				FileReader: "readonly",
				File: "readonly",
				CryptoKey: "readonly",
				KeyUsage: "readonly",
				WorkerGlobalScope: "readonly",
				ServiceWorkerGlobalScope: "readonly",
				NodeJS: "readonly"
			}
		},
		rules: {
			eqeqeq: "error",
			quotes: ["error", "double"],
			"no-mixed-spaces-and-tabs": "off",
			"no-duplicate-imports": "error",
			"no-undef": "error",
			"no-dupe-class-members": "off", // TypeScript handles method overloading
			"no-redeclare": "off", // Disable base rule as it can report incorrect errors with TypeScript
			"@typescript-eslint/no-redeclare": [
				"error",
				{
					// Use TypeScript-aware version instead
					ignoreDeclarationMerge: true // Allow function overloading
				}
			],
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_"
				}
			],
			...tseslint.configs["eslint-recommended"].rules,
			...tseslint.configs.recommended.rules
		}
	},
	{
		ignores: [".git", "node_modules"]
	}
]
