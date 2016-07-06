
/**
 * Created by durupina on 5/13/16.
 */

ContextAgent.prototype = new Agent();

//ContextAgent.prototype.constructor = ContextAgent;

function ContextAgent(name, id) {

    this.agentName = name;
    this.agentId = id;

    this.proteinList = new HashMap();


}


ContextAgent.prototype.analyzeCommand = function (cmd) {

    var self = this;
    var nodes = this.getNodeList();


    if(cmd.elId!=null) {
        cmd.elId.forEach(function (el) {

            if (el.isNode) {

                //proteins
                if(nodes[el.id].sbgnclass && ( (nodes[el.id].sbgnclass.indexOf("macromolecule")>-1 || nodes[el.id].sbgnclass.indexOf("nucleic")>-1 || nodes[el.id].sbgnclass.indexOf("chemical")>-1))){
                    var proteinName = nodes[el.id].sbgnlabel;
                    var proteinScore = self.proteinList.get(proteinName);
                    if (proteinScore != null)
                        self.proteinList.put(proteinName, ++proteinScore);
                    else
                        self.proteinList.put(proteinName, 0);

                }
            }

        });
    }

}
ContextAgent.prototype.printMutationData = function(cancerData){
    cancerStudies.forEach(function(study) {
        if(study.seqCaseCnt > 0)
            console.log(study.id + ": %"+ (study.mutationCaseIds.length*100/study.seqCaseCnt));
        // console.log(study.seqCaseCnt + " " + study.caseIds.length);
    });
}

ContextAgent.prototype.requestMutationQuery = function(proteinName, callback){
    var self = this;
    this.sendRequest("agentCBioPortalQueryRequest", proteinName, function(cancerData){
        self.printMutationData(cancerData);
        if(callback) callback();
    });

}

