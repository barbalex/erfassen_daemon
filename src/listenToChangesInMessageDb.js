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
  feed.on('error', error => {
    if (error.message.includes('Database deleted after change')) {
      // I have deleted message db in dev mode
      console.log('messages db was deleted while being followed')
      return global.messages.stop()
    }
    console.log('error following messages db', { msg: error.message })
    global.messages.stop()
  })
  feed.follow()
  // make sure that follow is only called once
  global.messages = feed
  // output result
  console.log('listening to changes in messages')
}
