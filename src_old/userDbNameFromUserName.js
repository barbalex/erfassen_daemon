module.exports = name =>
  'user_' +
  name
    .toLowerCase()
    .replace('@', '_at_')
    .replace('.', '_p_')
