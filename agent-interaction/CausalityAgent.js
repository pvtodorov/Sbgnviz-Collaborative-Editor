
/**
 * Created by durupina on 5/13/16.
 * Computer agent with the purpose of creating a model of causal relationships in ovarian cancer data
 */

CausalityAgent.prototype = new Agent();


function CausalityAgent(name, id) {
    this.agentName = name;
    this.agentId = id;

    this.pnnl = {}; //
    this.causality = {};
    this.allSifRelations = {};

}
/***
 *
 */
CausalityAgent.prototype.init = function(){

    var self = this;
    var sifFilePath = "./CausalPath/PC.sif";
    var causalityFilePath = "./CausalPath/causative.sif";

    self.sendMessage({text:"Please wait while I am loading the phosphoproteomics dataset from PNNL."}, "*");


    //Clean the sbgnviz canvas
    this.sendRequest('agentNewFileRequest');



    //Read pnnl data from the server
    this.sendRequest('agentPNLLRequest', null, function(pnnlList){
        self.pnnl = pnnlList;
        console.log("Pnnl data received");
        self.sendMessage({text:"Let’s build a pathway model for ovarian cancer using the phosphoproteomics dataset from PNNL."}, "*");

        self.listenToMessages();


    });


    this.readAllSifRelations(sifFilePath);

    this.readCausality(causalityFilePath);

}

/***
 * Read the binary directed relationships between genes and store them in this.allSifRelations
 * @param sifFilePath: path to PC.sif
 */
CausalityAgent.prototype.readAllSifRelations = function(sifFilePath){
    var self = this;

    readTextFile(sifFilePath, function (fileContent) {
        var sifRels = fileContent.split("\n");

        sifRels.forEach(function(line){

            var vals = line.split("\t");
            var id1 = vals[2].toUpperCase(); //opposite order because of upstream checking
            var id2 = vals[0].toUpperCase();
            var rel = vals[1];



            if(self.allSifRelations[id1])
                self.allSifRelations[id1].push({rel:rel, id2: id2});
            else
                self.allSifRelations[id1] = [{rel:rel, id2: id2}];
        });
    });



}

/**
 * Read causal relationships and their PC links and store them in this.causality
 * * @param causalityFilePath: path to causative.sif
 */
CausalityAgent.prototype.readCausality = function(causalityFilePath){
    var self = this;


    readTextFile(causalityFilePath, function (fileContent) {
        var causalRels = fileContent.split("\n").slice(1); //start from the second line

        causalRels.forEach(function(line){
            var vals = line.split("\t");
            var id1 = vals[0].toUpperCase();
            var id2 = vals[2].toUpperCase();

            var uriArr = [];


            if(vals[3]) {
                uriArr = vals[3].split(" ");

                if (!uriArr)
                    uriArr = [vals[3]];
            }

            var uriStr = "";
            uriArr.forEach(function(uri){
                uriStr += "uri= " + uri +"&"
            });



            if(self.causality[id1])
                self.causality[id1].push({rel: vals[1], id2: id2, uriStr: uriStr});
            else
                self.causality[id1] = [{rel: vals[1], id2: id2, uriStr: uriStr}];

            if(self.causality[id2])
                self.causality[id2].push({rel: vals[1], id2: id1, uriStr: uriStr});
            else
                self.causality[id2] = [{rel: vals[1], id2: id1, uriStr: uriStr}];
        });

    });
}


/***
 * Listen to messages from other actors and act accordingly
 * @param callback
 */
CausalityAgent.prototype.listenToMessages = function(callback){
    var self = this;
    this.socket.on('message', function(data){
        if(data.userId != self.agentId) {
            //convert every word to upper case and remove punctuation
            var sentence = (data.comment.text.toUpperCase()).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
            var words = sentence.split(' ');
            var gene = self.findRelevantGeneFromSentence(words);
            if(gene)
                self.performAction(gene, callback);
        }
    });
}

/***
 * Respond to queries from other actors to find explainable relationships around gene
 * @param gene: gene name
 * @param callback
 */
