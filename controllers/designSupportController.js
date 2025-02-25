import { getWeldingPrediction } from '../utils/weldingParameterPrediction/weldingPrediction.js';
import { encryptData, decryptData } from '../utils/encryption.js';
import { saveDesignData, getAllDesignData, getTotal, getSingleData as GSD, updateDesignData, deleteDesignData } from '../services/DesignerSupportServices.js';
import ProductionAccessRequest from '../Schema/ProductionAccessRequestSchema.js';
import { sendMail } from '../utils/mailSender.js';
import Employee from '../Schema/EmployeeSchema.js';

export const processMaterial = async (req, res) => {
    try {
        const { tensileStrength, youngsModulus, stress, strain } = req.body;
        const yieldStrength = tensileStrength * 0.9;
        const hardness = tensileStrength * 3;
        const elasticityVerified = Math.abs(youngsModulus - (stress / strain)) < 5;
        res.status(200).json({ yieldStrength, hardness, elasticityVerified });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const predictWelding = async (req, res) => { 
    try {
        const { flexuralStrength, tensileStrength, thermalConductivity, porosity } = req.body;
        const prediction = await getWeldingPrediction(flexuralStrength, tensileStrength, thermalConductivity, porosity);
        res.status(200).json(prediction);
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

export const saveData = async (req, res) => {
    try {
        const employeeId = req.username;
        const productId = req.params.productId;
        const data = {
            designerSupportId:employeeId,
            productId,
            ...req.body
        }
        const jsonData = JSON.stringify(data);
        const { encryptedHash, initialVector } = encryptData(jsonData);
        const timestamp = Math.floor(Date.now() / 1000);
        const response = await saveDesignData(encryptedHash, initialVector, timestamp);
        if (!response.response) {
            res.status(500).json(response.error);
        }
        const sanitizedReceipt = response.receipt ? {
            transactionHash: response.receipt.transactionHash,
            blockNumber: Number(response.receipt.blockNumber),
            gasUsed: Number(response.receipt.gasUsed),
            status: Number(response.receipt.status),
            transactionIndex: Number(response.receipt.transactionIndex || 0),
            cumulativeGasUsed: Number(response.receipt.cumulativeGasUsed || 0),
            effectiveGasPrice: Number(response.receipt.effectiveGasPrice || 0),
            type: Number(response.receipt.type || 0)
        } : null;
        res.status(200).json({message:"Data Save Successfully",receipt:sanitizedReceipt});

    }catch(error){
        res.status(500).json({message: error.message});
    }
}

export const getAllData = async (req, res) => { 
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { total } = await getTotal();
        const numericTotal = Number(total);
        console.log(numericTotal);
        if (numericTotal === 0) {
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
         const endIndex = Math.min(startIndex + limit, numericTotal-1);
         // Validate indices
         if (startIndex >= numericTotal) {
             return res.status(400).json({ 
                 error: 'Page number exceeds available products',
                 pagination: {
                     currentPage: page,
                     totalPages: Math.ceil(numericTotal / limit),
                     totalItems: numericTotal,
                     itemsPerPage: limit
                 }
             });
         }
        let batch = await getAllDesignData(startIndex, endIndex);
        if (!batch.response) {
            return res.status(500).json({message:"Error on fetching data",error:batch.data})
        }
        let productData = []
        for (let product of batch.data) {
            try {
                const decryptedData = decryptData(product.encryptedHash, product.initialVector);
                const parsedData = JSON.parse(decryptedData);
                productData.push({
                    transactionHash: product.transactionHash,
                    timestamp: Number(product.timestamp),
                    ...parsedData
                });
            } catch (error) {
                throw new Error(`Error on decryption for product ${product.transactionHash}: ${error.message}`);
            }
        }
        
        res.status(200).json({ 
            message: 'Products fetched and decrypted successfully', 
            products: productData,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(numericTotal / limit),
                totalItems: numericTotal,
                itemsPerPage: limit,
                hasNextPage: endIndex < numericTotal,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all data.", error: error.message });
    }
}

export const getSingleData = async (req, res) => { 
    try {
        const txnHash = req.params.txnHash;
        const response = await GSD(txnHash);
        if (!response.response) {
            return res.status(500).json({message:"Error on fetching data",error:response.error})
        }
        const decryptedData = decryptData(response.data.encryptedHash, response.data.initialVector);
        const parsedData = JSON.parse(decryptedData);
        res.status(200).json({ 
            message: 'Data fetched and decrypted successfully', 
            product: {
                transactionHash: response.data.transactionHash,
                timestamp: Number(response.data.timestamp),
                ...parsedData
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching single data.", error: error.message });
    }
}

export const updateData = async (req, res) => { 
    try {
        const txnHash = req.params.txnHash;
        const { encryptedHash, initialVector } = encryptData(JSON.stringify(req.body));
        const timestamp = Math.floor(Date.now() / 1000);
        const response = await updateDesignData(txnHash, encryptedHash, initialVector, timestamp);
        if (!response.response) {
            res.status(500).json(response.error);
        }
        const sanitizedReceipt = response.receipt ? {
            transactionHash: response.receipt.transactionHash,
            blockNumber: Number(response.receipt.blockNumber),
            gasUsed: Number(response.receipt.gasUsed),
            status: Number(response.receipt.status),
            transactionIndex: Number(response.receipt.transactionIndex || 0),
            cumulativeGasUsed: Number(response.receipt.cumulativeGasUsed || 0),
            effectiveGasPrice: Number(response.receipt.effectiveGasPrice || 0),
            type: Number(response.receipt.type || 0)
        } : null;
        res.status(200).json({message:"Data Updated Successfully",receipt:sanitizedReceipt});
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

export const deleteData = async (req, res) => { 
    try {
        const txnHash = req.params.txnHash;
        const response = await deleteDesignData(txnHash);
        if (!response.response) {
            res.status(500).json(response.error);
        }
        const sanitizedReceipt = response.receipt ? {
            transactionHash: response.receipt.transactionHash,
            blockNumber: Number(response.receipt.blockNumber),
            gasUsed: Number(response.receipt.gasUsed),
            status: Number(response.receipt.status),
            transactionIndex: Number(response.receipt.transactionIndex || 0),
            cumulativeGasUsed: Number(response.receipt.cumulativeGasUsed || 0),
            effectiveGasPrice: Number(response.receipt.effectiveGasPrice || 0),
            type: Number(response.receipt.type || 0)
        } : null;
        res.status(200).json({message:"Data Deleted Successfully",receipt:sanitizedReceipt});
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

export const 
getAllRequests = async (req, res) => { 
    try {
        const AccessRequests = await ProductionAccessRequest.find({ requestStatus: 'pending' });
        if(AccessRequests.length === 0){
            return res.status(200).json({ message: 'No requests found', requests: [] });
        }
        res.status(200).json({AccessRequests });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all requests.", error: error.message });
    }
}

export const grantAccess = async (req, res) => { 
    try {
        const designSupportId = req.username;
        const { txnHash } = req.params;
        const {duration ,employeeId} = req.body;  // duration should be in days
        const accessType = "read";

        // Validate duration
        if (!duration || isNaN(duration) || duration <= 0) {
            return res.status(400).json({ 
                error: 'Invalid duration. Please provide a positive number of days.' 
            });
        }

        const employee = await ProductionAccessRequest.findOne({ transactionHash: txnHash,employeeId:employeeId });
        if (!employee) {
            return res.status(404).json({ error: 'Employee Request not found' });
        }

        // Calculate expiration date properly
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(duration));

        // Update or create access control
        const accessControl = await ProductionAccessRequest.findOneAndUpdate(
            { transactionHash:txnHash ,employeeId:employeeId },
            {
                accessType,
                grantedBy: designSupportId,
                grantedAt: new Date(),
                expiresAt: expiresAt,
                requestStatus: 'active'
            },
            { upsert: true, new: true }
        );
        const employeeID = employee.employeeId;
        const employeeDetails = await Employee.findOne({ employeeId:employeeID });

        // Send email notification
        const emailContent = `
        Dear ${employeeDetails.name},

        Your access request has been approved with the following details:
        Access Type: ${accessType}
        Expires On: ${expiresAt.toLocaleDateString()}

        Best regards,
        Design Support Team
        `;

        await sendMail(employeeDetails.email, 'Access Request Approved', emailContent);

        res.status(200).json({
            message: 'Access granted successfully',
            accessDetails: accessControl
        });
    } catch (error) {
        console.error('Error granting access:', error);
        res.status(500).json({ error: error.message });
    }

}

export const denyAccess = async (req, res) => {
    try {
        const { txnHash } = req.params;
        const employee = await ProductionAccessRequest.findOne({ transactionHash: txnHash });
        if (!employee) {
            return res.status(404).json({ error: 'Employee Request not found' });
        }
        const accessControl = await ProductionAccessRequest.findOneAndUpdate({ transactionHash: txnHash }, { requestStatus: 'denied' });
        
        const employeeId = employee.employeeId;
        const employeeDetails = await Employee.findOne({ employeeId });

        const emailContent = `
        Dear ${employeeDetails.name},

        Your access request has been denied.More information will be provided by the resource analyst team.
        `;
        await sendMail(employeeDetails.email, 'Access Request Denied', emailContent);
        res.status(200).json({ message: 'Access request denied successfully' });
    } catch (error) {
        console.error('Error denying access:', error);
        res.status(500).json({ error: error.message });
    }
}