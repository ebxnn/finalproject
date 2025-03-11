import Web3 from 'web3';
import dotenv from 'dotenv';
import contractABI from './OrderBlockchainABI.json';  // ABI from compiled Solidity contract

dotenv.config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_NODE_URL));
const contractAddress = process.env.SMART_CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);
const adminAccount = process.env.ADMIN_WALLET_ADDRESS;
const privateKey = process.env.ADMIN_PRIVATE_KEY;

export const recordOrderOnBlockchain = async (orderId, totalAmount, status, paymentId) => {
  const tx = contract.methods.createOrder(orderId, totalAmount, status, paymentId);
  const gas = await tx.estimateGas({ from: adminAccount });
  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(adminAccount);

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: contractAddress,
      data,
      gas,
      gasPrice,
      nonce,
    },
    privateKey
  );

  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  return receipt.transactionHash;
};
