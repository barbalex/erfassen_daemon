/*
 * listens to changes in the erfassen_messages db
 */

const handleChangesInMessageDb = require('./handleChangesInMessageDb')

module.exports = function(nano) {
  if (GLOBAL.erfassen_messages) return

  const feed = nano.use('erfassen_messages').follow({
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
