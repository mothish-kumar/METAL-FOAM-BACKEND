import express from "express";
import { requestAccess, checkAccess, logout, changePassword } from "../controllers/employeeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/request-access/",authMiddleware, requestAccess);
router.get("/check-access/", authMiddleware, checkAccess);
router.post("/logout", authMiddleware, logout);
router.put("/change-password", authMiddleware, changePassword)


export default router;