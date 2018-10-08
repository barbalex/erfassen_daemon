/*
 * gets names and / or roles and maybe an admin
 * returns a security doc
 * allowing write to passed names and / or roles
 * plus admin for admin or if no admin was passed, couchPass.user
 * so users with the role can't change design docs
 */

var couchPass = require('../couchPass.json')

module.exports = ({ names, roles, admin }) => ({
  admins: {
    names: admin ? [admin] : [couchPass.user],
    roles: [],
  },
  members: {
    names: names ? names : [],
    roles: roles ? roles : [],
  },
})
