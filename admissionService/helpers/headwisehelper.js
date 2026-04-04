const { Op, Sequelize } = require('sequelize');
const { sequelize } = require('../models');

async function headwisePayDataTable(req, model, searchFields = [], extraWhere = {}, include) {
  const draw = parseInt(req.query.draw) || 1;
  const start = parseInt(req.query.start) || 0;
  const length = parseInt(req.query.length) || 10;
  const search = req.query['search[value]'] || req.query.search?.value || '';
  const fromDate = req.query['filter[fromDate]'] || '';
  const toDate = req.query['filter[toDate]'] || '';
  const classFilter = req.query['filter[className]'] || '';
  const paymentStatus=req.query['filter[paymentStatus]']||'';
 

  const searchClause = search && searchFields.length > 0
    ? { [Op.or]: searchFields.map(field => ({ [field]: { [Op.like]: `%${search}%` } })) }
    : {};

  const whereClause = { ...extraWhere, ...searchClause };

  if (fromDate && toDate) {
    whereClause[Op.and] = [
      ...(whereClause[Op.and] || []),
      Sequelize.literal(`DATE(\`FeeCollection\`.\`date\`) BETWEEN '${fromDate}' AND '${toDate}'`)
    ];
  } else if (fromDate) {
    whereClause[Op.and] = [
      ...(whereClause[Op.and] || []),
      Sequelize.literal(`DATE(\`FeeCollection\`.\`date\`) >= '${fromDate}'`)
    ];
  } else if (toDate) {
    whereClause[Op.and] = [
      ...(whereClause[Op.and] || []),
      Sequelize.literal(`DATE(\`FeeCollection\`.\`date\`) <= '${toDate}'`)
    ];
  }

  if (classFilter) {
    whereClause[Op.and] = [
      ...(whereClause[Op.and] || []),
      Sequelize.literal(`\`PeronalInformation\`.\`class\` LIKE '%${classFilter}%'`)
    ];
  }

  // Set attributes:[] on all includes so Sequelize does NOT auto-add the PK (id)
  // to the SELECT. We reference the columns we need in the main attributes instead.
  let maxFeeTableIdEachStudent = await FeeCollection.findAll({
    attributes: [
      [sequelize.fn('MAX', sequelize.col('id')), 'id']
    ],
    group: ['reg_no'],
    raw: true
  });
  
  const alltableId = maxFeeTableIdEachStudent.map((item) => item.id).filter((id) => id != null)

  const finalData = await FeeRecordMonthly.findAll({
    where: {
      fee_table_id: {
        [Op.in]: alltableId
      }
    },
    
    include: [
      {
        model: PersonalInformation,
        as: 'student',
        attributes: ['first_name', 'last_name'],
        include: [
          {
            model: class_master,
            as: 'classInfo',
            attributes: ['id', 'class_name', 'class_code', 'fall_in_category', 'status'],
            required: false
          }
        ]
      },
      {
        model: FeeHead,
        as: 'feeHeadInfo',
        attributes: ['id', 'fee_head_name', 'is_refundable', 'status']
      }
    ],
    limit: 100,
    order: [['id', 'ASC']]
  });

  return { draw, data };
}

module.exports = { headwisePayDataTable };
