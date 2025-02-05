import express from "express";
import { requestAccess, checkAccess, logout, changePassword } from "../controllers/employeeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { dataAccessMiddleware } from "../middlewares/dataAccessMiddleware.js";
import { getAllProductData, getProduct } from "../controllers/adminController.js";

const router = express.Router();

router.post("/request-access/",authMiddleware, requestAccess);
router.get("/check-access/", authMiddleware, checkAccess);
router.post("/logout", authMiddleware, logout);
router.put("/change-password", authMiddleware, changePassword)
//Get data
router.get('/get-products-data', authMiddleware, dataAccessMiddleware, getAllProductData)
router.get('/get-product/:productId', authMiddleware, dataAccessMiddleware, getProduct)

export default router;