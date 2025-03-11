import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography
} from '@mui/material';
import axios from 'axios';
import { ethers } from 'ethers';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('https://finalprojectqwq.onrender.com/api/orders/blockchain-transactions');
        setTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" p={2}>
        Blockchain Transactions
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Transaction Hash</TableCell>
            <TableCell>Amount (MATIC)</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx._id}>
              <TableCell>{tx._id}</TableCell>
              <TableCell>
                {tx.blockchainPayment?.transactionHash.slice(0, 6)}...
                {tx.blockchainPayment?.transactionHash.slice(-4)}
              </TableCell>
              <TableCell>
                {ethers.utils.formatEther(tx.blockchainPayment?.amount || '0')}
              </TableCell>
              <TableCell>{tx.blockchainPayment?.status}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.open(
                    `https://mumbai.polygonscan.com/tx/${tx.blockchainPayment.transactionHash}`,
                    '_blank'
                  )}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionList; 