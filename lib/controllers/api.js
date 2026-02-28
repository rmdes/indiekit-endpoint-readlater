/**
 * Public API controller (no auth required)
 * @module controllers/api
 */

import { getItems, getSources } from "../storage/items.js";

/**
 * List saved items — GET /api/items
 * Public read-only endpoint for the frontend page
 */
async function listItems(request, response) {
  const { application } = request.app.locals;

  const { sort, source, q } = request.query;

  try {
    const items = await getItems(application, { sort, source, q });

    response.json({
      items: items.map((item) => ({
        id: item._id.toString(),
        url: item.url,
        title: item.title,
        source: item.source,
        savedAt: item.savedAt,
      })),
      total: items.length,
    });
  } catch (error) {
    console.error("[ReadLater API] listItems error:", error);
    response.status(500).json({ error: "Failed to fetch items" });
  }
}

/**
 * List distinct sources — GET /api/sources
 * Public read-only endpoint for filtering
 */
async function listSources(request, response) {
  const { application } = request.app.locals;

  try {
    const sources = await getSources(application);
    response.json({ items: sources });
  } catch (error) {
    console.error("[ReadLater API] listSources error:", error);
    response.status(500).json({ error: "Failed to fetch sources" });
  }
}

export const readlaterApiController = { listItems, listSources };
