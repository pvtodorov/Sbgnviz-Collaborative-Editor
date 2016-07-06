
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

    /**
     * Return most likely cancer type according to the mutation data
     * @param cancerData
     */
    ContextAgent.prototype.getMostLikelyContext = function(cancerData) {

        return cancerData[0].name;
    }



    ContextAgent.prototype.requestMutationQuery = function(proteinName){
        var self = this;
        this.sendRequest("agentCBioPortalQueryRequest", proteinName, function(cancerData){
            self.sortMutationRates(cancerData);
            self.printMutationData(cancerData);
            var contextName = self.getMostLikelyContext(cancerData);

            var agentComment = "The most likely context is  " + cancerData[0].name + " with %" +  (cancerData[0].mutationCaseIds.length *100/ cancerData[0].seqCaseCnt) ;
            var targets = [];
            for(var i = 0; i < self.userList.length; i++){
                targets.push({id: agent.userList[i].userId});
            }


            self.sendMessage(agentComment, targets); // send to all the users for now
        });

    }

