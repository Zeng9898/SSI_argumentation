require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 帳號 = 班級 + 座號（座號補兩位），密碼 = 學號
// 格式：[班級, 座號, 姓名, 學號, group_type ('experimental'|'control'|null)]
const students = [
  ['501', '01', '孫煒宸', '110165', 'control'],
  ['501', '02', '張宸睿', '110070', 'control'],
  ['501', '03', '蔡啟義', '110201', 'control'],
  ['501', '04', '張睿',   '110224', 'control'],
  ['501', '05', '陳睿廷', '110039', 'control'],
  ['501', '06', '林駿霆', '110162', 'control'],
  ['501', '07', '楊璿禾', '110074', 'control'],
  ['501', '08', '尤靖崴', '110063', 'control'],
  ['501', '09', '蔡秉祐', '110016', 'control'],
  ['501', '10', '廖經承', '110043', 'control'],
  ['501', '11', '王竑岳', '110159', 'control'],
  ['501', '12', '古天樂', '110198', 'control'],
  ['501', '13', '陳昊言', '110133', 'control'],
  ['501', '14', '林少榮', '110128', 'control'],
  ['501', '15', '陳品默', '110218', 'control'],
  ['501', '16', '劉興辰', '110076', 'control'],
  ['501', '17', '劉桂華', '110215', 'control'],
  ['501', '18', '張家綠', '110052', 'control'],
  ['501', '19', '彭妍羚', '110119', 'control'],
  ['501', '20', '沈亭羽', '110178', 'control'],
  ['501', '21', '蘇芝瑩', '110158', 'control'],
  ['501', '22', '傅暄晴', '110150', 'control'],
  ['501', '23', '鍾喬羽', '110092', 'control'],
  ['501', '24', '丁芊勻', '110176', 'control'],
  ['501', '25', '吳昀書', '110080', 'control'],
  ['501', '26', '邱楉媗', '110145', 'control'],
  ['501', '27', '鄭晴允', '110157', 'control'],
  ['501', '28', '陳永婕', '110022', 'control'],
  ['501', '29', '温予菲', '110059', 'control'],
  ['501', '30', '莊芯語', '110148', 'control'],
  ['501', '31', '曾詠晴', '110152', 'control'],
  // 502 班 experimental
  ['502', '01', '范宇樂', '110069', 'experimental'],
  ['502', '02', '鄭程遠', '110193', 'experimental'],
  ['502', '03', '唐平宸', '110008', 'experimental'],
  ['502', '04', '吳柏霆', '110097', 'experimental'],
  ['502', '05', '詹瑝彬', '110042', 'experimental'],
  ['502', '06', '李鈞恩', '110035', 'experimental'],
  ['502', '07', '吳宗翰', '110033', 'experimental'],
  ['502', '08', '李文嘉', '110197', 'experimental'],
  ['502', '09', '張鎔凱', '110169', 'experimental'],
  ['502', '10', '余定駿', '110095', 'experimental'],
  ['502', '11', '林敬恆', '110130', 'experimental'],
  ['502', '12', '楊鈞皓', '110073', 'experimental'],
  ['502', '13', '楊皓棠', '110013', 'experimental'],
  ['502', '14', '何承軒', '110196', 'experimental'],
  ['502', '15', '陳少甫', '110132', 'experimental'],
  ['502', '16', '林黎安', '110067', 'experimental'],
  ['502', '17', '陳品翔', '110038', 'experimental'],
  ['502', '18', '李佳芯', '110115', 'experimental'],
  ['502', '19', '巫芹菲', '110017', 'experimental'],
  ['502', '20', '廖于菁', '110026', 'experimental'],
  ['502', '21', '宋芷蘋', '110082', 'experimental'],
  ['502', '22', '賴筠霏', '110061', 'experimental'],
  ['502', '23', '呂芝寧', '110081', 'experimental'],
  ['502', '24', '游珈嫙', '110153', 'experimental'],
  ['502', '25', '杜恩妘', '110083', 'experimental'],
  ['502', '26', '陳羽琦', '110117', 'experimental'],
  ['502', '27', '簡語萱', '110093', 'experimental'],
  ['502', '28', '王宥芸', '110144', 'experimental'],
  ['502', '29', '陳幼庭', '110054', 'experimental'],
  ['502', '30', '吳懿妡', '110114', 'experimental'],
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
