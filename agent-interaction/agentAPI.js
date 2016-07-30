    /**
    * Created by Funda Durupinar on 10/28/15.
    */

    /**
     * Creates an agent with name and id
     * @param name
     * @param id
     * @constructor
     */
    function Agent (name, id) {


        //public
        this.agentId = id;
        this.agentName = name;
        this.colorCode = getNewColor();

        this.selectedNode;
        this.selectedEdge;
        this.opHistory = [];
        this.chatHistory = [];
        this.userList = [];
        this.pageDoc;
        this.socket;
        this.room;

        //private variables
        var nextNodeCnt;

    }


    //var self = this;

    /**
     *
     * @param url Server address
     * @param callback After connecting to server we get the user list
     * @returns socket Io socket to the node.js server
     */
    Agent.prototype.connectToServer = function (url, callback) {


     //Parse
        var self = this;
        var self = this;
        var sInd = url.search("3000/") + 5; //roomId index
        var serverIp = url.slice(0,sInd);
        this.room = url.slice(sInd, url.length);
        this.socket =  io(serverIp);
        this.socket.emit("subscribeAgent", {userName: self.agentName, room: self.room, userId: self.agentId}, function(data){
            self.userList = data;

            if (data == null)
                self.userList = [];


            if (callback != null) callback();
        });
        return this.socket;

    }




        //get model for the current room
    Agent.prototype.loadModel = function (callback) {

        var self = this;
        this.socket.emit('agentPageDocRequest', {room: this.room}, function(data){

            self.pageDoc = data;
            if (callback != null) callback();
        });


    };
    /**
     * Gets list of operations from the node.js server
     * @param callback Function to call after getting operation history
     */
    Agent.prototype.loadOperationHistory = function (callback) {

        var self = this;
        this.socket.emit('agentOperationHistoryRequest', {room: this.room}, function(data){
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

    Agent.prototype.loadUserList = function(callback) {
        var self = this;
        this.socket.emit('agentUserListRequest', {room: this.room}, function(data){

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
    Agent.prototype.loadChatHistory= function (callback) {
        var self = this;
        this.socket.emit('agentChatHistoryRequest', {room: this.room}, function(data){
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
    Agent.prototype.getNodeList = function(){
        
        return this.pageDoc.cy.nodes;
    };

    

    /**
     *
     * @returns {Object} Edge list in the shared model
     */
    Agent.prototype.getEdgeList = function(){
        return this.pageDoc.cy.edges;
    };

    /**
     *
     * @returns {*} Layout properties in the shared model
     */
    Agent.prototype.getLayoutProperties = function(){
        return this.pageDoc.layoutProperties;
    }

    /**
     * Sends request to the node.js server to change agent's name
     * @param newName New agent name
     */
    Agent.prototype.changeName = function(newName){
        this.agentName = newName;
        this.sendRequest("agentChangeNameRequest", {userName: newName, userId: self.agentId});

    };




    /**
     * Gets node with id from the node.js server
     * @param id Node id
     * @param callback Function to call after getting node
     */
    Agent.prototype.getNodeRequest = function(id, callback){
        var self = this;
        this.socket.emit('agentGetNodeRequest', {room: this.room,  userId: self.agentId, id:id}, function(data){
            self.selectedNode = data;
            if (callback != null) callback();

        })
    };

    /**
     * Gets edge with id from the node.js server
     * @param id Edge id
     * @param callback Function to call after getting edge
     */
    Agent.prototype.getEdgeRequest = function(id, callback){
        var self = this;
        this.socket.emit('agentGetEdgeRequest', {room: this.room, userId: self.agentId, id:id}, function(data){
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
    Agent.prototype.sendRequest = function(reqName, param, callback){ //model operations

        param.room = this.room;
        param.userId = this.agentId;

        this.socket.emit(reqName, param, function(data){
            if(callback)
                callback(data);
            else
                console.log(data);
        });

    };


    /**
     * Socket listener
     * @param callback
     */
    Agent.prototype.listen = function(callback){
        var self = this;
        this.socket.on('operation', function(data){
            self.opHistory.push(data);
        });

        this.socket.on('message', function(data){
            self.chatHistory.push(data);
        });

        this.socket.on('userList', function(data){
            self.userList = data;
        });

        this.socket.on('imageFile', function(data){


        });

        if (callback != null) callback();


    }

    /**
     * Sends chat message
     * @param comment Message in text
     * @param targets Ids of targets
     * @param callback Function to call after sending message
     */
    Agent.prototype.sendMessage = function(comment, targets, callback){

        var message = {room: this.room, comment: comment, userName:this.agentName, userId: this.agentId, time: 1, targets: targets}; //set time on the server

        this.socket.emit('agentMessage', message, function(data){
    
            if (callback != null) callback(data);
        });
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




