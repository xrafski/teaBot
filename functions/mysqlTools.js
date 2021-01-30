// mysqlTools.js
// ================================

const config = require("../bot-settings.json");
const mysql = require('mysql2');
const { logger } = require("./logger");
const pool = mysql.createPool({
  connectionLimit: 25,
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database
});

pool.on('acquire', function (connection) {
  logger('debug', 'mysqlTools.js:1 - Connection ${connection.threadId} acquired');
});

pool.on('release', function (connection) {
  logger('debug', `mysqlTools.js:2 - Connection ${connection.threadId} released`);
});

pool.on('enqueue', function () {
  logger('debug', 'mysqlTools.js:3 - Waiting for available connection slot');
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