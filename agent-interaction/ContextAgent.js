
    /**
     * Created by durupina on 5/13/16.
     */

    ContextAgent.prototype = new Agent();

    //ContextAgent.prototype.constructor = ContextAgent;

    function ContextAgent(name, id) {

        this.agentName = name;
        this.agentId = id;
        


        this.contextList = []; //contextName, proteinName, interactionScore, relevance, confidence


        this.CONFIDENCE_THRESHOLD = 5;

        this.RELEVANCE_THRESHOLD = 0.5; //over 5%
    }

    ContextAgent.prototype.initContext = function(){
        if(this.pageDoc.context!=null)
            this.contextList = this.pageDoc.context;
    }



    ContextAgent.prototype.analyzeOperation = function (op) {

        var self = this;
        
        var nodes = self.getNodeList();
        var edges = self.getEdgeList();

        //if op == delete reduce score

        if(op.elId!=null) {
            if(op.elType == "node") {
                var node = nodes[op.elId];
                if(op.opName == "add")
                    self.updateNodeContribution(node, 1);
                else if(op.opName == "delete")
                    self.updateNodeContribution(node, -1);
                else
                    self.updateNodeContribution(node, 1);

            }
            else if(op.elType == "edge") {


                if(op.opName == "add"){
                    var sourceNode = edges[op.param.source];
                    var targetNode = edges[op.param.target];

                    self.updateNodeContribution(sourceNode, 1);
                    self.updateNodeContribution(targetNode, 1);
                }
                else if(op.opName == "delete"){
                    if(op.param != null && op.param.source!= null &&  op.param.target!= null) {
                        var sourceNode = edges[op.param.source];
                        var targetNode = edges[op.param.target];
                        self.updateNodeContribution(sourceNode, -1);
                        self.updateNodeContribution(targetNode, -1);
                    }
                }
            }

            else if( op.opName == "set") //treat them as a list

                op.elId.forEach(function (el) {
                    if (el.isNode) {
                        self.updateNodeContribution(nodes[el.id], 1);
                    }
                    else{
                        self.updateNodeContribution(edges[el.source], 1);
                        self.updateNodeContribution(edges[el.target], 1);
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
    ContextAgent.prototype.updateNodeContribution = function(node, scoreContribution){
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
                    context.interactionScore += scoreContribution;
                    console.log(context.interactionScore);
                }

            });
            if(!exists){
                //call portal query to update context related to the protein
                //get all the context data
                this.sendRequest("agentCBioPortalQueryRequest", proteinName, function(cancerData){
                    self.sortMutationRates(cancerData);
                    //        self.printMutationData(cancerData);


                    for(var ind = 0; ind < cancerData.length; ind++){
                        var data = cancerData[ind];
                        var relevance = data.mutationCaseIds.length / data.seqCaseCnt;
                        if(relevance >= self.RELEVANCE_THRESHOLD) { //no need to push the ones with smaller scores
                            self.contextList.push({
                                proteinName: proteinName,
                                interactionScore: scoreContribution,
                                relevance: relevance, //relevance value returned by the portal query
                                confidence: 1,
                                contextName: data.name

                            });
                        }
                        else
                            break; //no need to go further as this is a sorted list

                    };
                });

            }
        }
    }

    /**
     * Update context scores at each operation
     * @param op
     */
    ContextAgent.prototype.updateContext = function(op){
        var self = this;
        self.analyzeOperation(op); //updates node contribution


        var context = self.findBestContext();

        if(context!=null)
            self.informAboutContext(context);


            //send updated contextlist to the server
            //TODO: update only when contextList is updated
            self.sendRequest("agentContextUpdate", {param:self.contextList});

    }
    //
    // ContextAgent.prototype.findHighestScoreProteinInd = function(){
    //     var self = this;
    //     var maxRel = -100000;
    //     var maxProteinInd = -1;
    //     for(var i = 0; i < self.contextList.length; i++){
    //         var protein = self.proteinList[i];
    //         if(protein.score > maxRel){
    //             maxRel = protein.score;
    //             maxProteinInd = i;
    //         }
    //     }
    //     return maxProteinInd;
    // }
    //


    ContextAgent.prototype.printMutationData = function(cancerData){
        cancerData.forEach(function(study) {
            if(study.seqCaseCnt > 0)
                console.log(study.id +  ": %"+  (study.mutationCaseIds.length*100/study.seqCaseCnt));

        });
    }

    /**
     * Sort cancerData according to mutation rates
     * @param cancerData
     */
    ContextAgent.prototype.sortMutationRates = function(cancerData) {
        cancerData.sort(function(a, b){
            var aRate = a.seqCaseCnt==0 ? 0: (a.mutationCaseIds.length/a.seqCaseCnt);
            var bRate = b.seqCaseCnt==0 ? 0: (b.mutationCaseIds.length/b.seqCaseCnt);
            return bRate - aRate; //descending order
        });
    }
    ContextAgent.prototype.findBestContext = function(){
        var self = this;
        var likelyContext;

        var maxScore = - 100000;
        var maxContext = null;
        self.contextList.forEach(function(context){
            var score = context.relevance * (context.confidence + context.interactionScore);
            if (score > maxScore) {
                maxScore = score;
                maxContext = context;
            }
        });

        return maxContext;
    }

    ContextAgent.prototype.informAboutContext = function(context){

        var self = this;

        var agentComment = "The most likely context is  " + context.name + " with %" + (context.relevance.toFixed(2));
        agentComment += ". Do you agree with this?";
        var targets = [];
        for(var i = 0; i < self.userList.length; i++){ //FIXME: send to all the users for now
            targets.push({id: agent.userList[i].userId});
        }

        self.sendMessage(agentComment, targets);
        //console.log(self.chatHistory[self.chatHistory.length -1 ]);

    }






    // /**
    //  * Request the query about protein information and update protein info in proteinList
    //  * @param proteinInd
    //  */
    // ContextAgent.prototype.requestMutationQuery = function(proteinInd){
    //     var self = this;
    //
    //     this.sendRequest("agentCBioPortalQueryRequest", self.proteinList[proteinInd].name, function(cancerData){
    //         self.sortMutationRates(cancerData);
    // //        self.printMutationData(cancerData);
    //
    //         var relevance = cancerData[0].mutationCaseIds.length / cancerData[0].seqCaseCnt;
    //         self.proteinList[proteinInd].relevance = relevance;
    //         self.proteinList[proteinInd].contextName = cancerData[0].name;
    //
    //         self.updateContextList(cancerData[0].name, relevance, 1); //don't change relevance, just increment confidence
    //
    //
    //
    //     });
    //
    // }
    //
    // /**
    //  *
    //  * @param name
    //  * @param relevance : context relevance percentage found from portal
    //  * @param confContribution: to be added to the confidence
    //  */
    // ContextAgent.prototype.updateContextList = function(name, relevance, confContribution ){
    //
    //     var self = this;
    //     var ind = self.contextList.findIndex(function(context){
    //         return(context.name == name);
    //     });
    //
    //     if(ind  < 0)
    //         self.contextList.push({name: name, relevance: relevance, confidence:confContribution});
    //     else {
    //         self.contextList[ind].relevance = relevance;
    //         self.contextList[ind].confidence += confContribution ;
    //     }
    //
    // }





    // ContextAgent.prototype.evaluateAnswer = function(contextName, answer){
    //     if(answer.toLowerCase().search("ye") > -1 ) { //yes
    //
    //         self.updateContextList(contextName, 0, 3); //don't change relevance, just increase confidence by 3
    //
    //         self.contextList.put(contextName, {
    //             relevance: contextName.relevance,
    //             confidence: (contextValue.confidence + 3)
    //         })
    //     }
    //     else if (answer.toLowerCase().search("no")> -1)
    //         self.updateContextList(contextName, 0, -3); //don't change relevance, just decrease confidence by 3
    //
    //     //else don't change confidence
    // }