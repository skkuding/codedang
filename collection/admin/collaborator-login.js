// Use collection-local modules supported by Bruno QuickJS.
const prepareCollaborator = (req, bru, config) => {
  if (bru.getEnvName() !== 'Local') {
    throw new Error('Select Local for collaborator fixture requests.')
  }
  for (const [key, value] of Object.entries(config)) {
    if (key !== 'baseUrl' && key !== 'gqlUrl') bru.setVar(key, value)
  }
  // WSL's address is only used for this request, never the shared environment.
  req.setUrl(config.gqlUrl)
  const actor = req.getHeader('X-Collaborator-Actor')
  if (!['owner', 'editor', 'reviewer'].includes(actor)) {
    throw new Error('Unknown collaborator request actor.')
  }
  req.setHeader('Authorization', 'Bearer ' + config[actor + 'Token'])
}

module.exports = { prepareCollaborator }
