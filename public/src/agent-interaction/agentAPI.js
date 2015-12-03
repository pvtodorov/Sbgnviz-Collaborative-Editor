    /**
    * Created by cbio on 10/28/15.
    */

    var Agent = function (name, id) {


        //public
        this.agentId = id;
        this.agentName = name;
        this.pageDoc;
        this.selectedNode;
        this.selectedEdge;
        this.opHistory  = [];
        this.chatHistory =[];
        this.userList = [];

        //private variables
        var nextNodeCnt  ;
        var room;
        var socket;


        var self = this;

        this.connectToServer = function (url, callback) {
                //Parse
                var sInd = url.search("3000/") + 5; //roomId index
                var serverIp = url.slice(0,sInd);
                room = url.slice(sInd, url.length);
                socket =  io(serverIp);
                socket.emit("subscribeAgent", {userName: self.agentName, room: room, userId: self.agentId}, function(data){
                    self.userList = data;
                    if (data == null)
                        self.userList = [];


                    if (callback != null) callback();
                });
                return socket;
        };


        this.updateNextAgentNodeId = function(cb){
            var cnt = 0;
            for( var key in self.pageDoc.cy.nodes ) {
                if( self.pageDoc.cy.nodes.hasOwnProperty(key) ) {
                    cnt++;
                }
            }
            nextNodeCnt =  cnt;
        };

        this.getNextNodeId = function(){

            return  "agentN" + nextNodeCnt++;
        }

        //get model for the current room
        this.getModel = function (callback) {

            socket.emit('agentPageDocRequest', room, function(data){
                self.pageDoc = data;
                if (callback != null) callback();
            });


        };
        //get operation history
        this.getOperationHistory= function (callback) {

            socket.emit('agentOperationHistoryRequest', room, function(data){
                self.opHistory = data;
                if (data == null)
                    self.opHistory = [];


                if (callback != null) callback();


            });

        };

        this.getUserList = function(callback) {
            socket.emit('agentUserListRequest', room, function(data){

                    self.userList = data;
                    if (data == null)
                        self.userList = [];

                    if (callback != null) callback();
                });
        };

        this.getNodeList = function(){
            return self.pageDoc.cy.nodes;
        };


        this.getEdgeList = function(){
            return self.pageDoc.cy.edges;
        };

        this.changeName = function(newName){
            self.agentName = newName;
            self.sendRequest("agentChangeNameRequest", {userName: newName, userId: self.agentId});

        };


        //get operation history
        this.getChatHistory= function (callback) {
            socket.emit('agentChatHistoryRequest', room, function(data){
                    self.chatHistory = data;
                    if (data == null)
                        self.chatHistory = [];

                    if (callback != null) callback();

                });
        };

        this.getNodeRequest = function(id, callback){
            socket.emit('agentGetNodeRequest', room, id, function(data){
                self.selectedNode = data;
                if (callback != null) callback();

            })
        };

        this.getEdgeRequest = function(id, callback){
            socket.emit('agentGetEdgeRequest', room, id, function(data){
                self.selectedEdge = data;
                if (callback != null) callback();

            })
        };

        this.sendRequest = function(reqName, param){ //model operations
            socket.emit(reqName, room, param);
        };


        this.listen = function(callback){
            socket.on('operation', function(data){
                self.opHistory.push(data);
            });

            socket.on('message', function(data){
                self.chatHistory.push(data);
            });

            socket.on('userList', function(data){
                self.userList = data;
            });

            socket.on('imageFile', function(data){


            });

            callback();


        };

        this.sendMessage = function(comment, targets, callback){




            var message = {room: room, comment: comment, userName:self.agentName, userId: self.agentId, time: 1, targets: targets}; //set time on the server
            socket.emit('agentMessage', message, function(){

                callback();
            });
        };





    }








