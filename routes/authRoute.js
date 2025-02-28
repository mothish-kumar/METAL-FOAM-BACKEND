import express from "express";
import { login, register, refreshToken, landingPageMail,getFeaturedMaterails,getEmails } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refreshToken", refreshToken);
router.post("/sendMail",landingPageMail)
router.get('/get-featured-material',getFeaturedMaterails)
router.get('/getEmails',getEmails)

export default router;