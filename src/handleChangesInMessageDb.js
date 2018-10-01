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

module.exports = function(change) {
  var changeDoc = change.doc,
    oiDb = nano.use('erfassen_messages')

  switch (changeDoc.type) {
    case 'projectAdd':
      createProjectDb(nano, changeDoc.projectName)
      // now delete the message
      oiDb.destroy(changeDoc, changeDoc._rev, function(error) {
        if (error) {
          return console.log(
            'error removing doc after ordering to create project',
            error,
          )
        }

        console.log('removed doc after ordering to create project', changeDoc)
      })
      break
  }
}
