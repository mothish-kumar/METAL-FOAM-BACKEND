import { getAllDesignData,getTotal,getSingleData as GSD } from "../services/DesignerSupportServices.js";
import { decryptData } from "../utils/encryption.js";
import ProductionAccessRequest from "../Schema/ProductionAccessRequestSchema.js";
import RejectedProduct from "../Schema/rejectedProductSchema.js";
import Production from "../Schema/ProductionSchema.js";
import QualityControl from "../Schema/QualityControlSchema.js";

export const getAllData = async (req, res) => { 
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const employeeId = req.username;
        let AccessStatus; 
        const AccessRequests = await ProductionAccessRequest.find({ employeeId });
        if (AccessRequests.length === 0) { 
            AccessStatus = 'Make a request';
        } else {
            AccessStatus = AccessRequests[0].requestStatus;
        }

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
                    productId: parsedData.productId,
                    productName: parsedData.productName,
                    designSupportApprovalStatus: parsedData.finalApprovalStatus,
                    accessStatus: AccessStatus
                });
            } catch (error) {
                throw new Error(`Error on decryption for product ${product.transactionHash}: ${error.message}`);
            }
        }
        return res.status(200).json({ 
            message: 'Products fetched successfully',
            products: productData,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(numericTotal / limit),
                totalItems: numericTotal,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const makeRequest = async (req, res) => { 
    try {
        const { productId, productName, transactionHash } = req.body;
        const employeeId = req.username;
        const requestStatus = 'pending';
        const newRequest = new ProductionAccessRequest({ employeeId, productId, productName, transactionHash, requestStatus });
        await newRequest.save();
        return res.status(200).json({ message: 'Request submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getSingleData = async (req, res) => { 
    try {
        const employeeId = req.username;
        const transactionHash = req.params.txnHash;
        const accessStatus = await ProductionAccessRequest.findOne({employeeId, transactionHash, requestStatus: 'active' });
        if (!accessStatus) {
            return res.status(403).json({ message: 'You do not have access to this product' });
        }
        const result= await GSD(transactionHash);
        if(!result.response){
            return res.status(500).json({message:"Error on fetching data",error:result.error})
        }
        const decryptedData = decryptData(result.data.encryptedHash, result.data.initialVector);
        const parsedData = JSON.parse(decryptedData);
        return res.status(200).json({ 
            message: 'Product fetched successfully',
            product: parsedData
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const evaluateProduction = async (req, res) => { 
    try {
        const { tensileStrength, density, weldingStrength, porosity } = req.body;
        if(!tensileStrength || !density || !weldingStrength || !porosity){
            return res.status(400).json({message:"Missing required fields"});
        }
        const feasibilityScore = ((tensileStrength / density) * 10) + (weldingStrength * 0.5) - (porosity * 100)
        let comments = "";
        if (feasibilityScore > 80) {
            comments = "Material properties and welding parameters are optimal. Ready for production.";
        } else if (feasibilityScore > 50) {
            comments = "Material is feasible, but minor improvements in welding strength or cooling time may enhance quality.";
        } else {
            comments = "Material is not feasible for production. Consider increasing tensile strength or adjusting welding parameters.";
        }
        res.status(200).json({
            feasibilityScore: feasibilityScore.toFixed(2),
            status: feasibilityScore > 50 ? "Feasible" : "Not Feasible",
            comments
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const rejectProducts = async (req, res) => { 
    try {
        const id = req.username;
        const { productId, productName, materialType, rejectionReason, improvementSuggestions, additionalNotes, previousFeasibilityScore, heatInput, thermalConductivityRate, coolingTime, weldingStrength } = req.body;

        if (!productId || !productName || !materialType || !rejectionReason || !improvementSuggestions || !additionalNotes || !previousFeasibilityScore || !heatInput || !thermalConductivityRate || !coolingTime || !weldingStrength) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const rejection = new RejectedProduct({ productId, productName, materialType, rejectionReason, improvementSuggestions, additionalNotes, previousFeasibilityScore, heatInput, thermalConductivityRate, coolingTime, weldingStrength, rejectedBy: id });
        await rejection.save();
        res.status(200).json({ message: 'Product rejected successfully' });
    }catch(error){
        res.status(500).json({message: error.message});
    }
}

export const startProduction = async (req, res) => { 
    try {
        const productionEmployeeId = req.username;
        const { feasibilityScore, productId, productionName } = req.body;
        const startedAt = Date.now();
        const productionStatus = 'In_Progress';
        const production = new Production({ feasibilityScore, productId, productionName, productionStatus, startedAt, productionEmployeeId });
        await production.save();
        res.status(200).json({ message: 'Production started successfully' });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const getProduction = async (req, res) => { 
    try {
        const productionEmployeeId = req.username;
        const productionStatus = req.query.productionStatus || 'In_Progress';
        const production = await Production.find({ productionEmployeeId, productionStatus });
        if(production.length === 0){
            return res.status(200).json({ message: 'No production is started' });
        }
        res.status(200).json({ message: 'Production in list', InProgressProduction: production });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const sendQualityCheck = async (req, res) => {
    try {
        const productionEmployeeId = req.username;
        const productionId = req.params.productionId;
        const productionStatus = 'Quality_Check';
        const sentForQualityCheckAt = Date.now();
        const qualityCheckStatus = 'Pending';
        const { heatInput, weldingStrength, weldingQuality, recommendations } = req.body;
        if(!heatInput || !weldingStrength || !weldingQuality || !recommendations){
            return res.status(400).json({message:"Missing required fields"})
        }
        const production = await Production.findOneAndUpdate(
            { productionEmployeeId, productionId },
            {
                sentForQualityCheckAt,
                qualityCheckReport: { qualityCheckStatus },
                productionStatus,
                'productionReport.metrics.heatInput': heatInput,
                'productionReport.metrics.weldingStrength': weldingStrength,
                'productionReport.weldingQuality': weldingQuality,
                'productionReport.recommendations': recommendations
            });
        const productId = production.productId
        const data = await ProductionAccessRequest.findOne({ employeeId: productionEmployeeId, productId })
        const productName = data.productName;
        const transactionHash = data.transactionHash
        try {
            await QualityControl.create({ productId, productionId,productName,productTransactionHash:transactionHash})
            res.status(200).json({ message: 'Product sent for quality check' });
        } catch (error) {
            res.status(500).json({error:error.message})
        }

    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

export const generateReport = async (req, res) => {
    try {
        const productionId = req.params.productionId;
        const productionData = await Production.findOne({ productionId })
        if (productionData.length === 0) {
            res.status(404).json({message:"Production not found "})
        }
        res.status(200).json({message:"Production report generated",data:productionData})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}