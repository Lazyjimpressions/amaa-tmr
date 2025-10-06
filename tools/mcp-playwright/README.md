# Playwright MCP Server

A minimal Model Context Protocol (MCP) server that exposes Playwright-driven browser tools to Cursor:

- `open(url, headless?, auth?)`
- `screenshot(fullPage?)`
- `getConsoleLogs(limit?)`

## Install

```bash
cd /Users/jonathanhughes/Development/amaa-tmr/tools/mcp-playwright
npm install
npx playwright install chromium
npm run build
```

## Run locally

```bash
npm run start
```

## Cursor MCP config (example)

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["/Users/jonathanhughes/Development/amaa-tmr/tools/mcp-playwright/dist/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Notes
- Headless defaults to true; set `headless: false` in `open` for a visible browser.
- `auth` adds Basic Auth header for all requests in the page session.
