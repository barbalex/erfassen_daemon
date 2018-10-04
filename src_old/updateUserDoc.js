/*
 * when userDoc changes
 * - get last version
 * - compare roles:
 *   - if roles were added: create projectDb's
 *   - if roles were removed: remove projectDb's if no other users use them
 *   - if roles have changed: update roles in _users db
 */

const dbUrl = require('./dbUrl')
const nano = require('nano')(dbUrl())
const difference = require('lodash/difference')
const _usersDb = nano.use('_users')
const removeUsersProjectDbs = require('./removeUsersProjectDbs')
const createProjectDb = require('./createProjectDb')

module.exports = async (newDoc, oldDoc) => {
  if (
    !(
      (oldDoc &&
        newDoc &&
        oldDoc.roles &&
        newDoc.roles &&
        oldDoc.roles !== newDoc.roles) ||
      (!oldDoc && newDoc && newDoc.roles)
    )
  ) {
    return
  }

  // roles have changed
  // or no oldDoc, so assume they have changed
  // always update roles in _users DB
  let userDoc
  try {
    userDoc = await _usersDb.get(newDoc._id)
  } catch (error) {
    return console.log('error getting user from _users db: ', error)
  }
  userDoc.roles = newDoc.roles
  try {
    await _usersDb.insert(userDoc)
  } catch (error) {
    return console.log('error updating user in _users db: ', error)
  }
  const rolesAdded = oldDoc
    ? difference(newDoc.roles, oldDoc.roles)
    : newDoc.roles
  const rolesRemoved = oldDoc ? difference(oldDoc.roles, newDoc.roles) : []

  console.log('handleChangesInUserDb: rolesAdded: ', rolesAdded)
  console.log('handleChangesInUserDb: rolesRemoved: ', rolesRemoved)

  if (rolesAdded) {
    rolesAdded.forEach(role => createProjectDb(role))
  }
  if (rolesRemoved) {
    const userName = newDoc.name
    removeUsersProjectDbs(nano, userName, rolesRemoved)
  }
}
