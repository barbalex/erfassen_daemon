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
const without = require('lodash/without')

const removeUsersProjectDbs = require('./removeUsersProjectDbs')
const deleteDatabase = require('./deleteDatabase')
const listenToChangesInUsersDbs = require('./listenToChangesInUsersDbs')
const createSecurityDoc = require('./createSecurityDoc')
const getUserDbName = require('./getUserDbName')

const onCreatedUserDb = async (userName, userDbName, userDoc) => {
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
      'handleChangesIn_usersDb: error setting _security in new user DB: ',
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

  // make sure userDoc does not exist yet
  let doc
  try {
    doc = userDb.get(userDoc._id)
  } catch (error) {
    if (error.statusCode !== 404) {
      return console.log(
        `handleChangesIn_usersDb: error getting user doc of new user DB ${userDbName}:`,
        error,
      )
    }
    // userDoc does not exist yet
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

module.exports = async change => {
  // check the revs
  let revisionsBody
  try {
    revisionsBody = await nano
      .use('_users')
      .get(change.id, { revs: true, open_revs: 'all' })
  } catch (error) {
    return console.log(
      'handleChangesIn_usersDb: error getting revs of doc: ',
      error,
    )
  }
  const revisions = body[0].ok._revisions
  const revOfOldDoc = revisions.start - 1 + '-' + revisions.ids[1]
  const messageDb = nano.use('erfassen_messages')

  // a new user was created, an existing changed or deleted
  if (change.deleted) {
    // user was deleted > no doc in change
    // get last doc version before deleted to know the user.name and user.roles
    let doc
    try {
      doc = await nano.use('_users').get(change.id, { rev: revOfOldDoc })
    } catch (error) {
      if (error.statusCode === 404) {
        // could not get previous version - this is expected if user was created new before
        return true
      }
      return console.log(
        'handleChangesIn_usersDb: error getting userDoc version before deleted:',
        error,
      )
    }
    if (doc) {
      // a user was deleted
      const userName = doc.name
      const userProjects = doc.roles
      const userDbName = getUserDbName(userName)

      // remove the role from all the users docs
      // remove projects and their db's that only had this user
      removeUsersProjectDbs(nano, userName, userProjects)

      // delete this user's database
      deleteDatabase(nano, userDbName)

      // stop listening to changes to userDb
      if (GLOBAL[userDbName]) {
        GLOBAL[userDbName].stop()
        console.log(
          `handleChangesIn_usersDb: stopped listening to feed of ${userDbName}`,
        )
      }

      // remove user from members of message db
      let securityDoc
      try {
        securityDoc = await messageDb.get('_security')
      } catch (error) {
        console.log(
          'handleChangesIn_usersDb: error getting _security of message db:',
          error,
        )
      }
      securityDoc.members.names = without(securityDoc.members.names, userName)
    }
  } else {
    // PROBLEM: userDb gets created when userDb was removed,
    // because the roles are then removed from _users db
    // solution: handleDbChanges passes GLOBAL.deleteUserDb
    if (GLOBAL.deleteUserDb) {
      return delete GLOBAL.deleteUserDb
    }

    const userDoc = change.doc
    const userName = userDoc.name
    const userDbName = getUserDbName(userDoc.name)
    // get list of all databases
    let dbNames
    try {
      dbNames = await nano.db.list()
    } catch (error) {
      return console.log(
        'handleChangesIn_usersDb: error getting list of dbs:',
        error,
      )
    }
    if (!dbNames.includes(userDbName)) {
      // this user has no uderDb yet
      // a new user was created
      // create a new user db if it does not exist yet
      nano.db.create(userDbName, function(error) {
        if (error) {
          if (error.statusCode === 412) {
            // db exists already
            // go on incase roles have not been created yet
          } else {
            return console.log(
              'handleChangesIn_usersDb: error creating new user database ' +
                userDbName +
                ': ',
              error,
            )
          }
        }
        onCreatedUserDb(userName, userDbName, userDoc)
      })
    } else {
      // problem: somehow the userdb is created directly by the app
      // dont know why, it should be impossible
      onCreatedUserDb(userName, userDbName, userDoc)
    }
  }
}
