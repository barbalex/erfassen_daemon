/*
 * creates a new projectDb
 * but only if it does not exist yet
 */

'use strict'

const createSecurityDoc = require('./createSecurityDoc')

module.exports = async (nano, projectDbName) => {
  // create new projectDb's if it doesn't exist yet
  // get list of DB's in couch
  let dbNames
  try {
    await dbNames = nano.db.list()
  } catch (error) {
    return console.log("error getting list of db's: ", error)
  }
  if (dbNames.includes(projectDbName)) return
  // create new projectDb if it does not exist yet
  try {
    await nano.db.create(projectDbName)
  } catch (error) {
    return console.log('error creating new db ' + projectDbName + ':', error)
  }
  console.log('created new db:', projectDbName)

    // set up permissions for this role
    const securityDoc = createSecurityDoc(
      null,
      projectDbName,
      couchPassfile.user,
    )
    try {
      await nano.use(projectDbName).insert(securityDoc)
    } catch (error) {
      return console.log(
        `error setting _security in new db ${projectDbName}:`,
        error,
      )
    }
}
