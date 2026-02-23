// middleware/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');


//  Common settings

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — adjust as needed

function createUploader(destinationFolder, allowedTypes = /jpeg|jpg|png/, maxSize = MAX_FILE_SIZE) {
  console.log('in multer')
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const fullPath = path.join(destinationFolder);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
    
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        cb(null, true);
      } else {
        cb(new Error(`Only ${allowedTypes.source.replace(/\|/g, ', ')} files allowed`), false);
      }
    },
  });
}



const LOGO_UPLOAD_ROOT = 'E:\\institutes\\logos';
const CLASSWISE_LOGO_UPLOAD_ROOT = 'E:\\classwiseInstitutes\\logos';

const uploadInstituteLogo = createUploader(
  LOGO_UPLOAD_ROOT,
  /jpeg|jpg|png/,          // only images
  5 * 1024 * 1024          // 2MB is usually enough for logos
);

const uploadClasswiseInstituteLogo = createUploader(
  CLASSWISE_LOGO_UPLOAD_ROOT,
  /jpeg|jpg|png/,          // only images
  5 * 1024 * 1024          // 2MB is usually enough for logos
);

// Export both
module.exports = {
 
  uploadInstituteLogo,
  uploadClasswiseInstituteLogo        
};