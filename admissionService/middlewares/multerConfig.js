// middleware/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function createUploader(destinationFolder, allowedTypes = /jpeg|jpg|png/, maxSize = MAX_FILE_SIZE) {
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
const TIMETABLE_UPLOAD_ROOT = 'E:\\timetable';
const NOTES_UPLOAD_ROOT = 'E:\\notes';
const NOTIFICATION_UPLOAD_ROOT = 'E:\\notification';
const DIARY_UPLOAD_ROOT = 'E:\\diary';
const ASSIGNMENT_UPLOAD_ROOT = 'E:\\assignment';

const uploadInstituteLogo = createUploader(
  LOGO_UPLOAD_ROOT,
  /jpeg|jpg|png/,
  5 * 1024 * 1024
);

const uploadClasswiseInstituteLogo = createUploader(
  CLASSWISE_LOGO_UPLOAD_ROOT,
  /jpeg|jpg|png/,
  5 * 1024 * 1024
);

const uploadTimetable = createUploader(
  TIMETABLE_UPLOAD_ROOT,
  /jpeg|jpg|png|pdf/,
  1 * 1024 * 1024
);

const uploadNotes = createUploader(
  NOTES_UPLOAD_ROOT,
  /jpeg|jpg|png|pdf/,
  1 * 1024 * 1024
);

const NOTIFICATION_ALLOWED_TYPES = /jpeg|jpg|png|pdf/;

const uploadNotification = createUploader(
  NOTIFICATION_UPLOAD_ROOT,
  NOTIFICATION_ALLOWED_TYPES,
  1 * 1024 * 1024
);




const uploadDiary = createUploader(
  DIARY_UPLOAD_ROOT,
  /jpeg|jpg|png|pdf/,
  1 * 1024 * 1024
);

const uploadAssignment = createUploader(
  ASSIGNMENT_UPLOAD_ROOT,
  /jpeg|jpg|png|pdf/,
  1 * 1024 * 1024
);

module.exports = {
  uploadInstituteLogo,
  uploadClasswiseInstituteLogo,
  uploadTimetable,
  uploadNotes,
  uploadNotification,
  uploadDiary,
  uploadAssignment,
};
