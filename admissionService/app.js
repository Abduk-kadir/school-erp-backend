const express = require('express');
const sequelize = require('./models').sequelize; // From models/index.js
const cors=require('cors')
const app = express();
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


app.use('/api/document-types', documentTypeRoutes);

const requirementDocumentRoutes = require('./routes/requirementDocumentRoutes');
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