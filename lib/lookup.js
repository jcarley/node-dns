// The Lookup class is used to query your public IP
// address.  It makes a request to www.jsonip.com to
// get back the public IP of your router.  The 
// jsonip.com service returns a json string
// containing your public IP address.

var http  = require("http");
var events = require("events");

var Lookup = function(current_ip) {
  this.current_ip = current_ip;
}

Lookup.prototype = new events.EventEmitter();

Lookup.prototype.compare = function() {
  var options = {
    host : "www.jsonip.com",
    path : "/",
    method : "GET"
  };

  var lookup = this;
  var req = http.request(options, function(res) {
    res.on("data", function(d) {
      var public = JSON.parse(d);
      lookup._compareIP(lookup.current_ip, public.ip);
    });
  });

  req.on("error", function(e) {
    console.error(e);
  });

  req.end();
}

Lookup.prototype._compareIP = function(current, public) {
  var lookup = this;
  if(current !== public) {
    lookup.emit('update', public);
  } else {
    lookup.emit('match', current, public);
  }
}

module.exports = Lookup;
