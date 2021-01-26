// mysqlBotTools.js
// ================================

const config = require("../bot-settings.json");
const mysql = require('mysql2');
const pool = mysql.createPool({
  connectionLimit: 5,
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database
});

pool.on('acquire', function (connection) {
  console.debug('mysqlBotTools.js - Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
  console.debug('mysqlBotTools.js - Connection %d released', connection.threadId);
});

pool.on('enqueue', function () {
  console.debug('mysqlBotTools.js - Waiting for available connection slot');
});

function mysqlBotQuery(sqlQuery) {
  return new Promise((resolve, reject) => {
    pool.query(sqlQuery, function (error, results, fields) {
      if (error) return reject(error);
      return resolve(results);
    });
  });
}

function mysqlBotQueryArray(sqlQuery, arrayObject) {
  return new Promise((resolve, reject) => {
    pool.query(sqlQuery, [arrayObject], function (error, results, fields) {
      if (error) return reject(error);
      return resolve(results);
    });
  });
}

module.exports.mysqlBotQuery = mysqlBotQuery;
module.exports.mysqlBotQueryArray = mysqlBotQueryArray;