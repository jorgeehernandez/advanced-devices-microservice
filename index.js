const express = require('express')
const app = express()
const http = require('./utils/http')
const processFilters = require('./processFilters')
const config = require("./cumulocity.json")

app.get('/devices', async function ({ params, query, headers }, res) {

  const httpInstance = http(headers.authorization)
  if (!httpInstance)
    return res.status(401).json({
      message: 'No valid credentials'
    })

  try {
    const devices = await processFilters({ query, httpInstance })

    res.status(200).send({
      devices
    })
  } catch (error) {
    res.status(400).send({
      message: error.message
    })
  }
})

app.get('/health', (_, res) => {
  res.json({
    status: 'UP!',
    version: config.version
  })
})

app.listen(80, function () {
  console.log('app running on port 80! in /devices')
})