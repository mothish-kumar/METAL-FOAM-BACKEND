import mongoose from 'mongoose';

const qualityControlSchema = new mongoose.Schema({
    productId: { type: String, required: true },  
    productionId: { type: String, required: true, unique: true },  
    productTransactionHash: { type: String },
    productName: { type: String },
    qualityStatus: { 
        type: String, 
        enum: ["Pending", "In_Progress", "Approved", "Rework"], 
        default: "Pending" 
    },

    testResults: {
        youngsModulus: { type: Number }, // Material stiffness & elasticity
        corrosionResistance: { type: Number }, // Durability in harsh environments
        weightEfficiency: { type: Number }, // Strength-to-weight ratio
        tensileStrength: { type: Number } // Maximum tensile stress before failure
    },

    weldingAssessment: {
        weldIntegrity: { type: String, enum: ["Good", "Moderate", "Poor"] },
        corrosionImpact: { type: String, enum: ["None", "Minor", "Severe"] },
        weightRetention: { type: String, enum: ["Maintained", "Slight Loss", "Significant Loss"] }
    },

    approvedBy: { type: String }, // Quality Engineer ID or Name
    approvalDate: { type: Date },
    
    rejectionReason: { type: String }, 
    improvementSuggestions: { type: String }, 

    testReport: { type: String } // Path or link to stored report file
}, { timestamps: true, collection: 'qualityControl' });

const QualityControl = mongoose.model('QualityControl', qualityControlSchema);

export default QualityControl;
