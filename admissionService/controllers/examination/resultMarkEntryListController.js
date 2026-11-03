const asyncHandler = require('express-async-handler');
const {
  result_mark_entry_list,
  student_mark,
  exam_scheme,
  exam_name,
  class_master,
  term,
  division_master,
  Subject,
  exam_assessment,
  assessment_component,
  assessment_group,
  component,
  Program,
  semester,
  sequelize,
} = require('../../models');
const { httpError, toNumberOrNull, toBoolean, getQueryValue } = require('./examHelper');
const { getDataTable } = require('../../helper');
const ExcelJS=require('exceljs');
const schemeInclude = [
  { model: exam_name, as: 'examNameInfo', attributes: ['id', 'exam_name'] },
  { model: class_master, as: 'classInfo', attributes: ['id', 'class_name'] },
  { model: term, as: 'termInfo', attributes: ['id', 'term_name'] },
  { model: Program, as: 'programInfo', attributes: ['id', 'program_name'] },
  { model: semester, as: 'semesterInfo', attributes: ['id', 'semester'] },
];


const MARK_STATUSES = ['present', 'absent', 'exempt'];


const entryListInclude = [
  {
    model: exam_scheme,
    as: 'scheme',
    attributes: ['id', 'exam_name_id', 'class_id', 'term_id'],
    include: [
      { model: exam_name, as: 'examNameInfo', attributes: ['id', 'exam_name'] },
      { model: class_master, as: 'classInfo', attributes: ['id', 'class_name'] },
      { model: term, as: 'termInfo', attributes: ['id', 'term_name'] },
    ],
  },
  { model: division_master, as: 'divisionInfo', attributes: ['id', 'division_name'] },
  { model: Subject, as: 'subjectInfo', attributes: ['id', 'value', 'abbreviation_name'] },
];

const marksInclude = {
  model: student_mark,
  as: 'marks',
  separate: true,
  order: [['student_id', 'ASC'], ['exam_assessment_id', 'ASC'], ['assessment_component_id', 'ASC']],
};

const getAssessmentAndComponent=async(exam_scheme_id,subject_id)=>{
  let query=`select ea.exam_scheme_id, ea.id as exam_assessment_id,ac.id as assessment_component_id from exam_assessments ea left join assessment_components as ac on ea.id=ac.exam_assessment_id where ea.exam_scheme_id=:exam_scheme_id and ea.subject_id=:subject_id order by ea.sequence, ac.sequence;`
  let result=await sequelize.query(query,{replacements:{exam_scheme_id,subject_id},type:sequelize.QueryTypes.SELECT})
  return result
}
const getStudents=async(class_id,division_id)=>{
  let query=`select id,first_name,last_name,class,division from par_student_personal_informations where class=:class_id and division=:division_id;`
  let result=await sequelize.query(query,{replacements:{class_id,division_id},type:sequelize.QueryTypes.SELECT})
  return result
}

const markKey = (row) => [row.student_id, row.exam_assessment_id, row.assessment_component_id ?? 0].join('|');

const makePayload=(result_mark_entry_list_id,allassesmentandcomponentData,studentsData)=>{
  let payload=[]
  for(let student of studentsData){
    for(let assessment of allassesmentandcomponentData){
      payload.push({
        result_mark_entry_list_id:result_mark_entry_list_id,
        student_id:student.id,
        exam_assessment_id:assessment.exam_assessment_id,
        assessment_component_id:assessment.assessment_component_id
      })
    }
  }
  return payload
}



const loadColumns=async(exam_scheme_id,subject_id)=>{
  const schemeId=exam_scheme_id;
   const subjectId=subject_id;
    const scheme=await exam_scheme.findOne({
      where: { id: schemeId },
      include: schemeInclude,
    });
    const where = { exam_scheme_id: schemeId, subject_id: subjectId };
    const assessments = await exam_assessment.findAll({
      where,
      include: [
        { model: Subject, as: 'subjectInfo', attributes: ['id', 'value', 'abbreviation_name'] },
        { model: component, as: 'componentInfo', attributes: ['id', 'component_name', 'type'] },
        {
          model: assessment_component,
          as: 'components',
          include: [{ model: component, as: 'componentInfo', attributes: ['id', 'component_name', 'type'] }],
        },
        { model: assessment_group, as: 'groupInfo', attributes: ['id', 'group'] },
      ],
      order: [
       
        ['sequence', 'ASC'],
        [{ model: assessment_component, as: 'components' }, 'sequence', 'ASC'],
      ],
    });
    return assessments

}




  

  

 

