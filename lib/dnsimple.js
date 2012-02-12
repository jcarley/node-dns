var https = require("https");
var events = require("events");

var DNSimple = function(settings) {
  this.settings = settings;
}

DNSimple.prototype = new events.EventEmitter();

DNSimple.prototype.token = function() {
  return dnsimple.settings.username + ":" + dnsimple.settings.token
}

DNSimple.prototype.update = function(new_ip) {
  var dnsimple = this;

  var path = "/domains/" + dnsimple.settings.domain + "/records/" + dnsimple.settings.recordID;

  var record = JSON.stringify({
    record: {
      content: new_ip,
      ttl: 86400
    }
  });

  dnsimple.put(path, record);
}

DNSimple.prototype.put = function(path, data) {
  dnsimple = this;
  
  var options = {
    host : "dnsimple.com",
    path: path,
    method : "PUT",
    headers : {
      "Accept" : "application/json",
      "Content-Type": "application/json",
      "X-DNSimple-Token" : dnsimple.token(),
      "Content-Length" : data.length
    }
  };

  var req = https.request(options, function(res) {
    var status = res.statusCode;
    res.on("data", function(d) {
      if( status == 200 ) {
        dnsimple.emit("updated", d);
      } else {
        dnsimple.emit("error", d);
      }
    });
  });

  req.on("error", function(e) {
    dnsimple.emit("error", e);
  });

  req.write(data);
  req.end();
}

module.exports = DNSimple
