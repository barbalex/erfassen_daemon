/*
 * gets an array of user dbs
 * starts listening to them
 */

const handleChangesInUserDb = require('./handleChangesInUserDb')

module.exports = (nano, userDbs) => {
  // start listening to changes in all project-dbs
  userDbs.forEach(userDb => {
    // make sure the feed does not exist yet
    if (GLOBAL[userDb]) return

    const feed = nano.use(userDb).follow({
      since: 'now',
      live: true,
      include_docs: true,
    })
    feed.on('change', function(change) {
      handleChangesInUserDb(nano.use(userDb), change)
    })
    feed.follow()
    // give the feed a name so it can later be stopped
    GLOBAL[userDb] = feed
    // output result
    console.log('listening to changes in', userDb)
  })
}
