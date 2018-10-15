module.exports = ({ userName, projectName }) =>
  'project_' +
  userName
    .toLowerCase()
    .replace('@', '_at_')
    .replace('.', '_p_') +
  '_' +
  projectName
