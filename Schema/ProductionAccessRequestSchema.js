import mongoose from "mongoose";

const ProductionAccessRequestSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
        required: true,
    },
    requestStatus: {
        type: String,
        enum: ['approved', 'pending', 'denied'],
        default:'pending',
    },
    accessType: {
        type: String,
        enum: ['read', 'write', 'none'],
        default: 'none'
    },
    grantedBy: {
        type: String,

    },
    grantedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
    }
}, { collection: 'productionRequests' });

const ProductionAccessRequest = mongoose.model("ProductionAccessRequest", ProductionAccessRequestSchema);

export default ProductionAccessRequest;