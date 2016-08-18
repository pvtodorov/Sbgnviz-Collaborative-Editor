
    /**
     * Created by durupina on 5/13/16.
     */

    ContextAgent.prototype = new Agent();

    //ContextAgent.prototype.constructor = ContextAgent;

    function ContextAgent(name, id) {

        this.agentName = name;
        this.agentId = id;
        

        this.cancerTypes = [
            {abbr: "ACC", longName:"Adrenocortical carcinoma"},
            {abbr: "BLCA",longName:"Bladder Urothelial Carcinoma"},
            {abbr:"BRCA",longName:"Breast invasive carcinoma"},
            {abbr:"CESC",longName:"Cervical squamous cell carcinoma and endocervical adenocarcinoma"},
            {abbr:"CHOL",longName:"Cholangiocarcinoma"},
            {abbr:"COAD",longName:"Colon adenocarcinoma"},
            {abbr:"COADREAD",longName:"Colorectal cancer"},
            {abbr:"DLBC",longName:"Lymphoid Neoplasm Diffuse Large B-cell Lymphoma"},
            {abbr:"GBM",longName:"Glioblastoma multiforme"},
            {abbr:"GBMLGG",longName:"Glioblastoma multiforme/Brain Lower Grade Glioma"},
            {abbr:"HNSC",longName:"Head and Neck squamous cell carcinoma"},
            {abbr:"KICH",longName:"Kidney Chromophobe"},
            {abbr:"KIPAN",longName:"Pan-Kidney"},
            {abbr:"KIRC",longName:"Kidney renal clear cell carcinoma"},
            {abbr:"KIRP",longName:"Kidney renal papillary cell carcinoma"},
            {abbr:"LAML",longName:"	Acute Myeloid Leukemia"},
            {abbr:"LGG",longName:"Brain Lower Grade Glioma"},
            {abbr:"LIHC",longName:"Liver hepatocellular carcinoma"},
            {abbr:"LUAD",longName:"Lung adenocarcinoma"},
            {abbr:"LUSC",longName:"Lung squamous cell carcinoma"},
            {abbr:"OV",longName:"Ovarian serous cystadenocarcinoma"},
            {abbr:"PAAD",longName:"Pancreatic adenocarcinoma"},
            {abbr:"PCPG",longName:"Pheochromocytoma and Paraganglioma"},
            {abbr:"PRAD",longName:"Prostate adenocarcinoma"},
            {abbr:"READ",longName:"Rectum adenocarcinoma"},
            {abbr:"SARC", longName:"Sarcoma"},
            {abbr:"SKCM", longName:"Skin Cutaneous Melanoma"},
            {abbr:"STAD", longName:"Stomach adenocarcinoma"},
            {abbr:"STES", longName:"Stomach and Esophageal carcinoma"},
            {abbr:"TGCT", longName:"Testicular Germ Cell Tumors"},
            {abbr:"THCA", longName:"Thyroid carcinoma"},
            {abbr:"UCEC", longName:"Uterine Corpus Endometrial Carcinoma"},
            {abbr:"UCS", longName:"Uterine Carcinosarcoma"},
            {abbr:"UVM", longName:"Uveal Melanoma"}];


        this.contextList = []; //cancerType, genes[{importance, interactionRate}], importance, confidence





        this.contextQuestionInd; //for communication through chat

        this.neighborhoodQuestionInd; //for communication through chat
        this.contextInd; //most likely context

        this.importantNeighborName;
        this.importantGeneName;

        this.contextEstablished = false;
    }

    /**
     * Read mutsig analysis data into memory
     */
    ContextAgent.prototype.initCancerGeneInformation = function(cancerType,  fileContent){
        var self = this;
        var context = {cancerType: cancerType, genes:new Object(), relevance:0, confidence:1};


        var genes = fileContent.split("\n").slice(1); //start from the second line


        genes.forEach(function(gene){
            geneInfo = gene.split("\t");
            var pVal = Number(geneInfo[17]);
            var importance = (pVal== 0) ? 100 : -Math.log10(pVal);


            context.genes[geneInfo[1]] = {importance: importance, interactionRate:0};
        });



        self.contextList.push(context);

    }


    ContextAgent.prototype.initContext = function(callback){
        var self = this;

        self.cancerTypes.forEach(function(cancerType){
            readTextFile("TCGA/" + cancerType.abbr +"/scores-mutsig.txt", function(fileContent){
                agent.initCancerGeneInformation(cancerType, fileContent);
            });
        });

        //update each node's contribution by 1
        var nodes = self.getNodeList();
        for(var nodeId in nodes){
            self.updateNodeContribution(nodes[nodeId], 1);
        };

        //update cumulative contributions of nodes for each cancer type
        self.updateContextRelevance(nodes);
        if(callback) callback();

    }



    ContextAgent.prototype.analyzeOperation = function (op, callback) {

        var self = this;

        var nodes = self.getNodeList();
        var edges = self.getEdgeList();

        //if op == delete reduce relevance

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


        self.updateContextRelevance(nodes);
        if(callback) callback();


    }


    /**
     * Increase the contribution of gene "node" in all the contexts by scoreContribution
     * @param node
     * TODO: contribution values to be tweaked
     * @param scoreContribution: User interest score contribution which can be + or -
     */
    ContextAgent.prototype.updateNodeContribution = function(node, relevanceContribution) {
        if (node == null)
            return;
        var self = this;

        //proteins
        if (self.isGene(node)) {
            var geneName = node.sbgnlabel.toUpperCase();

            self.contextList.forEach(function (context) {
                if(context.genes[geneName]!=null) {
                    context.genes[geneName].interactionRate += relevanceContribution;
                    if (context.genes[geneName].interactionRate > 100)
                        context.genes[geneName].interactionRate = 100;

                    if (context.genes[geneName].interactionRate < 0)
                        context.genes[geneName].interactionRate = 0;
                }
            });
        }

    }
    ContextAgent.prototype.isGene = function(node){
        if(node.sbgnlabel && node.sbgnclass && ( (node.sbgnclass.indexOf("macromolecule") > -1 || node.sbgnclass.indexOf("nucleic") > -1 || node.sbgnclass.indexOf("chemical") > -1)))
            return true;
        return false;
    }
    ContextAgent.prototype.updateContextRelevance = function (nodes) {

        var self = this;

        self.contextList.forEach(function (context) {
            var cumRelevance = 0;
            var geneCnt = 0;
            for(var nodeId in nodes){
                var node = nodes[nodeId];

                if(self.isGene(node) && context.genes[node.sbgnlabel.toUpperCase()]){
                    var gene = context.genes[node.sbgnlabel.toUpperCase()];
                    cumRelevance += gene.interactionRate * gene.importance;



                    geneCnt++;
                }
            }

            context.relevance = cumRelevance/geneCnt;




        });
    }

    ContextAgent.prototype.evaluateMessage = function(callback){
        var self = this;
        self.socket.on('message', function(data){


            //FIXME: find a better solution to get human response
            if(data.userId != self.userId) {
                if(self.chatHistory.length  ==  self.contextQuestionInd + 2) {  //means human answered in response to agent's question about cancer type

                    var answer = data.comment;

                    if (answer.toLowerCase().search("ye") > -1) {  //yes
                        //self.contextList[self.contextInd].confidence = 100;
                        self.contextList[self.contextInd].confidence *= 2;

                        var node = self.findMostInterestingNodeInContext(self.contextList[self.contextInd]);


                        self.suggestGenesByNeighborhoodAlterations(node.sbgnlabel.toUpperCase(), self.contextList[self.contextInd], function (neighborName) {

                            self.importantNeighborName = neighborName;
                            self.importantGeneName = node.sbgnlabel.toUpperCase();

                            self.informAboutNeighborhood(node.sbgnlabel.toUpperCase(), neighborName);
                        });

                    }

                    else if (answer.toLowerCase().search("no") > -1) {
                        //self.contextList[self.contextInd].confidence = 0;
                        self.contextList[self.contextInd].confidence *= 0.5;

                    }
                    //else don't do anything


                }
                else if(self.chatHistory.length  ==  self.neighborhoodQuestionInd + 2) {
                    var answer = data.comment;

                    if (answer.toLowerCase().search("ye") > -1)  //yes
                        self.suggestNewGraph(self.importantGeneName, self.importantNeighborName);

                    //else if (answer.toLowerCase().search("no") > -1)
                }


                if(callback) callback();
            }

        });
    }

    ContextAgent.prototype.findMostInterestingNodeInContext = function(context){
        var self = this;
        var maxScore = -100000;
        var bestNode;
        var nodes = self.getNodeList();
        for(var nodeInd in nodes){
            var node = nodes[nodeInd];
            if(self.isGene(node)){
                var gene = context.genes[node.sbgnlabel.toUpperCase()];
                if(gene && gene.importance* gene.interactionRate > maxScore) {
                    maxScore = gene.importance * gene.interactionRate;
                    bestNode = node;
                }

            }
        }

        return bestNode;
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


            //if context changed
            if(!prevContextInd  || (self.contextInd>-1 && prevContextInd!=self.contextInd &&  self.contextList[self.contextInd].cancerType!= self.contextList[prevContextInd].cancerType )) { //only inform if the most likely context has changed

                var context = self.contextList[self.contextInd];
                self.informAboutContext(context);


            }


            var node = self.findMostInterestingNodeInContext(self.contextList[self.contextInd]);


            var prevNeighborName = self.importantNeighborName;
            var prevGeneName = self.importantGeneName;
            if(prevNeighborName!=self.importantNeighborName && prevGeneName!=self.importantGeneName){
                self.suggestGenesByNeighborhoodAlterations(node.sbgnlabel.toUpperCase(), self.contextList[self.contextInd], function (neighborName) {

                    self.importantNeighborName = neighborName;
                    self.importantGeneName = node.sbgnlabel.toUpperCase();


                    self.informAboutNeighborhood(node.sbgnlabel.toUpperCase(), neighborName);
                });
            }


            //send updated contextlist to the server
            self.sendRequest("agentContextUpdate", {param: self.contextList[self.contextInd].cancerType}); //only send the name

            if (callback) callback();
        }); //updates node contribution



    }


    ContextAgent.prototype.printContextList = function(){
        this.contextList.forEach(function(context){
            console.log(context);
        })
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
            if (score> maxScore) {
                maxScore = score;
                maxContextInd = ind;
            }
            ind++;
        });

        return maxContextInd;
    }

    ContextAgent.prototype.informAboutContext = function(context){

        var self = this;

        var agentComment = "The most likely cancer type is  " + context.cancerType.longName + " with a score of " + (context.relevance* context.confidence).toFixed(3);
        agentComment +=". Do you agree?"

        var targets = [];
        for(var i = 0; i < self.userList.length; i++){ //FIXME: send to all the users for now
            targets.push({id: agent.userList[i].userId});
        }


        self.sendMessage(agentComment, targets);

        self.contextQuestionInd = self.chatHistory.length - 1; //last question ind in history


    }

    ContextAgent.prototype.informAboutNeighborhood = function(geneName, neighborName){
        var self = this;

        var agentComment = "The most interesting gene for this cancer type is " + geneName +". " + neighborName + " is another important gene in its neighborhood." +
            "Are you interested in seeing the neighborhood graph?";


        var targets = [];
        for(var i = 0; i < self.userList.length; i++){ //FIXME: send to all the users for now
            targets.push({id: agent.userList[i].userId});
        }


        self.sendMessage(agentComment, targets);

        self.neighborhoodQuestionInd = self.chatHistory.length - 1; //last question ind in history


    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    ContextAgent.prototype.suggestGenesByNeighborhoodAlterations = function(geneName, context, callback){
        var self = this;

        var pc2URL = "http://www.pathwaycommons.org/pc2/";
        var format = "graph?format=BINARY_SIF";
        var kind = "&kind=NEIGHBORHOOD";

        var sources = "&source=" +geneName;

        pc2URL = pc2URL + format + kind + sources;


        if(geneName)
            self.socket.emit('PCQuery',  {url: pc2URL, type:"sif"});



        self.socket.on('PCQueryResult', function(data) {
            if(data.type == "sif"){
                var neighbors = self.findControllingNeighbors(geneName, data.graph);


                var importantNeighborName = self.findMostImportantNeighborInContext(neighbors, context);

                if(callback) callback(importantNeighborName);



            }

        });

    }

    ContextAgent.prototype.suggestNewGraph = function(geneName, importantNeighborName) {

        var self = this;
        var pc2URL = "http://www.pathwaycommons.org/pc2/";
        var format = "graph?format=SBGN";
        var kind = "&kind=PATHSBETWEEN";
        var limit = "&limit=2";

        var sources = "&source=" + geneName + "&source=" + importantNeighborName;

        pc2URL = pc2URL + format + kind + limit + sources;
        console.log(pc2URL);
        self.socket.emit('PCQuery', {url: pc2URL, type: "sbgn"});


        self.socket.on('PCQueryResult', function (data) {
            if (data.type = "sbgn") {
                self.sendRequest("agentMergeGraphRequest", {param: data.graph});
            }



        });
    }


    /**
     * Parses a graph in sif format and returns nodes that have edges that control state change
     * @param sifGraph
     * @param proteinName: find the molecule that is different from proteinName
     *
     */
    ContextAgent.prototype.findControllingNeighbors = function(geneName, sifGraph){
        var lines = sifGraph.split("\n");
        var neighbors = [];


        lines.forEach(function(line){

            var rel = line.split("\t");

            if(rel[1].indexOf("controls") >= 0){
                if(rel[0] == geneName && neighbors.indexOf(rel[2]) < 0)
                    neighbors.push(rel[2]);
                else if(rel[2] == geneName && neighbors.indexOf(rel[0]) < 0)
                    neighbors.push(rel[0]);
            }

        });



        return neighbors;
    }


    ContextAgent.prototype.findMostImportantNeighborInContext =  function (neighbors, context){

        var importantNeighbor;
        var self = this;

        const MIN_IMPORTANCE  = 2;
        var maxScore = -100000;

        neighbors.forEach(function(neighborName) {
            if (context.genes[neighborName] && context.genes[neighborName].importance > MIN_IMPORTANCE && context.genes[neighborName].importance > maxScore) {
                maxScore = context.genes[neighborName].importance;
                importantNeighbor = neighborName;
            }
        });



        return importantNeighbor;
    }








