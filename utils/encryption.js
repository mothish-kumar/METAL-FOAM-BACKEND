import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const algorithm = 'aes-256-ctr';
const secretKey = Buffer.from(process.env.ENCRYPTION_SECRET_KEY, 'hex').subarray(0, 32);

// Validate secret key
if (!secretKey) {
    throw new Error('ENCRYPTION_SECRET_KEY is not defined in environment variables');
}

// Generate a new IV for each encryption
export const encryptData = (data) => {
    if (!data) {
        throw new Error('Data to encrypt cannot be empty or undefined');
    }
    
    // Generate new IV for each encryption
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(
        algorithm, 
        Buffer.from(secretKey),
        iv
    );
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return { 
        initialVector: iv.toString('hex'), 
        encryptedHash: encrypted 
    };
}

export const decryptData = (encryptedHash, initialVector) => {
    const decipher = crypto.createDecipheriv(
        algorithm, 
        Buffer.from(secretKey), 
        Buffer.from(initialVector, 'hex')
    );
    
    let decryptedString = decipher.update(encryptedHash, 'hex', 'utf8');
    decryptedString += decipher.final('utf8');
    
    return decryptedString;
}