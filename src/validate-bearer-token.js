
const { API_TOKEN } = require('./config')
const logger = require('./logger')

function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')

  // Help yourself out by using a standard output format of "function: variable: value"
  // console.log('validateBearerToken: authToken: ', authToken)
  // console.log('validateBearerToken: API_TOKEN: ', API_TOKEN)
  
  if (!authToken || authToken.split(' ')[1] !== API_TOKEN) {
    logger.error(`Unauthorized request to path: ${req.path}`)
    return res.status(401).json({ error: 'Unauthorized request' })
  }

  next()
}

module.exports = validateBearerToken