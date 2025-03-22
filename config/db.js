import mysql from 'mysql2';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'devlinks',
    password: 'kalpanaJHA@123',
    port: 3306
})

export default pool.promise();