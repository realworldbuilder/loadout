#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.LOADOUT_API_URL || "https://loadout.fit";

async function apiFetch(path: string): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

const server = new McpServer({
  name: "loadout",
  version: "1.0.0",
});

// --- Tools ---

server.tool(
  "search_creators",
  "Search and discover fitness creators on Loadout. Returns creator handles, names, product counts, and tiers.",
  {
    limit: z.number().min(1).max(100).default(20).describe("Max results to return"),
    offset: z.number().min(0).default(0).describe("Pagination offset"),
  },
  async ({ limit, offset }) => {
    const data = await apiFetch(`/api/v1/creators?limit=${limit}&offset=${offset}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  "get_creator",
  "Get a fitness creator's full profile including bio, social links, theme, and all products organized into sections. Returns a component tree that can be rendered.",
  {
    handle: z.string().describe("Creator's handle (e.g. 'therock', 'avamiralles')"),
  },
  async ({ handle }) => {
    const data = await apiFetch(`/api/v1/creators/${encodeURIComponent(handle)}`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  "get_products",
  "Get a creator's products. Optionally filter by type (program, ebook, coaching, supplement, merch, link, digital).",
  {
    handle: z.string().describe("Creator's handle"),
    type: z.string().optional().describe("Product type filter"),
    limit: z.number().min(1).max(100).default(50).describe("Max results"),
    offset: z.number().min(0).default(0).describe("Pagination offset"),
  },
  async ({ handle, type, limit, offset }) => {
    let path = `/api/v1/creators/${encodeURIComponent(handle)}/products?limit=${limit}&offset=${offset}`;
    if (type) path += `&type=${encodeURIComponent(type)}`;
    const data = await apiFetch(path);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  "get_coaching_forms",
  "Get coaching application forms for a creator. Returns form schemas with fields that can be filled out to apply for coaching.",
  {
    handle: z.string().describe("Creator's handle"),
  },
  async ({ handle }) => {
    const data = await apiFetch(`/api/v1/creators/${encodeURIComponent(handle)}/forms`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool(
  "get_component_schema",
  "Get the full component schema — all renderable components, their props, and variants. Useful for understanding what Loadout's API returns and how to render it.",
  {},
  async () => {
    const data = await apiFetch(`/api/v1/schema`);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

// --- Resources ---

server.resource(
  "llms-txt",
  "loadout://llms.txt",
  { description: "Loadout platform overview and API documentation for LLMs", mimeType: "text/plain" },
  async () => {
    const res = await fetch(`${BASE_URL}/llms.txt`);
    const text = await res.text();
    return { contents: [{ uri: "loadout://llms.txt", text, mimeType: "text/plain" }] };
  }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Loadout MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
