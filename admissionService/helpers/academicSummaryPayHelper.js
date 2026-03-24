const { Op, Sequelize } = require('sequelize');

async function academicSummaryPayDataTable(req, model, searchFields = [], extraWhere = {}, include) {
  const draw = parseInt(req.query.draw) || 1;
  const start = parseInt(req.query.start) || 0;
  const length = parseInt(req.query.length) || 10;
  const search = req.query['search[value]'] || req.query.search?.value || '';
  const fromDate = req.query['filter[fromDate]'] || '';
  const toDate = req.query['filter[toDate]'] || '';
  const classFilter = req.query['filter[className]'] || '';

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
  const strippedInclude = include.map(inc => ({
    ...inc,
    attributes: [],
    include: (inc.include || []).map(nested => ({ ...nested, attributes: [] }))
  }));
 console.log('strippedInclude is***********:',strippedInclude)
  const data = await model.findAll({
    attributes: [
      [Sequelize.col('PeronalInformation.class'), 'class'],
      [Sequelize.col('PeronalInformation->classInfo.id'), 'class_id'],
      [Sequelize.col('PeronalInformation->classInfo.class_name'), 'class_name'],
      [Sequelize.fn('COUNT', Sequelize.literal('`PeronalInformation`.`reg_no`')), 'total_students'],
      [Sequelize.literal('COUNT(DISTINCT CASE WHEN `FeeCollection`.`balance` = 0 THEN `PeronalInformation`.`reg_no` END)'), 'full_payment_students'],
      [Sequelize.literal('COUNT(DISTINCT CASE WHEN `FeeCollection`.`balance` > 0 THEN `PeronalInformation`.`reg_no` END)'), 'partial_payment_students'],
      [Sequelize.fn('SUM', Sequelize.col('FeeCollection.total')), 'total'],
      [Sequelize.fn('SUM', Sequelize.col('FeeCollection.total_paid')), 'total_paid'],
      [Sequelize.fn('SUM', Sequelize.col('FeeCollection.balance')), 'balance']
    ],
    where: whereClause,
    include: strippedInclude,
    group: [
      'PeronalInformation.class',
      'PeronalInformation->classInfo.id',
      'PeronalInformation->classInfo.class_name'
    ],
    offset: start,
    limit: length,
    subQuery: false,
    raw: true
  });

  return { draw, data };
}

module.exports = { academicSummaryPayDataTable };
