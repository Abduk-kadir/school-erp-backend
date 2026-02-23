const express = require('express');
const sequelize = require('./models').sequelize; // From models/index.js
const cors=require('cors')
const app = express();
const path = require('path');
app.use(express.json());
app.use(cors()); 

const roleRoutes = require('./routes/roleRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const classRoutes = require('./routes/classRoutes');
const academicYearRoutes = require('./routes/academicYearRoutes');
const casteRoutes = require('./routes/casteRoutes');
const divisionRoutes = require('./routes/divisionRoutes');
const physicallyDisableRoutes = require('./routes/phisallyDisableRoute');
const formRoutes=require('./routes/formRoutes')
const personalInformationRoutes = require("./routes/personalInformationRoute");
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



app.use('/api/document-types', documentTypeRoutes);
app.use('/api/requirement-documents', requirementDocumentRoutes);


app.use('/api/categories',categoryRoutes)

app.use('/api/subjects', subjectRoutes);

app.use("/api/personal-information", personalInformationRoutes);
app.use('/api/physically-disable', physicallyDisableRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/castes', casteRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/roles', roleRoutes);

app.use('/api',formRoutes)

// Routes


// Sync DB and start (for dev; use migrations in prod)
sequelize.sync().then(() => {
  console.log('DB connected');
}).catch(err => console.error('DB error:', err));

module.exports = app;