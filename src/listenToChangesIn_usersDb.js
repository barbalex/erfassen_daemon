/*
 * listens to changes in the _users db
 * handleChangesIn_usersDb keeps user docs in the oi db in sync
 */

'use strict'

const handleChangesIn_usersDb = require('./handleChangesIn_usersDb')

module.exports = nano => {
  if (!GLOBAL._users) {
    const feed = nano.use('_users').follow({
      since: 'now',
      live: true,
      include_docs: true,
    })
    feed.on('change', handleChangesIn_usersDb)
    feed.follow()
    GLOBAL._users = feed
    // output result
    console.log('listening to changes in _users')
  }
}
