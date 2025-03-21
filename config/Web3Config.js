import Web3 from "web3";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.WEB3_PROVIDER_URL) {
    console.error('WEB3_PROVIDER_URL is not set in the environment variables');
}
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER_URL));
 if(!process.env.BLOCKCHAIN_PRIVATE_KEY){
    console.error('BLOCKCHAIN_PRIVATE_KEY is not set in the environment variables');
 }
const account = web3.eth.accounts.privateKeyToAccount(process.env.BLOCKCHAIN_PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

//Check balance
// web3.eth.getBalance(process.env.BLOCKCHAIN_PUBLIC_KEY)
//   .then(balance => {
//     console.log(`Balance: ${web3.utils.fromWei(balance, "ether")} ETH`);
//   })
//   .catch(err => console.error("Error fetching balance:", err));

export default web3;
