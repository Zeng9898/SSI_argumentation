require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 帳號 = 班級 + 座號（座號補兩位），密碼 = 學號
// 格式：[班級, 座號, 姓名, 學號, group_type ('experimental'|'control'|null)]
const students = [
  ['501', '01', '孫煒宸', '110165', 'experimental'],
  ['501', '02', '張宸睿', '110070', 'experimental'],
  ['501', '03', '蔡啟義', '110201', 'experimental'],
  ['501', '04', '張睿',   '110224', 'experimental'],
  ['501', '05', '陳睿廷', '110039', 'experimental'],
  // 繼續在這裡加資料...
];

async function main() {
  let success = 0;
  let skip = 0;

  for (const [cls, seat, name, studentId, groupType] of students) {
    const account = `${cls}${seat.padStart(2, '0')}`;
    const hash = await bcrypt.hash(studentId, 10);

    try {
      await pool.query(
        `INSERT INTO users (name, account, password_hash, role, class, seat_number, student_id, group_type)
         VALUES ($1, $2, $3, 'student', $4, $5, $6, $7)
         ON CONFLICT (account) DO NOTHING`,
        [name, account, hash, cls, parseInt(seat), studentId, groupType]
      );
      console.log(`✓ ${account} ${name}`);
      success++;
    } catch (err) {
      console.error(`✗ ${account} ${name}: ${err.message}`);
      skip++;
    }
  }

  console.log(`\n完成：成功 ${success} 筆，略過 ${skip} 筆`);
  await pool.end();
}

main();
