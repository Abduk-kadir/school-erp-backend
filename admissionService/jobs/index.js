const startAttendanceReminderJob = require('./attendanceCrone.js');
const startMonthlyAttendanceReminderJob = require('./monthlyAttendaceCrone.js');
function startAllJobs() {
  console.log('Starting all cron jobs...');
  console.log('start montly also but some time')
    startAttendanceReminderJob();
    startMonthlyAttendanceReminderJob();

  console.log('All cron jobs are running');
}

module.exports = startAllJobs;