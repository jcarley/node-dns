// The dnsimple class is a thin wrapper around
// the DNSimple.com REST API.  Only the call to
// update a domain's IP address has been implemented.
// There are several libraries that exist where
// more of the API has been implemented.

var https = require("https");
var bl = require('bl');
var events = require("events");

var DNSimple = function (settings) {
    this.settings = settings;
};

DNSimple.prototype = new events.EventEmitter();

// Builds the apiToken used for authenticating to the DNSimple API
DNSimple.prototype.apiToken = function () {
    return this.settings.username + ":" + this.settings.token
};

// updates the IP of the domain specified in the
// settings file
DNSimple.prototype.update = function(new_ip) {
    var dnsimple = this;

    var path = "/v1/domains/" + dnsimple.settings.domain + "/records/" + dnsimple.settings.recordID;

    var record = {
        record: {
            content: new_ip
        }
    };

    dnsimple.put(path, record);
};

// put is a convience method for sending an HTTP PUT
// statement.
DNSimple.prototype.put = function(path, data) {
    var dnsimple = this;

    var options = {
        host: "api.dnsimple.com",
        path: path,
        method: "PUT",
        headers: {
            "X-DNSimple-Token": dnsimple.apiToken(),
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    };

    var req = https.request(options, function (res) {
        var status = res.statusCode;

        res.pipe(bl(function (err, data) {
            if (err || status != 200)
                dnsimple.emit("error", err);
            else
                dnsimple.emit("updated", data);
        }));
    });

    req.on("error", function (e) {
        dnsimple.emit("error", e);
    });

    req.write(JSON.stringify(data));
    req.end();
};

module.exports = DNSimple;