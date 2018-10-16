const couchUrl = require('./couchUrl')
const nano = require('nano')(couchUrl)
const handleChangesInMessagesDb = require('./handleChangesInMessagesDb')

module.exports = () => {
  if (global.messages) return

  const feed = nano.use('messages').follow({
    since: 'now',
    live: true,
    include_docs: true,
  })
  feed.on('change', handleChangesInMessagesDb)
  feed.follow()
  // make sure that follow is only called once
  global.messages = feed
  // output result
  console.log('listening to changes in messages')
}
