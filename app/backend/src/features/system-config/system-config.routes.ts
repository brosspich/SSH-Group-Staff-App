import { Router } from "express";
import { SystemConfigController } from "./system-config.controller.js";

export const systemConfigRoutes = Router();
const controller = new SystemConfigController();

systemConfigRoutes.get("/", (req, res) => controller.getConfig(req, res));
systemConfigRoutes.put("/", (req, res) => controller.updateConfig(req, res));
systemConfigRoutes.get("/support-links", (req, res) =>
  controller.getSupportLinks(req, res),
);
