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

const createProjectDb = require('./createProjectDb')

//const userDbNameFromUserName = require('./userDbNameFromUserName')
const getProjectDbName = require('./getProjectDbName')

module.exports = async change => {
  const { doc } = change
  if (doc.type === 'projectDef') {
    const { creatorName, projectName, type } = doc
    //const userDbName = userDbNameFromUserName(doc.user)
    const projectDbName = getProjectDbName({ creatorName, projectName })
    /*console.log('handleChangesInMessagesDb', {
      projectDbName,
    })*/
    await createProjectDb(projectDbName)
    nano
      .use(projectDbName)
      .insert({ _id: 'projectDef', creatorName, projectName, type })
    console.log(
      `handleChangesInMessagesDb: created new project db '${projectDbName}'`,
    )
    nano.use('messages').destroy(doc._id, doc._rev)
    console.log(`handleChangesInMessagesDb: removed message '${doc.type}'`)
  }
}
