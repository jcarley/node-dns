var fs = require("fs"),
    appPath = require("path").dirname(process.argv[1]),
    Lookup = require(appPath + "/lib/lookup"),
    DNSimple = require(appPath + "/lib/dnsimple");

var settings = JSON.parse(fs.readFileSync(appPath + "/settings.json"));

var lookup = new Lookup(settings.currentIP);
var dns = new DNSimple(settings);

writeln("App Directory: " + appPath);

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
    .on('match', function (current_ip, public_id) {
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
    fs.writeFile("./settings.json", JSON.stringify(settings, undefined, 4), function (err, fd) {
        if (err) throw err;
    });

    writeln("Local settings updated successfully.");

}).on('error', function(e) {
    writeln("Error: " + e);
});

//lookup.compare();

// Uncomment the below to run continuously
//  current set to run once an hour

checkIpStatus();
setInterval(checkIpStatus, settings.checkInterval);

function checkIpStatus() {
    printDate();
    lookup.compare();
}

function writeln(str) {
    process.stdout.write(str + "\n");
}

function printDate() {
    writeln("//------------------------------------------------------//");
    writeln("//----------------" + getDateTime() + "-----------------//");
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "/" + month + "/" + day + " - " + hour + ":" + min + ":" + sec;
}