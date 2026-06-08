const express = require('express');
const sequelize = require('./models').sequelize; // From models/index.js
const cors=require('cors')
const app = express();
const path = require('path');
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors()); 

const roleRoutes = require('./routes/roleRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const classRoutes = require('./routes/classRoutes');
const batchRoutes = require('./routes/batchRoutes');
const timetableRoutes = require('./routes/timetable/timetableRoutes');
const assignmentRoutes = require('./routes/assignment/assignmentRoutes');
const notesRoutes = require('./routes/notes/notesRoutes');
const diaryRoutes = require('./routes/diary/diaryRoutes');
const studentnotificationRoutes = require('./routes/studentnotification/studentnotificationRoutes');
const casteRoutes = require('./routes/casteRoutes');
const divisionRoutes = require('./routes/divisionRoutes');
const physicallyDisableRoutes = require('./routes/phisallyDisableRoute');
const formRoutes=require('./routes/formRoutes')
const personalInformationRoutes = require("./routes/personalInformationRoute");
const parmanentPersonalInformationRoutes = require('./routes/parmanentPersonalInformationRoutes');
const subjectRoutes = require('./routes/subjectRoute');
const categoryRoutes=require('./routes/catergoryRoute')
const documentTypeRoutes = require('./routes/documentTypeRoute');
const requirementDocumentRoutes = require('./routes/requirementDocumentRoutes');
const studentDocumentRoutes = require('./routes/studentDocumentRoutes');
const programRoutes = require('./routes/programRoutes');
const programSubjectRoutes = require('./routes/programSubjectRoutes');
const electiveBasketRoutes = require('./routes/electiveBasketRoutes');
const studentSubjectRoutes = require('./routes/studentSubjectRoutes');
const declarationRoutes = require('./routes/declarationRoutes');
const studentDeclarationRoutes = require('./routes/studentDeclarationRoutes');
const instituteRoutes=require('./routes/instituteRoutes')
const formStatusRoutes=require('./routes/formStatusRoute')
const routeRouter = require('./routes/routeRoutes');
const subrouteRouter = require('./routes/subRouteRoutes');
const studentTransportRoutes = require('./routes/studentTransportRoutes');
const otherInformationRoutes = require('./routes/otherInformationRoutes');
const educationDetailRoutes=require('./routes/educationalDetailRoutes')
const parentParticularRoutes=require('./routes/parentParticularRoute')
const classFiledRoutes=require('./routes/classFieldRoutes')
const admissionConformRoutes=require('./routes/admissionComformRoutes')
const seatAllotmentRoutes = require('./routes/seatAllotmentRoutes');
const classwiseSchoolRoutes=require('./routes/classwiseSchoolRoutes')
const admissionpdfRoutes = require('./routes/admissionPdfRoutes');
const studentDownloadDataRoutes = require('./routes/studentDownloadDataRoute');
const bankDetailsRouter = require('./routes/Fee/Bank/bankDetailRoutes');
const banksRouter = require('./routes/Fee/Bank/bankRoutes');
const feeHeadRoutes = require('./routes/Fee/Bank/feeHeadRoutes');
const paymentSettingRoutes = require('./routes/Fee/Bank/paymentSettingRoutes');
const feeGroupRoutes = require('./routes/Fee/feeGroupRoutes');
const feeCollectionRoutes = require('./routes/Fee/feeCollectionRoutes');
const studentFeeRoutes = require('./routes/Fee/studentFeeRoutes');
const canteenFeeRoutes = require('./routes/Fee/canteenFeeRoutes');
const admissionFeeRoutes = require('./routes/Fee/admissionFeeRoutes');
const transportFeeRoutes = require('./routes/Fee/transportFeeRoutes');
const studentFeeGroupDetailpriceSplitRoutes = require('./routes/Fee/studentFeeGroupDetailpriceSplitRoutes');
const fineRoutes = require('./routes/Fee/fineRoutes');
const fineAssignedRoutes = require('./routes/Fee/fineAssignedRoutes');
const studentfineRoutes = require('./routes/Fee/studentfineRoutes');
const feeRecordMonthlyRoutes = require('./routes/feeRecordMonthlyRoutes');
const errorRoutes=require('./routes/errorRoutes')
const adminDashBoardRoutes = require('./routes/adminDashBoardRoutes');
const staffRegistrationRoutes = require('./routes/staffRegistrationRoutes');
const feesTypeRoutes = require('./routes/feesTypeRoutes');
const inOutAttendanceRoutes = require('./routes/attendance/inOutAttendanceRoutes');
const attendanceLecturewiseRoutes = require('./routes/attendance/attendanceLecturewiseRoutes');

// In your app.js or server.js
                 // Ensure Redis connects first
const worker = require('./workers/notificationWorker.js');

// Optional: Add more event listeners
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker Error:', err);
});

