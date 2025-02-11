import mongoose from 'mongoose';

const productionSchema = new mongoose.Schema({
    productionId: { type: String, unique: true },
    productId: { type: String, required: true },  
    productionName: { type: String, required: true }, 
    productionStatus: { 
        type: String, 
        enum: ["Not_Started", "In_Progress", "Completed", "Quality_Check"], 
        default: "Not_Started" 
    },

    feasibilityScore: { type: Number }, 
    startedAt: { type: Number }, 
    finishedAt: { type: Number },

    // Production Report
    productionReport: {
        metrics: {
            heatInput: { type: Number },
            weldingStrength: { type: Number },
        },
        weldingQuality: { type: String },
        recommendations: { type: String }
    },

    sentForQualityCheckAt: { type: Number },
    productionEmployeeId: { type: String,required: true },

}, { timestamps: true, collection: 'production' });

// Pre-save middleware to auto-generate productionId
productionSchema.pre('save', async function(next) {
    try {
        if (!this.productionId) {
            const lasProduction = await this.constructor.findOne({}, {}, { sort: { 'productionId': -1 } });
            let nextNumber = 1;
            
            if (lasProduction && lasProduction.productionId) {
                const lastNumber = parseInt(lasProduction.productionId.replace('PR', ''));
                if (!isNaN(lastNumber)) {
                    nextNumber = lastNumber + 1;
                }
            }
            
            this.productionId = `PR${String(nextNumber).padStart(3, '0')}`;
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Production = mongoose.model('Production', productionSchema);

export default Production;
