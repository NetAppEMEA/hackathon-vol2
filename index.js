var http = require('http')
var args = require('minimist')(process.argv, {
  alias:{
    p:'port',
    r:'redis_host',
    v:'verbose'
  },
  default:{
    port:80
  },
  boolean:['verbose']
})

var RedisServer = require('./server')
var useServer = RedisServer

var server = http.createServer(useServer(args))

server.listen(args.port, function(){
  console.log('server listening on port: ' + args.port)
})