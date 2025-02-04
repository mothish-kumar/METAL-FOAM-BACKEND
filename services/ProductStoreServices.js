import { getContractInstance } from './blockchainService.js';
import web3 from '../config/Web3Config.js';


export const saveProductData = async (encryptedHash, initialVector, timestamp) => {
    const contract = getContractInstance('ProductStorage');
    try {
        const receipt = await contract.methods.storeProduct(encryptedHash, initialVector, timestamp)
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

export const saveProductDataBatch = async (encryptHashes, initialVectors, timestamps) => {
    const contract = getContractInstance('ProductStorage');
    try {
        // Get gas price and estimate gas
        const gasPrice = await web3.eth.getGasPrice();
        const estimatedGas = await contract.methods.storeMultipleProducts(encryptHashes, initialVectors, timestamps)
            .estimateGas({ from: web3.eth.defaultAccount });

        // Convert to numbers and add buffer
        const gas = Math.floor(Number(estimatedGas) * 1.5);
        const gasPriceNum = Number(gasPrice);

        const receipt = await contract.methods.storeMultipleProducts(encryptHashes, initialVectors, timestamps)
            .send({ 
                from: web3.eth.defaultAccount,
                gas: gas,
                gasPrice: gasPriceNum
            });
        
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
        console.error('Blockchain save error:', error);
        return { response: false, error: error.message };
    }
}

export const getAllProductData = async (startIndex, endIndex) => {
    const contract = getContractInstance('ProductStorage');
    try {
        const result = await contract.methods.getAllProducts(startIndex, endIndex).call();
        // Transform the result into an array of objects
        return result.encryptedHashes.map((hash, index) => ({
            productId: Number(result.ids[index]),
            encryptedHash: hash,
            initialVector: result.initialVectors[index],
            timestamp: Number(result.timestamps[index])
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

export const getProductData = async (productHash) => {
    const contract = getContractInstance('ProductStorage');
    return contract.methods.getProduct(productHash).call();
}

export const productCount = async () => {
    const contract = getContractInstance('ProductStorage');
    return contract.methods.getProductCount().call();
}

export const getProductById = async (productId) => {
    const contract = getContractInstance('ProductStorage');
    return contract.methods.getProductById(productId).call();
}

export const deleteProductById = async (productId) => {
    const contract = getContractInstance('ProductStorage');
    try {
        const receipt = await contract.methods.deleteProduct(productId)
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

export const deleteAllProducts = async () => {
    const contract = getContractInstance('ProductStorage');
    try {
        const receipt = await contract.methods.deleteAllProducts()
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

export const updateProductById = async (productId, encryptedHash, initialVector, timestamp) => {
    const contract = getContractInstance('ProductStorage');
    try {
        // Get gas price and estimate gas
        const gasPrice = await web3.eth.getGasPrice();
        const estimatedGas = await contract.methods.updateProduct(productId, encryptedHash, initialVector, timestamp)
            .estimateGas({ from: web3.eth.defaultAccount });

        // Convert to numbers and add buffer
        const gas = Math.floor(Number(estimatedGas) * 1.5);
        const gasPriceNum = Number(gasPrice);

        const receipt = await contract.methods.updateProduct(productId, encryptedHash, initialVector, timestamp)
            .send({ 
                from: web3.eth.defaultAccount,
                gas: gas,
                gasPrice: gasPriceNum
            });
        
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
        console.error('Blockchain update error:', error);
        return { response: false, error: error.message };
    }
}
