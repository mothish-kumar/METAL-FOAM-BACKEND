import mongoose from "mongoose";

const accessControlSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        ref: 'Employee'
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
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'pending','denied'],
        default: 'pending'
    }
}, { collection: 'access_control' });

const AccessControl = mongoose.model("AccessControl", accessControlSchema);

export default AccessControl; 