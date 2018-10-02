'use strict'
const uniq = require('lodash/uniq')
const flatten = require('lodash/flatten')

module.exports = async (nano, dbName) => {
  // first check if this db still exists
  let dbNames
  try {
    dbNames = await nano.db.list()
  } catch (error) {
    return console.log('error getting list of dbs: ', error)
  }
  if (!dbNames.includes(dbName) return
    // check if a user uses this db
    nano.use('_users').list(function(error, body) {
      if (error) {
        return console.log(
          'error getting list of users from _users db: ',
          error,
        )
      }
      var users = body.rows

      const usersRoles = uniq(flatten(users.map(user => user.roles)))

      if (usersRoles.includes(dbname)) {
        // another user uses this db
        // DONT remove it
        console.log(`db ${dbName} not deleted because used by other user`)
      } else {
        // stop listening to changes
        if (GLOBAL[dbName]) {
          GLOBAL[dbName].stop()
          console.log(
            `deleteDatabase: stopped listening to feed of ${dbName}`,
          )
        }
        nano.db.destroy(dbName, function(err) {
          if (err) {
            return console.log(`error deleting database ${dbName}:`, err)
          }
          console.log(`deleteDatabase: deleted database ${dbName}`)
        })
      }
    })
}
