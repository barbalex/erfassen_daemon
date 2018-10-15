/*
 * listens to changes in the _users db
 * handleChangesIn_usersDb keeps user docs in the oi db in sync
 */

const couchUrl = require('./couchUrl')
const nano = require('nano')(couchUrl)
const handleChangesIn_usersDb = require('./handleChangesIn_usersDb')

module.exports = () => {
  if (global._users) return

  const feed = nano.use('_users').follow({
    since: 'now',
    live: true,
    include_docs: true,
  })
  feed.on('change', handleChangesIn_usersDb)
  feed.follow()
  // make sure that follow is only called once
  global._users = feed
  // output result
  console.log('listening to changes in _users')
}
