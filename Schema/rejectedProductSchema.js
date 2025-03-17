import mongoose from 'mongoose';

const rejectedProductSchema = new mongoose.Schema({
    rejectionId: { type: String, unique: true },
    productId: { type: String, required: true }, 
    productName: { type: String, required: true }, 
    materialType: { type: String, required: true }, 
    rejectedAt: { type: Date, default: Date.now }, 
    rejectedBy: { type: String, required: true }, 
    rejectionReason: { type: String, required: true }, 
    improvementSuggestions: { type: String, required: true }, 
    previousFeasibilityScore: { type: Number },
    weldingIssues: {
        heatInput: { type: Number },
        thermalConductivityRate: { type: Number },
        coolingTime: { type: Number },
        weldingStrength: { type: Number }
    },
    additionalNotes: { type: String } 
}, { timestamps: true, collection: 'rejected_products' });

// Pre-save middleware to auto-generate rejectionId
rejectedProductSchema.pre('save', async function(next) {
    try {
        if (!this.rejectionId) {
            const lastProduction = await this.constructor.findOne()
                .sort({ rejectedAt: -1 }) 
            
            let nextNumber = 1;
            
            if (lastProduction && lastProduction.rejectionId) {
                const lastNumber = parseInt(lastProduction.rejectionId.replace('RJ', ''), 10);
                if (!isNaN(lastNumber)) {
                    nextNumber = lastNumber + 1;
                }
            }
            
            this.rejectionId = `RJ${String(nextNumber).padStart(3, '0')}`; 
        }
        next();
    } catch (error) {
        next(error);
    }
});

const RejectedProduct = mongoose.model('RejectedProduct', rejectedProductSchema);

export default RejectedProduct;
