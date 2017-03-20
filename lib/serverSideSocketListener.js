
var useBiopax = true;

module.exports.start = function(io, model, cancerDataOrganizer){
    var modelManagerList = [];
    var menuList = [];
    var userList = [];
    var roomList = [];
    var humanList = [];

    var request = require('request'); //REST call over http/https

    var responseHeaders = {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
        "access-control-allow-headers": "content-type, accept",
        "access-control-max-age": 10,
        "Content-Type": "application/json"
    };


    io.sockets.on('connection', function (socket) {

        socket.on('error', function (error) {
            console.log(error);
            //  socket.destroy()
        });



        socket.on('getDate', function(callback){
            callback(new Date);
        });


        socket.on('subscribeHuman', function (data,  callback) {
            socket.userId = data.userId;
            socket.room = data.room;
            socket.userName = data.userName;
            socket.subscribed = true;

            socket.join(data.room);

            data.socketId = socket.id;

            roomList.push(data.room);
            humanList.push({room:data.room, userId: data.userId, socketId: data.socketId});

            console.log("human subscribed");


        });



        socket.on('agentActiveRoomsRequest', function(data, callback){
            callback(roomList);
        });



        //Agent requests

        socket.on('agentUndoRequest', function(data, callback){ //from computer agent

            modelManagerList[data.userId].undoCommand();

        });


        socket.on('agentRedoRequest', function(data, callback){ //from computer agent

            modelManagerList[data.userId].redoCommand();

        });



        socket.on('agentChangeNameRequest',function(data){

            modelManagerList[data.userId].setName(data.userName);
            userList.forEach(function(user){
                if(user.userId == data.userId)
                    user.userName = data.userName;
            });

            socket.emit('userList',  userList.filter(function (obj) {
                return(obj.room == data.room);
            }));
        });

        //Agent requests
        socket.on('agentSetLayoutProperties', function(data){
            modelManagerList[data.userId].setLayoutProperties(data.param);
        });

        socket.on('agentGetLayoutPropertiesRequest', function(data, callback){
            var docPath = 'documents.' + data.room;

            callback(model.get(docPath + '.layoutProperties'))

        });
        socket.on('agentRunLayoutRequest', function(data, callback){
            //Ask a human client to perform this operation as we don't know the node id
            var roomMate = humanList.find(function(human){
                return(human.userId != socket.userId && human.room == data.room);
            });

            if(roomMate!= null) {
                var clientSocket = io.sockets.connected[roomMate.socketId];
                clientSocket.emit('runLayout'); //tell clients to perform layout
                if(callback) callback("Run layout");
            }

        });
        socket.on('agentMergeGraphRequest', function(data){

            //Ask a human client to perform this operation as we don't know the node id
            var roomMate = humanList.find(function(human){
                return(human.userId != socket.userId && human.room == data.room);
            });



            if (roomMate != null) {
                var clientSocket = io.sockets.connected[roomMate.socketId];

                if(data.type == "sbgn") {
                    var sbgnGraph = data.graph;
                    clientSocket.emit('mergeSbgn', sbgnGraph); //tell clients to perform layout
                }
                else {
                    var jsonGraph = data.graph;
                    clientSocket.emit('mergeJson', jsonGraph); //tell clients to perform layout
                }//default is json
            }



        });


        //done via sockets as data conversion to json is done in menu-functions
        socket.on('agentLoadFileRequest',  function(data, callback){
            var msg = "File loaded.";

            if(data.fileType == "owl"){


                request.post({
                    url: "http://localhost:8080/SBGNConverterServlet",
                    headers: responseHeaders,
                    form: {reqType: "sbgn", content: data.param}
                }, function(error, response, body){

                    if (error) {
                        msg = "File loading error."
                        console.log(error);
                    } else  {



                        //console.log(body);
                        console.log(response.statusCode);

                        if(response.statusCode == 200) {
                            menuList[data.userId].loadFileInNode(body);
                        }
                        else {
                            msg = "File loading error."
                        }

                    }
                });

            }
            else
                menuList[data.userId].loadFileInNode(data.param);


            if (callback) callback(msg);
        });
        socket.on('agentNewFileRequest',  function(data, callback){
            //Ask a human client to perform this operation as we don't know the node id
            var roomMate = humanList.find(function(human){
                return(human.userId != socket.userId && human.room == data.room);
            }); //returns the first match


            if(roomMate!= null) {
                var clientSocket = io.sockets.connected[roomMate.socketId];
                clientSocket.emit('newFile'); //tell clients to open a new file
                if (callback) callback("New file");
            }
        });


        socket.on('agentHighlightStatusRequest', function(data){

            if (data.val == 0)
                menuList[data.userId].removeHighlights(data.selectedNodeIds);
            else if (data.val == 1)
                menuList[data.userId].highlightNeighbors(data.selectedNodeIds);
            else
                menuList[data.userId].highlightProcesses(data.selectedNodeIds);

        });

        socket.on('agentVisibilityStatusRequest', function(data){

            if (data.val == 0)
                menuList[data.userId].showNodes(data.selectedNodeIds);
            else if (data.val == 1)
                menuList[data.userId].hideNodes(data.selectedNodeIds);
            else
                menuList[data.userId].showAll();
        });

        socket.on('agentAddCompoundRequest', function(data, callback) {

            //TODO: cytoscape discrepancies between agent and humans

            var compoundId = -1;

            if(data.type == "complex")
                compoundId = menuList[data.userId].makeCompoundComplex(data);
            else
                compoundId = menuList[data.userId].makeCompoundCompartment(data);



            if(callback) callback(compoundId);


        });


        socket.on('agentGetNodeRequest',function(data, callback){
            var node = modelManagerList[data.userId].getModelNode(data.id);
            callback(node);

        });
        socket.on('agentGetEdgeRequest',function(data, callback){

            var edge = modelManagerList[data.userId].getModelEdge(data.id);

            callback(edge);

        });

        socket.on('agentAddNodeRequest',function(data, callback){

            // if(useBiopax) {
            //     var msg;
            //
            //     request.post({
            //         url: "http://localhost:8080/PaxtoolsServlet",
            //         headers: responseHeaders,
            //         form: {reqType: "addNode", content: data.param}
            //     }, function (error, response, body) {
            //
            //
            //         if (error) {
            //             if (callback)
            //                 callback("Node adding error: ");
            //
            //         } else { //only open the window if a proper response is returned
            //
            //             var nodeId = menuList[data.userId].addNode(null, data.param.x, data.param.y, data.param.sbgnclass, data.param.sbgnlabel, true);
            //
            //             console.log(body);
            //             if (response.statusCode == 200) {
            //                 if (callback) callback(nodeId);
            //             }
            //             else{
            //                 if (callback)
            //                     callback("Node adding error: " + response.statusCode);
            //             }
            //
            //
            //
            //         }
            //     });
            // }
            // else{
          //  var nodeId = menuList[data.userId].addNode(null, data.param.x, data.param.y, data.param.sbgnclass, data.param.sbgnlabel, true);

            //Ask a human client to perform this operation as we don't know the node id
            var roomMate = humanList.find(function(human){
                return(human.userId != socket.userId && human.room == data.room);
            }); //returns the first match

            if(roomMate!= null) {
                var clientSocket = io.sockets.connected[roomMate.socketId];
                clientSocket.emit('addNode', data.param, function(nodeId){
                    if(callback) callback(nodeId);   //send the new node id back
                });
            }

        });

        socket.on('agentAddEdgeRequest',function(data,  callback){
            //we know the edge id so add directly to the model
            modelManagerList[data.userId].addModelEdge(data.id, data.param, "me");
        });
        socket.on('agentDeleteNodeRequest',function(data, callback){
            var status = modelManagerList[data.userId].deleteModelNode(data.id);
            if(callback) callback(status);

        });
        socket.on('agentDeleteEdgeRequest',function(data, callback){
            var status = modelManagerList[data.userId].deleteModelEdge(data.id);
            if(callback) callback(status);
        });

        socket.on('agentMoveNodeRequest',function(data, callback){
            var status = modelManagerList[data.userId].changeModelNodeAttribute("position", data.id, data.pos);
            if(callback) callback(status);

        });

        socket.on('agentChangeNodeAttributeRequest', function(data, callback){
            var status = modelManagerList[data.userId].changeModelNodeAttribute(data.attStr, data.id, data.attVal);
            if(callback) callback(status);

        });
        socket.on('agentChangeEdgeAttributeRequest', function(data, callback){
            var status = modelManagerList[data.userId].changeModelEdgeAttribute(data.attStr, data.id, data.attVal);
            console.log(data.attStr);
            console.log(data.attVal);

            if(callback) callback(status);

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
        socket.on('agentAddImageRequest', function(data, callback){
            var status = modelManagerList[data.userId].addImage(data);
            if(callback) callback(status);

        });

        socket.on('agentCBioPortalQueryRequest', function(queryInfo, callback){

            if(queryInfo.queryType == "cancerTypes") {

                callback(cancerDataOrganizer.cancerStudies);


            }

            else if(queryInfo.queryType == "context") {

                cancerDataOrganizer.getAllMutationCounts(queryInfo.proteinName, function (cancerData) {

                    callback(cancerData);

                });
            }
            else if(queryInfo.queryType == "alterations"){

                cancerDataOrganizer.getMutationCountInContext(queryInfo.proteinName, queryInfo.studyId, function(mutationCount){
                    callback(mutationCount);
                });
            }


        });


        socket.on('agentMessage', function( msg){

            msg.date = +(new Date);

            model.add('messages', msg);

            if (msg.comment.indexOf("The most likely context") > -1) { //if agent told about context
                io.in(socket.room).emit("agentContextQuestion",msg.userId);
            }

        });


        // socket.on('contextAnswer', function(answer){
        //
        //     if(socket.userId == answer.userId) //send only to agents
        //         io.in(socket.room).emit('contextAnswerValue', answer.value);
        // });


        /**
         * This stores only species and organs information as cancerTypes require too many genes to be stored and
         * node interactionCnt is already stored as a node attribute
         */
        socket.on('agentContextUpdate', function(data, callback){
            var docPath = 'documents.' + data.room;
            model.set(docPath + '.context', data.param);
        });

        socket.on('subscribeAgent', function (data, callback) {


            socket.userId = data.userId;
            socket.room = data.room;
            socket.subscribed = true;
            socket.userName = data.userName;

            socket.join(data.room);

            data.socketId = socket.id;
            // userList.push(data);
            //
            // callback( userList.filter(function (obj) {
            //     return(obj.room == socket.room);
            // }));


       //     io.in(socket.room).emit('userList', userList); //to notify humans of the new users



            model.subscribe('documents', function() {
                var pageDoc = model.at('documents.' + data.room);
                var docPath = 'documents.' + data.room;
                var cy = model.at((docPath + '.cy'));
                var history = model.at((docPath + '.history'));
                var undoIndex = model.at((docPath + '.undoIndex'));
                var context = model.at((docPath + '.context'));
                var images = model.at((docPath + '.images'));

                var users = model.at((docPath + '.users'));//user lists with names and color codes
                var userIds = model.at((docPath + '.userIds')); //used for keeping a list of subscribed users
                var messages = model.at((docPath + '.messages'));

                pageDoc.subscribe(function () {
                    cy.subscribe(function () {
                    });
                    history.subscribe(function () {
                    });
                    undoIndex.subscribe(function () {
                    });
                    context.subscribe(function () {
                    });
                    images.subscribe(function () {
                    });
                    messages.subscribe(function () {
                    });
                    userIds.subscribe(function () {
                        var userIdsList = userIds.get();
                        if(!userIdsList || userIdsList.indexOf(data.userId) < 0 )
                            userIds.push(data.userId);
                    });
                    users.subscribe(function () {
                        users.set(data.userId, {name: data.userName, colorCode: data.colorCode});
                        modelManagerList[data.userId] = require("../public/collaborative-app/modelManager.js")(model, data.room, data.userId, data.userName);
                    });


                    //Notify agents of model changes
                    model.on('insert', (docPath + '.history.**'), function (id, cmdInd) {
                            if (socket.subscribed) { //humans are connected through sockets as well,check userType to prevent notifying twice
                                var cmd = model.get(docPath + '.history.' + cmdInd);
                                io.in(socket.room).emit('operation', cmd);
                            }
                        }
                    );

                    //To send the message to computer agents
                    model.on('all', (docPath + '.messages.**'), function (id, op, msg) {

                        if (socket.subscribed) {
                            if (msg.targets) {
                                var obj = msg.targets.filter(function (obj) {
                                    return obj.id == data.userId;
                                })[0];

                                if (msg.room == socket.room && obj != null) {
                                    io.in(socket.room).emit('message', msg);

                                }
                            }
                        }
                    });

                    //Send image file to computer agents
                    model.on('all', (docPath + '.images'), function (op, id, data) {
                        if (socket.subscribed)
                            io.in(socket.room).emit('imageFile', data[0]);
                        });
                });
            });


            callback(roomList);

        });

        //Agent wants the model
        socket.on('agentPageDocRequest', function(data, callback){ //from computer agent


            if(modelManagerList[data.userId]!=null) {
                var pageDoc = modelManagerList[data.userId].getPageDoc();


                callback(pageDoc);
            }

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


        socket.on('REACHQuery', function(msg){
            var queryParams = "text=" + msg + "&output=fries";


            request({
                url: 'http://agathon.sista.arizona.edu:8080/odinweb/api/text', //URL to hit
                // qs: {from: 'blog example', time: +new Date()}, //Query string data
                method: 'POST',
                headers: responseHeaders,
                form: queryParams

            }, function (error, response, body) {

                if (error) {

                    console.log(error);
                } else {


                    if(response.statusCode == 200) {
                        io.in(socket.room).emit("REACHResult", body);

                    }
                }
            });
        });

        socket.on('BioGeneQuery', function (queryParams, callback) {


            request({
                url: 'http://cbio.mskcc.org/biogene/retrieve.do', //URL to hit
                // qs: {from: 'blog example', time: +new Date()}, //Query string data
                method: 'POST',
                headers: responseHeaders,
                form: queryParams

            }, function (error, response, body) {

                if (error) {

                    console.log(error);
                } else {

                    callback(body);
                    //socket.emit("BioGeneResult",body);



                }
            });


        });


        socket.on('PCQuery', function(queryData, callback){


            var req = request(queryData.url , function (error, response, body) {
                console.log(queryData.url);

                if (error) {
                    console.log(error);
                } else  { //only open the window if a proper response is returned

                    //     console.log(body);
                    console.log(response.statusCode);
                    if(response.statusCode == 200) {
                        if(callback)
                            callback(body);
                        else
                            socket.emit("PCQueryResult", {graph:body, type:queryData.type});
                    }
                    else{
                        if(callback)
                            callback();
                        socket.emit("PCQueryResult", "error");
                    }

                }
                //    req.end();
            });

            // req.end();
        });




        socket.on('BioPAXRequest', function(fileContent, reqType, callback){


            if(useBiopax) {


                //  request('http://localhost:8080/SBGNConverterServlet' , function (error, response, body) {

                request.post({
                    url: "http://localhost:8080/PaxtoolsServlet",
                    headers: responseHeaders,
                    form: {reqType: reqType, content: fileContent}
                }, function (error, response, body) {


                    if (error) {
                        console.log(error);
                    } else { //only open the window if a proper response is returned

                        if (response.statusCode == 200) {

                            if(reqType == "partialBiopax"){
                                io.in(socket.room).emit("processToIntegrate", body);

                            }
                            if(callback)
                                callback({graph:body});



                        }
                        else
                            socket.emit("Paxtools Server Error", "error");


                    }
                });

            }
        });

    });

}