import express from 'express';
import { dataAccessMiddleware } from '../middlewares/dataAccessMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {designSupportMiddleware} from '../middlewares/designSupportMiddleware.js';
import { getAllData, getSingleData } from '../controllers/resourceAnalystController.js';
import { processMaterial,predictWelding,saveData,getAllData as getAllDataController,getSingleData as GSD,updateData,deleteData,getAllRequests,grantAccess } from '../controllers/designSupportController.js';


const router = express.Router();

//get data from resource analyst
router.get('/get-data', authMiddleware,designSupportMiddleware, dataAccessMiddleware, getAllData);
router.get('/get-single-data/:txnHash', authMiddleware, designSupportMiddleware, dataAccessMiddleware, getSingleData);

//process material
router.post('/process-material', authMiddleware, designSupportMiddleware, processMaterial);
router.post('/predict-welding', authMiddleware, designSupportMiddleware, predictWelding);

//save data
router.post('/save-data/:productId', authMiddleware, designSupportMiddleware, saveData);
router.get('/get-all-data', authMiddleware, designSupportMiddleware, getAllDataController);
router.get('/get-single-design-data/:txnHash', authMiddleware, designSupportMiddleware, GSD);
router.put('/update-design-data/:txnHash', authMiddleware, designSupportMiddleware, updateData);
router.delete('/delete-design-data/:txnHash', authMiddleware, designSupportMiddleware, deleteData);

// access the data
router.get('/get-all-requests', authMiddleware, designSupportMiddleware, getAllRequests);
router.post('/grant-access/:txnHash', authMiddleware, designSupportMiddleware, grantAccess);


export default router;