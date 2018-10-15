/*
 * when message doc changes
 * - analyse type
 * - do it
 * - remove message doc
 */

const couchUrl = require('./couchUrl')
const nano = require('nano')(couchUrl)
const createProjectDb = require('./createProjectDb')

module.exports = async change => {
  const { doc } = change
  // only react to adding projects
  if (doc.type !== 'projectAdd') return

  createProjectDb(nano, doc.projectName)
  // now delete the message
  try {
    await nano.use('messages').destroy(doc, doc._rev)
  } catch (error) {
    return console.log(
      'error removing doc after ordering to create project',
      error,
    )
  }
  console.log('removed doc after initiating project creation', doc)
}
