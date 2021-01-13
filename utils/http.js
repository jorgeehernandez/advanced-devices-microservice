const axios = require('axios')

/**
 * 
 * @param {string} credentials 
 */
function http (credentials) {
  const baseURL = process.env.C8Y_BASEURL || 'https://tracking.bismark-iot.com'

  if (!credentials) return
  // let decoded = credentials.replace('Basic ', '')
  // decoded = Buffer.from(decoded, 'base64').toString('utf-8')
  // console.log(decoded)
  return axios.create({
    baseURL,
    headers: {
      Authorization: credentials
    }
  })
}

module.exports = http

