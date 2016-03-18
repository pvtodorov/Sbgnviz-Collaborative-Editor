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
  var port = options.port || process.env.PORT || 3000 ;//| process.env.OPENSHIFT_NODEJS_PORT ;

  function listenCallback(err) {

    console.log('%d listening. Go to: http://localhost:%d/', process.pid, port);
    cb && cb(err);
  }


    function createServer() {
        var userList = [];
        var modelManagerList = []; //model managers for agents


      if (typeof app === 'string') app = require(app);

      require('./server').setup(app, options, function (err, expressApp, upgrade, refModel) {
          model = refModel;



          //To set the time for the messages
          model.on('all', ('messages.*'), function (id, op, msg ) {

              if(msg.time < 0) {
                msgPath = model.at('messages.' + id);
                msgPath.set('time', +(new Date));
              }

          });

          if (err) throw err;
          server = require('http').createServer(expressApp);



         // var io = require('socket.io')(server);
          var io = require('socket.io').listen(server);

          server.on('upgrade', upgrade);
          server.listen(port, listenCallback);


        io.sockets.on('connection', function (socket) {


            socket.on('error', function (error) {
                console.log(error);
                socket.destroy()
            });



            //Agent wants the model
            socket.on('agentPageDocRequest', function(data, callback){ //from computer agent

                var pageDoc = model.get('documents.' + data.room);
                callback(pageDoc);

            });


            //Agent requests
            socket.on('agentGetNodeRequest',function(data, callback){
                var node = modelManagerList[data.room].getModelNode(data.id);
                callback(node);

            });
            socket.on('agentGetEdgeRequest',function(data, callback){

                var edge = modelManagerList[data.room].getModelEdge(data.id);

                callback(edge);

            });
            socket.on('agentChangeNameRequest',function( data){

                modelManagerList[data.room].setName(data.userName);
                userList.forEach(function(user){
                    if(user.userId == data.userId)
                        user.userName = data.userName;
                });

                socket.emit('userList',  userList.filter(function (obj) {
                    return(obj.room == room);
                }));
            });

            //Agent requests
            socket.on('agentSetLayoutProperties', function(data){
                modelManagerList[data.room].setLayoutProperties(data.param);
            });

            socket.on('agentGetLayoutPropertiesRequest', function(data, callback){
                var docPath = 'documents.' + data.room;

                callback(model.get(docPath + '.layoutProperties'))

            });

            //done via sockets as data conversion to json is done in menu-functions
            socket.on('agentLoadFileRequest',  function(data){
                io.in(socket.room).emit('loadFile', data.param); //tell clients to load file

            });
            socket.on('agentNewFileRequest',  function(data){
                io.in(socket.room).emit('newFile'); //tell clients to open a new file
            });
            socket.on('agentRunLayoutRequest', function(data){
                io.in(socket.room).emit('runLayout'); //tell clients to perform layout
            });

            socket.on('agentHighlightStatusRequest', function(data){
                if(data.val == 0)
                    io.in(socket.room).emit('removeHighlights');
                else if(data.val == 1)
                    io.in(socket.room).emit('highlightNeighbors', data.selectedNodeIds);
                else
                    io.in(socket.room).emit('highlightProcesses', data.selectedNodeIds);
            });

            socket.on('agentVisibilityStatusRequest', function(data){
                if(data.val == 0)
                    io.in(socket.room).emit('showNodes', data.selectedNodeIds);
                else if(data.val == 1)
                    io.in(socket.room).emit('hideNodes', data.selectedNodeIds);
                else
                    io.in(socket.room).emit('showAll');
            });

            socket.on('agentAddCompoundRequest', function(data){

                var roomMate = userList.find(function(ul){

                    return(ul.userId != socket.userId && ul.room == data.room);
                }); //returns the first match

                //tell only one client to add compound, others will follow
                //otherwise more than one compounds will be added
                if(roomMate!= null)
                    socket.broadcast.to(roomMate.socketId).emit('addCompound', data);


            });


            socket.on('agentAddNodeRequest',function(data){


                //make one client to add the node instead of the agent
                var roomMate = userList.find(function(ul){

                    return(ul.userId != socket.userId && ul.room == data.room);
                }); //returns the first match

                //tell only one client to add compound, others will follow
                //otherwise more than one compounds will be added
                if(roomMate!= null)
                    socket.broadcast.to(roomMate.socketId).emit('addNode', data.param);


                //find a unique node id
//                modelManagerList[data.room].addModelNode(data.id, data.param);

            });

            socket.on('agentAddEdgeRequest',function(data){

                modelManagerList[data.room].addModelEdge(data.id, data.param);

            });
            socket.on('agentDeleteNodeRequest',function(data){
                modelManagerList[data.room].deleteModelNode(data.id);

            });
            socket.on('agentDeleteEdgeRequest',function(data){
                modelManagerList[data.room].deleteModelEdge(data.id);

            });

            socket.on('agentMoveNodeRequest',function(data){

                modelManagerList[data.room].moveModelNode(data.id, data.pos);

            });

            socket.on('agentChangeNodeAttributeRequest', function(data){
                modelManagerList[data.room].changeModelNodeAttribute(data.attStr, data.id, data.attVal);

            });
            socket.on('agentChangeEdgeAttributeRequest', function(data){
                modelManagerList[data.room].changeModelEdgeAttribute(data.attStr, data.id, data.attVal);

            });

            socket.on('agentAddImageRequest', function(data){
                modelManagerList[data.room].addImage(data);

            });
            socket.on('agentHighlightRequest', function(data){

                modelManagerList[data.room].highlight(data.val);
            });


            //Agent wants the history of operations
            socket.on('agentOperationHistoryRequest', function(data, callback){ //
            // from computer agent
                var docPath = 'documents.' + data.room;

                callback(model.get(docPath + '.history'))


            });

            //Agent wants the history of chat messages
            socket.on('agentChatHistoryRequest', function(data, callback){ //from computer agent


                messagesQuery = model.query('messages', {
                    room: data.room
                });

                messagesQuery.fetch( function(err){
                    if(err) next(err);


                    callback(messagesQuery.get());
                });

            });
            socket.on('agentUserListRequest', function(data, callback){

                var usersInRoom = userList.filter(function (obj) {
                    return(obj.room == data.room);
                });

                callback(usersInRoom);

            });


            socket.on('agentMessage', function( msg, callback){

                    msg.time = +(new Date);

                    model.add('messages', msg);
                    callback();

                }

            );

            socket.on('subscribeHuman', function (data, callback) {
                socket.userId = data.userId;
                socket.room = data.room;
                socket.userName = data.userName;
                socket.subscribed = true;


                socket.join(data.room);

                data.socketId = socket.id;

                //if (userList.indexOf(data) < 0) //unique users only
                    userList.push(data);


                callback(userList.filter(function (obj) {
                    return(obj.room == socket.room);
                }));


            });


            socket.on('subscribeAgent', function (data, callback) {


                socket.userId = data.userId;
                socket.room = data.room;
                socket.subscribed = true;
                socket.userName = data.userName;

                socket.join(data.room);

                modelManagerList[data.room] = (require('../public/sample-app/sampleapp-components/js/modelManager.js')(model, data.room, data.userId, data.userName));

                modelManagerList[data.room].setName(data.userName);

                data.socketId = socket.id;
                userList.push(data);

                callback( userList.filter(function (obj) {
                    return(obj.room == socket.room);
                }));


                io.in(socket.room).emit('userList', userList); //to notify humans of the new users


                var docPath = 'documents.' + data.room;


                //Notify agents of model changes
                model.on('insert',  (docPath + '.history.**'), function (id, cmdInd) {
                    if(socket.subscribed ) { //humans are connected through sockets as well,check userType to prevent notifying twice
                        var cmd = model.get(docPath + '.history.' + cmdInd);
                        io.in(socket.room).emit('operation', cmd);
                    }
                    }
                );

                //To send the message to computer agents
                model.on('all', ('messages.**'), function (id, op, msg) {

                    if(socket.subscribed ) {
                        if(msg.targets){
                            var obj = msg.targets.filter(function ( obj ) {
                                return obj.id == data.userId;
                            })[0];

                            if(msg.room == socket.room && obj!=null)
                                io.in(socket.room).emit('message', msg);
                            }
                    }
                });

                //Send image file to computer agents
                model.on('all',  (docPath + '.images'), function ( op,id, data ) {
                        if(socket.subscribed ) {

                            io.in(socket.room).emit('imageFile', data[0]);
                        }
                    }
                );

                //socket.on('agentAddCompoundRequest', function(data){
                //
                //    var roomMate = userList.find(function(ul){
                //
                //        return(ul.userId != socket.userId && ul.room == data.room);
                //    }); //returns the first match
                //
                //
                //    //tell only one client to add compound, others will follow
                //    if(roomMate!= null)
                //        socket.broadcast.to(roomMate.socketId).emit('addCompound', data);
                //
                //
                //});

            });

            socket.on('disconnect', function() {
                socket.subscribed = false; //why isn't the socket removed



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
