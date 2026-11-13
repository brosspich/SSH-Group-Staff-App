import { Router } from "express";
import { companyController } from "./company.controller.js";

const router = Router();

router.get("/", companyController.getCompanies);
router.get("/:id", companyController.getCompanyById);
router.put("/:id", companyController.updateCompany);

export const companyRoutes = router;
