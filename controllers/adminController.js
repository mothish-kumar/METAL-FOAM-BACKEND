import fs from "fs";
import csv from "csv-parser";
import { encryptData, decryptData } from "../utils/encryption.js";
import { saveProductDataBatch, productCount as getProductCount, getAllProductData as fetchProductData, saveProductData, deleteAllProducts, deleteProductById, getProductById, updateProductById } from "../services/ProductStoreServices.js";
import Employee from "../Schema/EmployeeSchema.js";
import { sendMail } from "../utils/mailSender.js";
import { generatePassword } from "../utils/generatePassword.js";
import AccessControl from '../Schema/AccessControlSchema.js';
import Login from "../Schema/LoginSchema.js";
import RejectedProduct from "../Schema/rejectedProductSchema.js";
import bcrypt from "bcrypt";
import web3 from "../config/Web3Config.js";
import QualityControl from "../Schema/QualityControlSchema.js";
import Production from "../Schema/ProductionSchema.js";
// data management
export const uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                if (data && Object.keys(data).length > 0) {
                    const productDataString = JSON.stringify(data);
                    const { encryptedHash, initialVector } = encryptData(productDataString);
                    const timestamp = Math.floor(Date.now() / 1000);
                    results.push({ encryptedHash, initialVector, timestamp });
                }
            })
            .on('end', async () => {
                fs.unlinkSync(req.file.path);
                
                const encryptedHashes = results.map(r => r.encryptedHash);
                const initialVectors = results.map(r => r.initialVector);
                const timestamps = results.map(r => r.timestamp);
                
                try {
                    const result = await saveProductDataBatch(encryptedHashes, initialVectors, timestamps);
                    
                    if (!result.response) {
                        throw new Error(result.error || 'Failed to save to blockchain');
                    }

                    const sanitizedReceipt = result.receipt ? {
                        transactionHash: result.receipt.transactionHash,
                        blockNumber: Number(result.receipt.blockNumber),
                        gasUsed: Number(result.receipt.gasUsed),
                        status: Number(result.receipt.status),
                        transactionIndex: Number(result.receipt.transactionIndex || 0),
                        cumulativeGasUsed: Number(result.receipt.cumulativeGasUsed || 0),
                        effectiveGasPrice: Number(result.receipt.effectiveGasPrice || 0),
                        type: Number(result.receipt.type || 0)
                    } : null;
                    
                    res.json({ 
                        message: 'CSV processed and saved to blockchain successfully', 
                        count: results.length,
                        transactionResult: { 
                            response: result.response, 
                            receipt: sanitizedReceipt 
                        }
                    });
                } catch (error) {
                    console.error('Blockchain save error:', error);
                    res.status(500).json({ error: error.message });
                }
            });
    } catch (error) {
        console.error('Error uploading CSV:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getAllProductData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const count = await getProductCount();
        const totalCount = Number(count);
        
        // Return early if no products exist
        if (totalCount === 0) {
            return res.status(200).json({ 
                message: 'No products found', 
                products: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: limit
                }
            });
        }

        // Calculate indices
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalCount);
        
        // Validate indices
        if (startIndex >= totalCount) {
            return res.status(400).json({ 
                error: 'Page number exceeds available products',
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: limit
                }
            });
        }
        
        let batch = await fetchProductData(startIndex, endIndex);
        
        let productData = [];
        if (batch && Array.isArray(batch)) {
            productData = batch.map(product => {
                try {
                    const decryptedData = decryptData(product.encryptedHash, product.initialVector);
                    return {
                        productId: product.productId,
                        ...JSON.parse(decryptedData),
                        timestamp: Number(product.timestamp)
                    };
                } catch (error) {
                    console.error('Error decrypting product:', error);
                    return null;
                }
            }).filter(Boolean);
        }
        
        res.status(200).json({ 
            message: 'Products fetched and decrypted successfully', 
            products: productData,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit,
                hasNextPage: endIndex < totalCount,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
};

export const addProduct = async (req, res) => { 
    try {
        const jsonData = JSON.stringify(req.body);
        const { encryptedHash, initialVector } = encryptData(jsonData);
        const timestamp = Math.floor(Date.now() / 1000);
        const result = await saveProductData(encryptedHash, initialVector, timestamp);

        // Convert BigInt values to numbers in the receipt
        const sanitizedReceipt = {
            ...result.receipt,
            transactionIndex: Number(result.receipt.transactionIndex),
            blockNumber: Number(result.receipt.blockNumber),
            cumulativeGasUsed: Number(result.receipt.cumulativeGasUsed),
            gasUsed: Number(result.receipt.gasUsed),
            status: Number(result.receipt.status),
            effectiveGasPrice: Number(result.receipt.effectiveGasPrice),
            type: Number(result.receipt.type)
        };

        res.status(200).json({
            message: 'Product added successfully',
            transactionResult: { ...result, receipt: sanitizedReceipt }
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: error.message });
    }
}

export const getProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await getProductById(productId);
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        // Decrypt the product data
        const decryptedData = decryptData(product.encryptedHash, product.initialVector);
        
        // Convert BigInt values and combine with decrypted data
        const sanitizedProduct = {
            productId: Number(product.productId),
            ...JSON.parse(decryptedData),
            timestamp: Number(product.timestamp)
        };

        res.status(200).json({
            message: 'Product fetched successfully',
            product: sanitizedProduct
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const result = await deleteProductById(productId);

        // Convert BigInt values to numbers in the receipt
        const sanitizedReceipt = result.receipt ? {
            transactionHash: result.receipt.transactionHash,
            blockNumber: Number(result.receipt.blockNumber),
            gasUsed: Number(result.receipt.gasUsed),
            status: Number(result.receipt.status),
            transactionIndex: Number(result.receipt.transactionIndex || 0),
            cumulativeGasUsed: Number(result.receipt.cumulativeGasUsed || 0),
            effectiveGasPrice: Number(result.receipt.effectiveGasPrice || 0),
            type: Number(result.receipt.type || 0)
        } : null;

        res.status(200).json({
            message: 'Product deleted successfully',
            transactionResult: { 
                response: result.response, 
                receipt: sanitizedReceipt 
            }
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: error.message });
    }
}

export const deleteAllProductData = async (req, res) => {
    try {
        const result = await deleteAllProducts();
        
        // Convert BigInt values to numbers in the receipt
        const sanitizedReceipt = {
            ...result.receipt,
            transactionIndex: Number(result.receipt.transactionIndex),
            blockNumber: Number(result.receipt.blockNumber),
            cumulativeGasUsed: Number(result.receipt.cumulativeGasUsed),
            gasUsed: Number(result.receipt.gasUsed),
            status: Number(result.receipt.status),
            effectiveGasPrice: Number(result.receipt.effectiveGasPrice),
            type: Number(result.receipt.type)
        };

        res.status(200).json({
            message: 'All products deleted successfully',
            transactionResult: { ...result, receipt: sanitizedReceipt }
        });
    } catch (error) {
        console.error('Error deleting all products:', error);
        res.status(500).json({ error: error.message });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const updatedData = req.body;
        
        // Encrypt the updated data
        const jsonData = JSON.stringify(updatedData);
        const { encryptedHash, initialVector } = encryptData(jsonData);
        const timestamp = Math.floor(Date.now() / 1000);
        
        const result = await updateProductById(productId, encryptedHash, initialVector, timestamp);
        
        if (!result.response) {
            throw new Error(result.error || 'Failed to update product');
        }

        const sanitizedReceipt = result.receipt ? {
            transactionHash: result.receipt.transactionHash,
            blockNumber: Number(result.receipt.blockNumber),
            gasUsed: Number(result.receipt.gasUsed),
            status: Number(result.receipt.status),
            transactionIndex: Number(result.receipt.transactionIndex || 0),
            cumulativeGasUsed: Number(result.receipt.cumulativeGasUsed || 0),
            effectiveGasPrice: Number(result.receipt.effectiveGasPrice || 0),
            type: Number(result.receipt.type || 0)
        } : null;

        res.status(200).json({
            message: 'Product updated successfully',
            transactionResult: { 
                response: result.response, 
                receipt: sanitizedReceipt 
            }
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
}

// employee management
export const approveEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        // Find employee and make sure it exists
        const employee = await Employee.findOne({employeeId: employeeId});
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Generate credentials
        const username = employee.employeeId;
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update employee and save login credentials
        employee.status = 'approved';
        const login = new Login({username, password: hashedPassword});
        await login.save();
        await employee.save();
        console.log('Username', username);
        console.log('Password', password);
        // Email content
        const emailContent = `
        Dear ${employee.name},

        Your account has been approved. Below are your login credentials:

        Username: ${username}
        Password: ${password}

        Please change your password after your first login.

        Best regards,
        XXXXXXX
        `;
        
        // Send email
        await sendMail(employee.email, 'Employee Approved', emailContent);
        
        res.status(200).json({ 
            message: 'Employee approved successfully',
            employeeId: username,
            status: 'approved',
            emailSent: false
        });
    } catch (error) {
        console.error('Error approving employee:', error);
        res.status(500).json({ error: error.message });
    }
};

export const denyEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findOne({employeeId: employeeId});
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        employee.status = 'denied';
        await employee.save();
        const emailContent = `
        Dear ${employee.name},

        Your account has been denied.

        We regret to inform you that your account has been denied.
        Please contact the administrator for more information.
        Best regards,
        XXXXXXX
        `;
        await sendMail(employee.email, 'Employee Denied', emailContent);
        res.status(200).json({ message: 'Employee denied successfully' });
    } catch (error) {
        console.error('Error denying employee:', error);
        res.status(500).json({ error: error.message });
    }
}

