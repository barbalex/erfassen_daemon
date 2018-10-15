module.exports = ({ userName, projectName }) => {
  const name =
    'project_' +
    userName
      .toLowerCase()
      .replace('@', '_at_')
      .replace('.', '_p_') +
    '_' +
    projectName
  if (!/^[a-z][a-z0-9_$()+/-]*$/.test(name)) {
    return console.log('Name is not valid db name')
  }
  return name
}
