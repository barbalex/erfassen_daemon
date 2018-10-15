/*
 * listens to changes in the messages db
 */

const handleChangesInMessageDb = require('./handleChangesInMessageDb')

module.exports = function(nano) {
  if (global.messages) return

  const feed = nano.use('messages').follow({
    since: 'now',
    live: true,
    include_docs: true,
  })
  feed.on('change', handleChangesInMessageDb)
  feed.follow()
  global.messages = feed
  // output result
  console.log('listening to changes in messages')
}
