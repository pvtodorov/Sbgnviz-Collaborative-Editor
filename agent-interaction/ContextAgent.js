
    /**
     * Created by durupina on 5/13/16.
     */

    ContextAgent.prototype = new Agent();

    //ContextAgent.prototype.constructor = ContextAgent;

    function ContextAgent(name, id) {

        this.agentName = name;
        this.agentId = id;
        

        this.proteinList = new HashMap();

        this.contextList = new HashMap();

        this.CONFIDENCE_THRESHOLD = 5;

        this.RELEVANCE_THRESHOLD = 0.5; //over 50%
    }

    ContextAgent.prototype.findMostRelevantProtein = function(){
        var self = this;
        var maxRel = -100000;
        var proteinName = "";
        for(var att in self.proteinList._dict){
            var proteinScore = self.proteinList._dict[att];
            if(proteinScore > maxRel){
                maxRel = proteinScore;
                proteinName = att;
            }
        }
        return proteinName;
    }

    /**
     * Increase the contribution of protein "node" in proteinList by relVal
     * @param node
     * TODO: contribution values to be tweaked
     * @param relevanceContribution: Relevance contribution which can be + or -
     */
    ContextAgent.prototype.updateNodeContribution = function(node, relevanceContribution){
        if(node == null)
            return;
        var self = this;

        //proteins
        if(node.sbgnlabel && node.sbgnclass && ( (node.sbgnclass.indexOf("macromolecule")>-1 || node.sbgnclass.indexOf("nucleic")>-1 || node.sbgnclass.indexOf("chemical")>-1))){
            var proteinName = node.sbgnlabel;
            // var proteins = self.proteinList.filter(function(name){
            //     return name == proteinName;
            // });
            var proteinScore = self.proteinList.get(proteinName);
            if (proteinScore)
                self.proteinList.put(proteinName,(proteinScore + relevanceContribution));
            else
                self.proteinList.put(proteinName,  relevanceContribution);

        }
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

            else if( op.opName== "set") //treat them as a list

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

    ContextAgent.prototype.analyzeOperationHistory = function(){
        var self = this;

        self.opHistory.forEach(function(op){
            self.analyzeOperation(op);
        })
    }

    ContextAgent.prototype.analyzeGraph = function(){
        var self = this;
        var nodes = self.getNodeList();
        for(var att in nodes){
            if(nodes.hasOwnProperty(att)) {
                self.updateNodeContribution(nodes[att], 1);
            }

        };
    }



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
    ContextAgent.prototype.evaluateContext = function(){
        var self = this;
        var likelyContext;

        var maxRelConf = - 100000;
        var contextName = "";
        for(var att in self.contextList._dict){
            if(self.contextList._dict.hasOwnProperty(att)){
                var rel = self.contextList._dict[att].relevance;
                if(rel > 0.5) {
                    var conf = self.contextList._dict[att].confidence;
                    var relConf = rel * conf;
                    if (relConf > maxRelConf) {
                        maxRelConf = relConf;
                        contextName = att;
                    }
                }
            }
        }

        return contextName;
    }

    ContextAgent.prototype.informAboutContext = function(contextName){

        var self = this;

        var contextValue = self.contextList.get(contextName);
        if(contextValue == null)
            return;
        var agentComment = "The most likely context is  " + contextName + " with %" + (contextValue.relevance.toFixed(2));
        agentComment += ". Do you agree with this?"
        var targets = [];
        for(var i = 0; i < self.userList.length; i++){ //FIXME: send to all the users for now
            targets.push({id: agent.userList[i].userId});
        }

        self.sendMessage(agentComment, targets, function(answer){
            console.log(answer);
            if(answer.toLowerCase().search("ye") > -1 ) //yes
                self.contextList.put(contextName, {relevance:contextValue.relevance, confidence: (contextValue.confidence + 3)})
            else if (answer.toLowerCase().search("no")> -1)
                self.contextList.put(contextName, {relevance:contextValue.relevance, confidence: ((contextValue.confidence - 3)<0 ? 0 : (contextValue.confidence-3))});
            //else don't change confidence

        });
    }


    ContextAgent.prototype.updateContext = function(op){
        this.analyzeOperation(op);
        var proteinName = this.findMostRelevantProtein();
        this.evaluateContext();
        this.requestMutationQuery(proteinName);
        var contextName = this.evaluateContext();

        if(contextName!=null)
            this.informAboutContext(contextName);
    }
    
    ContextAgent.prototype.requestMutationQuery = function(proteinName){
        var self = this;
        this.sendRequest("agentCBioPortalQueryRequest", proteinName, function(cancerData){
            self.sortMutationRates(cancerData);
    //        self.printMutationData(cancerData);

            var relevance = cancerData[0].mutationCaseIds.length / cancerData[0].seqCaseCnt;


            var contextValue = self.contextList.get(cancerData[0].name);
            if(contextValue == null)
                self.contextList.put(cancerData[0].name, {relevance: relevance, confidence:1});
            else
                self.contextList.put(cancerData[0].name, {relevance: relevance, confidence:(contextValue.confidence+1)});


        });

    }

    



