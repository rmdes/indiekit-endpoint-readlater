/**
 * Read It Later controller
 * @module controllers/readlater
 */

import {
  saveItem,
  deleteItem,
  getItems,
  getSources,
} from "../storage/items.js";

/**
 * Admin page — list saved items with filters
 */
async function list(request, response) {
  const { application } = request.app.locals;
  const baseUrl = request.baseUrl;

  const sort = request.query.sort || "desc";
  const source = request.query.source || "";
  const q = request.query.q || "";

  const items = await getItems(application, { sort, source, q });
  const sources = await getSources(application);

  response.render("readlater", {
    title: "Read It Later",
    items,
    sources,
    sort,
    source,
    q,
    baseUrl,
    breadcrumbs: [{ text: "Read It Later" }],
  });
}

/**
 * Save a URL — POST /readlater/save
 * Accepts JSON or form-encoded: { url, title, source }
 */
async function save(request, response) {
  const { application } = request.app.locals;

  const url = request.body.url;
  if (!url) {
    return response.status(400).json({ error: "URL is required" });
  }

  const title = request.body.title || url;
  const source = request.body.source || "manual";

  const { item, created } = await saveItem(application, {
    url,
    title,
    source,
  });

  if (created) {
    return response.json({ success: true, item });
  }

  return response.json({ success: true, item, alreadySaved: true });
}

/**
 * Delete a saved item — POST /readlater/delete
 * Accepts JSON or form-encoded: { id } or { url }
 */
async function remove(request, response) {
  const { application } = request.app.locals;

  const id = request.body.id;
  const url = request.body.url;

  if (!id && !url) {
    return response.status(400).json({ error: "id or url is required" });
  }

  const deleted = await deleteItem(application, { id, url });

  if (deleted) {
    return response.json({ success: true });
  }

  return response.status(404).json({ error: "Not found" });
}

export const readlaterController = { list, save, remove };
