    /**
    * Created by Funda Durupinar on 10/28/15.
    */

    /**
     * Creates an agent with name and id
     * @param name
     * @param id
     * @constructor
     */
    var Agent = function (name, id) {


        //public
        this.agentId = id;
        this.agentName = name;
        this.colorCode = getNewColor();

        this.selectedNode;
        this.selectedEdge;
        this.opHistory  = [];
        this.chatHistory =[];
        this.userList = [];

        //private variables
        var nextNodeCnt  ;
        var room;
        var socket;
        var pageDoc;


        var self = this;

        /**
         *
         * @param url Server address
         * @param callback After connecting to server we get the user list
         * @returns socket Io socket to the node.js server
         */
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

        /**
         * Generates a new node id
         */
        //TODO: what if an in-between node is deleted before? We should get a unique id
        this.updateNextAgentNodeId = function(){
            var cnt = 0;
            for( var key in pageDoc.cy.nodes ) {
                if( pageDoc.cy.nodes.hasOwnProperty(key) ) {
                    cnt++;
                }
            }
            nextNodeCnt =  cnt;
        };

        /**
         *
         * @returns {string} New node id
         */
        this.getNextNodeId = function(){

            return  "agentN" + nextNodeCnt++;
        }

        //get model for the current room
        this.loadModel = function (callback) {

            socket.emit('agentPageDocRequest', {room: room}, function(data){
                pageDoc = data;
                self.updateNextAgentNodeId();
                if (callback != null) callback();
            });


        };
        /**
         * Gets list of operations from the node.js server
         * @param callback Function to call after getting operation history
         */
        this.loadOperationHistory = function (callback) {

            socket.emit('agentOperationHistoryRequest', {room: room}, function(data){
                self.opHistory = data;
                if (data == null)
                    self.opHistory = [];


                if (callback != null) callback();


            });

        };

        /**
         * Gets user list from the node.js server
         * @param callback Function to call after getting user list
         */

        this.loadUserList = function(callback) {
            socket.emit('agentUserListRequest', {room: room}, function(data){

                    self.userList = data;
                    if (data == null)
                        self.userList = [];

                    if (callback != null) callback();
                });
        };

        /**
         * Gets chat messages from the node.js server
         * @param callback Function to call after getting chat history
         */
            //get operation history
        this.loadChatHistory= function (callback) {
            socket.emit('agentChatHistoryRequest', {room: room}, function(data){
                self.chatHistory = data;
                if (data == null)
                    self.chatHistory = [];

                if (callback != null) callback();

            });
        };
        /**
         *
         * @returns {Object} Node list in the shared model
         */
        this.getNodeList = function(){
            return pageDoc.cy.nodes;
        };

        /**
         *
         * @returns {Object} Edge list in the shared model
         */
        this.getEdgeList = function(){
            return pageDoc.cy.edges;
        };

        /**
         *
         * @returns {*} Layout properties in the shared model
         */
        this.getLayoutProperties = function(){
            return pageDoc.layoutProperties;
        }

        /**
         * Sends request to the node.js server to change agent's name
         * @param newName New agent name
         */
        this.changeName = function(newName){
            self.agentName = newName;
            self.sendRequest("agentChangeNameRequest", {userName: newName, userId: self.agentId});

        };




        /**
         * Gets node with id from the node.js server
         * @param id Node id
         * @param callback Function to call after getting node
         */
        this.getNodeRequest = function(id, callback){
            socket.emit('agentGetNodeRequest', {room: room, id:id}, function(data){
                self.selectedNode = data;
                if (callback != null) callback();

            })
        };

        /**
         * Gets edge with id from the node.js server
         * @param id Edge id
         * @param callback Function to call after getting edge
         */
        this.getEdgeRequest = function(id, callback){
            socket.emit('agentGetEdgeRequest', {room: room, id:id}, function(data){
                self.selectedEdge = data;
                if (callback != null) callback();

            })
        };

        /**
         * Sends an operation request to the node.js server
         * Model update operations are done in this method
         * @param reqName Operation name
         * @param param Depends on the operation type
         * <ul>
         *     <li>reqName: "agentAddImageRequest", param: {img,filePath} </li>
         *     <li>reqName: "agentSetLayoutProperties", param: {name, nodeRepulsion, nodeOverlap, idealEdgeLength, edgeElasticity, nestingFactor, gravity, numIter, tile, animate, randomize} </li>
         *     <li>reqName: "agentRunLayoutRequest", param:null </li>
         *     <li>reqName: "agentAddNodeRequest", param:{x y, sbgnclass} </li>
         *     <li>reqName: "agentAddEdgeRequest", param:{source, target, sbgnclass} </li>\
         *     <li>reqName: "agentChangeNodeAttributeRequest", param:{id, attStr, attVal} </li>
         *     <li>reqName: "agentChangeEdgeAttributeRequest", param:{id, attStr, attVal} </li>
         *     <li>reqName: "agentMoveNodeRequest", param:{id, pos} </li>
         *     <li>reqName: "agentMoveNodeRequest", param:{id, pos} </li>
         *     <li>reqName: "agentAddCompoundRequest", param:{type, selectedNodes} </li>
         * </ul>
         *
         */
        this.sendRequest = function(reqName, param){ //model operations

            param.room = room;
            socket.emit(reqName, param);
        };


        /**
         * Socket listener
         * @param callback
         */
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

            if (callback != null) callback();


        };

        /**
         * Sends chat message
         * @param comment Message in text
         * @param targets Ids of targets
         * @param callback Function to call after sending message
         */
        this.sendMessage = function(comment, targets, callback){

            var message = {room: room, comment: comment, userName:self.agentName, userId: self.agentId, time: 1, targets: targets}; //set time on the server
            socket.emit('agentMessage', message, function(){
            if(callback!=null)
                if (callback != null) callback();
            });
        };
    }


    /**
     *
     * @returns {string} A specific color to identify the agent
     */
    function getNewColor(){
        var gR = 1.618033988749895; //golden ratio
        var h = Math.floor((Math.random() * gR * 360));//Math.floor((cInd * gR - Math.floor(cInd * gR))*360);
        var cHsl = [h, 70 + Math.random() * 30, 60 + Math.random() * 10];

        return tinycolor('hsla('+cHsl[0]  +', '+ cHsl[1] + '%, ' + cHsl[2] +'%, 1)').toHexString();

    }




