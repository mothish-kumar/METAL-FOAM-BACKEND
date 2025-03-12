import QualityCriteria from "../Schema/QualityCriteriaSchema.js"
import { encryptData,decryptData } from "../utils/encryption.js";
import { saveAnalysisData, getTotal, fetchAllData, getData, updateData, deleteData } from "../services/ResourceAnalystStoreServices.js";
import AccessControl from "../Schema/AccessControlSchema.js";
import Employee from "../Schema/EmployeeSchema.js";
import { sendMail } from "../utils/mailSender.js";

 // for new resource analyst to set the quality criteria
export const setQualityCriteria = async (req, res) => {
    const employeeId = req.username;
    const { densityThreshold, flexuralStrengthThreshold, tensileStrengthThreshold, porosityThreshold, thermalConductivityThreshold } = req.body
    try {
        const qualityCriteria = new QualityCriteria({ densityThreshold, flexuralStrengthThreshold, tensileStrengthThreshold, porosityThreshold, thermalConductivityThreshold, employeeId })
        await qualityCriteria.save()
        res.status(201).json({ message: "Quality Criteria set successfully" })
    }catch (error) {
        res.status(409).json({ message: error.message })
    }
}

export const getQualityCriteria = async (req, res) => {
    const employeeId = req.username;
    try {
        const qualityCriteria = await QualityCriteria.findOne({ employeeId })
        res.status(200).json(qualityCriteria)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

export const updateQualityCriteria = async (req, res) => { 
    const employeeId = req.username;
    const { densityThreshold, flexuralStrengthThreshold, tensileStrengthThreshold, porosityThreshold, thermalConductivityThreshold } = req.body
    try {
        const qualityCriteria = await QualityCriteria.findOne({ employeeId })
        qualityCriteria.densityThreshold = densityThreshold
        qualityCriteria.flexuralStrengthThreshold = flexuralStrengthThreshold
        qualityCriteria.tensileStrengthThreshold = tensileStrengthThreshold
        qualityCriteria.porosityThreshold = porosityThreshold
        qualityCriteria.thermalConductivityThreshold = thermalConductivityThreshold
        await qualityCriteria.save()
        res.status(200).json({ message: "Quality Criteria updated successfully" })
    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}

export const validateMaterial = async (req, res) => {
    const {density,volume, flexuralStrength, tensileStrength, porosity, thermalConductivity,temperature } = req.body
    const employeeId = req.username;
    try {
        const qualityCriteria = await QualityCriteria.findOne({ employeeId })
    let issues = []
    
    //Mass Calculation
    const mass = density * volume

    //Quality Checks
    if (density < qualityCriteria.densityThreshold) issues.push("Low Density")
    if (flexuralStrength < qualityCriteria.flexuralStrengthThreshold) issues.push("Low Flexural Strength")
    if (tensileStrength < qualityCriteria.tensileStrengthThreshold) issues.push("Low Tensile Strength")
    if (porosity > qualityCriteria.porosityThreshold) issues.push("High Porosity")  
        if (thermalConductivity > qualityCriteria.thermalConductivityThreshold) issues.push("High Thermal Conductivity")
        
      //  New Fatigue Strength Test
      const fatigueStrength = 0.75 * tensileStrength;
      if (flexuralStrength < fatigueStrength) issues.push("Weak Under Repeated Stress");

      //  New Thermal Expansion Test
      const alpha = 0.000017;
      const thermalExpansion = alpha * temperature * volume;
      if (thermalExpansion > 0.01) issues.push("High Thermal Expansion Risk");

      //  New Corrosion Resistance Test
      if (porosity > 0.02) issues.push("High Corrosion Risk");
  
    //Quality String
    
    let qualityString = "High Quality"
    if (issues.length > 0) qualityString = "Medium Quality"
    if (issues.length > 2) qualityString = "Low Quality"
    
    res.status(200).json({ mass,qualityString, issues })
    } catch (error) {
        res.status(404).json({ message: error.message })
    }

}
 
export const evaluateMaterial = async (req, res) => { 
    const {thickness, volume, tensileStrength, flexuralStrength, forcesToTest,gaugeLength,changeInLength,width} = req.body;
    if (!Array.isArray(forcesToTest)) return res.status(400).json({ message: "forcesToTest should be an array" });
    
    let bestForce = null;
    let bestEvaluation = null;

    //Calculate cross-sectional area
    const crossSectionalArea = volume / (width * thickness);

    const evaluation = forcesToTest.map(force => {
        const stress = force / crossSectionalArea;
        const strain = changeInLength / gaugeLength;
        const youngsModulus = strain !== 0 ? stress / strain : null;
        const loadBearingCapacity = youngsModulus * strain;
        const isWithinTensileStrength = stress < tensileStrength
        const isWithinFlexuralStrength = stress < flexuralStrength;
         //Find the optimal force suggestions
    if (isWithinTensileStrength && isWithinFlexuralStrength) {
        if (!bestForce || force > bestForce) {
            bestForce = force;
            bestEvaluation = { force, stress, strain, youngsModulus };
        }
    }
        return { force, stress, strain, youngsModulus,loadBearingCapacity, isWithinTensileStrength, isWithinFlexuralStrength};
    });

    res.status(200).json({
        message: "Evaluation of a product is compleated",
        evaluation,
        optimalForce: bestForce ? bestEvaluation : "No suitable force found within safe limits"
    });

}

export const calculateWeldingParameters = async (req, res) => {
    try {
        const {thickness, volume, density, thermalConductivity, flexuralStrength, tensileStrength, powerSpeedInputs } = req.body;

        if ( !thickness || !volume || !density || !thermalConductivity || !flexuralStrength || !tensileStrength || !powerSpeedInputs || powerSpeedInputs.length === 0) {
            return res.status(400).json({ message: "Missing required material properties or power-speed inputs." });
        }

        let weldingResults = [];

        // 🔹 Process each power-speed combination
        powerSpeedInputs.forEach(({ power, weldingSpeed }) => {
            if (!power || !weldingSpeed) return;

            // 🔹 Auto-calculate Heat Input (J/mm)
            const heatInput = (power * 60) / weldingSpeed;

            // 🔹 Auto-calculate Thermal Conductivity Rate
            const thermalConductivityRate = thermalConductivity / (density * thickness);

            // 🔹 Auto-calculate Cooling Time (s)
            const coolingTime = (thickness * density) / thermalConductivity;

            // 🔹 Auto-calculate Welding Strength (MPa)
            const flexuralFactor = 0.75; // Example factor
            const weldingStrength = tensileStrength * flexuralFactor;

            weldingResults.push({
                power,
                weldingSpeed,
                heatInput: parseFloat(heatInput.toFixed(2)),
                thermalConductivityRate: parseFloat(thermalConductivityRate.toFixed(2)),
                coolingTime: parseFloat(coolingTime.toFixed(2)),
                weldingStrength: parseFloat(weldingStrength.toFixed(2))
            });
        });

        // 🔹 Determine Optimal Welding Parameters
        const optimalWeldingParameters = weldingResults.reduce((best, current) => {
            if (!best || (current.weldingStrength >= best.weldingStrength && current.coolingTime <= best.coolingTime)) {
                return current;
            }
            return best;
        }, null);

        // 🔹 Response with all calculations + optimal parameters
        res.status(200).json({
            message: "Welding parameters calculated successfully.",
            weldingResults,
            optimalWeldingParameters
        });

    } catch (error) {
        res.status(500).json({ message: "Error calculating welding parameters.", error: error.message });
    }
};

export const finalSubmission = async (req, res) => { 
    try {
        const employeeId = req.username;
        const { productId } = req.params; 
        const data = {
            ...req.body,
            productId,
            resourceAnalystID:employeeId
        }
        const jsonData = JSON.stringify(data);
        const { encryptedHash, initialVector } = encryptData(jsonData);
        const timestamp = Math.floor(Date.now() / 1000);
        const result = await saveAnalysisData(encryptedHash, initialVector, timestamp);
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
            message: 'Analysed Data added successfully',
            transactionResult: { ...result, receipt: sanitizedReceipt }
        });

    } catch (error) {
        res.status(500).json({ message: "Error submitting final analysis.", error: error.message });
    }
    
    
}

export const getAllData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const {total} = await getTotal();
        if (total === 0) {
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
         const endIndex = Math.min(startIndex + limit, total);
         // Validate indices
         if (startIndex >= total) {
             return res.status(400).json({ 
                 error: 'Page number exceeds available products',
                 pagination: {
                     currentPage: page,
                     totalPages: Math.ceil(total / limit),
                     totalItems: total,
                     itemsPerPage: limit
                 }
             });
         }

        let batch = await fetchAllData(startIndex, endIndex);
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
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: endIndex < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all data.", error: error.message });
    }
}

