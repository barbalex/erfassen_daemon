module.exports = async (nano, dbName) => {
  // first check if this db still exists
  let dbNames
  try {
    dbNames = await nano.db.list()
  } catch (error) {
    return console.log('error getting list of dbs: ', error)
  }
  if (!dbNames.includes(dbName)) return

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
