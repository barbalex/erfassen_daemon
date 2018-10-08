/*
 * when a new user signs up,
 * a new userDb is created
 * and listening to it's changes started
 *
 * when a user is deleted,
 * his projectDb's are removed,
 * if no other user uses them
 */

const dbUrl = require('./dbUrl')
const nano = require('nano')(dbUrl())

const listenToChangesInUsersDbs = require('./listenToChangesInUsersDbs')
const createSecurityDoc = require('./createSecurityDoc')
const couchPassfile = require('../couchPass.json')

module.exports = async (userName, userDbName, userDoc) => {
  const userDb = nano.use(userDbName)

  // set up read permissions for the user
  // create security doc
  // dont check if it exist yet - it always exists
  // just make sure it's set correctly
  const securityDoc = createSecurityDoc(userName, null, couchPassfile.user)
  try {
    await userDb.insert(securityDoc, '_security')
  } catch (error) {
    return console.log(
      'handleChangesIn_usersDb: error setting _security in new user DB:',
      error,
    )
  }

  // start listening to changes
  // start before inserting doc so the changes in roles are watched
  listenToChangesInUsersDbs([userDbName])

  // add the user as doc, without rev and some other fields
  delete userDoc._rev
  delete userDoc.salt
  delete userDoc.derived_key
  delete userDoc.iterations
  delete userDoc.password_scheme

  // TODO: add list of all projects, the user is listed as member in
  // maybe roles are better because loading all projects does not scale?

  // make sure userDoc does not exist yet
  try {
    await userDb.get(userDoc._id)
  } catch (error) {
    if (error.statusCode !== 404) {
      return console.log(
        `handleChangesIn_usersDb: error getting user doc of new user DB ${userDbName}:`,
        error,
      )
    }
    // error 404: userDoc does not exist yet
    try {
      await userDb.insert(userDoc)
    } catch (error) {
      return console.log(
        `handleChangesIn_usersDb: error adding user doc to new user DB ${userDbName}:`,
        error,
      )
    }
  }
}
