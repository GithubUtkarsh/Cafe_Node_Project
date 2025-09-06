const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const mySqlHost = process.env.mySqlHost || "localhost";
const mySqlUser = process.env.mySqlUser || "root";
const mySqlPassword= process.env.mySqlPassword;
const mySqlDatabase= process.env.mySqlDatabase;
const mySqlPort = process.env.mySqlPort || 3000;


if(!mySqlPassword || !mySqlDatabase) {
    console.error('SQL Password or Database is not defined');
    return;
}

const con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password: mySqlPassword,
    database: mySqlDatabase,
    port:mySqlPort,
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

module.exports=con;