CausalityAgent.prototype.performAction = function(gene, callback){

    var self = this;
    var indCausal = -1;
    var indCorr = -1;
    var maxCorr = -1000;

    if(self.causality[gene]) { //gene has causal relationships
        for (var j = 0; j < self.pnnl[gene].length; j++) {
            var geneCorr = self.pnnl[gene][j].id2.split('-')[0];

            for (var i = 0; i < self.causality[gene].length; i++) {
                var geneCausal = self.causality[gene][i].id2;
                if (geneCausal === geneCorr && self.pnnl[gene][j].correlation > maxCorr) {
                    indCausal = i;
                    indCorr = j;
                    maxCorr = self.pnnl[gene][j].correlation;
                }
            }
        }
    }

    if (indCausal > -1){
        agentMsg = "The largest explainable correlation about  " + gene + " is the correlation with " + self.pnnl[gene][indCorr].id2 + " with a value of " + maxCorr + ". ";
        self.showCausality(gene, indCausal, callback);
        agentMsg += gene + " " + self.causality[gene][indCausal].rel + " " + self.causality[gene][indCausal].id2 + "; and here's it's graph.";


    }
    else { //no causal explanation around gene

        agentMsg = "I can't find any causal relationships about " + gene + ". ";

        var corr = self.pnnl[gene][0].correlation; //self.pnnl[gene] is sorted so take the first element
        if(corr)
            agentMsg += "But it has the highest correlation with " + self.pnnl[gene][0].id2 + " in PNNL data. ";

        //Search common upstreams of gene and its correlated
        var commonUpstreams = self.findCommonUpstreams(gene, self.pnnl[gene][0].id2.split('-')[0]);
        if (commonUpstreams) {
            var upstreamStr = "";
            for(var i = 0; i < commonUpstreams.length; i++)
                upstreamStr += commonUpstreams[i] + " ";

            if(upstreamStr){

                if(commonUpstreams.length === 1)
                    agentMsg += " They have a common upstream " + upstreamStr + ". Does that make sense?";
                else
                    agentMsg += " They have common upstreams " + upstreamStr + ". Do any of these make sense?";

            }
        }


    }
    self.sendMessage({text: agentMsg}, "*", function () {
            if (callback) callback();
        });




}

/***
 * Send a PC query for the relationship between gene and its most correlated causal neighbor
 * @param gene
 * @param ind: Index of the highest correlated causal neighbor
 * @param callback
 */

CausalityAgent.prototype.showCausality = function(gene, ind, callback){
    var self = this;


    var geneRelationshipArr = self.causality[gene];

    if(geneRelationshipArr[ind].uriStr.length >0) {

        self.mergePCQuery(geneRelationshipArr[ind].uriStr, function (result) {
            if (ind >= geneRelationshipArr.length - 1 && callback)
                callback();

        });
    }

}

/***
 * Send PC query and merge with the current graph
 * @param uriStr
 * @param callback
 */

CausalityAgent.prototype.mergePCQuery = function(uriStr, callback){
    var pc2URL = "http://www.pathwaycommons.org/pc2/get?";
    var format = "format=SBGN";

    pc2URL = pc2URL + uriStr + format;

    this.socket.emit('MergePCQuery', {url: pc2URL, type: "sbgn"}, function(data){
        if(callback) callback(data);
    });

}




/***
 * @param gene1
 * @param gene2
 * @returns An array of names of common upstream genes for gene1 and gene2
 */
CausalityAgent.prototype.findCommonUpstreams = function(gene1, gene2){

    var gene1Rels = this.allSifRelations[gene1];
    var gene2Rels = this.allSifRelations[gene2];
    var upstreams = [];

    if(!gene1Rels || !gene2Rels)
        return upstreams;

    for(var i = 0; i < gene1Rels.length; i++) {
        if(gene1Rels[i].rel === "controls-state-change-of"){
            for (var j = 0; j < gene2Rels.length; j++) {
                if(gene2Rels[j].rel === "controls-state-change-of" && gene1Rels[i].id2 === gene2Rels[j].id2){
                    upstreams.push(gene1Rels[i].id2);
                }
            }
        }
    }

    return upstreams;
}

/***
 * @param words: sentence organized as a words array
 * @returns An array of gene names in a sentence
 */

CausalityAgent.prototype.findRelevantGeneFromSentence = function(words){
    var self = this;
    var gene;

    words.forEach(function(word){
        if(self.pnnl[word]!=null){
            gene = word;
        }
    });

    return gene;
}


/***
 * Temporary method to find genes that don't have causal relationship but have a common upstream and high correlation
 */
CausalityAgent.prototype.findDemoGenes = function(){
    var self = this;
    var commonGenes = [];

    for(var gene in self.pnnl){
        if(!self.causality[gene]){
                var upstreams = self.findCommonUpstreams(gene, self.pnnl[gene][0].id2);
                if(upstreams && upstreams.length > 0) {
                    commonGenes.push(gene + "\t" + self.pnnl[gene][0].id2 +"\n");
                }
        }
    }
    saveFile(commonGenes, "./CausalPath/noncausal.txt", "txt");
}