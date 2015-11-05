var derby = require('derby');

exports.run = run;
var model;
var server;
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
// client names which are currently connected to the server



function run(app, options, cb) {
  options || (options = {});
  var port = options.port || process.env.PORT || 3000;

  function listenCallback(err) {
    console.log('%d listening. Go to: http://localhost:%d/', process.pid, port);
    cb && cb(err);
  };


    function createServer() {
      var userList = [];
      var pageDocList = [];

      if (typeof app === 'string') app = require(app);

      require('./server').setup(app, options, function (err, expressApp, upgrade, refModel) {
          model = refModel;
          if (err) throw err;
          server = require('http').createServer(expressApp);



         // var io = require('socket.io')(server);
          var io = require('socket.io').listen(server);

          server.on('upgrade', upgrade);
          server.listen(port, listenCallback);


        io.sockets.on('connection', function (socket) {

            //Agent requests
            socket.on('agentAddNodeRequest',function(data){

                var nodePath = 'documents.' + data.room + '.cy.nodes.' + data.id;

                model.set(nodePath + '.id', data.id);
                model.set(nodePath + '.position', {x: data.param.x, y: data.param.y});
                model.set(nodePath + '.sbgnclass', data.param.sbgnclass);



            });

            socket.on('agentPageDocRequest', function(room){ //from computer agent

                var pageDocEl = pageDocList.find(function(el){

                    return el.room == room});

                if(pageDocEl)
                    socket.emit('pageDoc', pageDocEl.pageDoc);



            });

            socket.on('subscribe', function (data) {
                socket.join(data.room);
                socket.userId = data.userId;
                socket.room = data.room;
                socket.userType = data.userType;

                //if (userList.indexOf(data) < 0) //unique users only
                    userList.push(data);




                io.in(socket.room).emit('userList',  userList.filter(function (obj) {
                    return(obj.room == socket.room);
                }));

                pageDocList.push({room: data.room, pageDoc: data.pageDoc});


                var docPath = 'documents.' + data.room;

                model.subscribe(docPath, 'cy', function(){

                    //Agent should be notified of model changes
            /*        model.on('all', (docPath + '.cy.nodes.**.sbgnclass'), function (id, op, sbgnclass, prev, passed) {
                        if(data.userType == "agent"){ //Humans are connected through sockets as well,chech userType to prevent double updates
                            var pos = model.get(docPath + '.cy.nodes.' + id + '.position');
                            io.in(socket.room).emit('addNode', {id: id, position: pos, sbgnclass: sbgnclass});
                        }
                    });

                    model.on('all', (docPath + '.cy.nodes.**.position'), function (id, op, pos, prev, passed) {
                        if(data.userType == "agent"){ //Humans are connected through sockets as well,chech userType to prevent double updates
                            io.in(socket.room).emit('move', {id: id, position: pos});
                        }
                    });*/

                    model.on('all',  (docPath + '.history.**'), function (id, op, cmdInd, prev, passed) {
                        if(data.userType == "agent") { //ns are connected through sockets as well,chech userType to prevent notifying twice
                            var cmd = model.get(docPath + '.history.' + cmdInd);
                            io.in(socket.room).emit('operation', cmd);
                        }
                        }
                    )
                });






            });

            socket.on('disconnect', function() {

                for(var i =  userList.length -1 ; i >=0; i--){
                    if(userList[i].userId == socket.userId && userList[i].room == socket.room){
                        userList.splice(i,1);
                        break;
                    }
                }

                io.in(socket.room).emit('userList',  userList.filter(function (obj) {
                    return(obj.room === socket.room);
                }));
            });

            socket.on('getTime', function() {
                socket.emit('currentTime', +(new Date));
            });

            socket.on('BioGeneQuery', function (queryParams) {
              var request = require('request');

              var responseHeaders = {
                  "access-control-allow-origin": "*",
                  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
                  "access-control-allow-headers": "content-type, accept",
                  "access-control-max-age": 10,
                  "Content-Type": "application/json"
              };

              var responseContent = "";
              request({
                  url: 'http://cbio.mskcc.org/biogene/retrieve.do', //URL to hit
                  // qs: {from: 'blog example', time: +new Date()}, //Query string data
                  method: 'POST',
                  headers: responseHeaders,
                  //Lets post the following key/values as form
                  form: queryParams

              }, function (error, response, body) {

                  if (error) {

                      console.log(error);
                  } else {

                      socket.emit("BioGeneResult",body);

                  }
              });

            });

        });



      });

      return server;


  }



    derby.run(createServer);







}
