/*
 * removes all project databases that were only used by this user
 * - also stops listening to their changes
 * removes the user from all docs in project databases that are also used by other users
 */

'use strict'

const deleteDatabase = require('./deleteDatabase')

module.exports = function(nano, userName, projects) {
  // get all users roles
  let users
  try {
    users = await nano.use('_users').list()
  } catch (error) {
    return console.log('error getting users from _users db: ', err)
  }
  const otherUsersDocs = users.rows.filter(doc => doc.name !== userName)
  projects.forEach(project => {
    // check if other user uses this project
    const otherUserUsingProject = otherUsersDocs.find(doc =>
      doc.roles.includes(project),
    )
    if (!otherUserUsingProject) {
      deleteDatabase(nano, project)
    }
  })
}
