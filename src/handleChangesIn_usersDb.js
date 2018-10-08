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
const without = require('lodash/without')

const removeUsersProjectDbs = require('./removeUsersProjectDbs')
const deleteDatabase = require('./deleteDatabase')
const userDbNameFromUserName = require('./userDbNameFromUserName')
const onCreatedUserDb = require('./onCreatedUserDb')

module.exports = async change => {
  console.log('handleChangesIn_usersDb', { change })
  // check the revs
  let revisionsBody
  try {
    revisionsBody = await nano
      .use('_users')
      .get(change.id, { revs: true, open_revs: 'all' })
  } catch (error) {
    return console.log(
      'handleChangesIn_usersDb: error getting revs of doc:',
      error,
    )
  }
  const messageDb = nano.use('erfassen_messages')
  console.log('handleChangesIn_usersDb', { revisionsBody, messageDb })

  // was created, changed or deleted
  if (change.deleted) {
    // user was deleted > no doc in change
    // get last doc version before deleted to know the user.name
    const revisions = revisionsBody[0].ok._revisions
    const revOfOldDoc = `${revisions.start - 1}-${revisions.ids[1]}`
    console.log('handleChangesIn_usersDb', { revOfOldDoc, revisions })
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
    console.log('handleChangesIn_usersDb', { doc })
    if (!doc) return

    // a user was deleted
    const userName = doc.name
    console.log('handleChangesIn_usersDb', { userName })
    const userDbName = userDbNameFromUserName(userName)
    console.log('handleChangesIn_usersDb', { userDbNameFromUserName })

    // TODO: 2.1. remove user from projects

    // delete this user's db
    deleteDatabase(nano, userDbName)

    // remove the role from all the users docs
    // remove projects and their db's that only had this user
    removeUsersProjectDbs(nano, userName)

    // stop listening to changes to userDb
    if (global[userDbName]) {
      global[userDbName].stop()
      console.log(
        `handleChangesIn_usersDb: stopped listening to feed of ${userDbName}`,
      )
    }

    // remove user from members of message db
    let mDbSecurityDoc
    try {
      mDbSecurityDoc = await messageDb.get('_security')
    } catch (error) {
      console.log(
        'handleChangesIn_usersDb: error getting _security of message db:',
        error,
      )
    }
    console.log('handleChangesIn_usersDb', { mDbSecurityDoc })
    mDbSecurityDoc.members.names = without(
      mDbSecurityDoc.members.names,
      userName,
    )
    try {
      await messageDb.put(mDbSecurityDoc)
    } catch (error) {
      console.log(
        'handleChangesIn_usersDb: error putting _security of message db:',
        error,
      )
    }
    return
  }

  // change.deleted is false
  // PROBLEM: userDb gets created when userDb was removed,
  // because the roles are then removed from _users db
  // solution: handleDbChanges passes global.deleteUserDb
  // TODO: is this still so?
  console.log('handleChangesIn_usersDb', {
    globalDeleteUserDb: global.deleteUserDb,
  })
  if (global.deleteUserDb) {
    return delete global.deleteUserDb
  }

  const userDoc = change.doc
  console.log('handleChangesIn_usersDb', {
    userDoc,
  })
  const userName = userDoc.name
  console.log('handleChangesIn_usersDb', {
    userName,
  })
  const userDbName = userDbNameFromUserName(userDoc.name)
  console.log('handleChangesIn_usersDb', {
    userDbNameFromUserName,
  })
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
  console.log('handleChangesIn_usersDb', {
    dbNames,
  })
  if (!dbNames.includes(userDbName)) {
    // this user has no userDb yet
    // a new user was created
    // create a new user db if it does not exist yet
    try {
      await nano.db.create(userDbName)
    } catch (error) {
      // error 412 means: db exists already
      // go on in case roles have not been created yet
      // only error out on other errors
      if (error.statusCode !== 412) {
        return console.log(
          `handleChangesIn_usersDb: error creating new user database ${userDbName}:`,
          error,
        )
      }
    }
    console.log(
      `handleChangesIn_usersDb: userDb ${userDbName} created for user ${userName}`,
    )
  }
  onCreatedUserDb(userName, userDbName, userDoc)
}
