http = require('http');
fs = require('fs');
dateFormat = require('dateformat');
server = http.createServer( function(req, res) {

    console.dir(req.param);
    // console.log(Object.keys(jsonbuild).length);
    // console.log();

    if (req.method == 'POST') {
        console.log("POST");
        var body = '';
        req.on('data', function (data) {
            body += data;
            // console.log("Partial body: " + body);
        });
        req.on('end', function () {
            console.log("Body: " + body);
            if(JSON.parse(body).ServiceName){
            service_params = JSON.parse(body).ServiceName.split("/"); 
            if(service_params[2]=="development")
            {
                qaJsonFile = './json-data/qa.json';
                jsonbuild = require(qaJsonFile);
                count=Object.keys(jsonbuild.builds).length;
            }
            else if(service_params[2]=="live")
            {
                qaJsonFile = './json-data/production.json';
                jsonbuild = require(qaJsonFile);
                count=Object.keys(jsonbuild.builds).length;
            }   
            else if(service_params[2]=="prelive")
            {
                qaJsonFile = './json-data/preprod.json';
                jsonbuild = require(qaJsonFile);
                count=Object.keys(jsonbuild.builds).length;
            } 
            else if(service_params[2]=="master")
            {
                qaJsonFile = './json-data/production.json';
                jsonbuild = require(qaJsonFile);
                preJsonFile = './json-data/preprod.json';
                jsonbuildpre = require(preJsonFile);
                count=Object.keys(jsonbuild.builds).length;
            }                 
           else if(service_params[2]=="maintenance")
            {
                qaJsonFile = './json-data/perf.json';
                jsonbuild = require(qaJsonFile);
                count=Object.keys(jsonbuild.builds).length;
            }  
            else{
              count=0;

            }          
            for(i=1;i<count;++i){
                //console.log(i)
                // console.log("file: "+jsonbuild.builds[i].ServiceName);
                 console.log("post: "+ JSON.parse(body).ServiceName.split("/"));                            
                if(jsonbuild.builds[i].ServiceName.includes(service_params[1])){
                      //  console.log("amar"+i)
                      if(JSON.parse(body).Available){
                      jsonbuild.builds[i].Available = JSON.parse(body).Available;
                      fs.writeFile(qaJsonFile, JSON.stringify(jsonbuild), function (err) {
                        if (err) return console.log(err);
                       // console.log(JSON.stringify(jsonbuild));
                        console.log('writing to ' + qaJsonFile);
                      });
                      if(service_params[2]=="master"){
                        console.log("this block is for prepord");
                        jsonbuildpre.builds[i].Available = JSON.parse(body).Available;
                      fs.writeFile(preJsonFile, JSON.stringify(jsonbuildpre), function (err) {
                        if (err) return console.log(err);                    
                        console.log('writing to ' + preJsonFile);
                      });
                    }
                      
                      console.log(JSON.parse(body).Current)
                      console.log(JSON.parse(body).Available)
                }
                if(JSON.parse(body).Current){
                  if(JSON.parse(body).Env=="Th"){
                    jsonbuild.builds[i].THCurrent = JSON.parse(body).Current;
                    jsonbuild.builds[i].DeployedOn = dateFormat(new Date());
                    fs.writeFile(qaJsonFile, JSON.stringify(jsonbuild), function (err) {
                      if (err) return console.log(err);
                     // console.log(JSON.stringify(jsonbuild));
                      console.log('writing to ' + qaJsonFile);
                    });
            
                    
                    console.log(JSON.parse(body).Current)
                    console.log(JSON.parse(body).Available)
                  }
                  else if(JSON.parse(body).Env=="Id"){
                    jsonbuild.builds[i].IDCurrent = JSON.parse(body).Current;
                    jsonbuild.builds[i].DeployedOn = dateFormat(new Date());
                    fs.writeFile(qaJsonFile, JSON.stringify(jsonbuild), function (err) {
                      if (err) return console.log(err);
                     // console.log(JSON.stringify(jsonbuild));
                      console.log('writing to ' + qaJsonFile);
                    });
            
                    
                    console.log(JSON.parse(body).Current)
                    console.log(JSON.parse(body).Available)
                  }
                    
              } 
               
              if(JSON.parse(body).EC){
                jsonbuild.builds[i].EC = JSON.parse(body).EC;
                fs.writeFile(qaJsonFile, JSON.stringify(jsonbuild), function (err) {
                  if (err) return console.log(err);
                //  console.log(JSON.stringify(jsonbuild));
                  console.log('writing to ' + qaJsonFile);
                });

                
                console.log(JSON.parse(body).Current)
                console.log(JSON.parse(body).Available)
          }                             
            }
            }
        }
        // for ecs logs errror
        if(JSON.parse(body).AlarmName){
          service_name=JSON.parse(body).AlarmName.split('_')[1];

EC_text=JSON.parse(body).NewStateReason;
var regex = /[0-9]+(\.[0-9][0-9]?)?/g;
var EC_count_list = EC_text.match(regex);

qaJsonFile = './json-data/production.json';
jsonbuild = require(qaJsonFile);
count=Object.keys(jsonbuild.builds).length;
console.log(service_name);
for(i=1;i<count;++i){
        console.log(i);                  
  if(jsonbuild.builds[i].ServiceName==service_name){
    jsonbuild.builds[i].EC = EC_count_list[2];
    fs.writeFile(qaJsonFile, JSON.stringify(jsonbuild), function (err) {
      if (err) return console.log(err);
    //  console.log(JSON.stringify(jsonbuild));
      console.log('writing to ' + qaJsonFile);
    });
  }}

        }
              // for ecs logs errror
      });
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('post received');
    }
    else
    {
        console.log("GET");
        //var html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
        var html = fs.readFileSync('index.html');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    }

});

port = 3000;
host = '127.0.0.1';
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);
