/*
 * when message doc changes
 * - analyse type
 * - do it
 * - remove message doc
 */

'use strict'

const dbUrl = require('./dbUrl')
const nano = require('nano')(dbUrl())
const createProjectDb = require('./createProjectDb')

module.exports = async change => {
  const { doc } = change
  const mDb = nano.use('erfassen_messages')

  if (doc.type === 'projectAdd') (
    createProjectDb(nano, doc.projectName)
    // now delete the message
    mDb.destroy(doc, doc._rev, function(error) {
      if (error) {
        return console.log(
          'error removing doc after ordering to create project',
          error,
        )
      }

      console.log('removed doc after ordering to create project', doc)
    })
  )
}
