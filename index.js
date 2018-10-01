'use strict'

const { user, pass } = require('./couchpass.json')
const dbUrl = `http://${user}:${pass}@127.0.0.1:5984`
const nano = require('nano')(dbUrl)
const filter = require('lodash/filter')

const listenToChangesIn_usersDb = require('./src/listenToChangesIn_usersDb')
const listenToChangesInUsersDbs = require('./src/listenToChangesInUsersDbs')
const listenToChangesInMessageDb = require('./src/listenToChangesInMessageDb')
const listenToDbChanges = require('./src/listenToDbChanges')

consr run = async() => {
  let dbs
  try {
    dbs = nano.db.list()
  } catch (error) {
    return console.log('error getting DBs: ', error)
  }
  const userDbs = filter(dbs, (db)=>db.substr(0, 5) === 'user_')

  listenToChangesIn_usersDb()
  listenToChangesInUsersDbs(userDbs)
  listenToChangesInMessageDb()
  listenToDbChanges()
}

run()
