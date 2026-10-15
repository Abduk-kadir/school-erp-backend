function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function getQueryValue(query, name) {
  return query[`filter[${name}]`] ?? query[name] ?? '';
}

/**
 * Makes the child rows of a parent match `rows`:
 * rows with an existing id are updated, rows without id are created,
 * and existing rows missing from `rows` are deleted.
 */
async function syncChildren({ model, where, rows, build, transaction }) {
  const existing = await model.findAll({ where, transaction });
  const existingById = new Map(existing.map((row) => [Number(row.id), row]));
  const keepIds = new Set(
    rows.map((row) => Number(row.id)).filter((id) => existingById.has(id))
  );

  const removeIds = existing.map((row) => Number(row.id)).filter((id) => !keepIds.has(id));
  if (removeIds.length) {
    await model.destroy({ where: { id: removeIds }, transaction });
  }

  const saved = [];
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const values = { ...build(row, index), ...where };
    const current = existingById.get(Number(row.id));
    saved.push(
      current
        ? await current.update(values, { transaction })
        : await model.create(values, { transaction })
    );
  }
  return saved;
}

module.exports = {
  httpError,
  toNumberOrNull,
  toBoolean,
  getQueryValue,
  syncChildren,
};
