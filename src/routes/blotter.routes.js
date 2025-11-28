import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  submitBlotter,
  getBlotters,
  trackBlotter,
  deleteBlotter,
} from "../controllers/blotter.controller.js";
import {
  authMiddleware,
  authorizeRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Submit a blotter
router.post(
  "/submit",
  authMiddleware,
  authorizeRoles("user", "admin"),
  asyncHandler(submitBlotter)
);

// Get blotters
router.get(
  "/",
  authMiddleware,
  authorizeRoles("user", "admin"),
  asyncHandler(getBlotters)
);

// Track a blotter by number
router.get("/track/:number", authMiddleware, asyncHandler(trackBlotter));

// Delete a blotter
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("user", "admin"),
  asyncHandler(deleteBlotter)
);

export default router;
