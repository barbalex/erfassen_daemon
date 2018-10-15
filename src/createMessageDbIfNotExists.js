const couchUrl = require('./couchUrl')
const nano = require('nano')(couchUrl)

module.exports = async () => {
  let dbs
  try {
    dbs = await nano.db.list()
  } catch (error) {
    console.log('createMessageDbIfNotExists, error listing dbs:', error)
  }
  const existingMessageDb = dbs.find(db => db === 'messages')
  if (existingMessageDb) return

  try {
    await nano.db.create('messages')
  } catch (error) {
    console.log(
      'createMessageDbIfNotExists, error creating messages db:',
      error,
    )
  }
  console.log('messages db created')
  return
}
