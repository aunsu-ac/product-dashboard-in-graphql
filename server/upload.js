const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Ensure upload directory exists
const ls_uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || '../public/uploads');
if (!fs.existsSync(ls_uploadDir)) {
  fs.mkdirSync(ls_uploadDir, { recursive: true });
}

// Configure storage
const lo_storage = multer.diskStorage({
  destination: (lo_req, lo_file, fn_cb) => {
    fn_cb(null, ls_uploadDir);
  },
  filename: (lo_req, lo_file, fn_cb) => {
    const ls_uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ls_ext = path.extname(lo_file.originalname);
    fn_cb(null, 'logo-' + ls_uniqueSuffix + ls_ext);
  }
});

// File filter to accept only images
const fileFilter = (lo_req, lo_file, fn_cb) => {
  const la_allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (la_allowedTypes.includes(lo_file.mimetype)) {
    fn_cb(null, true);
  } else {
    fn_cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: lo_storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024 // Default 2MB limit
  }
});

module.exports = upload;
