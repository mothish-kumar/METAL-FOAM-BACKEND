import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                error: 'No authorization header found',
                message: 'Please login to access this resource'
            });
        }

        const token = authHeader.split(' ')[1];  // Only split if header exists
        
        if (!token) {
            return res.status(401).json({ 
                error: 'No token found',
                message: 'Please provide a valid authentication token'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS);
            req.username = decoded.username;  // Add username to request
            next();
        } catch (jwtError) {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: 'Your session has expired. Please login again'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            error: 'Authentication failed',
            message: 'An error occurred during authentication'
        });
    }
};