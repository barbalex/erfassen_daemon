/*
 * when message doc changes
 * - analyse type
 * - do it
 * - remove message doc
 */

const dbUrl = require('./dbUrl')
const nano = require('nano')(dbUrl())
const createProjectDb = require('./createProjectDb')

module.exports = async change => {
  const { doc } = change
  // only react to adding projects
  if (doc.type !== 'projectAdd') return

  createProjectDb(nano, doc.projectName)
  // now delete the message
  try {
    await nano.use('erfassen_messages').destroy(doc, doc._rev)
  } catch (error) {
    return console.log(
      'error removing doc after ordering to create project',
      error,
    )
  }
  console.log('removed doc after initiating project creation', doc)
}