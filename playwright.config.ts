import { defineConfig } from "@playwright/test";

// E2E gate — runs against the LIVE stack (vite dev on 5173 -> FastAPI on 8000
// via proxy, backed by docker compose Postgres). Never against MSW.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
    env: { VITE_USE_MOCKS: "false" },
  },
});
