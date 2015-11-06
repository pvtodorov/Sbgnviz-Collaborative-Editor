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

        var room;
        var socket;
        var agentId = id;
        var agentName = name;
        var pageDoc;
        var opHistory;
        var chatHistory;

        var self = this;
        return {

            connectToServer: function (url) {


                //Parse

                var sInd = url.search("3000/") + 5; //roomId index
                var serverIp = url.slice(0,sInd);
                room = url.slice(sInd, url.length);

                socket =  io(serverIp);



                socket.emit("subscribeAgent", {userName: agentName, room: room, userId: agentId});



                return socket;

            },




            //get model for the current room
            getModel: function () {
                socket.emit('agentPageDocRequest', room);
                socket.on('pageDoc', function (data) {
                    pageDoc = data;

                });
            },
            printHistory: function(){


            },


            //get operation history
            getOperationHistory: function () {

                socket.emit('agentOperationHistoryRequest', room);
                socket.on('operationHistory', function (data) {

                    console.log(data);
                    console.log(room);

                    opHistory = data;
                    if(opHistory != null){
                        opHistory.forEach(function(op){
                            var command = "<b>" + op.userName + " (" + formatTime(op) + "): " + "</b>"  +op.name +  " " +op.id +  " " +JSON.stringify(op.param);
                            $('#operationHistory').append("<li>" + command+ "</li>");
                        });
                    }

                });
            },


            //get operation history
            getChatHistory: function () {
                console.log(room);
                socket.emit('agentChatHistoryRequest', room);
                socket.on('chatHistory', function (data) {

                    chatHistory = data;
                    if(chatHistory != null){
                        for(var msg in chatHistory){
                            var htmlMessage = "<b>" + chatHistory[msg].userName + " (" + formatTime(chatHistory[msg]) + "): "+ "</b>"  +chatHistory[msg].comment ;
                            $('#chat').append("<li>" + htmlMessage+ "</li>");
                        };
                    }

                });
            },

            getUserIds: function () {


            },

            //User id
            sendMessage: function (to, msgTxt) {


            },

            addNode: function (id, x, y, sbgnclass) {

                var param = {x:x, y:y, sbgnclass: sbgnclass};
                socket.emit('agentAddNodeRequest', {room: room, id: id, param:param})
            },



            listen: function(){
                socket.on('operation', function(data){
                    var command = "<b>" + data.userName + " (" + formatTime(data) + "): " + "</b>"  +data.name +  " " +data.id +  " " +JSON.stringify(data.param);
                    $('#operationHistory').append("<li>" + command+ "</li>");

                });

                socket.on('message', function(data){
                    var message = "<b>" + data.userName + " (" + formatTime(data) + "): "+ "</b>"  +data.comment ;
                    $('#chat').append("<li>" + message+ "</li>");

                });

            },




        }


    };






