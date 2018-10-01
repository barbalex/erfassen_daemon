/*
 * listens to changes in the erfassen_messages db
 */

'use strict'

const handleChangesInMessageDb = require('./handleChangesInMessageDb')

module.exports = function(nano) {
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
