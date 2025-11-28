import express from "express";
import {
  createPoliceStation,
  getPoliceStations,
} from "../controllers/policeStation.controller.js";

const router = express.Router();

router.post("/create", createPoliceStation);
router.get("/", getPoliceStations);

export default router;
