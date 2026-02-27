/**
 * Read It Later item storage operations
 * @module storage/items
 */

import { ObjectId } from "mongodb";

function getCollection(application) {
  return application.collections.get("readlater_items");
}

/**
 * Save a URL for later reading
 * @param {object} application - Indiekit application
 * @param {object} data
 * @param {string} data.url - URL to save
 * @param {string} data.title - Display title
 * @param {string} data.source - Source context
 * @returns {Promise<{item: object, created: boolean}>}
 */
export async function saveItem(application, { url, title, source }) {
  const collection = getCollection(application);
  const existing = await collection.findOne({ url });
  if (existing) {
    return { item: existing, created: false };
  }
  const item = {
    url,
    title: title || url,
    source: source || "manual",
    savedAt: new Date().toISOString(),
  };
  const result = await collection.insertOne(item);
  item._id = result.insertedId;
  return { item, created: true };
}

/**
 * Delete a saved item
 * @param {object} application
 * @param {object} params
 * @param {string} [params.id] - Item _id
 * @param {string} [params.url] - Item URL
 * @returns {Promise<boolean>}
 */
export async function deleteItem(application, { id, url }) {
  const collection = getCollection(application);
  let filter;
  if (id) {
    filter = { _id: new ObjectId(id) };
  } else if (url) {
    filter = { url };
  } else {
    return false;
  }
  const result = await collection.deleteOne(filter);
  return result.deletedCount > 0;
}

/**
 * Get saved items with optional filtering and sorting
 * @param {object} application
 * @param {object} [options]
 * @param {string} [options.sort] - "asc" or "desc" (default: "desc")
 * @param {string} [options.source] - Filter by source
 * @param {string} [options.q] - Search query (title and url)
 * @returns {Promise<object[]>}
 */
export async function getItems(application, options = {}) {
  const collection = getCollection(application);
  const filter = {};
  if (options.source) {
    filter.source = options.source;
  }
  if (options.q) {
    const escaped = options.q.replaceAll(/[$()*+.?[\\\]^{|}]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [{ title: regex }, { url: regex }];
  }
  const sortDirection = options.sort === "asc" ? 1 : -1;
  return collection.find(filter).sort({ savedAt: sortDirection }).toArray();
}

/**
 * Check if a URL is already saved
 * @param {object} application
 * @param {string} url
 * @returns {Promise<boolean>}
 */
export async function isSaved(application, url) {
  const collection = getCollection(application);
  const item = await collection.findOne({ url });
  return !!item;
}

/**
 * Get distinct source values that have saved items
 * @param {object} application
 * @returns {Promise<string[]>}
 */
export async function getSources(application) {
  const collection = getCollection(application);
  return collection.distinct("source");
}

/**
 * Create MongoDB indexes
 * @param {object} application
 */
export async function createIndexes(application) {
  const collection = getCollection(application);
  await collection.createIndex({ url: 1 }, { unique: true });
  await collection.createIndex({ savedAt: -1 });
  await collection.createIndex({ source: 1 });
}
