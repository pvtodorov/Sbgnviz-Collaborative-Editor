    /**
    * Created by cbio on 10/28/15.
    */


    function formatTime(message){
    var hours, minutes, seconds, period, time;
    time = message && message.time;
    if (!time) {
        return;
    }
    time = new Date(time);
    hours = time.getHours();

    minutes = time.getMinutes();

    seconds = time.getSeconds();

    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
    };



    var Agent = function (name, id) {

        //private variables
        var room;
        var socket;
        var agentId = id;
        var agentName = name;
        var pageDoc;
        var opHistory  = [];
        var chatHistory =[];
        var userList = [];
        var nextNodeCnt  ;


        var self = this;

        this.connectToServer = function (url) {
                //Parse
                var sInd = url.search("3000/") + 5; //roomId index
                var serverIp = url.slice(0,sInd);
                room = url.slice(sInd, url.length);
                socket =  io(serverIp);
                socket.emit("subscribeAgent", {userName: agentName, room: room, userId: agentId});
                return socket;
        };


        this.updateNextAgentNodeId = function(cb){
            var cnt = 0;
            for( var key in pageDoc.cy.nodes ) {
                if( pageDoc.cy.nodes.hasOwnProperty(key) ) {
                    cnt++;
                }
            }
            nextNodeCnt =  cnt;
        };

        this.getNextNodeId = function(){

            return  "agentN" + nextNodeCnt++;
        }

        //get model for the current room
        this.getModel = function (cb) {
            socket.emit('agentPageDocRequest', room);
            socket.on('pageDoc', function (data) {
                pageDoc = data;

                if(cb!=null) cb();

            });
        };

        //get operation history
        this.getOperationHistory= function (cb) {
            socket.emit('agentOperationHistoryRequest', room);
            socket.on('operationHistory', function (data) {
                opHistory = data;
                if(data == null)
                    opHistory = [];
                if(cb!=null) cb();

            });
        };

        this.getUserList = function(cb){
            socket.emit('agentUserListRequest', room)
            socket.on('userList', function (data) {
                userList = data;

                if(cb!=null) cb();
            });
        }


        //get operation history
        this.getChatHistory= function (cb) {
            socket.emit('agentChatHistoryRequest', room);
            socket.on('chatHistory', function (data) {
                chatHistory = data;
                if(data == null)
                    chatHistory = [];

                if(cb!=null) cb();

            });
        };

        this.sendRequest = function(reqName, param){ //model operations
            socket.emit(reqName, room, param);
        };


        this.listen = function(){
            socket.on('operation', function(data){
                opHistory.push(data);

                self.writeCommand(data);
            });

            socket.on('message', function(data){
                chatHistory.push(data);
                self.writeMessage(data);
            });

            socket.on('userList', function(data){
                userList = data;
                self.writeUserList();
            });

            socket.on('imageFile', function(data){

                self.writeImage(data);

            })

        };


        //Web page update operations
        this.updateWebPage = function(){

            if(opHistory != null){
                opHistory.forEach(function(op){
                    self.writeCommand(op);
                });
            }

            if(chatHistory != null){
                for(var ind in chatHistory){
                    self.writeMessage(chatHistory[ind]);

                };
            }

            this.writeUserList();
        };


        this.writeCommand = function(op){
            var command = "<b>" + op.userName + " (" + formatTime(op) + "): " + "</b>"  +op.name +  " " +op.id +  " " +JSON.stringify(op.param);
            $('#operationHistory').append("<li>" + command+ "</li>");

            $('#operationHistory').trigger('contentchanged');

        };
        this.writeMessage = function(msg){
            var htmlMessage = "<b>" + msg.userName + " (" + formatTime(msg) + "): "+ "</b>"  +msg.comment ;
            $('#chat').append("<li>" + htmlMessage+ "</li>");
            $('#chat').trigger('contentchanged');
        };
        this.writeUser = function(usr){
            $('#userList').append("<li>" + usr.userName+ "</li>");
        }
        this.writeUserList = function(){
            $('#userList').empty();
            $('#userList').append("<b> Online Users");

            userList.forEach(function(usr){
                $('#userList').append("<li>" + usr.userName+ "</li>");
            });
        }

        this.writeImage = function(data){

            $('#receivedImage').append('<img src="' + data + '"/>');


        }

    }








