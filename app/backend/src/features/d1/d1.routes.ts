import { Router } from "express";
import { handleD1Query } from "./d1.controller.js";

export const d1Routes = Router();

d1Routes.post("/query", handleD1Query);
