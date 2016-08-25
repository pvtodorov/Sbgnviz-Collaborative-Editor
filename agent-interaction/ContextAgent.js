
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


        this.contextList = []; //cancerType, genes[{importance, interactionCount}], importance, confidence





        this.contextQuestionInd; //for communication through chat

        this.neighborhoodQuestionInd; //for communication through chat
        this.contextInd; //most likely context

        this.mostImportantNeighborName;
        this.mostImportantGeneName;

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
            var geneInfo = gene.split("\t");
            var pVal = Number(geneInfo[17]);
            var importance = (pVal== 0) ? 100 : -Math.log10(pVal);


            context.genes[geneInfo[1]] = {importance: importance};


        });



        self.contextList.push(context);

    }


    ContextAgent.prototype.initContext = function(callback){
        var self = this;


        self.cancerTypes.forEach(function(cancerType){
            readTextFile("TCGA/" + cancerType.abbr +"/scores-mutsig.txt", function(fileContent){
                self.initCancerGeneInformation(cancerType, fileContent);
            });
        });

        //update each node's contribution by 1
        var nodes = self.getNodeList();



        //update cumulative contributions of nodes for each cancer type
        self.updateContextRelevance(nodes);
        if(callback) callback();

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
                    cumRelevance += node.interactionCount * gene.importance;



                    geneCnt++;
                }
            }

            if(geneCnt > 0)
                context.relevance = cumRelevance/geneCnt;
            else
                context.relevance = 0;





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

                        var node = self.findMostImportantNodeInContext(self.getNodeList(), self.contextList[self.contextInd]);


                        if(node) {
                            self.findMostImportantNeighborInContext(node.sbgnlabel.toUpperCase(), self.contextList[self.contextInd], function (neighborName) {


                                self.mostImportantNeighborName = neighborName;
                                self.mostImportantGeneName = node.sbgnlabel.toUpperCase();

                                self.informAboutNeighborhood(node.sbgnlabel.toUpperCase(), neighborName);
                            });
                        }

                    }

                    else if (answer.toLowerCase().search("n") > -1) {
                        //self.contextList[self.contextInd].confidence = 0;
                        self.contextList[self.contextInd].confidence *= 0.5;

                    }
                    //else don't do anything


                }
                else if(self.chatHistory.length  ==  self.neighborhoodQuestionInd + 2) {
                    var answer = data.comment;

                    if (answer.toLowerCase().search("ye") > -1)  //yes
                        self.suggestNewGraph(self.mostImportantGeneName, self.mostImportantNeighborName);

                    //else if (answer.toLowerCase().search("no") > -1)
                }


                if(callback) callback();
            }

        });
    }

    ContextAgent.prototype.findMostImportantNodeInContext = function(nodes, context){
        var self = this;
        var maxScore = -100000;
        var bestNode;
        for(var nodeInd in nodes){
            var node = nodes[nodeInd];

           // console.log(node.interactionCount);
            if(self.isGene(node)){
                var gene = context.genes[node.sbgnlabel.toUpperCase()];
                if(gene && gene.importance* node.interactionCount > maxScore) {
                    maxScore = gene.importance * node.interactionCount;
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
    ContextAgent.prototype.updateContext = function( callback){
        var self = this;
        var nodes = self.getNodeList(); //this is called after nodes are updated

        self.updateContextRelevance(nodes);

        var prevContextInd = self.contextInd;
        self.contextInd = self.findBestContext();


        //if context changed
        if(!prevContextInd  || (self.contextInd>-1 && prevContextInd!=self.contextInd &&  self.contextList[self.contextInd].cancerType!= self.contextList[prevContextInd].cancerType )) { //only inform if the most likely context has changed

            var context = self.contextList[self.contextInd];
            self.informAboutContext(context);


        }


        //update most important node and its neighbor
        var node = self.findMostImportantNodeInContext(nodes, self.contextList[self.contextInd]);
        if(node) {

            var prevNeighborName = self.mostImportantNeighborName;
            var prevGeneName = self.mostImportantGeneName;
            if (prevNeighborName != self.mostImportantNeighborName && prevGeneName != self.mostImportantGeneName) {
                self.findMostImportantNeighborInContext(node.sbgnlabel.toUpperCase(), self.contextList[self.contextInd], function (neighborName) {

                    self.mostImportantNeighborName = neighborName;
                    self.mostImportantGeneName = node.sbgnlabel.toUpperCase();


                    self.informAboutNeighborhood(node.sbgnlabel.toUpperCase(), neighborName);
                });
            }
        }

        self.sendRequest("agentContextUpdate", {param: {cancerType: self.contextList[self.contextInd].cancerType, geneName: self.mostImportantGeneName,
        neighborName: self.mostImportantNeighborName}}); //only send the names of most important values

        if (callback) callback();




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

        var agentComment =   neighborName + " is another important gene in the neighborhood of " + geneName +
            ". Are you interested in seeing the neighborhood graph?";





        self.sendMessage(agentComment,"*"); //send all

        self.neighborhoodQuestionInd = self.chatHistory.length - 1; //last question ind in history


    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    ContextAgent.prototype.isInModel = function(geneName){
        var self = this;

        var nodes = self.getNodeList();

        for(var nodeInd in nodes){
            if(self.isGene(nodes[nodeInd]))
            if(nodes[nodeInd].sbgnlabel.toUpperCase() == geneName.toUpperCase())
                return true;
        }

        return false;
    }


    ContextAgent.prototype.findMostImportantNeighborInContext = function(geneName, context, callback){
        var self = this;

        var pc2URL = "http://www.pathwaycommons.org/pc2/";
        var format = "graph?format=BINARY_SIF";
        var kind = "&kind=NEIGHBORHOOD";

        var sources = "&source=" +geneName;

        pc2URL = pc2URL + format + kind + sources;


        if(geneName) {
            self.socket.emit('PCQuery', {url: pc2URL, type: "sif"});
            self.sendMessage("The most important gene  in your network for this cancer type is " + geneName +". I'm looking up its neighborhood alterations...", "*");
        }



        self.socket.on('PCQueryResult', function(data) {
            if(data.type == "sif"){
                var neighbors = self.findAllControllingNeighbors(geneName, data.graph);


                var importantNeighborName;
                const MIN_IMPORTANCE  = 2; //p-value of 0.01
                var maxScore = -100000;

                neighbors.forEach(function(neighborName) {
                    if (!self.isInModel(neighborName) && context.genes[neighborName] && context.genes[neighborName].importance > MIN_IMPORTANCE && context.genes[neighborName].importance > maxScore) {

                        maxScore = context.genes[neighborName].importance;
                        importantNeighborName = neighborName;
                    }
                });


                if(callback && importantNeighborName)
                    callback(importantNeighborName);
                else
                    console.log("No important neighbors");


            }

        });

    }

    ContextAgent.prototype.suggestNewGraph = function(geneName, importantNeighborName) {

        var self = this;
        var pc2URL = "http://www.pathwaycommons.org/pc2/";
        var format = "graph?format=SBGN";
        var kind = "&kind=PATHSBETWEEN";
        var limit = "&limit=1";

        var sources = "&source=" + geneName + "&source=" + importantNeighborName;

        pc2URL = pc2URL + format + kind + limit + sources;

        self.socket.emit('PCQuery', {url: pc2URL, type: "sbgn"});


        self.socket.on('PCQueryResult', function (data) {
            if (data.type = "sbgn") {
                //if neighbor does not appear in the new graph, call the query with limit = 2
                // if(limit.indexOf("=1")>-1 && data.graph.indexOf(importantNeighborName)<0){
                //     limit = "&limit=2";
                //     pc2URL = "http://www.pathwaycommons.org/pc2/" + format + kind + limit + sources;
                //     self.socket.emit('PCQuery', {url: pc2URL, type: "sbgn"});
                // }
                // else {
                    self.sendRequest("agentMergeGraphRequest", {param: data.graph});
                // }
            }

        });
    }


    /**
     * Parses a graph in sif format and returns nodes that have edges that control state change
     * @param sifGraph
     * @param geneName: find the molecule that is different from geneName
     *
     */
    ContextAgent.prototype.findAllControllingNeighbors = function(geneName, sifGraph){
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







