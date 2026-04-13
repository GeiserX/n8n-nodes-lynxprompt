# n8n-nodes-lynxprompt

[n8n](https://n8n.io/) community node for [LynxPrompt](https://lynxprompt.com) — manage AI configuration blueprints (AGENTS.md, CLAUDE.md, .cursorrules) via the LynxPrompt API.

## Installation

In your n8n instance go to **Settings > Community Nodes** and install:

```
n8n-nodes-lynxprompt
```

## Credentials

1. In LynxPrompt, navigate to your account settings and generate an API token (prefixed `lp_`).
2. In n8n, create a new **LynxPrompt API** credential and enter:
   - **URL** — base URL of your instance (default `https://lynxprompt.com`)
   - **API Token** — your `lp_...` token

## Nodes

### LynxPrompt

CRUD operations for blueprints, hierarchies, and user info.

| Resource | Operations |
|---|---|
| Blueprint | List, Get, Create, Update, Delete |
| Hierarchy | List, Get, Create, Update, Delete |
| User | Get Current |

### LynxPrompt Trigger

Polling trigger that fires when:

- **New Blueprint Created** — detects blueprints not seen in previous polls
- **Blueprint Updated** — detects changes in `updated_at` timestamps

## Other n8n Community Nodes by GeiserX

- [n8n-nodes-cashpilot](https://github.com/GeiserX/n8n-nodes-cashpilot) — Passive income monitoring
- [n8n-nodes-genieacs](https://github.com/GeiserX/n8n-nodes-genieacs) — TR-069 device management
- [n8n-nodes-pumperly](https://github.com/GeiserX/n8n-nodes-pumperly) — Fuel and EV charging prices
- [n8n-nodes-telegram-archive](https://github.com/GeiserX/n8n-nodes-telegram-archive) — Telegram message archive
- [n8n-nodes-way-cms](https://github.com/GeiserX/n8n-nodes-way-cms) — Web archive content management


## Related Projects

| Project | Description |
|---------|-------------|
| [LynxPrompt](https://github.com/GeiserX/LynxPrompt) | Self-hosted platform for AI IDE/Tools Rules and Commands via WebUI and CLI |
| [lynxprompt-vscode](https://github.com/GeiserX/lynxprompt-vscode) | VS Code extension for LynxPrompt AI configuration file management |
| [lynxprompt-action](https://github.com/GeiserX/lynxprompt-action) | GitHub Action to sync and validate AI IDE configuration files with LynxPrompt |
| [lynxprompt-mcp](https://github.com/GeiserX/lynxprompt-mcp) | MCP Server for LynxPrompt AI configuration blueprint management |
| [homebrew-lynxprompt](https://github.com/GeiserX/homebrew-lynxprompt) | Homebrew tap for LynxPrompt CLI |

## License

GPL-3.0
