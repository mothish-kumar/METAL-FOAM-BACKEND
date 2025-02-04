import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ["admin", "resource_analyst", "design_support"],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'denied'],
        default: 'pending'
    }
}, { collection: 'employee' });

// Pre-save middleware to auto-generate employeeId
employeeSchema.pre('save', async function(next) {
    try {
        if (!this.employeeId) {
            const lastEmployee = await this.constructor.findOne({}, {}, { sort: { 'employeeId': -1 } });
            let nextNumber = 1;
            
            if (lastEmployee && lastEmployee.employeeId) {
                const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
                if (!isNaN(lastNumber)) {
                    nextNumber = lastNumber + 1;
                }
            }
            
            this.employeeId = `EMP${String(nextNumber).padStart(3, '0')}`;
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
