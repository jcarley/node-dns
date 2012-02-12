var fs = require("fs"),
    Lookup = require("./lib/lookup"),
    DNSimple = require("./lib/dnsimple");

var settings = JSON.parse(fs.readFileSync("./settings.json"));

var lookup = new Lookup(settings.currentIP);
var dns = new DNSimple(settings);

lookup.on('update', function(public_ip) {
  writeln("IP address mismatch:");
  writeln("\tCurrent IP: " + settings.currentIP);
  writeln("\t Public IP: " + public_ip);
  writeln("Updating record...");
  
  dns.update(public_ip);
}).on('match', function(current_ip, public_id) {
  writeln("IP addresses match.  No need to update.");
});

dns.on('updated', function(data) {
  writeln("Domain IP updated successfully.");

  var parentRecord = JSON.parse(data);
  settings.currentIP = parentRecord.record.content;

  writeln("Updating local settings...");

  fs.writeFile("./settings.json", JSON.stringify(settings), function(err, fd) {
    if(err) throw err;
  });

  writeln("Local settings updated.");

}).on('error', function(e) {
  writeln("Error: " + e);
});

function writeln(str) {
  process.stdout.write(str + "\n");
}

lookup.compare();

// Uncomment the below to run continuously
//  current set to run once an hour
//setInterval(lookup.compare, 3600000);

