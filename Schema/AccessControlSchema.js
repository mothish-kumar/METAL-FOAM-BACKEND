import mongoose from "mongoose";

const accessControlSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        ref: 'Employee',
        unique: true
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
    },
    role: {
        type: String,
        enum: ["admin", "resource_analyst", "design_support"],
        required: true
    },
}, { collection: 'access_control' });

const AccessControl = mongoose.model("AccessControl", accessControlSchema);

export default AccessControl; 