export const getAllEmployeeData = async (req, res) => {
    try {
        const { status } = req.query;  // Get status from query params
        let query = {};

        // Add status filter if provided
        if (status && ['pending', 'approved', 'denied'].includes(status)) {
            query.status = status;
        }

        const employees = await Employee.find(query).sort({ createdAt: -1 });

        // Group counts by status
        const counts = {
            total: employees.length,
            approved: employees.filter(emp => emp.status === 'approved').length,
            pending: employees.filter(emp => emp.status === 'pending').length,
            denied: employees.filter(emp => emp.status === 'denied').length
        };

        res.status(200).json({ 
            employees,
            counts,
            currentStatus: status || 'all'
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: error.message });
    }
}

export const deleteEmployee = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        const employee = await Employee.findOne({ employeeId: employeeId });
        const user = await Login.findOne({username:employeeId})
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await employee.deleteOne();
        await user.deleteOne();
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: error.message });
    }
}

//get all access requests
export const getAccessRequests = async (req, res) => {
    try {
        const accessRequests = await AccessControl.find({ status: "pending", role: "resource_analyst" }).lean();

        if (accessRequests.length === 0) {
            return res.status(404).json({ error: 'No access requests found' });
        }

        // Fetch employee details for each access request
        const updatedRequests = await Promise.all(accessRequests.map(async (emp) => {
            const employeeDetails = await Employee.findOne({ employeeId: emp.employeeId }).lean();

            return {
                ...emp, // Spread original request
                name: employeeDetails ? employeeDetails.name : null,
                email: employeeDetails ? employeeDetails.email : null
            };
        }));

        res.status(200).json({ accessRequests: updatedRequests });
    } catch (error) {
        console.error('Error fetching access requests:', error);
        res.status(500).json({ error: error.message });
    }
};


