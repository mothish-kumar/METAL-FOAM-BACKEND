import { getContractInstance } from './blockchainService.js';
import web3 from '../config/Web3Config.js';

export const saveAnalysisData = async (encryptedHash, initialVector, timestamp) => {
    const contract = getContractInstance('AnalysisStorage');
    try {
        const receipt = await contract.methods.storeAnalysis(encryptedHash, initialVector, timestamp)
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

export const getTotal = async () => {
    const contract = getContractInstance('AnalysisStorage');
    try {
        const total = await contract.methods.getTotal().call();
        const count = Number(total);
        return { response: true, total: count };
    } catch (error) {
        return { response: false, error };
    }
}

export const fetchAllData = async (startIndex, endIndex) => { 
    const contract = getContractInstance('AnalysisStorage');
    try {
        const result = await contract.methods.getAllAnalysis(startIndex, endIndex).call();
         // Destructure the returned tuple
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
                 timestamp: timestamps[i]
             });
         }
        return { response: true, data: formattedData };
    } catch (error) {
        return { response: false, error };
    }
}

export const getData = async (transactionHash) => {
    const contract = getContractInstance('AnalysisStorage');
    try {
        const result = await contract.methods.getAnalysis(transactionHash).call();
        const encryptedHash = result[0];
        const initialVector = result[1];
        const timestamp = result[2];
        const data = {
            encryptedHash,initialVector,timestamp
        }
        return{response:true,data}
    } catch (error) {
        return {response:false,error}
    }
}

export const updateData = async (transactionHash, encryptedHash, initialVector, timestamp) => {
    const contract = getContractInstance('AnalysisStorage');
    try {
        const receipt = await contract.methods.updateAnalysis(transactionHash, encryptedHash, initialVector, timestamp)
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
 
export const deleteData = async (transactionHash) => { 
    const contract = getContractInstance('AnalysisStorage');
    try {
        const receipt = await contract.methods.deleteAnalysis(transactionHash)
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
        if (error.message && error.message.includes("Analysis not found")) {
            // Optionally, return a dummy receipt or an appropriate success message.
            return { 
                response: true,
                receipt: { 
                    transactionHash: transactionHash,
                    message: "Analysis not found. It may have already been deleted." 
                }
            };
        }
        return { response: false, error };
    }
}