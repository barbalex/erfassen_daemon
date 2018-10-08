/*
 * removes all project databases that were created by this user
 * - also stops listening to their changes
 */

const deleteDatabase = require('./deleteDatabase')

module.exports = async (nano, userName) => {
  let dbNames
  try {
    dbNames = await nano.db.list()
  } catch (error) {
    return console.log(
      'handleChangesIn_usersDb: error getting list of dbs:',
      error,
    )
  }

  const ownProjectDbNames = dbNames.filter(
    dbName =>
      dbName.substring(0, 8 + userName.length) === `project_${userName}`,
  )

  ownProjectDbNames.forEach(dbName => {
    deleteDatabase(nano, dbName)
  })
}
