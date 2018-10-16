module.exports = ({ creatorName, projectName }) => {
  const projectDbName =
    'project_' +
    creatorName
      .toLowerCase()
      .replace('@', '_at_')
      .replace('.', '_p_') +
    '_' +
    projectName
  if (!/^[a-z][a-z0-9_$()+/-]*$/.test(projectDbName)) {
    return console.log('Name is not valid db name')
  }
  return projectDbName
}
