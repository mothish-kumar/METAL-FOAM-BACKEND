import { getContractInstance } from "./blockchainService.js";
import web3 from "../config/Web3Config.js";

export const saveDesignData = async (encryptedHash, initialVector, timestamp) => { 
    const contract = getContractInstance('DesignerSupport');
    try {
        const receipt = await contract.methods.storeData(encryptedHash, initialVector, timestamp)
            .send({ from: web3.eth.defaultAccount });
            if (!receipt) {
                throw new Error('Transaction failed - no receipt received');
            }
            
            return { 
                response: true, 
                receipt: {
                    transactionHash: receipt.transactionHash,
                    blockNumber: receipt.blockNumber,
                    gasUsed: receipt.gasUsed,
                    status: receipt.status,
                    transactionIndex: receipt.transactionIndex || 0,
                    cumulativeGasUsed: receipt.cumulativeGasUsed || 0,
                    effectiveGasPrice: receipt.effectiveGasPrice || 0,
                    type: receipt.type || 0
                }
            };
    } catch (error) {
        return { response: false, error };
    }
}