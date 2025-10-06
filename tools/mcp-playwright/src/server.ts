import { createServer } from "@modelcontextprotocol/sdk/server/stdio";
import { z } from "zod";
import { chromium, Browser, Page, BrowserContext, LaunchOptions } from "playwright";

// Minimal Playwright MCP server exposing: open, screenshot, getConsoleLogs

type ConsoleEntry = {
  type: string;
  text: string;
  timestamp: number;
};

class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private consoleEntries: ConsoleEntry[] = [];

  async ensurePage(headless: boolean = true): Promise<Page> {
    if (!this.browser) {
      const launchOptions: LaunchOptions = { headless };
      this.browser = await chromium.launch(launchOptions);
    }
    if (!this.context) {
      this.context = await this.browser.newContext();
    }
    if (!this.page) {
      this.page = await this.context.newPage();
      this.page.on("console", (msg) => {
        this.consoleEntries.push({
          type: msg.type(),
          text: msg.text(),
          timestamp: Date.now(),
        });
      });
    }
    return this.page;
  }

  getConsoleLogs(limit?: number): ConsoleEntry[] {
    if (limit && limit > 0) {
      return this.consoleEntries.slice(-limit);
    }
    return [...this.consoleEntries];
  }
}

const browserManager = new BrowserManager();
const server = createServer({
  name: "mcp-playwright-server",
  version: "0.1.0",
});

// Tool: open a page with optional basic auth
server.tool(
  {
    name: "open",
    description: "Open a URL in a Playwright-controlled browser. Supports optional basic auth and headless flag.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        headless: { type: "boolean" },
        auth: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
          required: ["username", "password"],
        },
      },
      required: ["url"],
    },
  },
  async (args) => {
    const url = String((args as any).url);
    const headless = Boolean((args as any).headless ?? true);
    const auth = (args as any).auth as { username: string; password: string } | undefined;

    const page = await browserManager.ensurePage(headless);
    if (auth) {
      await page.route("**/*", async (route) => {
        const headers = {
          ...route.request().headers(),
          Authorization: `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString("base64")}`,
        };
        await route.continue({ headers });
      });
    }
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    return {
      content: [
        {
          type: "text",
          text: `Opened ${url} with status ${response?.status() ?? "n/a"}`,
        },
      ],
    };
  }
);

// Tool: screenshot current page
server.tool(
  {
    name: "screenshot",
    description: "Take a screenshot of the current page and return it as base64.",
    inputSchema: {
      type: "object",
      properties: {
        fullPage: { type: "boolean" },
      },
    },
  },
  async (args) => {
    const page = await browserManager.ensurePage();
    const fullPage = Boolean((args as any).fullPage ?? true);
    const buf = await page.screenshot({ fullPage });
    return {
      content: [
        {
          type: "image",
          data: buf.toString("base64"),
          mimeType: "image/png",
        },
      ],
    };
  }
);

// Tool: get recent console logs
server.tool(
  {
    name: "getConsoleLogs",
    description: "Return recent captured console logs from the current page.",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "number" } },
    },
  },
  async (args) => {
    const limit = (args as any).limit as number | undefined;
    const logs = browserManager.getConsoleLogs(limit);
    return {
      content: [
        {
          type: "json",
          data: logs,
        },
      ],
    };
  }
);

server.start();

