# CLAUDE.md - indiekit-endpoint-readlater

## Package Overview

`@rmdes/indiekit-endpoint-readlater` is a "Read It Later" plugin for Indiekit. It provides a private bookmark list where you can save URLs from any context (microsub reader, activitypub reader, blogroll, podroll, listening, news) for later consumption.

**Package Name:** `@rmdes/indiekit-endpoint-readlater`
**Type:** ESM module
**Entry Point:** `index.js`

## MongoDB Collection

### `readlater_items`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated |
| `url` | string | Saved URL (unique index) |
| `title` | string | Display title |
| `source` | string | Origin context (microsub, activitypub, blogroll, podroll, listening, news, manual) |
| `savedAt` | string | ISO 8601 timestamp |

**Indexes:**
- `{ url: 1 }` unique — deduplication
- `{ savedAt: -1 }` — sort by date
- `{ source: 1 }` — filter by source

## API Endpoints

All routes require authentication.

| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/readlater` | — | Admin page (HTML) |
| POST | `/readlater/save` | `{url, title, source}` | `{success, item, alreadySaved?}` |
| POST | `/readlater/delete` | `{id}` or `{url}` | `{success}` or `{error}` |

## Integration with Other Plugins

Other plugins detect this plugin by checking `application.readlaterEndpoint`. If set, they render a save button. If not, no button appears.

## Key Files

- `index.js` — Plugin entry point, routes, init
- `lib/storage/items.js` — MongoDB CRUD operations
- `lib/controllers/readlater.js` — Admin page and API handlers
- `views/readlater.njk` — Admin page template
- `assets/styles.css` — Admin page styles
- `locales/en.json` — English locale strings

## Date Handling

All dates stored as ISO 8601 strings (`new Date().toISOString()`). Templates use `| date("PPp")` filter for display.
