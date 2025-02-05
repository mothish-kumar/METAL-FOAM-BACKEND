import express from 'express'
import { setQualityCriteria } from '../controllers/resourceAnalystController.js'

const router = express.Router()

router.post('/set-quality-criteria/:employeeId', setQualityCriteria)

export default router;