console.log('🚀 Notification Worker Started Successfully');


app.use('/api/in-out-attendance', inOutAttendanceRoutes);
app.use('/api/attendance-lecturewise', attendanceLecturewiseRoutes);


app.use('/api/error',errorRoutes)
app.use('/api/admin-dashboard', adminDashBoardRoutes);
app.use('/api/staff', staffRegistrationRoutes);


//fee module routes
app.use('/api/fees', feeCollectionRoutes);
app.use('/api/student-fees', studentFeeRoutes);
app.use('/api/canteen-fees', canteenFeeRoutes);
app.use('/api/admission-fees', admissionFeeRoutes);
app.use('/api/transport-fees', transportFeeRoutes);
app.use('/api/student-fee-installment-splits', studentFeeGroupDetailpriceSplitRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/fine-assigned', fineAssignedRoutes);
app.use('/api/student-fines', studentfineRoutes);
app.use('/api/fee-record-monthly', feeRecordMonthlyRoutes);


app.use('/api/fee-heads', feeHeadRoutes);
app.use('/api/fee-groups', feeGroupRoutes);
app.use('/api/fees-types', feesTypeRoutes);

app.use('/api/banks', banksRouter);
app.use('/api/bank-details', bankDetailsRouter);
app.use('/api/payment-settings', paymentSettingRoutes);


//fee module end here


//admission routes

app.use('/api/studentData-download', studentDownloadDataRoutes);
app.use('/api/admission', admissionpdfRoutes);
app.use('/api/classwise-institute', classwiseSchoolRoutes);
app.use('/api/seat-allotments', seatAllotmentRoutes);
app.use('/api/admission-conform', admissionConformRoutes);
app.use('/api/class-fields', classFiledRoutes);
app.use('/api/parent-particular', parentParticularRoutes);
app.use('/api/educational-detail', educationDetailRoutes);
app.use('/api/other-information', otherInformationRoutes);
app.use('/api/student-transport', studentTransportRoutes);
app.use('/api/subroutes', subrouteRouter);
app.use('/api/routes', routeRouter);
app.use('/api/form-status', formStatusRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/student-declarations', studentDeclarationRoutes);
app.use('/api/declarations', declarationRoutes);
app.use('/api/studentsubjects', studentSubjectRoutes);
app.use('/api/elective-baskets', electiveBasketRoutes);

app.use('/api/program-subjects', programSubjectRoutes);
app.use('/api/programs', programRoutes);

app.use('/api/student-documents', studentDocumentRoutes);
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  '/uploads/classwiseInstitutes/logos',
  express.static('E:/classwiseInstitutes/logos')
);
app.use(
  '/uploads/institutes/logos',
  express.static('E:/institutes/logos')
);
app.use(
  '/uploads/timetable',
  express.static('E:/timetable')
);
app.use(
  '/uploads/assignment',
  express.static('E:/assignment')
);
app.use(
  '/uploads/notes',
  express.static('E:/notes')
);
app.use(
  '/uploads/diary',
  express.static('E:/diary')
);
app.use(
  '/uploads/notification',
  express.static('E:/notification')
);



app.use('/api/document-types', documentTypeRoutes);
app.use('/api/requirement-documents', requirementDocumentRoutes);


app.use('/api/categories',categoryRoutes)
app.use('/api/subjects', subjectRoutes);
app.use("/api/personal-information", personalInformationRoutes);
app.use('/api/parmanent-personal-information', parmanentPersonalInformationRoutes);
app.use('/api/physically-disable', physicallyDisableRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/castes', casteRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/diaries', diaryRoutes);
app.use('/api/student-notifications', studentnotificationRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api',formRoutes);


const globalError = require('./middlewares/globalError');
app.use(globalError);




// Routes


// Sync DB and start (for dev; use migrations in prod)
sequelize.sync().then(() => {
  console.log('DB connected');
}).catch(err => console.error('DB error:', err));

module.exports = app;