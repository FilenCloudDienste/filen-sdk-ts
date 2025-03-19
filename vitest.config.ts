import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/*.{test,spec}.{js,ts}"],
		testTimeout: 300000,
		teardownTimeout: 300000,
		hookTimeout: 300000,
		globalSetup: ["tests/setup.ts"],
		pool: "threads",
		poolOptions: {
			threads: {
				singleThread: true
			}
		}
	}
})
