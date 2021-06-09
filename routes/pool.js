
var mysql = require('mysql')
require('dotenv').config()

const pool = mysql.createPool({
 
 host : 'db-mysql-blr1-05486-do-user-9022348-0.b.db.ondigitalocean.com',
   user: 'doadmin',
    password : 'm8wcz9akv2dbl1jy',
    database: 'dailynourish',
    port:'25060' ,
    multipleStatements: true
  })


module.exports = pool;