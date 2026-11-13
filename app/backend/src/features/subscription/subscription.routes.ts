import { Router } from "express";
import { subscriptionController } from "./subscription.controller.js";

const router = Router();

// Fast check for a specific branch (e.g. system-0001)
router.get("/check/:systemId", subscriptionController.checkSubscription);
router.get("/check", subscriptionController.checkSubscription);

// List all subscriptions
router.get("/", subscriptionController.getAllSubscriptions);

// Upsert subscription
router.post("/", subscriptionController.upsertSubscription);
router.put("/:id", subscriptionController.upsertSubscription);

export const subscriptionRoutes = router;
