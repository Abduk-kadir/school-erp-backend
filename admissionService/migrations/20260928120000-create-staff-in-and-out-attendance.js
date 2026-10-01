'use strict';

/** @type {import('sequelize-cli').Migration} */

/**
 * DB_YEAR in .env = session label (e.g. 2025).
 * Partitions cover DB_YEAR and DB_YEAR+1 so sessions starting Mar/Jun
 * can store dates into the next calendar year (e.g. Apr 2025 – Mar 2026).
 * MySQL partitioned tables cannot have foreign keys, so staff_id is not constrained.
 */
function getDatabaseYear() {
  return Number(process.env.DB_YEAR);
}

function buildPartitionsForYearRange(startYear, endYear) {
  const pad = (n) => String(n).padStart(2, '0');
  const parts = [];

  for (let y = startYear; y <= endYear; y += 1) {
    for (let m = 1; m <= 12; m += 1) {
      const nextY = m === 12 ? y + 1 : y;
      const nextM = m === 12 ? 1 : m + 1;
      const boundary = `${nextY}-${pad(nextM)}-01`;
      parts.push(
        `PARTITION p${y}${pad(m)} VALUES LESS THAN (TO_DAYS('${boundary}'))`
      );
    }
  }

  return parts.join(',\n      ');
}

module.exports = {
  async up(queryInterface) {
    const year = getDatabaseYear();
    const partitionSql = buildPartitionsForYearRange(year, year + 1);

    await queryInterface.sequelize.query(`
      CREATE TABLE staff_in_and_out_attendances (
        id BIGINT NOT NULL AUTO_INCREMENT,
        staff_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        in_time TIME NULL,
        in_time_notification_flag TINYINT NOT NULL DEFAULT 0 COMMENT '0=pending, 1=sent',
        out_time TIME NULL,
        out_time_notification_flag TINYINT NOT NULL DEFAULT 0 COMMENT '0=pending, 1=sent',
        machine_id VARCHAR(255) NULL,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        PRIMARY KEY (id, attendance_date),
        UNIQUE KEY uk_staff_in_out_staff_id_date (staff_id, attendance_date),
        KEY idx_staff_in_out_attendance_date (attendance_date),
        KEY idx_staff_in_out_staff_id_date (staff_id, attendance_date)
      )
      PARTITION BY RANGE (TO_DAYS(attendance_date)) (
        ${partitionSql}
      );
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('staff_in_and_out_attendances');
  },
};
