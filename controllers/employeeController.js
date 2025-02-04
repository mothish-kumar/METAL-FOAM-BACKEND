import Employee from "../Schema/EmployeeSchema.js";
import AccessControl from "../Schema/AccessControlSchema.js";
import Login from "../Schema/LoginSchema.js";
import bcrypt from "bcrypt";

// Request access to read the product data
export const requestAccess = async (req, res) => {
    try {
        const employeeId = req.username;

        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Check if there's already a pending request
        const existingRequest = await AccessControl.findOne({
            employeeId,
            status: 'active'
        });

        if (existingRequest) {
            return res.status(400).json({ 
                error: 'Access request already exists',
                accessDetails: existingRequest
            });
        }

        // Create access request
        await AccessControl.create({
            employeeId,
            accessType: 'none',
            grantedBy: 'pending',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });

        res.status(200).json({ 
            message: 'Access request submitted successfully',
            employeeId
        });
    } catch (error) {
        console.error('Error requesting access:', error);
        res.status(500).json({ error: error.message });
    }
};
// Check access
export const checkAccess = async (req, res) => {
    try {
        const employeeId = req.username;

        const accessControl = await AccessControl.findOne({
            employeeId,
            status: 'active',
            expiresAt: { $gt: new Date() }
        });

        if (!accessControl) {
            return res.status(403).json({ 
                error: 'No active access found.Make a request to read the product data',
                hasAccess: false
            });
        }

        res.status(200).json({
            hasAccess: true,
            accessDetails: accessControl
        });
    } catch (error) {
        console.error('Error checking access:', error);
        res.status(500).json({ error: error.message });
    }
};


// Logout
export const logout = async (req, res) => {
    try {
        const username = req.username;
        const user = await Login.findOne({ username });
        await user.updateLoginStatus(false);
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// change password
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const username = req.username;
        const user= await Login.findOne({ username});
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Old password is incorrect' });
        }
        const hashNewPassword = await bcrypt.hash(newPassword,10)
            user.password = hashNewPassword;
            await user.save();
            res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
}