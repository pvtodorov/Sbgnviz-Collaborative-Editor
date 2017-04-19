
/**
 * Created by durupina on 5/13/16.
 */

CausalityAgent.prototype = new Agent();

//CausalityAgent.prototype.constructor = CausalityAgent;

function CausalityAgent(name, id) {

    this.agentName = name;
    this.agentId = id;

    this.pnnl = [];
    this.causative = [];


}


CausalityAgent.prototype.init = function(){
    //this.readPNNLData();
    this.readCausative();

 //   console.log(this.pnnl[0]);
    console.log(this.causative[0]);


}
/**
 * Read pnnl analysis data into memory
 */
CausalityAgent.prototype.readPNNLData = function(){
    var self = this;


    readTextFile("CausalPath/PNNL-ovarian-correlations.txt", function (fileContent) {
        var correlations = fileContent.split("\n").slice(1); //start from the second line

        correlations.forEach(function(line){
            var vals = line.split("\t");
            self.pnnl.push({id1: vals[0], id2: vals[1], correlation: vals[2], pVal: vals[3]});
        });
    });
}

/**
 * Read causal relationships into memory
 */
CausalityAgent.prototype.readCausative = function(){
    var self = this;


    readTextFile("CausalPath/causative.sif", function (fileContent) {
        var causalRels = fileContent.split("\n").slice(1); //start from the second line

        causalRels.forEach(function(line){
            var vals = line.split("\t");
            self.causative.push({id1: vals[0], relationship: vals[1], id2: vals[2], uri: vals[3]});
        });
    });
}
