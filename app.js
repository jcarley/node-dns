var fs = require("fs"),
    Lookup = require("./lib/lookup"),
    DNSimple = require("./lib/dnsimple");

var settings = JSON.parse(fs.readFileSync("./settings.json"));

var lookup = new Lookup(settings.currentIP);
var dns = new DNSimple(settings);

// the update event is fired when there is a mismatch of
// IP addresses
lookup.on('update', function(public_ip) {
  writeln("IP address mismatch:");
  writeln("\tCurrent IP: " + settings.currentIP);
  writeln("\t Public IP: " + public_ip);
  writeln("Updating record...");

  dns.update(public_ip);
})
// the match event is called when the current and the public
// IP addresses match
.on('match', function(current_ip, public_id) {
  writeln("IP addresses match.  No need to update.");
});

// the updated event is raised after the public IP
// was successfully updated
dns.on('updated', function(data) {
  writeln("Domain IP updated successfully.");

  var parentRecord = JSON.parse(data);
  settings.currentIP = parentRecord.record.content;

  writeln("Updating local settings...");

  // we have to save the new public IP to a local file
  // so that we can do a comparison on the next run
  fs.writeFile("./settings.json", JSON.stringify(settings), function(err, fd) {
    if(err) throw err;
  });

  writeln("Local settings updated successfully.");

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

