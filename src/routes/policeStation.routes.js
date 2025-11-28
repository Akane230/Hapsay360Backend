import express from 'express';
import { createPoliceStation, getStations } from '../controllers/policeStation.controller.js';

const router = express.Router();

router.post('/create', createPoliceStation);
router.get('/getStations', getStations);


export default router;