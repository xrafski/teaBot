// mysqlTools.js
// ================================

const config = require("../bot-settings.json");
const mysql = require('mysql2');
const pool = mysql.createPool({
  connectionLimit: 25,
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database
});

pool.on('acquire', function (connection) {
  console.debug('mysqlTools.js - Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
  console.debug('mysqlTools.js - Connection %d released', connection.threadId);
});

pool.on('enqueue', function () {
  console.debug('mysqlTools.js - Waiting for available connection slot');
});

function mysqlQuery(sqlQuery) {
  return new Promise((resolve, reject) => {
    pool.query(sqlQuery, function (error, results, fields) {
      if (error) return reject(error);
      return resolve(results);
    });
  });
}

function mysqlQueryArray(sqlQuery, arrayObject) {
  return new Promise((resolve, reject) => {
    pool.query(sqlQuery, [arrayObject], function (error, results, fields) {
      if (error) return reject(error);
      return resolve(results);
    });
  });
}

module.exports.mysqlQuery = mysqlQuery;
module.exports.mysqlQueryArray = mysqlQueryArray;