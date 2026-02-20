const { form_status, PersonalInformation, student_subject,Subject } = require('../models')
const { Op } = require('sequelize');
const { getDataTable } = require('../helper');
// ... other imports
/*
const filledFormStudensts = async (req, res) => {
  try {
    const result = await getDataTable(req, class_master, ['class_name','class_code','fall_in_category']);
    const data = await PersonalInformation.findAll({
      attributes: [
        'id', 'first_name', 'reg_no', 'last_name', 'father_name','password',
        'class', 'division', 'contact_number', 'email', 'dob', 'blood_group',
        'createdAt', 'updatedAt'
      ], // optional: select only needed fields from PersonalInformation
      include: [
        {
          model: form_status,
          as: 'formStatus',
          attributes: ['current_step', 'form_status'], // optional: slim down
          required: false,
        },
        {
          model: student_subject,
          as: 'studentSubjects',
          attributes: [
            'semester',
            'subject_id',
            'elective_bbasket_id'
            // 'class_id', 'program_id',  → add if needed
          ],
          required: false,
          include: [
            {
              model: Subject,                // ← this pulls the subject details
              as: 'subject',
              attributes: ['id', 'value'],    // ← key part: bring the name (add other fields like code, short_name if they exist)
              required: false,
            },
            // Optional: include other related models if you want their names too
            // {
            //   model: class_master,
            //   as: 'class',
            //   attributes: ['name']
            // },
            // {
            //   model: Program,
            //   as: 'program',
            //   attributes: ['name']
            // }
          ]
        }
      ],
      // Optional: only students with at least one subject
      // where: {
      //   '$studentSubjects.id$': { [Op.ne]: null }
      // }
    });

    return res.status(200).json({
        success:true,
      message: 'Students with subjects and names fetched successfully',
      data
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Server error',
      err: err.message
    });
  }
};
*/

const filledFormStudensts = async (req, res) => {
  try {
    const include = [
      {
        model: form_status,
        as: 'formStatus',
        attributes: ['current_step', 'form_status'],
        required: false,
      },
      {
        model: student_subject,
        as: 'studentSubjects',
        attributes: ['semester', 'subject_id', 'elective_bbasket_id'],
        required: false,
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'value'],
            required: false,
          }
        ]
      }
    ];

    // Searchable fields, including associations via $ notation
    const searchFields = [
      'first_name',
      'last_name',
      'reg_no',
     
    ];

    // Pass `include` to getDataTable
    const result = await getDataTable(req, PersonalInformation, searchFields, {}, include);

    return res.status(200).json({
      success: true,
      message: 'Students with subjects fetched successfully',
      ...result
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', err: err.message });
  }
};







module.exports={
    filledFormStudensts

}