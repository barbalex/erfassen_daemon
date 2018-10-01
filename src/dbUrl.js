const { user, pass } = require('../couchpass.json')
module.exports = `http://${user}:${pass}@127.0.0.1:5984`
