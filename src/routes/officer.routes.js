import express from 'express';
import { createOfficer, getAllOfficers, updateOfficer, deleteOfficer } from '../controllers/officer.controller.js';

const router = express.Router();

router.post('/create', createOfficer);
router.get('/all', getAllOfficers);
router.put('/update/:id', updateOfficer);
router.delete('/delete/:id', deleteOfficer);

export default router;