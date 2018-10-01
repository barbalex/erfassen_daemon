/*
 * creates a new projectDb
 * but only if it does not exist yet
 */

'use strict'

const contains = require('lodash/contains')
const createSecurityDoc = require('./createSecurityDoc')

module.exports = (nano, projectDbName) => {
  var securityDoc

  // create new projectDb's if it doesn't exist yet
  // get list of DB's in couch
  nano.db.list(function(error, dbNames) {
    if (error) {
      return console.log("error getting list of db's: ", error)
    }
    // create new projectDb if it does not exist yet
    if (!contains(dbNames, projectDbName)) {
      nano.db.create(projectDbName, function(error) {
        if (error) {
          return console.log(
            'error creating new db ' + projectDbName + ':',
            error,
          )
        }

        console.log('created new db: ', projectDbName)

        // set up permissions for this role
        securityDoc = createSecurityDoc(null, projectDbName, couchPassfile.user)
        nano
          .use(projectDbName)
          .insert(securityDoc, '_security', function(error) {
            if (error) {
              return console.log(
                'error setting _security in new db ' + projectDbName + ': ',
                error,
              )
            }
          })
      })
    }
  })
}
