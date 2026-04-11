/**
 * Removes fee-related rows from SequelizeMeta so db:migrate can recreate those tables.
 * Also clears legacy duplicate fee-group migration names no longer present in /migrations.
 *
 * Run from admissionService: node scripts/clear-fee-migrations-meta.js
 */
'use strict';

require('dotenv').config();
const mysql = require('mysql2/promise');

const FEE_MIGRATION_NAMES = [
  '20260316063113-create-fee-head.js',
  '20260318114938-create-fee-collection.js',
  '20260326055328-create-fee-record-monthly.js',
  '20260403054648-create-feegroup.js',
  '20260403120000-create-fee-group-head.js',
  '20260403180000-create-feegroupdetail.js',
  '20260404120000-add-startmonth-feegroupdetails.js',
  '20260410120000-add-classid-feegroupdetails.js',
  '20260404130000-create-feegroupdetailprice.js',
  // Legacy (files removed); delete meta rows if present
  '20260331120000-create-fee-group.js',
  '20260403200000-add-academicyear-feegroups.js'
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const placeholders = FEE_MIGRATION_NAMES.map(() => '?').join(',');
  const [res] = await conn.query(
    `DELETE FROM SequelizeMeta WHERE name IN (${placeholders})`,
    FEE_MIGRATION_NAMES
  );
  console.log('SequelizeMeta rows removed:', res.affectedRows);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