// Grant access to read the product data
export const grantAccess = async (req, res) => {
    try {
        const adminId = req.username;
        const { employeeId } = req.params;
        const { duration } = req.body;  // duration should be in days
        const accessType = "read";

        // Validate duration
        if (!duration || isNaN(duration) || duration <= 0) {
            return res.status(400).json({ 
                error: 'Invalid duration. Please provide a positive number of days.' 
            });
        }

        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Calculate expiration date properly
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(duration));

        // Update or create access control
        const accessControl = await AccessControl.findOneAndUpdate(
            { employeeId },
            {
                accessType,
                grantedBy: adminId,
                grantedAt: new Date(),
                expiresAt: expiresAt,
                status: 'active'
            },
            { upsert: true, new: true }
        );

        // Send email notification
        const emailContent = `
        Dear ${employee.name},

        Your access request has been approved with the following details:
        Access Type: ${accessType}
        Expires On: ${expiresAt.toLocaleDateString()}

        Best regards,
        Admin Team
        `;

        await sendMail(employee.email, 'Access Request Approved', emailContent);

        res.status(200).json({
            message: 'Access granted successfully',
            accessDetails: accessControl
        });
    } catch (error) {
        console.error('Error granting access:', error);
        res.status(500).json({ error: error.message });
    }
};

