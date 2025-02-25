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

export const getAllDesignData = async (startIndex,endIndex) => { 
    const contract = getContractInstance('DesignerSupport');
    try {
        const result = await contract.methods.getAllData(startIndex,endIndex).call();
        const txnHashes = result[0];
         const encryptedHashes = result[1];
         const initialVectors = result[2];
         const timestamps = result[3];
 
         // Convert the tuple of arrays into an array of objects.
         let formattedData = [];
         for (let i = 0; i < txnHashes.length; i++) {
             formattedData.push({
                 transactionHash: txnHashes[i],
                 encryptedHash: encryptedHashes[i],
                 initialVector: initialVectors[i],
                 timestamp: timestamps[i].toString()
             });
         }
        return { response: true, data: formattedData };
    } catch (error) {
        return { response: false, error:error.message };
    }
}

export const getTotal = async () => {
    const contract = getContractInstance('DesignerSupport');
    try {
        const total = await contract.methods.getTotalStoredData().call();
        return { response: true, total };
    } catch (error) {
        return { response: false, error };
    }
}

export const getSingleData = async (txnHash) => { 
    const contract = getContractInstance('DesignerSupport');
    try {
        const result = await contract.methods.getSingleData(txnHash).call();
        const encryptedHash = result[0];
        const initialVector = result[1];
        const timestamp = result[2];
        return { response: true, data: { encryptedHash, initialVector, timestamp } };
    } catch (error) {
        return { response: false, error:error.message };
    }
}

export const updateDesignData = async (txnHash, encryptedHash, initialVector, timestamp) => { 
    const contract = getContractInstance('DesignerSupport');
    try {
        const receipt = await contract.methods.updateData(txnHash, encryptedHash, initialVector, timestamp)
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

export const deleteDesignData = async (txnHash) => { 
    const contract = getContractInstance('DesignerSupport');
    try {
        const receipt = await contract.methods.deleteData(txnHash)
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