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
        unique: true
    },
    requestStatus: {
        type: String,
        enum: ['approved', 'pending', 'denied'],
        required: true
    },
    accessType: {
        type: String,
        enum: ['read', 'write', 'none'],
        default: 'none'
    },
    grantedBy: {
        type: String,
        required: true
    },
    grantedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { collection: 'productionRequests' });

const ProductionAccessRequest = mongoose.model("ProductionAccessRequest", ProductionAccessRequestSchema);

export default ProductionAccessRequest;