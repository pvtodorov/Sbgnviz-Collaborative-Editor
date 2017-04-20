
/**
 * Created by durupina on 5/13/16.
 */

CausalityAgent.prototype = new Agent();

//CausalityAgent.prototype.constructor = CausalityAgent;

function CausalityAgent(name, id) {

    this.agentName = name;
    this.agentId = id;

    this.pnnl = [];
    this.causality = [];


}


CausalityAgent.prototype.init = function(){

    var self = this;

    this.readCausality();

    //
    // this.sendRequest('agentPNLLRequest', null, function(pnnlArr){
    //     self.pnnl = pnnlArr;
    //     console.log("Pnnl data received");
    // });

    self.showCausality(["RPS6KA3"]);


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
            var id1 = vals[0];
            var id2 = vals[2];
            var uriArr = [];

            if(vals[3]) {
                uriArr = vals[3].split(" ");

                if (!uriArr)
                    uriArr = [vals[3]];
            }



            if(self.causality[id1])
                self.causality[id1].push({relationship: vals[1], id2: id2, uriArr: uriArr});
            else
                self.causality[id1] = [{relationship: vals[1], id2: id2, uriArr: uriArr}];

            if(self.causality[id2])
                self.causality[id2].push({relationship: vals[1], id2: id1, uriArr: uriArr});
            else
                self.causality[id2] = [{relationship: vals[1], id2: id1, uriArr: uriArr}];
        });

        console.log("Reading causality data complete");
    });
}

CausalityAgent.prototype.showCausality = function(geneNames){
    var self = this;

    geneNames.forEach(function(geneName){
        var causalGene = self.causality[geneName];


        if(causalGene){

            causalGene.forEach(function(causalRelationship){

                if(causalRelationship.uriArr && causalRelationship.uriArr.length > 0) {

                    var mergeGraph = function(uriArr){
                        self.mergePCQuery(uriArr)
                        // self.sendPCQuery(uriArr, function(data) {
                        //     self.sendRequest("agentMergeGraphRequest", data);
                        // });

                    }(causalRelationship.uriArr);

                }
            });
        }

    });
    
}

CausalityAgent.prototype.mergePCQuery = function(uriArr, callback){
    var self = this;
    var pc2URL = "http://www.pathwaycommons.org/pc2/get?";
    var format = "format=SBGN";

    var uriStr = "";
    uriArr.forEach(function(uri){
        uriStr += "uri=" + uri + "&";
    });

    pc2URL = pc2URL + uriStr + format;


    self.socket.emit('MergePCQuery', {url: pc2URL, type: "sbgn"}, function(data){
        console.log(data);
        if(callback) callback();
    });



}
