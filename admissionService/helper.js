const { Op } = require('sequelize');

async function getDataTable(req, model, searchFields = [], extraWhere = {}) {
    console.log('hello')
  const draw = parseInt(req.query.draw) || 1;
  const start = parseInt(req.query.start) || 0;
  const length = parseInt(req.query.length) || 10;
  const search = req.query['search[value]'] || req.query.search?.value || "";

  // Build search clause
  const searchClause = search && searchFields.length > 0
    ? { [Op.or]: searchFields.map(field => ({ [field]: { [Op.like]: `%${search}%` } })) }
    : {};
  console.log('search clause is*********:',searchClause)
  // Merge with extra where clause if any
  const whereClause = { ...extraWhere, ...searchClause };

  // Count total records
  const recordsTotal = await model.count();

  // Fetch filtered records with pagination
  const { count: recordsFiltered, rows: data } = await model.findAndCountAll({
    where: whereClause,
    offset: start,
    limit: length
  });

  return { draw, recordsTotal, recordsFiltered, data };
}

module.exports = { getDataTable };