export const getSingleData = async (req, res) => {
    const txnHash = req.params.txnHash;
    try {
        let result = await getData(txnHash);
        if (!result.response) {
            return res.status(500).json({message:"Error on fetching data",error})
        }
        const data = result.data;
        try {
            const decryptedData = decryptData(data.encryptedHash, data.initialVector)
            res.status(200).json({
                message:"Product Data fetched Successfully",
                ...JSON.parse(decryptedData),
                timestamp:Number(data.timestamp)
            })
        } catch (error) {
            return res.status(500).json({message:"Error on decrypting data",error})
        }
        
    } catch (error) {
        res.status(500).json({message:"Error on fetching data",error})
    }
}

export const updateAnalysisData = async (req, res) => {
    const txnHash = req.params.txnHash;
    const data = {
        ...req.body,
    }
    const jsonData = JSON.stringify(data);
    const { encryptedHash, initialVector } = encryptData(jsonData);
    const timestamp = Math.floor(Date.now() / 1000);
    try {
        const result = await updateData(txnHash,encryptedHash, initialVector, timestamp);
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
            message: 'Analysed Data updated successfully',
            transactionResult: { ...result, receipt: sanitizedReceipt }
        });

    } catch (error) {
        res.status(500).json({ message: "Error updating analysis data.", error: error.message });
    }
}

