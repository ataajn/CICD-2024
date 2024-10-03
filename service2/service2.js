const http = require('http');
const ps = require('ps-node');
const os = require('os');
const disk = require('diskusage');
const port = 8000;
const checkDiskSpace = require('check-disk-space').default

var getIpAddress = async function(){
    return new Promise((resolve, reject)=> {
        let networkInterfaces = os.networkInterfaces();
        for (let inet in networkInterfaces) {
          let addresses = networkInterfaces[inet];
          for (let i=0; i<addresses.length; i++) {
            let address = addresses[i];
            if (!address.internal) {
              if(address.family === "IPv4"){
                resolve(address.address);
              }
            }
          }
        }
        resolve("")
    })
}

var getProcesses = async function(){
    return new Promise((resolve, reject) => {
        var output = [];
        ps.lookup({}, function(err, resultList ) {
            resultList.forEach(function( process ){
            if(process){
                output.push({
                    name: process.command,
                    pid: process.pid,
                })
                }
            });
            resolve(output);
        })
    })
}

var getFreeDiskSpace = async function(){
    return new Promise((resolve, reject) => {
        checkDiskSpace('/').then((diskSpace) => {
            resolve((diskSpace.free / 1000000000).toFixed(2).toString() + " Gb")
        })
    })
    //checkDiskSpace('/').then((diskSpace) => {
    //    console.log((diskSpace.free / 1000000000).toFixed(2).toString() + " Gb")
    //})
    //let path = os.platform() === 'win32' ? 'c:' : '/';
    //try {
    //    const { free } = await disk.check(path);
    //    return (free / 1000000000).toFixed(2).toString() + " Gb"
    //} catch (err) {
    //    return "error"
    //}
}

var getLastBootSince = async function(){
  return os.uptime().toFixed(2).toString() + " s";
}

const server = http.createServer(async (req, res) => {
  var output = {
    "ip_address": await getIpAddress(),
    "processes" : await getProcesses(),
    "disk_space" : await getFreeDiskSpace(),
    "last_boot_since" : await getLastBootSince()
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(output));
});

server.listen(port, () => {
  //console.log(`Internal server started`);
});
