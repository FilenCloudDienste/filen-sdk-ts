import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/*.{test,spec}.{js,ts}"],
		testTimeout: 60000,
		globalSetup: ["tests/setup.ts"]
	}
})
