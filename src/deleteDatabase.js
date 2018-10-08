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
  if (!dbNames.includes(dbName)) return
  // check if a user uses this db
  let _usersBody
  try {
    _usersBody = await nano.use('_users').list()
  } catch (error) {
    return console.log('error getting list of users from _users db:', error)
  }
  const users = _usersBody.rows
  const usersRoles = uniq(flatten(users.map(user => user.roles)))

  if (usersRoles.includes(dbName)) {
    // another user uses this db
    // DONT remove it
    return console.log(`db ${dbName} not deleted because used by other user`)
  }
  // stop listening to changes
  if (global[dbName]) {
    global[dbName].stop()
    console.log(`deleteDatabase: stopped listening to feed of ${dbName}`)
  }
  try {
    await nano.db.destroy(dbName)
  } catch (error) {
    return console.log(`error deleting database ${dbName}:`, error)
  }
  console.log(`deleteDatabase: deleted database ${dbName}`)
}
