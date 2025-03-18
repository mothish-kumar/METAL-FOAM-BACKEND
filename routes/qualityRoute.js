import express from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {qualityControlMiddleware} from '../middlewares/qualityControlMiddleware.js'
import { makeRequest, getSingleData } from '../controllers/productionController.js';
import { getStatus,submitQualityAssement,reportGenerator,getProductionOption,reportGeneratorOptions} from '../controllers/qualityController.js';
import { getAllData } from '../controllers/productionController.js';

const router = express.Router();

router.get('/get-request-data', authMiddleware, qualityControlMiddleware, getAllData)
router.post('/make-request', authMiddleware, qualityControlMiddleware, makeRequest)

//designSupport product data getter
router.get('/get-data/:txnHash', authMiddleware, qualityControlMiddleware, getSingleData)

// get the quality check data with filter qualityStatus
router.get('/get-status', authMiddleware, qualityControlMiddleware, getStatus) 

//submit quality report 
router.post('/submit-report/:productionId', authMiddleware, qualityControlMiddleware, submitQualityAssement)

router.get('/report/:productionId',authMiddleware,qualityControlMiddleware,reportGenerator)
router.get('/getProduction',authMiddleware,qualityControlMiddleware,getProductionOption)
router.get('/getReportOptions',authMiddleware,qualityControlMiddleware,reportGeneratorOptions)

export default router;  