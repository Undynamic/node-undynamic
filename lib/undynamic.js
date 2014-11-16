var Joi = require('joi');
var https = require('https');
var url = require('url');

var Undynamic = function(options) {
  if (!(this instanceof Undynamic))
    return new Undynamic(options);

  if (!options)
    options = {};

  this._options = options;
  this._options._api = 'https://undynamic.com/api/v1';

  Joi.assert(this._options.token, Joi.binary().encoding('base64'));
};

Undynamic.prototype.express = function() {
  var self = this;

  return function(req, res, next) {
    if (!req.query._escaped_fragment_)
      return next();

    var uri = req.protocol + '://' +
      req.get('host') + req.path + '#!' + req.query._escaped_fragment_;

    var request = self._snapshot(uri, function(response) {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    });

    request.on('error', function(err) {
      next(err);
    });
  };
};

Undynamic.prototype._snapshot = function(uri, callback) {
  var options = url.parse(this._options._api);
  options.headers = {
    authorization: this._options.token
  };

  options.path += '/snapshot/' + encodeURIComponent(uri);
  options.query = '?replay';

  return https.get(options, callback);
};

module.exports = Undynamic;
