
    /**
     * Created by durupina on 5/13/16.
     */

    ContextAgent.prototype = new Agent();

    //ContextAgent.prototype.constructor = ContextAgent;

    function ContextAgent(name, id) {

        this.agentName = name;
        this.agentId = id;
        


        this.contextList = []; //contextName, proteinName, relevance, confidence


        this.RELEVANCE_THRESHOLD = 0.5; //over 50%

        this.questionInd;

        this.contextInd;
    }

    ContextAgent.prototype.initContext = function(callback){
        var self = this;
        if(this.pageDoc.context!=null) {
            this.contextList = this.pageDoc.context;
            if(callback) callback();
        }
        else{
            var nodes = self.getNodeList();
            for(var nodeId in nodes){
                self.updateNodeContribution(nodes[nodeId], 1, callback);
            }
        }
    }



    ContextAgent.prototype.analyzeOperation = function (op, callback) {

        var self = this;
        
        var nodes = self.getNodeList();
        var edges = self.getEdgeList();

        //if op == delete reduce score

        if(op.elId!=null) {

            if(op.elType == "node") {
                var node = nodes[op.elId];
                if(op.opName == "add")
                    self.updateNodeContribution(node, 1, callback);
                else if(op.opName == "delete")
                    self.updateNodeContribution(node, -1, callback);
                else
                    self.updateNodeContribution(node, 1, callback);

            }
            else if(op.elType == "edge") {


                if(op.opName == "add"){
                    var sourceNode = edges[op.param.source];
                    var targetNode = edges[op.param.target];

                    self.updateNodeContribution(sourceNode, 1, callback);
                    self.updateNodeContribution(targetNode, 1, callback);
                }
                else if(op.opName == "delete"){
                    if(op.param != null && op.param.source!= null &&  op.param.target!= null) {
                        var sourceNode = edges[op.param.source];
                        var targetNode = edges[op.param.target];
                        self.updateNodeContribution(sourceNode, -1, callback);
                        self.updateNodeContribution(targetNode, -1, callback);
                    }
                }
            }

            else if( op.opName == "set") //treat them as a list


                op.elId.forEach(function (el) {

                    if (el.isNode) {
                        self.updateNodeContribution(nodes[el.id], 1, callback);
                    }
                    else{
                        self.updateNodeContribution(edges[el.source], 1, callback);
                        self.updateNodeContribution(edges[el.target], 1, callback);
                    }
                });
                
            }


    }


    /**
     * Increase the contribution of protein "node" in proteinList by relVal
     * @param node
     * TODO: contribution values to be tweaked
     * @param scoreContribution: User interest score contribution which can be + or -
     */
    ContextAgent.prototype.updateNodeContribution = function(node, scoreContribution, callback){
        if(node == null)
            return;
        var self = this;


        //proteins
        if(node.sbgnlabel && node.sbgnclass && ( (node.sbgnclass.indexOf("macromolecule")>-1 || node.sbgnclass.indexOf("nucleic")>-1 || node.sbgnclass.indexOf("chemical")>-1))){
            var proteinName = node.sbgnlabel;


            var exists = false;
            self.contextList.forEach(function(context) {
                if (context.proteinName == proteinName) { //update this for each context associated with the protein
                    exists = true;
                    context.confidence += scoreContribution;
                    if(context.confidence > 100)
                        context.confidence = 100;

                    if(context.confidence < 0)
                        context.confidence = 0;
                }

            });
            if(exists){
                if(callback) callback();
            }

            if(!exists){
                //call portal query to update context related to the protein
                //get all the context data
                this.sendRequest("agentCBioPortalQueryRequest", {proteinName: proteinName, queryType:"context"} ,function(cancerData){
                    //        self.printMutationData(cancerData);
                    for(var ind = 0; ind < cancerData.length; ind++){
                        var data = cancerData[ind];
                        if(data.seqCaseCnt > 0) {

                            var relevance = data.mutationCaseIds.length / data.seqCaseCnt;

                          //  if (relevance >= self.RELEVANCE_THRESHOLD) { //no need to push the ones with smaller scores
                                //   var endInd = data.name.indexOf("(") < 0 ? data.name.length: data.name.indexOf("(");
                                //  var name = data.name.slice(0, endInd);
                                self.contextList.push({
                                    studyId: data.id,
                                    proteinName: proteinName,
                                    relevance: relevance, //relevance value returned by the portal query
                                    confidence: scoreContribution,
                                    contextName: data.name

                                });

                        //    }
                        }

                    };


                    if(callback) callback();
                });

            }
        }
    }
    ContextAgent.prototype.evaluateMessage = function(callback){
        var self = this;
        self.socket.on('message', function(data){


            //FIXME: find a better solution to get human response
            if(data.userId != self.userId && self.chatHistory.length  ==  self.questionInd + 2 ) //means human answered in response to agent's question
            {

                var answer = data.comment;

                if(answer.toLowerCase().search("ye") > -1 )  //yes
                    self.contextList[self.contextInd].confidence = 100;
                    //self.contextList[self.contextInd].confidence *= 2;

                else if (answer.toLowerCase().search("no")> -1)
                    self.contextList[self.contextInd].confidence = 0;
                    //self.contextList[self.contextInd].confidence *= 0.5;

                //else don't change confidence

                if(callback) callback();
            }


        });
    }

    /**
     * Update context scores at each operation
     * @param op
     */
    ContextAgent.prototype.updateContext = function(op, callback){
        var self = this;


        self.analyzeOperation(op, function(){ //requests a query call if necessary, hence the callback

            var prevContextInd = self.contextInd;
            self.contextInd = self.findBestContext();


            if(self.contextInd>-1 && prevContextInd!=self.contextInd &&  self.contextList[self.contextInd]!= self.contextList[prevContextInd] ) { //only inform if the most likely context has changed

                var context = self.contextList[self.contextInd];
                self.informAboutContext(context);

                self.findNeighborhoodAlterations(context.proteinName, context.studyId, function(maxAlteration){
                    console.log(maxAlteration);
                });
            }

            //send updated contextlist to the server
            self.sendRequest("agentContextUpdate", {param: self.contextList});

            if (callback) callback();
        }); //updates node contribution



    }


    ContextAgent.prototype.printMutationData = function(cancerData){
        cancerData.forEach(function(study) {
            if(study.seqCaseCnt > 0){

                console.log(study.id +  ": %"+  (study.mutationCaseIds.length*100/study.seqCaseCnt));
            }

        });
    }

    ContextAgent.prototype.findBestContext = function(){
        var self = this;
        var likelyContext;

        var maxScore = - 100000;
        var maxContextInd = -1;
        var ind = 0;
        self.contextList.forEach(function(context){
            var score = context.relevance * context.confidence;
            if (score > maxScore) {
                maxScore = score;
                maxContextInd = ind;
            }
            ind++;
        });

        return maxContextInd;
    }

    ContextAgent.prototype.informAboutContext = function(context){

        var self = this;

        var agentComment = "The most likely context is  " + context.contextName + " with %" + (context.relevance.toFixed(2) * 100);
        agentComment +=". Do you agree?"
        
        var targets = [];
        for(var i = 0; i < self.userList.length; i++){ //FIXME: send to all the users for now
            targets.push({id: agent.userList[i].userId});
        }


        self.sendMessage(agentComment, targets);

        self.questionInd = self.chatHistory.length - 1; //last question ind in history



    }


    ContextAgent.prototype.findNeighborhoodAlterations = function(proteinName, studyId, callback){
        var self = this;

        var pc2URL = "http://www.pathwaycommons.org/pc2/";
        var format = "graph?format=BINARY_SIF";
        var kind = "&kind=NEIGHBORHOOD";

        var sources = "&source=" + proteinName;

        pc2URL = pc2URL + format + kind + sources;


        if(proteinName)
            self.socket.emit('PCQuery',  pc2URL);


        self.socket.on('PCQueryResult', function(sifData) {
            var neighbors = self.findControllingNeighbors(proteinName, sifData.graph);
        });


        //FIXME
        self.findAlterationFrequencies(neighbors, studyId, function(alterations, callback){

                alterations.sort(function(a, b ){
                        return a.mutationCnt - b.mutationCnt;});
                if(callback) callback(alterations[0]);


            });



    }


    /**
     * Parses a graph in sif format and returns nodes that have edges that control state change
     * @param sifGraph
     * @param proteinName: find the molecule that is different from proteinName
     *
     */
    ContextAgent.prototype.findControllingNeighbors = function(proteinName, sifGraph){
        var lines = sifGraph.split("\n");
        var neighbors = [];


        lines.forEach(function(line){
            var rel = line.split("\t");
            if(rel[1].indexOf("controls") >= 0){
                if(rel[0] == proteinName && neighbors.indexOf(rel[2]) < 0)
                    neighbors.push(rel[2]);
                else if(rel[2] == proteinName && neighbors.indexOf(rel[0]) < 0)
                    neighbors.push(rel[0]);
            }

        });

        return neighbors;
    }

    ContextAgent.prototype.findAlterationFrequencies =  function (neighbors, studyId, callback){

        var alterations = [];
        var self = this;

        neighbors.forEach(function(neighborName) {
            var queryInfo =  {proteinName: neighborName, studyId: studyId, queryType:"alterations"};
            self.sendRequest("agentCBioPortalQueryRequest", queryInfo, function (mutationCnt) {


                alterations.push({neighborName: neighborName, mutationCnt: mutationCnt});

            });

            if(callback) callback(alterations);

        });


    }








