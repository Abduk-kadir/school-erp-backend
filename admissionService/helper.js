const { Op } = require('sequelize');

async function getDataTable(req, model, searchFields = [], extraWhere = {},include) {
    console.log('hello')
  const draw = parseInt(req.query.draw) || 1;
  const start = parseInt(req.query.start) || 0;
  const length = parseInt(req.query.length) || 30;
 const search = req.query['search[value]'] || req.query.search?.value || "";
 const classFilter = req.query['filter[className]'] || '';

const regFilter=req.query['filter[regNo]']||''


  // Build search clause
  const searchClause = search && searchFields.length > 0
    ? { [Op.or]: searchFields.map(field => ({ [field]: { [Op.like]: `%${search}%` } })) }
    : {};
 
  const whereClause = { ...extraWhere, ...searchClause };

  // Add filters if provided
  if (classFilter) {
    whereClause.class = { [Op.like]: `%${classFilter}%` };
  }
 
  if (regFilter) {
    whereClause.reg_no = { [Op.like]: `%${regFilter}%` };
  }
  console.log('Final where clause:', JSON.stringify(whereClause));
  // Count total records
  const recordsTotal = await model.count();

  // Fetch filtered records with pagination
  const { count: recordsFiltered, rows: data } = await model.findAndCountAll({
    where: whereClause,
    include: include,
    offset: start,
    limit: length,
     distinct: true 
  });

  return { draw, recordsTotal, recordsFiltered, data };
}

module.exports = { getDataTable };
