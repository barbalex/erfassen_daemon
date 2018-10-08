const couchUrl = require('./src/couchUrl')
const nano = require('nano')(couchUrl)

const listenToChangesIn_usersDb = require('./src/listenToChangesIn_usersDb')

const run = async () => {
  listenToChangesIn_usersDb(nano)
}

run()