const resultMarkEntryListController = {
  importMarks:asyncHandler(async(req,res)=>{
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Excel file is required (form-data key: file)" });
    }
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet('Marks');
    const meta = workbook.getWorksheet('Meta');
    if (!sheet || !meta) {
      return res.status(400).json({
        success: false,
        message: "Invalid file. Please upload the marks sheet downloaded from Marks Entry.",
      });
    }

    const metaValues = {};
    meta.eachRow((r) => {
      metaValues[r.getCell(1).text] = r.getCell(2).text;
    });
    const toId = (v) => (v === undefined || v === "" ? null : Number(v));
    const ids = {
      result_mark_entry_id: toId(metaValues.result_mark_entry_id),
      exam_scheme_id: toId(metaValues.exam_scheme_id),
      subject_id: toId(metaValues.subject_id),
      division_id: toId(metaValues.division_id),
    };

    const dataStartRow = Number(metaValues.data_start_row) || 6;
    if (!metaValues.layout) {
      return res.status(400).json({ success: false, message: "Column details are missing from the file." });
    }
    
    const layout = JSON.parse(metaValues.layout);
    const row6=sheet.getRow(6);

    const columns=await loadColumns(ids.exam_scheme_id,ids.subject_id)
    let firstvalue=columns[0];
    let secondvalue=columns[1];
    let thirdvalue=columns[2];

    let numofsubheadfirst=firstvalue?.components.length;
    let numofsubheadsecond=secondvalue?.components.length;
    let numofsubheadthird=thirdvalue?.components.length;

    let start=6
    let fa1startcolumnno=start
    let fa1totalcolumnno=numofsubheadfirst+fa1startcolumnno
    let fa1totalconvertedcolno=fa1totalcolumnno+1

    let fa2startcolumnno=fa1totalconvertedcolno+1
    let fa2totalcolumnno=numofsubheadsecond+fa2startcolumnno
    let fa2totalconvertedcolno=fa2totalcolumnno+1
    let formativevetotalcolumnno=fa2totalconvertedcolno+1

    let s
    


    
   
    res.send({
      //ids,
      //row6values:row6.values,
      ///dataStartRow,
      //columns,
      numofsubheadfirst,
      fa1startcolumnno,
      fa1totalcolumnno,
      fa1totalconvertedcolno,
      numofsubheadsecond,
      fa2startcolumnno,
      fa2totalcolumnno,
      fa2totalconvertedcolno,
      numofsubheadthird,

      
      
      
    })

  }),


  create: asyncHandler(async (req, res) => {
   let body=req.body;
   let {class_id,division_id,exam_scheme_id,term_id,subject_id,sort_by}=body
   if(!exam_scheme_id || !class_id || !division_id || !subject_id){
    return res.status(400).json({message:'exam_scheme_id, class_id, division_id and subject_id are required'})
   }
   let [allassesmentandcomponent,students]=await Promise.allSettled([getAssessmentAndComponent(exam_scheme_id,subject_id),getStudents(class_id,division_id)])

   let allassesmentandcomponentData=[];
   let studentsData=[]
   console.log('students****************>',students.value)
   
   console.log('allassesmentandcomponentData****>>>>>',allassesmentandcomponentData);

   if(allassesmentandcomponent.status==='fulfilled' && students.status==='fulfilled'){
    allassesmentandcomponentData=allassesmentandcomponent.value
    studentsData=students.value
   
   }
   else{
    return res.status(400).json({message:'Failed to get assessment and component or students'})
   }


    const entryWhere = { exam_scheme_id, division_id, subject_id };
    const { entryId, isNewEntry, inserted, existing } = await sequelize.transaction(async (transaction) => {
      let entry = await result_mark_entry_list.findOne({ where: entryWhere, transaction });
      const isNewEntry = !entry;
      if (entry) {
        await entry.update({ searchbystudent: sort_by ?? null }, { transaction });
      } else {
        entry = await result_mark_entry_list.create(
          { ...entryWhere, searchbystudent: sort_by ?? null },
          { transaction }
        );
      }

      const payload = makePayload(entry.id, allassesmentandcomponentData, studentsData);

      let newRows = payload;
      if (!isNewEntry) {
        const existingRows = await student_mark.findAll({
          where: { result_mark_entry_list_id: entry.id },
          attributes: ['student_id', 'exam_assessment_id', 'assessment_component_id'],
          raw: true,
          transaction,
        });
        const existingKeys = new Set(existingRows.map(markKey));
        newRows = payload.filter((row) => !existingKeys.has(markKey(row)));
      }

      for (let i = 0; i < newRows.length; i += 1000) {
        await student_mark.bulkCreate(newRows.slice(i, i + 1000), { transaction });
      }

      return {
        entryId: entry.id,
        isNewEntry,
        inserted: newRows.length,
        existing: payload.length - newRows.length,
      };
    });

    const data = await result_mark_entry_list.findByPk(entryId, {
      include: [...entryListInclude, marksInclude],
    });
    res.status(isNewEntry ? 201 : 200).json({
      success: true,
      message: isNewEntry
        ? `Mark entry list created with ${inserted} mark row(s)`
        : `Mark entry list updated: ${inserted} mark row(s) added, ${existing} already existed`,
      data,
    });

  }),

  getAll: asyncHandler(async (req, res) => {
    const filters = {
      exam_scheme_id: ['exam_scheme_id', 'examSchemeId'],
      division_id: ['division_id', 'divisionId'],
      subject_id: ['subject_id', 'subjectId'],
      '$scheme.exam_name_id$': ['exam_name_id', 'examId'],
      '$scheme.class_id$': ['class_id', 'classId'],
      '$scheme.term_id$': ['term_id', 'termId'],
    };

    const where = {};
    for (const [field, names] of Object.entries(filters)) {
      for (const name of names) {
        const value = toNumberOrNull(getQueryValue(req.query, name));
        if (value) {
          where[field] = value;
          break;
        }
      }
    }

    const include = toBoolean(getQueryValue(req.query, 'include_marks'))
      ? [...entryListInclude, marksInclude]
      : entryListInclude;

    const result = await getDataTable(req, result_mark_entry_list, ['searchbystudent'], where, include);
    res.json(result);
  }),

  getallstudentbyresultmarkentrylist: asyncHandler(async (req, res) => {
    const entryListId = toNumberOrNull(req.params.id);
    if (!entryListId) throw httpError(400, 'Valid result mark entry list id is required');

    const query = `select distinct p.id, p.reg_no, p.rollnumber, p.first_name, p.last_name, p.father_name
      from student_marks sm
      inner join par_student_personal_informations p on p.id = sm.student_id
      where sm.result_mark_entry_list_id = :entryListId
      order by p.rollnumber, p.first_name;`;
    const data = await sequelize.query(query, {
      replacements: { entryListId },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({ success: true, count: data.length, data });
  }),
};

module.exports = resultMarkEntryListController;
