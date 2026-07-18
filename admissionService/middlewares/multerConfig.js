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

/*const LOGO_UPLOAD_ROOT = 'E:\\institutes\\logos';
const CLASSWISE_LOGO_UPLOAD_ROOT = 'E:\\classwiseInstitutes\\logos';
const TIMETABLE_UPLOAD_ROOT = 'E:\\timetable';
const NOTES_UPLOAD_ROOT = 'E:\\notes';
const NOTIFICATION_UPLOAD_ROOT = 'E:\\notification';
const DIARY_UPLOAD_ROOT = 'E:\\diary';
const ASSIGNMENT_UPLOAD_ROOT = 'E:\\assignment';
const ABOUT_INSTITUTE_IMAGE_UPLOAD_ROOT = 'E:\\aboutInstituteImage';
const STAFF_DOCUMENT_UPLOAD_ROOT = 'E:\\staffDocument';
const CARSOSLIDE_UPLOAD_ROOT = 'E:\\carsoslide';
*/



const UPLOAD_ROOT = path.join(__dirname, "../../uploads");

const LOGO_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "institutes/logos");
const CLASSWISE_LOGO_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "classwiseInstitutes/logos");
const TIMETABLE_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "timetable");
const NOTES_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "notes");
const NOTIFICATION_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "notification");
const DIARY_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "diary");
const ASSIGNMENT_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "assignment");
const ABOUT_INSTITUTE_IMAGE_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "aboutInstituteImage");
const STAFF_DOCUMENT_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "staffDocument");
const CARSOSLIDE_UPLOAD_ROOT = path.join(UPLOAD_ROOT, "carsoslide");



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

const uploadAboutInstituteImage = createUploader(
  ABOUT_INSTITUTE_IMAGE_UPLOAD_ROOT,
  /jpeg|jpg|png/,
  1 * 1024 * 1024
);

const uploadStaffDocument = createUploader(
  STAFF_DOCUMENT_UPLOAD_ROOT,
  /jpeg|jpg|png/,
  1 * 1024 * 1024
);

const uploadCarsolSlide = createUploader(
  CARSOSLIDE_UPLOAD_ROOT,
  /jpeg|jpg|png/,
  1 * 1024 * 1024
);

module.exports = {
  UPLOAD_ROOT,
  LOGO_UPLOAD_ROOT,
  CLASSWISE_LOGO_UPLOAD_ROOT,
  TIMETABLE_UPLOAD_ROOT,
  NOTES_UPLOAD_ROOT,
  NOTIFICATION_UPLOAD_ROOT,
  DIARY_UPLOAD_ROOT,
  ASSIGNMENT_UPLOAD_ROOT,
  ABOUT_INSTITUTE_IMAGE_UPLOAD_ROOT,
  STAFF_DOCUMENT_UPLOAD_ROOT,
  CARSOSLIDE_UPLOAD_ROOT,
  uploadInstituteLogo,
  uploadClasswiseInstituteLogo,
  uploadTimetable,
  uploadNotes,
  uploadNotification,
  uploadDiary,
  uploadAssignment,
  uploadAboutInstituteImage,
  uploadStaffDocument,
  uploadCarsolSlide,
};
