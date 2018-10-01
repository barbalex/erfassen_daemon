/*
 * listens to changes in the erfassen_messages db
 */

'use strict'

var couchPassfile = require('../couchpass.json'),
  dbUrl =
    'http://' +
    couchPassfile.user +
    ':' +
    couchPassfile.pass +
    '@127.0.0.1:5984',
  nano = require('nano')(dbUrl),
  handleChangesInMessageDb = require('./handleChangesInMessageDb')

module.exports = function() {
  var feed

  if (!GLOBAL.erfassen_messages) {
    feed = nano.use('erfassen_messages').follow({
      since: 'now',
      live: true,
      include_docs: true,
    })
    feed.on('change', handleChangesInMessageDb)
    feed.follow()
    GLOBAL.erfassen_messages = feed
    // output result
    console.log('listening to changes in erfassen_messages')
  }
}
