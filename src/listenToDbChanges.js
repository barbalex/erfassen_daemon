/*
 * listens to changes in the couch instance
 * goal: know when a db was added
 */

'use strict'

const handleDbChanges = require('./handleDbChanges')

module.exports = nano => {
  var feed

  if (!GLOBAL.dbUpdates) {
    feed = nano.followUpdates({ since: 'now' })
    feed.on('change', handleDbChanges)
    feed.follow()
    GLOBAL.dbUpdates = feed
    console.log("listening to changes in db's")
  }
}
