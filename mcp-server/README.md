# Loadout MCP Server

Model Context Protocol server for [Loadout.fit](https://loadout.fit) — the operating system for fitness creators.

Plug Loadout directly into Claude, Cursor, Windsurf, or any MCP-compatible AI tool.

## Tools

| Tool | Description |
|------|-------------|
| `search_creators` | Discover fitness creators (paginated) |
| `get_creator` | Full creator profile + products as component tree |
| `get_products` | Creator's products with type filters |
| `get_coaching_forms` | Coaching application form schemas |
| `get_component_schema` | Full component schema reference |

## Resources

| Resource | Description |
|----------|-------------|
| `loadout://llms.txt` | Platform overview + API docs |

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "loadout": {
      "command": "node",
      "args": ["/path/to/loadout/mcp-server/dist/index.js"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "loadout": {
      "command": "node",
      "args": ["/path/to/loadout/mcp-server/dist/index.js"]
    }
  }
}
```

### npx (after publish)

```json
{
  "mcpServers": {
    "loadout": {
      "command": "npx",
      "args": ["@loadout/mcp-server"]
    }
  }
}
```

## Development

```bash
cd mcp-server
npm install
npm run build
npm run dev  # uses tsx for hot reload
```

## Example Prompts

Once connected, try:

- "Find fitness creators on Loadout"
- "What does avamiralles sell?"
- "Show me coaching application forms for jaretsmith"
- "What components does Loadout support?"
