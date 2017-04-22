
/**
 * Created by durupina on 5/13/16.
 */

CausalityAgent.prototype = new Agent();

//CausalityAgent.prototype.constructor = CausalityAgent;

function CausalityAgent(name, id) {

    this.agentName = name;
    this.agentId = id;

    this.pnnl = {};
    this.causality = {};


}


CausalityAgent.prototype.init = function(){

    var self = this;

    this.sendRequest('agentNewFileRequest', null, function(){

    });



    this.sendRequest('agentPNLLRequest', null, function(pnnlList){
        self.pnnl = pnnlList;
        console.log("Pnnl data received");
    });


    this.readCausality();


    self.sendMessage("Let’s build a pathway model for ovarian cancer using the phosphoproteomics dataset from PNNL.", "*", function() {

    });






    self.listenToMessages(function(val){
        console.log(val);
    });


}

/**
 * Read causal relationships into memory
 */
CausalityAgent.prototype.readCausality = function(){
    var self = this;


    readTextFile("./CausalPath/causative.sif", function (fileContent) {
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
                self.causality[id1].push({relationship: vals[1], id2: id2, uriStr: uriStr});
            else
                self.causality[id1] = [{relationship: vals[1], id2: id2, uriStr: uriStr}];

            if(self.causality[id2])
                self.causality[id2].push({relationship: vals[1], id2: id1, uriStr: uriStr});
            else
                self.causality[id2] = [{relationship: vals[1], id2: id1, uriStr: uriStr}];
        });

        console.log("Reading causality data complete");
    });
}

CausalityAgent.prototype.showCausality = function(geneName, callback){
    var self = this;


    var geneRelationshipArr = self.causality[geneName];


    if(geneRelationshipArr) {


        for(var i = 0; i< geneRelationshipArr.length; i++) {


            (function(ind){

                if(geneRelationshipArr[ind].uriStr.length >0) {

                        self.mergePCQuery(geneRelationshipArr[ind].uriStr, function (result) {
                            if(ind >= geneRelationshipArr.length - 1 && callback)
                                callback();

                        });
                }

            })(i);
        }

    }
}


CausalityAgent.prototype.mergePCQuery = function(uriStr, callback){
    var self = this;
    var pc2URL = "http://www.pathwaycommons.org/pc2/get?";
    var format = "format=SBGN";

    pc2URL = pc2URL + uriStr + format;

    self.socket.emit('MergePCQuery', {url: pc2URL, type: "sbgn"}, function(data){
        if(callback) callback(data);
    });

}

/***
 * Comments should always end with punctuation
 * @param callback
 */
CausalityAgent.prototype.listenToMessages = function(callback){
    var self = this;
    this.socket.on('message', function(data){
        var comment = data.comment.toUpperCase();
        if(data.userId != self.agentId) {
            var sentence = comment.slice(0, comment.length-1);
           self.evaluateSentence(sentence, callback);
        }
    });
}

CausalityAgent.prototype.evaluateSentence = function(sentence, callback){

    var self = this;
    var words = sentence.split(' ');

    var geneName = self.findRelevantGeneFromSentence(words);

    if(geneName){

        var corr;
        if(self.pnnl[geneName])
            corr = self.pnnl[geneName][0].correlation;
        var agentMsg = "Here are the causal relationships about " + geneName + ". ";

        if(corr) agentMsg+= " The largest explainable correlation about  " + geneName + " is the correlation with "+ self.pnnl[geneName][0].id2  + " with a value of " + corr;
        self.sendMessage(agentMsg, "*", function(){
            if(callback) callback();
        });


        self.showCausality(geneName, callback);


    }



}
CausalityAgent.prototype.findRelevantGeneFromSentence = function(words){
    var self = this;

    var gene;
    words.forEach(function(word){
        if(self.causality[word]!=null){
            gene = word;
        }

    });

    return gene;
}
