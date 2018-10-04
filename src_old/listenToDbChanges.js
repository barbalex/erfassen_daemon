/*
 * listens to changes in the couch instance
 * goal: know when a db was added
 */

const handleDbChanges = require('./handleDbChanges')

module.exports = nano => {
  if (GLOBAL.dbUpdates) return

  const feed = nano.followUpdates({ since: 'now' })
  feed.on('change', handleDbChanges)
  feed.follow()
  GLOBAL.dbUpdates = feed
  console.log("listening to changes in db's")
}
