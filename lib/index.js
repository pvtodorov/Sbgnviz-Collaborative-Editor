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
        var modelManagerList = []; //model managers for agents


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

            //Agent wants the model
            socket.on('agentPageDocRequest', function(room){ //from computer agent

/*
                var pageDocEl = pageDocList.find(function(el){

                    return el.room == room});

                if(pageDocEl)*/

                var pageDoc = model.get('documents.' + room);
                    socket.emit('pageDoc', pageDoc);

            });


            //Agent requests
            socket.on('agentAddNodeRequest',function(room, data){

                //find a unique node id
                modelManagerList[room].addModelNode(data.id, data.param);

            });
            socket.on('agentDeleteNodeRequest',function(room, data){
                modelManagerList[room].deleteModelNode(data.id);

            });

            socket.on('agentMoveNodeRequest',function(room, data){
                modelManagerList[room].moveModelNode(data.id, data.pos);

            });

            //Agent wants the history of operations
            socket.on('agentOperationHistoryRequest', function(room){ //
            // from computer agent
                var docPath = 'documents.' + room;

                socket.emit('operationHistory', model.get(docPath + '.history'));

            });

            //Agent wants the history of chat messages
            socket.on('agentChatHistoryRequest', function(room){ //from computer agent


                messagesQuery = model.query('messages', {
                    room: room,
                });

                messagesQuery.fetch( function(err){
                    if(err) next(err);


                    socket.emit('chatHistory', messagesQuery.get());
                });

            });
            socket.on('agentUserListRequest', function(room){
                socket.emit('userList',  userList.filter(function (obj) {
                    return(obj.room == room);
                }));
            });



            socket.on('subscribeHuman', function (data) {
                socket.userId = data.userId;
                socket.room = data.room;
                socket.userName = data.userName;
                socket.subscribed = true;


                socket.join(data.room);

             //   pageDocList.push({userId: socket.userId, room: data.room, pageDoc: data.pageDoc});
                //if
                // (userList.indexOf(data) < 0) //unique users only
                userList.push(data);

                io.in(socket.room).emit('userList',  userList.filter(function (obj) {
                    return(obj.room == socket.room);
                }));

            });


            socket.on('subscribeAgent', function (data) {


                socket.userId = data.userId;
                socket.room = data.room;
                socket.subscribed = true;
                socket.userName = data.userName;

                socket.join(data.room);

                modelManagerList[data.room] = (require('../public/sample-app/sampleapp-components/js/modelManager.js')(model, data.room, data.userId, data.userName));

                modelManagerList[data.room].setName(data.userName);

                userList.push(data);

                io.in(socket.room).emit('userList',  userList.filter(function (obj) {
                    return(obj.room == socket.room);
                }));





                var docPath = 'documents.' + data.room;


                //Notify agents of model changes
                model.on('insert',  (docPath + '.history.**'), function (id, cmdInd,  prev, passed) {
                    if(socket.subscribed ) { //humans are connected through sockets as well,check userType to prevent notifying twice
                        var cmd = model.get(docPath + '.history.' + cmdInd);
                        io.in(socket.room).emit('operation', cmd);
                    }
                    }
                );

                model.on('all', ('messages.**'), function (id, op, msg, prev, passed) {


                    if(socket.subscribed ) { //humans are connected through sockets as well,check userType to prevent notifying twice
                        if(msg.room == socket.room)
                            io.in(socket.room).emit('message', msg);
                    }
                });


            });

            socket.on('disconnect', function() {
                socket.subscribed = false; //why isn't the socket removed


                for(var i =  userList.length -1 ; i >=0; i--){
                    if(userList[i].userId == socket.userId && userList[i].room == socket.room){
                        userList.splice(i,1);
                        break;
                    }
                }

/*                for(var i =  pageDocList.length -1 ; i >=0; i--){
                    if(pageDocList[i].userId == socket.userId && pageDocList[i].room == socket.room){
                        pageDocList.splice(i,1);
                        break;
                    }
                }
*/
                io.in(socket.room).emit('userList',  userList.filter(function (obj) {
                    return(obj.room === socket.room);
                }));
            });


            socket.on('imageFile', function(data) {
                io.in(data.room).emit('imageFile', data.img);
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