//deny access request
export const denyAccess = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        const accessControl = await AccessControl.findOneAndUpdate({ employeeId }, { status: 'denied' });


        const emailContent = `
        Dear ${employee.name},

        Your access request has been denied.More information will be provided by the admin team.
        `;
        await sendMail(employee.email, 'Access Request Denied', emailContent);
        res.status(200).json({ message: 'Access request denied successfully' });
    } catch (error) {
        console.error('Error denying access:', error);
        res.status(500).json({ error: error.message });
    }
}

// Get all logged in users
export const getLoggedInUsers = async (req, res) => {
    try {
        const loggedInUsers = await Login.find({ isLoggedIn: true })
            .select('username lastLoginAt')
            .lean();

        const counts = {
            total: await Login.countDocuments(),
            loggedIn: loggedInUsers.length
        };

        res.status(200).json({
            users: loggedInUsers,
            counts
        });
    } catch (error) {
        console.error('Error fetching logged in users:', error);
        res.status(500).json({ error: error.message });
    }
};

//Get the transaction history
export const getTransactionHistory = async (req, res) => {
    try {
        const blockNumber = await web3.eth.getBlockNumber();
    let transactions = []
    for (let i = 1; i <= blockNumber; i++){
        const block = await web3.eth.getBlock(i, true);
        if (block && block.transactions) {
            block.transactions.forEach(tx => {
                transactions.push({
                    blockNumber: block.number.toString(),
                    from: tx.from,
                    to: tx.to,
                    value: web3.utils.fromWei(tx.value.toString(), 'ether'), // Convert value to ether
                    gasUsed: tx.gas.toString(),
                    hash: tx.hash,
                });
            });
        }
    }
    res.status(200).json(transactions)
    } catch(error) {
        res.status(500).json({ error: "Error on getting Transaction History" })
        console.error('Error fetching transaction history:', error);
    }
}
// get the rejected Products
export const getRejectedProducts = async(req,res)=>{
    try{
        const rejectedProducts = await RejectedProduct.find({}).lean();
        if (rejectedProducts.length === 0) {
            return res.status(404).json({ error: 'No rejected Products found' });
        }
        const rejectedProductDetails = await Promise.all(rejectedProducts.map(async(rp)=>{
            const empDetails = await Employee.findOne({employeeId:rp.rejectedBy}).lean();
            return{
                ...rp,
                name: empDetails ? empDetails.name : null,
                email: empDetails ? empDetails.email : null
            }
        }))
        res.status(200).json({message:"Rejected products Successfuly fetched",rejectedProductDetails})

    }catch(error){
        res.status(500).json({error:"Error on getting rejected Products"})
        console.log("Error on getting rejected products",error)
    }
}

//generate production report
export const productionReport = async (req, res) => {
    try {
        const productionData = await Production.find({  })
        if (productionData.length === 0) {
            res.status(404).json({message:"Production not found "})
        }
        res.status(200).json({message:"Production report generated",data:productionData})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

//generate quality report

export const qualityReport = async(req,res)=>{
    try{
        const qualityReports = await QualityControl.find({ })
        if (qualityReports.length === 0) {
            return res.status(400).json({message:"No more quality Check submitted"})
        }
        res.status(200).json({message:"Production report generated successfully",qualityReports})
    }catch(error){
        res.status(500).json({message:"Generate Erron on Quality Report"})
        console.log("Error on quality report generator ",error)
    }
}
