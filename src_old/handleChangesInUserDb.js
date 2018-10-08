/*
 * when userDoc changes
 * - get last version
 * - compare roles:
 *   - if roles were added: create projectDb's
 *   - if roles were removed: remove projectDb's if no other users use them
 *   - if roles have changed: update roles in _users db
 */

const couchUrl = require('./couchUrl')
const nano = require('nano')(couchUrl())
const createProjectDb = require('./createProjectDb')
const updateUserDoc = require('./updateUserDoc')

module.exports = async (userDb, change) => {
  var newDoc = change.doc

  // check the revs
  let userDoc
  try {
    userDoc = await userDb.get(change.id, { revs_info: true })
  } catch (error) {
    return console.log('error getting revs of doc:', error)
  }
  const revisions = userDoc._revs_info

  if (revisions.length === 1) {
    // this is a new user doc
    // there will be no roles yet
    // well, make shure
    if (newDoc.roles && newDoc.roles.length > 0) {
      newDoc.roles.forEach(role => createProjectDb(nano, role))
      return console.log("new user doc, set it's roles")
    }
    return console.log('new user doc, not setting roles')
  }

  // get last version
  const revOfOldDoc = revisions[1].rev
  let oldUserDoc
  try {
    oldUserDoc = await userDb.get(change.id, { rev: revOfOldDoc })
  } catch (error) {
    if (error.statusCode === 404) {
      // old doc not found
      return updateUserDoc(newDoc, null)
    }
    return console.log('error getting last version of user doc: ', error)
  }
  // compare with last version
  if (
    oldUserDoc &&
    oldUserDoc.roles &&
    newDoc.roles &&
    oldUserDoc.roles !== newDoc.roles
  ) {
    // roles have changed
    // always update roles in _users DB
    updateUserDoc(newDoc, oldUserDoc)
  }
  // TODO: make shure other changes to userDoc are copied to _users doc
}
