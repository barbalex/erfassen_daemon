/**
 * Two ways to do this:
 * 1. load all project dbs
 *    get all their _security docs
 *    remove user if exists
 * 2. Use list of projects in userDb
 *    load all projects listed in userDb
 *    remove user
 * Version 1 does not scale well
 * Also: need a list of projects in userDb anyway
 * so user can decide which to sync
 */

module.exports = async (nano, userName) => {}
