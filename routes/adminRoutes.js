import express from "express";
import multer from "multer";
import { uploadCSV, getAllProductData, addProduct, deleteAllProductData, getProduct, deleteProduct, updateProduct, approveEmployee, denyEmployee, getAllEmployeeData, deleteEmployee, grantAccess, getAccessRequests, denyAccess, getLoggedInUsers } from "../controllers/adminController.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

// CSV upload route
router.post("/upload-csv", upload.single("file"), uploadCSV);

// Get products with pagination
// Example: /get-products-data?page=1&limit=10
router.get("/get-products-data", getAllProductData);

// Add single product   
router.post("/add-product", express.json(), addProduct);

// Get single product
router.get("/get-product/:productId", getProduct);

// Delete single product
router.delete("/delete-product/:productId", deleteProduct);

// Delete all products
router.delete("/delete-all-products", deleteAllProductData);

// Update product
router.put("/update-product/:productId", express.json(), updateProduct);

//approve employee
router.put("/approve-employee/:employeeId", approveEmployee);

//deny employee
router.put("/deny-employee/:employeeId", denyEmployee);

//get all employee data Example: /get-all-employee-data?status=pending
router.get("/get-all-employee-data", getAllEmployeeData);

//delete employee
router.delete("/delete-employee/:employeeId", deleteEmployee);

// Access control routes
router.get("/get-access-requests", getAccessRequests);
router.put("/grant-access/:employeeId", grantAccess);
router.put("/deny-access/:employeeId", denyAccess);

// Get logged in users
router.get("/logged-in-users", getLoggedInUsers);

export default router;
