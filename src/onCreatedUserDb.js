/*
 * when a new user signs up,
 * a new userDb is created
 * and listening to it's changes started
 *
 * when a user is deleted,
 * his projectDb's are removed,
 * if no other user uses them
 */

const couchUrl = require('./couchUrl')
const nano = require('nano')(couchUrl)
const startsWith = require('lodash/startsWith')
const get = require('lodash/get')

// const listenToChangesInUsersDbs = require('./listenToChangesInUsersDbs')
const createSecurityDoc = require('./createSecurityDoc')

module.exports = async (userName, userDbName, userDoc) => {
  const userDb = nano.use(userDbName)

  // set up read permissions for the user
  // create security doc
  // dont check if it exist yet - it always exists
  // just make sure it's set correctly
  const securityDoc = createSecurityDoc(userName, null)
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
  // TODO: enable this
  // listenToChangesInUsersDbs(nano, [userDbName])

  // add the user as doc, without rev and some other fields
  delete userDoc._rev
  delete userDoc.salt
  delete userDoc.derived_key
  delete userDoc.iterations
  delete userDoc.password_scheme

  // add list of all projects, the user is listed as member in
  let projectDbNames
  try {
    projectDbNames = await nano.db
      .list()
      .filter(dbName => startsWith(dbName, 'project_'))
  } catch (error) {
    return console.log('onCreatedUserDb: error getting list of dbs:', error)
  }
  let usersProjects = []
  for (const projectDbName of projectDbNames) {
    let securityDoc
    try {
      securityDoc = await nano.use(projectDbName).get('_security')
    } catch (error) {
      console.log('onCreatedUserDb: error getting _security of db:', error)
    }
    const memberNames = get(securityDoc, 'members.names', [])
    if (memberNames.includes(userName)) {
      usersProjects.push(projectDbName)
    }
  }
  userDoc.projects = usersProjects

  // make sure userDoc does not exist yet
  try {
    await userDb.get(userDoc._id)
  } catch (error) {
    if (error.statusCode !== 404) {
      return console.log(
        `onCreatedUserDb: error getting user doc of new user DB ${userDbName}:`,
        error,
      )
    }
    // error is 404: userDoc does not exist yet
    // so insert it
    try {
      await userDb.insert(userDoc)
    } catch (error) {
      return console.log(
        `onCreatedUserDb: error adding user doc to new user DB ${userDbName}:`,
        error,
      )
    }
  }
}
