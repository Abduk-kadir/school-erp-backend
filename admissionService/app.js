const express = require('express');
const sequelize = require('./models').sequelize; // From models/index.js

const cors=require('cors')
const app = express();
const path = require('path');

//const dbSwitcher = require('./middlewares/dbSwitcher');
//const dbRoutes = require('./routes/dbRoutes');

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors()); 

//app.use(dbSwitcher);


const roleRoutes = require('./routes/roleRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const classRoutes = require('./routes/classRoutes');
const classDivMapMasterRoutes = require('./routes/classDivMapMasterRoutes');
const staffclassmapRoutes = require('./routes/staffclassmapRoutes');
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
const holidarmasterRoutes = require('./routes/holidarmaster/holidarmasterRoutes');
const eventmasterRoutes = require('./routes/eventmaster/eventmasterRoutes');
const aboutInstituteRoute = require('./routes/aboutinstitute/aboutInstituteRoute');
const carsoulRoutes = require('./routes/carsoul/carsoulRoutes');
const othercrousalRoutes = require('./routes/othercrousal/othercrousalRoutes');
const designationRoutes = require('./routes/designationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const titleRoutes = require('./routes/titleRoutes');

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

//app.use('/api/db', dbRoutes);
app.use('/api/in-out-attendance', inOutAttendanceRoutes);
app.use('/api/attendance-lecturewise', attendanceLecturewiseRoutes);
app.use('/api/holiday-masters', holidarmasterRoutes);
app.use('/api/event-masters', eventmasterRoutes);
app.use('/api/about-institute', aboutInstituteRoute);
app.use('/api/carsoul', carsoulRoutes);
app.use('/api/othercrousal', othercrousalRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/titles', titleRoutes);


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
const { UPLOAD_ROOT } = require('./middlewares/multerConfig');
app.use('/uploads', express.static(UPLOAD_ROOT));



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
app.use('/api/class-div-map-masters', classDivMapMasterRoutes);
app.use('/api/staff-class-maps', staffclassmapRoutes);
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