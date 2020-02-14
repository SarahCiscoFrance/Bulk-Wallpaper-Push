var winston = require('winston')

var logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: './logs/info.log'})
  ]
})

module.exports = logger