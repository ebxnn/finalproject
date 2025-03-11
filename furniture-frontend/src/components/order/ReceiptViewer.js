import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  ButtonGroup
} from '@mui/material';
import { Receipt, Image, Code, Download } from '@mui/icons-material';

const ReceiptViewer = ({ receipt }) => {
  if (!receipt) return null;

  const downloadReceipt = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Digital Receipt
        </Typography>
        
        {!receipt.error && (
          <ButtonGroup variant="outlined" size="small">
            <Button
              startIcon={<Download />}
              onClick={() => downloadReceipt(receipt.imageUrl, 'receipt.png')}
              title="Download Receipt Image"
            >
              Image
            </Button>
            <Button
              startIcon={<Download />}
              onClick={() => downloadReceipt(receipt.url, 'receipt.json')}
              title="Download Receipt Metadata"
            >
              Metadata
            </Button>
          </ButtonGroup>
        )}
      </Box>
      
      {receipt.error ? (
        <Typography color="error">
          Error generating receipt: {receipt.error}
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Image />}
              component="a"
              href={receipt.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Receipt Image
            </Button>
            <Button
              variant="outlined"
              startIcon={<Receipt />}
              component="a"
              href={receipt.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Metadata
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" color="text.secondary">
            IPFS Details
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Code fontSize="small" />
              Receipt Hash: {receipt.ipfsHash}
            </Typography>
            {receipt.imageIpfsHash && (
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Code fontSize="small" />
                Image Hash: {receipt.imageIpfsHash}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(receipt.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ReceiptViewer; 