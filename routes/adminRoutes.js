import express from "express";
import multer from "multer";
import { uploadCSV, getAllProductData, addProduct, deleteAllProductData, getProduct, deleteProduct, updateProduct, approveEmployee, denyEmployee, getAllEmployeeData, deleteEmployee, grantAccess, getAccessRequests, denyAccess, getLoggedInUsers,getTransactionHistory } from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddelware } from "../middlewares/adminMiddleware.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

// CSV upload route
router.post("/upload-csv", upload.single("file"), uploadCSV);

// Get products with pagination
// Example: /get-products-data?page=1&limit=10
router.get("/get-products-data",authMiddleware,adminMiddelware, getAllProductData);

// Add single product   
router.post("/add-product", express.json(),authMiddleware,adminMiddelware, addProduct);

// Get single product
router.get("/get-product/:productId",authMiddleware,adminMiddelware, getProduct);

// Delete single product
router.delete("/delete-product/:productId",authMiddleware,adminMiddelware, deleteProduct);

// Delete all products
router.delete("/delete-all-products",authMiddleware,adminMiddelware, deleteAllProductData);

// Update product
router.put("/update-product/:productId", express.json(), updateProduct);

//approve employee
router.put("/approve-employee/:employeeId",authMiddleware,adminMiddelware, approveEmployee);

//deny employee
router.put("/deny-employee/:employeeId",authMiddleware,adminMiddelware, denyEmployee);

//get all employee data Example: /get-all-employee-data?status=pending
router.get("/get-all-employee-data",authMiddleware,adminMiddelware, getAllEmployeeData);

//delete employee
router.delete("/delete-employee/:employeeId",authMiddleware,adminMiddelware, deleteEmployee);

// Access control routes
router.get("/get-access-requests",authMiddleware,adminMiddelware, getAccessRequests);
router.put("/grant-access/:employeeId",authMiddleware,adminMiddelware, grantAccess);
router.put("/deny-access/:employeeId",authMiddleware,adminMiddelware, denyAccess);

// Get logged in users
router.get("/logged-in-users",authMiddleware,adminMiddelware, getLoggedInUsers);

// Get the transaction history
router.get("/get-transaction-history",authMiddleware,adminMiddelware, getTransactionHistory);
export default router;
