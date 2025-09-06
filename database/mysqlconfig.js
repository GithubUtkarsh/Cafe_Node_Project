const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const MYSQLHOST = process.env.MYSQLHOST || "localhost";
const MYSQLUSER = process.env.MYSQLUSER || "root";
const MYSQLPASSWORD = process.env.MYSQLPASSWORD;
const MYSQLDATABASE = process.env.MYSQLDATABASE;
const MYSQLPORT = process.env.MYSQLPORT || 3306;


if (!MYSQLPASSWORD || !MYSQLDATABASE) {
    console.error('SQL Password or Database is not defined');
    process.exit(1);
}

const con = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// con.connect(function(err){
//     if(err) throw err;
//     console.log('Connected!');
//     con.query(`CREATE DATABASE miniproject`, function(err,result){
//         if(err) throw err;
//         console.log('Database created');
//     });
// });

//& **************************************************** TABLE CREATED ******************************************************************

// con.connect(function(err){
//     if(err) throw err;
//     console.log("Connected!");
//     let sql = `CREATE TABLE view_recipe (
//             recipe_name VARCHAR(255),
//             price INT(20),
//             category ENUM ('Coffee','Tea','Pastries','Sandwiches','Salads','Desserts'),
//             prep_time INT(10),
//             description TEXT,
//             recipe_img TEXT )`;
//             con.query(sql,(err,result)=>{
//                 if(err) throw err;
//                 console.log('Table Created!');
//             });
// });

// con.connect(function(err){
//     if(err) throw err;
//     console.log("Connected!");
//     let sql = `CREATE TABLE contact_messages (
//                 id INT AUTO_INCREMENT PRIMARY KEY,
//                 first_name VARCHAR(100) NOT NULL,
//                 last_name VARCHAR(100) NOT NULL,
//                 email VARCHAR(150) NOT NULL,
//                 phone VARCHAR(20),
//                 subject ENUM('general', 'reservation', 'catering', 'events', 'feedback', 'complaint') NOT NULL,
//                 message TEXT NOT NULL,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//             )`;
//             con.query(sql,(err,result)=>{
//                 if(err) throw err;
//                 console.log('Table Created!');
//             });
// });

// con.connect(function(err){
//     if(err) throw err;
//     console.log("Connected!");
//     let sql = `CREATE TABLE register (
//                 id INT AUTO_INCREMENT PRIMARY KEY,
//                 first_name VARCHAR(100) NOT NULL,
//                 last_name VARCHAR(100) NOT NULL,
//                 email VARCHAR(150) NOT NULL,
//                 password VARCHAR(255) NOT NULL,
//                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//             )`;
//             con.query(sql,(err,result)=>{
//                 if(err) throw err;
//                 console.log('Table Created!');
//             });
// });

module.exports = con;