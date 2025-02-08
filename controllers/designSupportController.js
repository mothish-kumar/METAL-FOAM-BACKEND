import { getWeldingPrediction } from '../utils/weldingParameterPrediction/weldingPrediction.js';
import { encryptData, decryptData } from '../utils/encryption.js';
import { saveDesignData } from '../services/DesignerSupportServices.js';

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