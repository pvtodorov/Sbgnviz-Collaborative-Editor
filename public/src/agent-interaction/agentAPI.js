/**
 * Created by cbio on 10/28/15.
 */


    var Agent = function (id) {

        var room;
        var socket;
        var agentId = id;

        var pageDoc;

        var self = this;
        return {

            connectToServer: function (url) {


                //Parse

                var sInd = url.search("3000/") + 5; //roomId index
                var serverIp = url.slice(0,sInd);
                room = url.slice(sInd, url.length);

                socket =  io(serverIp);


                socket.emit("subscribe", {room: room, userId: agentId, userType: "agent"});

                return socket;

            },




            //get model for the current room
            getModel: function () {
                socket.emit('agentPageDocRequest', room);
                socket.on('pageDoc', function (data) {
                    pageDoc = data;


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
                    $('#operationHistory').append("<li>" + JSON.stringify(data) + "</li>");

                });

            }
        }


    };






