const { Op, Sequelize } = require('sequelize');

async function academicOnlineAndOfflinePayDataTable(req, model, searchFields = [], extraWhere = {}, include) {
  const draw = parseInt(req.query.draw) || 1;
  const start = parseInt(req.query.start) || 0;
  const length = parseInt(req.query.length) || 10;
  const search = req.query['search[value]'] || req.query.search?.value || '';
  const fromDate = req.query['filter[fromDate]'] || '';
  const toDate = req.query['filter[toDate]'] || '';
  //const batchId = req.query['filter[batchId]'] || '';
  //const divisionId = req.query['filter[divisionId]'] || '';
  const paymentStatus = req.query['filter[paymentStatus]'] || '';
  const classFilter = req.query['filter[className]'] || '';
  

  const searchClause = search && searchFields.length > 0
    ? { [Op.or]: searchFields.map(field => ({ [field]: { [Op.like]: `%${search}%` } })) }
    : {};

  const whereClause = { ...extraWhere, ...searchClause };

  if (fromDate && toDate) {
    whereClause[Op.and] = [
      ...(whereClause[Op.and] || []),
      Sequelize.literal(`DATE(\`date\`) BETWEEN '${fromDate}' AND '${toDate}'`)
    ];
  } else if (fromDate) {
    whereClause[Op.and] = [
      ...(whereClause[Op.and] || []),
      Sequelize.literal(`DATE(\`date\`) >= '${fromDate}'`)
    ];
  } else if (toDate) {
    whereClause[Op.and] = [
      ...(whereClause[Op.and] || []),
      Sequelize.literal(`DATE(\`date\`) <= '${toDate}'`)
    ];
  }

  console.log('fromDate:', fromDate, 'toDate:', toDate);

  //if (batchId) {
  //  whereClause.batch_id = batchId;
  //}

  //if (divisionId) {
  //  whereClause.division_id = divisionId;
  //}

  if (paymentStatus) {
    whereClause.payment_mode = paymentStatus;
  }

  if (classFilter) {
    whereClause[Op.and] = [
      ...(whereClause[Op.and] || []),
      Sequelize.literal(`\`PeronalInformation\`.\`class\` LIKE '%${classFilter}%'`)
    ];
  }

 

  const recordsTotal = await model.count();

  const { count: recordsFiltered, rows: data } = await model.findAndCountAll({
    where: whereClause,
    include: include,
    offset: start,
    limit: length,
    distinct: true
  });

  return { draw, recordsTotal, recordsFiltered, data };
}

module.exports = { academicOnlineAndOfflinePayDataTable };
