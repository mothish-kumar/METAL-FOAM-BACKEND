import express from 'express'
import { setQualityCriteria, getQualityCriteria, updateQualityCriteria, validateMaterial,evaluateMaterial, calculateWeldingParameters,finalSubmission, getAllData,getSingleData, updateAnalysisData, deleteAnalysisData, getTotalCount,getAccessRequests,grantAccess,denyAccess} from '../controllers/resourceAnalystController.js'
import { authMiddleware} from '../middlewares/authMiddleware.js'
import { analystMiddleware } from '../middlewares/analystMiddleware.js'
import { dataAccessMiddleware } from '../middlewares/dataAccessMiddleware.js'
import { getAllProductData, getProduct } from "../controllers/adminController.js";


const router = express.Router()

//getData from admin
router.get('/get-products-data', authMiddleware,analystMiddleware, dataAccessMiddleware, getAllProductData)
router.get('/get-product/:productId', authMiddleware,analystMiddleware, dataAccessMiddleware, getProduct)

//QualityCriteria API
router.post('/set-quality-criteria',authMiddleware,analystMiddleware, setQualityCriteria) 
router.get('/get-quality-criteria',authMiddleware,analystMiddleware, getQualityCriteria) 
router.put('/update-quality-criteria',authMiddleware,analystMiddleware, updateQualityCriteria) 

//validate the material data
router.post('/validate-material', authMiddleware, analystMiddleware, validateMaterial)
router.post('/evaluate-material', authMiddleware, analystMiddleware, evaluateMaterial)
router.post('/welding-parameters', authMiddleware, analystMiddleware, calculateWeldingParameters)

//final submission
router.post('/final-submission/:productId', authMiddleware, analystMiddleware, finalSubmission)
router.get('/get-all-analysis-data', authMiddleware, analystMiddleware, getAllData)
router.get('/get-analysis-total', authMiddleware, analystMiddleware, getTotalCount)
router.get('/get-analysis-data/:txnHash', authMiddleware, analystMiddleware, getSingleData)
router.put('/update-analysis-data/:txnHash', authMiddleware, analystMiddleware, updateAnalysisData)
router.delete('/delete-analysis-data/:txnHash', authMiddleware, analystMiddleware, deleteAnalysisData)

// data access requests
router.get('/get-access-requests', authMiddleware, analystMiddleware, getAccessRequests)
router.post('/approve-access-request/:employeeId', authMiddleware, analystMiddleware, grantAccess)
router.post('/deny-access-request/:employeeId', authMiddleware, analystMiddleware, denyAccess)


export default router;