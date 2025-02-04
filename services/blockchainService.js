import web3 from '../config/Web3Config.js';
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import contractDetails from '../config/contractDetails.json' assert { type: 'json' };
import { fileURLToPath } from 'url';

dotenv.config();

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const getContractInstance = (contractName) => {
    try {
        const contractInfo = contractDetails[contractName];
        if (!contractInfo || !contractInfo.address || !contractInfo.abiPath) {
            throw new Error(`Invalid contract details for ${contractName}`);
        }

        const contractData = JSON.parse(
            fs.readFileSync(path.resolve(__dirname, contractInfo.abiPath)).toString()
        );

        return new web3.eth.Contract(contractData.abi, contractInfo.address);
    } catch (error) {
        console.error('Error getting contract instance:', error);
        throw error;
    }
};
