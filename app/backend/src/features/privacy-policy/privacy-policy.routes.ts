import { Router } from "express";
import { privacyPolicyController } from "./privacy-policy.controller.js";

const router = Router();

// Public web page / API
router.get("/", privacyPolicyController.getPublicPolicy);

// Record consent in AuditLog
router.post("/consent", privacyPolicyController.recordConsent);

export const privacyPolicyRoutes = router;
