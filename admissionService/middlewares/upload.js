// middleware/upload.js or in your multer config file
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const UPLOAD_ROOT = 'E:\\school-uploads\\students';
const TEMP_FOLDER = path.join(UPLOAD_ROOT, 'temp');

// Create temp folder if not exists
if (!fs.existsSync(TEMP_FOLDER)) {
  fs.mkdirSync(TEMP_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TEMP_FOLDER); // always save to temp first
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `temp-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Only JPG, PNG, PDF allowed'), false);
  },
});

module.exports = upload;