const dbUrl = require('./src/dbUrl')
const nano = require('nano')(dbUrl())

const listenToChangesIn_usersDb = require('./src/listenToChangesIn_usersDb')

const run = async () => {
  listenToChangesIn_usersDb(nano)
}

run()
