// Write a query to add the user and their password to the database
const dbconnection = require('../db_connection')

const addUser = (email, password, cb) => {
  dbconnection.query(`Insert into users (email, password) values ($1,$2)`, [email, password], (error, result) => {
    if (error) {
      return cb(error)
    } else {
      return cb(null, result)
    }
  })
}
module.exports = addUser
