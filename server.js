var concat = require('concat-stream')
var Router = require('routes-router')
var ecstatic = require('ecstatic')
var redis = require('redis')

module.exports = function(opts){

  console.log('using redis server')

  var port = opts.redis_port || process.env.USE_REDIS_PORT || 6379
  var host = opts.redis_host || process.env.USE_REDIS_HOST || 'redis'

  var connectionStatus = false

  var client = redis.createClient(port, host, {})
  client.on('error', function(err){
    connectionStatus = false
    console.log('Error from the redis connection:')
    console.log(err)
  })
  client.on('end', function(err){
    connectionStatus = false
    console.log('Lost connection to Redis server')
  })
  client.on('ready', function(err){
    connectionStatus = true
    console.log('Connection made to the Redis server')
  })

  console.log('-------------------------------------------');
  console.log('have host: ' + host)
  console.log('have port: ' + port)

  var router = Router()
  var fileServer = ecstatic({ root: __dirname + '/client' })

  router.addRoute("/v1/ping", {
    // API to provide db connection status
    GET: function(req, res){
      res.setHeader('Content-type', 'application/json')
      res.end(JSON.stringify({
        connected:connectionStatus
      }))
    }
  })
  router.addRoute("/v1/logos", {
    // API to get all logo coordinates
    GET: function (req, res) {

      client.lrange('logos', 0, -1, function(err, data){
        res.setHeader('Content-type', 'application/json')
        res.end(JSON.stringify(data))
      })
    },
    // API to add a new logo coordinate
    POST: function (req, res) {
      req.pipe(concat(function(data){
        data = data.toString()

        client.rpush('logos', data, function(){
          client.save(function(){
            res.end('ok')
          })
        })

      }))
    }
  })

  router.addRoute("/v1/reset", {
    // API to reset and purge all logo coordinates
    PUT: function (req, res) {
       client.del('logos', function(err, data){
        res.setHeader('Content-type', 'application/json')
        res.end(JSON.stringify(data))
      })
    }
  })
  // API to handle serving of all other content
  router.addRoute("/*", fileServer)

  return router
}
