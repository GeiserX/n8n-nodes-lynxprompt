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

## License

GPL-3.0
