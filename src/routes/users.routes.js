import express from "express";
import {
  getAllUsers,
  getUserCount,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
} from "../controllers/users.controller.js";

const router = express.Router();

// GET routes
router.get("/", getAllUsers);
router.get("/count", getUserCount);
router.get("/:id", getUserById);

// PUT routes
router.put("/:id", updateUser);
router.put("/:id/change-password", changePassword);

// DELETE routes
router.delete("/:id", deleteUser);

export default router;