export const deleteAnalysisData = async (req, res) => { 
    const txnHash = req.params.txnHash;
    try {
        const result = await deleteData(txnHash);
        res.status(200).json({message:"Data deleted successfully"})
    } catch (error) {
        res.status(500).json({message:"Error on deleting data",error:error.message})
    }
}

export const getTotalCount = async (req, res) => { 
    try {
        const data = await getTotal();
        if (!data.response) {
            return res.status(500).json({message:"Error on fetching data",error:data.data})
        }
        res.status(200).json({total:data.total})
    } catch (error) {
        res.status(500).json({message:"Error on fetching data",error})
    }
}

export const getAccessRequests = async (req, res) => {
    try {
        const accessRequests = await AccessControl.find({ role:"design_support" });
        if (accessRequests.length === 0) {
            return res.status(404).json({ error: 'No access requests found' });
        }

        res.status(200).json({ accessRequests });
    } catch (error) {
        console.error('Error fetching access requests:', error);
        res.status(500).json({ error: error.message });
    }
}

export const grantAccess = async (req, res) => {
    try {
        const resourceAnalystId = req.username;
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
                grantedBy: resourceAnalystId,
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
        Resource Analyst Team
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
}

export const denyAccess = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        const accessControl = await AccessControl.findOneAndDelete({ employeeId });


        const emailContent = `
        Dear ${employee.name},

        Your access request has been denied.More information will be provided by the resource analyst team.
        `;
        await sendMail(employee.email, 'Access Request Denied', emailContent);
        res.status(200).json({ message: 'Access request denied successfully' });
    } catch (error) {
        console.error('Error denying access:', error);
        res.status(500).json({ error: error.message });
    }
}