// The dnsimple class is a thin wrapper around
// the DNSimple.com REST API.  Only the call to
// update a domain's IP address has been implemented.
// There are several libraries that exist where
// more of the API has been implemented.

var https = require("https");
var events = require("events");

var DNSimple = function(settings) {
  this.settings = settings;
}

DNSimple.prototype = new events.EventEmitter();

// updates the IP of the domain specified in the settings file
DNSimple.prototype.update = function(new_ip) {
  var dnsimple = this;

  var path = `/v2/${dnsimple.settings.ACCOUNT_ID}/zones/${dnsimple.settings.DNS_ZONE_ID}/records/${dnsimple.settings.DNS_RECORD_ID}`

  var record = JSON.stringify({
      content: new_ip,
      ttl: 86400
  });

  dnsimple.patch(path, record);
}

// patch is a convience method for sending an HTTP PATCH statement.
DNSimple.prototype.patch = function(path, data) {
  dnsimple = this;

  var options = {
    host : "api.dnsimple.com",
    path: path,
    method : "PATCH",
    headers : {
      "Authorization": `Bearer ${dnsimple.settings.AUTH_TOKEN}`,
      "Accept" : "application/json",
      "Content-Type": "application/json",
      "Content-Length" : data.length
    }
  };

  var req = https.request(options, function(res) {
    var status = res.statusCode;
    res.on("data", function(d) {
      if( status == 200 ) {
        dnsimple.emit("updated");
      } else {
        dnsimple.emit("error");
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
