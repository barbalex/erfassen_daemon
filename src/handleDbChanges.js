/*
 * when a db is deleted
 * - if there is an active change listener this will be stopped
 * - if it was a user db, it's userDoc's last roles are removed from the _users doc
 *   and the corresponding projectDb's removed if no other user uses them
 */

const dbUrl = require('./dbUrl')
const nano = require('nano')(dbUrl())
const userDbNameFromUserName = require('./userDbNameFromUserName')
const removeUsersProjectDbs = require('./removeUsersProjectDbs')
const _usersDb = nano.use('_users')

module.exports = async change => {
  // only work on deletions
  if (change.type !== 'deleted') return

  const dbName = change.db_name
  const isUserDb = dbName.substring(0, 5) === 'user_'

  console.log('handleDbChanges: db change: ', change)

  if (GLOBAL[dbName]) {
    console.log('handleDbChanges: Removing feed following changes in ' + dbName)
    // stop feed following the db
    GLOBAL[dbName].stop()
  }

  // onloy continue for user db's
  if (!isUserDb) return

  // if isUserDb remove user roles from _users db
  // find user in _users
  let _usersDbBody
  try {
    _usersDbBody = await _usersDb.list({ include_docs: true })
  } catch (error) {
    return console.log('error getting list of _users: ', error)
  }

  const userRow = _usersDbBody.rows
    // there seems to be a design doc in the _users db
    // return only docs with id beginning with org.couchdb.user:
    .filter(row => row.id.substring(0, 17) === 'org.couchdb.user:')
    .find(row => userDbNameFromUserName(row.doc.name) === dbName)

  if (!userRow) return

  const userDoc = userRow.doc
  if (!userDoc) return

  const projects = userDoc.roles
  const userName = userDoc.name
  userDoc.roles = []
  // pass global to handleChangesIn_usersDb as marker to not recreate userDb
  GLOBAL.deleteUserDb = true
  try {
    await _usersDb.insert(userDoc)
  } catch (error) {
    return console.log('handleDbChanges: error inserting userDoc:', error)
  }
  // remove all the user's projectDb's
  if (userName && projects) {
    removeUsersProjectDbs(nano, userName, projects)
  }
}
