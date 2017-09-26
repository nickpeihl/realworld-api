var http = require('http')
var test = require('tape')
var xtend = require('xtend')
var tapeCluster = require('tape-cluster')

RealWorldTestCluster.test = tapeCluster(test, RealWorldTestCluster)

module.exports = RealWorldTestCluster

/**
 * Bootstrap a server to listen to HTTP requests and pass the request URL,
 * method, data, and headers back to the response. This way we can write unit
 * tests for our API calls without requiring internet access by internally
 * capturing the request details that would be sent to the server.
 * @param {Object} opts
 * @param {Number} opts.port the port number for the server to listen on
 */
function RealWorldTestCluster (opts) {
  if (!(this instanceof RealWorldTestCluster)) {
    return new RealWorldTestCluster(opts)
  }

  var self = this

  self.assert = opts.assert
  self.port = opts.port
  self.server = http.createServer()

  self.server.on('request', onRequest)

  function onRequest (req, res) {
    var data = {
      url: req.url,
      method: req.method,
      headers: req.headers
    }
    var reqBody = []
    req
      .on('data', function (chunk) {
        reqBody.push(chunk)
      })
      .on('end', function () {
        reqBody = Buffer.concat(reqBody).toString()
        if (reqBody && typeof reqBody === 'string') {
          data = xtend(
            {
              body: JSON.parse(reqBody)
            },
            data
          )
        }
        res.end(JSON.stringify(data))
      })
  }
}

/**
 * Starts the server and listens on the assigned port before running any tests
 * in the cluster. This is similar to the `before` hook in [MochaJS](http://mochajs.org).
 * @param {Function} cb callback function to run after the server begins
 * listening for requests
 */
RealWorldTestCluster.prototype.bootstrap = function (cb) {
  var self = this
  self.server.once('listening', cb)
  self.server.listen(self.port)
}

/**
 * Closes the server after all tests in the cluster are complete. This is
 * similar to the `after` hook in [MochaJS](http://mochajs.org).
 * @param {Function} cb callback function to run after closing the server
 */
RealWorldTestCluster.prototype.close = function (cb) {
  var self = this
  self.server.close(cb)
}
