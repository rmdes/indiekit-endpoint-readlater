import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";

import { readlaterController } from "./lib/controllers/readlater.js";
import { readlaterApiController } from "./lib/controllers/api.js";
import { createIndexes } from "./lib/storage/items.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaults = {
  mountPath: "/readlater",
};

const router = express.Router();
const publicRouter = express.Router();

export default class ReadLaterEndpoint {
  name = "Read It Later endpoint";

  constructor(options = {}) {
    this.options = { ...defaults, ...options };
    this.mountPath = this.options.mountPath;
  }

  get localesDirectory() {
    return path.join(__dirname, "locales");
  }

  get navigationItems() {
    return {
      href: this.options.mountPath,
      text: "readlater.title",
      requiresDatabase: true,
    };
  }

  get shortcutItems() {
    return {
      url: this.options.mountPath,
      name: "readlater.title",
      iconName: "bookmark",
      requiresDatabase: true,
    };
  }

  get routes() {
    router.get("/", readlaterController.list);
    router.post("/save", readlaterController.save);
    router.post("/delete", readlaterController.remove);
    return router;
  }

  /**
   * Public routes (no authentication required)
   * Read-only JSON API for the frontend page
   */
  get routesPublic() {
    publicRouter.get("/api/items", readlaterApiController.listItems);
    publicRouter.get("/api/sources", readlaterApiController.listSources);
    return publicRouter;
  }

  init(Indiekit) {
    console.info("[ReadLater] Initializing read-it-later plugin");

    Indiekit.addCollection("readlater_items");
    Indiekit.addEndpoint(this);

    // Store mount path in application config for other plugins to detect
    Indiekit.config.application.readlaterEndpoint = this.mountPath;

    if (Indiekit.database) {
      createIndexes(Indiekit).catch((error) => {
        console.warn("[ReadLater] Index creation failed:", error.message);
      });
    }
  }
}
