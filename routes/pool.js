
var mysql = require('mysql')
require('dotenv').config()

const pool = mysql.createPool({
 
 host : 'db-mysql-blr1-56981-do-user-9676911-0.b.db.ondigitalocean.com',
   user: 'doadmin',
    password : 'a0xe66knpqoeoy0i',
    database: 'pureeasy',
    port:'25060' ,
    multipleStatements: true
  })


module.exports = pool;