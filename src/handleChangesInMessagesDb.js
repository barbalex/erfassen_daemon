/*
 * when a new user signs up,
 * a new userDb is created
 * and listening to it's changes started
 *
 * when a user is deleted,
 * his projectDb's are removed,
 * if no other user uses them
 */

const couchUrl = require('./couchUrl')
const nano = require('nano')(couchUrl)
const get = require('lodash/get')

//const userDbNameFromUserName = require('./userDbNameFromUserName')
const getProjectDbName = require('./getProjectDbName')

module.exports = async change => {
  console.log('handleChangesInMessagesDb', { change })
  const { doc } = change
  console.log('handleChangesInMessagesDb', {
    doc,
  })
  /*console.log('handleChangesInMessagesDb', {
    doc,
  })*/
  if (doc.type === 'projectDef') {
    const userName = doc.user
    //const userDbName = userDbNameFromUserName(doc.user)
    const projectDbName = getProjectDbName({ userName, projectName: doc.name })
    console.log('handleChangesInMessagesDb', {
      projectDbName,
    })
  }
}
