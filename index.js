const couchUrl = require('./src/couchUrl')
const nano = require('nano')(couchUrl)

const listenToChangesIn_usersDb = require('./src/listenToChangesIn_usersDb')
const createMessageDbIfNotExists = require('./src/createMessageDbIfNotExists')

const run = async () => {
  await createMessageDbIfNotExists()
  // TODO: create userDb's for all users without (in case script was not up when user was created)
  // TODO: check all the other things that may not have happened if daemon was down
  listenToChangesIn_usersDb(nano)
}

run()
