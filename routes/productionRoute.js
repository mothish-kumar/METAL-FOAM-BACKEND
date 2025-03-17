import express from 'express';
import { getAllData,makeRequest,getSingleData,evaluateProduction,rejectProducts,startProduction, getProduction,sendQualityCheck, generateReport,getProductOptions } from '../controllers/productionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { productionMiddleware } from '../middlewares/productionMiddleware.js';

const router = express.Router();

router.get('/get-request-data', authMiddleware, productionMiddleware, getAllData)
router.post('/make-request', authMiddleware, productionMiddleware, makeRequest)

// get data
router.get('/get-data/:txnHash', authMiddleware, productionMiddleware, getSingleData)

//evaluate for production
router.post('/evaluate-for-production', authMiddleware, productionMiddleware, evaluateProduction)

//reject products for production
router.post('/reject-product', authMiddleware, productionMiddleware, rejectProducts)

// start Production
router.post('/start-production', authMiddleware, productionMiddleware, startProduction) 

//add filters with productionStatus this key
router.get('/getProduction', authMiddleware, productionMiddleware, getProduction)

// send to quality check
router.put('/send-quality-check/:productionId', authMiddleware, productionMiddleware, sendQualityCheck)

//generate production report
router.get('/generate-production-report/:productionId',authMiddleware,productionMiddleware,generateReport)

router.get('/getProductOptions',authMiddleware,productionMiddleware,getProductOptions)


export default router;