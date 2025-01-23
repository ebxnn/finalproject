import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Create a storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Define the destination for the uploaded files
  },
  filename: (req, file, cb) => {
    // Create a unique filename using the original name and the current timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + '-' + uniqueSuffix + ext); // Set the filename
  },
});

// Initialize multer with the storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
  fileFilter: (req, file, cb) => {
    // Allow only certain file types (e.g., jpg, jpeg, png, gif)
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true); // Accept file
    } else {
      cb('Error: Only images are allowed!'); // Reject file
    }
  },
});

// Export the upload middleware for use in your routes
export default upload;
