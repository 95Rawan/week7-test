// Write a query to get the user and their password from the database
const dbconnection = require('../db_connection')

const getUser = (email, cb) => {
  dbconnection.query(`Select email, password from users where email = $1`, [email], (error, result) => {
    if (error) {
      return cb(error)
    } else {
      return cb(null, result.rows)
    }
  })
}

module.exports = getUser
