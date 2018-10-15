const couchUrl = require('./couchUrl')
const nano = require('nano')(couchUrl)
const handleChangesInMessagesDb = require('./handleChangesInMessagesDb')

module.exports = () => {
  console.log('listenToChangesInMessageDb', { globalMessages: global.messages })
  if (global.messages) return

  const feed = nano.use('messages').follow({
    since: 'now',
    live: true,
    include_docs: true,
  })
  feed.on('change', handleChangesInMessagesDb)
  console.log('listenToChangesInMessageDb, on.change created')
  feed.follow()
  // make sure that follow is only called once
  global.messages = feed
  // output result
  console.log('listening to changes in messages')
}
