import Login from "../Schema/LoginSchema.js";
import Employee from "../Schema/EmployeeSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Login.findOne({ username });
        const employee = await Employee.findOne({ employeeId:username})
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
                return res.status(401).json({ error: 'Invalid password' });
        }
        const accesstoken = jwt.sign({ username: user.username,role:employee.role }, process.env.JWT_SECRET_ACCESS, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ username: user.username,role:employee.role }, process.env.JWT_SECRET_REFRESH, { expiresIn: '7d' });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        await user.updateLoginStatus(true);
        res.status(200).json({ message: 'Login successful', accesstoken, refreshToken }); //testing refresh token 
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const register = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        // Check if email already exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const employee = new Employee({ 
            name, 
            email, 
            role 
        });
        
        await employee.save(); 

        res.status(201).json({ 
            message: 'Employee registered successfully. Kindly wait for approval, we will send you an email', 
            employee: {
                employeeId: employee.employeeId,
                name: employee.name,
                email: employee.email,
                role: employee.role,
                status: employee.status
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: error.message });
    }
}

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token found' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);
    
    const newAccessToken = jwt.sign({ username: decoded.username,role:decoded.role }, process.env.JWT_SECRET_ACCESS, { expiresIn: '1h' });
    res.status(200).json({ accesstoken: newAccessToken });
   } catch (error) {
        console.error('Error during refresh token:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }   
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Refresh token expired' });
        }
        res.status(500).json({ error: 'Internal server error' });
   }
}