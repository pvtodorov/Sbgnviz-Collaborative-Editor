/**
 * Created by durupina on 7/1/16.
 */
/**
 * This is called on the server side to let the server know which queries to request
 */

var request = require('request');

module.exports = function(){

    var cancerStudies = [];
    var profileIds = [];


    return{
        getCancerStudies: function() {
            var self = this;
            request("http://www.cbioportal.org/webservice.do?cmd=getCancerStudies", function (error, response, body) {

                if (error) {
                    console.log(error);
                } else { //only open the window if a proper response is returned

                    //console.log(body);
                    var lines = body.split('\n');
                    //skip first line
                    lines = lines.slice(1, lines.length);

                    lines.forEach(function (line) {

                        var words = line.split('\t');
                        if(words[0].length > 0) {
                            cancerStudies.push({id: words[0], name: words[1], seqCaseCnt: 0, mutationCaseIds:[]});

                            self.getSequencedCaseCounts(cancerStudies[cancerStudies.length-1]);



                        }
                    });

                }
            });
        },

        getSequencedCaseCounts: function(study) {
            var self = this;
            var url = "http://www.cbioportal.org/webservice.do?cmd=getCaseLists&cancer_study_id=" + study.id;


            request(url, function (error, response, body) {

                if (error) {
                    console.log(error);
                } else { //only open the window if a proper response is returned

                    //console.log(body);
                    var lines = body.split('\n');
                    //skip first line
                    lines = lines.slice(1, lines.length);

                    lines.forEach(function (line) {
                        var words = line.split('\t');
                        if (words[0].length > 0 && words[0].indexOf("sequenced")>-1) {
                            var caseIds = words[4].split(' ');
                            study.seqCaseCnt = caseIds.length;

                        }

                    });
                }
            });
        },
        

        /**
         * Get the length of mutation data for all the study ids of all the profile ids in the cancerStudies variable
         * @param geneList
         */
        getMutationCount: function(geneList){


            var self = this;
            var mutationResults = 0;
            //initialize
            cancerStudies.forEach(function(study){
               study.mutationCaseIds.length  = 0;
            });

            cancerStudies.forEach(function(study){

                var url = "http://www.cbioportal.org/webservice.do?cmd=getMutationData&genetic_profile_id=" + (study.id + "_mutations") +
                        "&case_set_id=" + (study.id +"_sequenced") + "&gene_list=" + geneList;


                request(url, function (error, response, body) {

                    if (error) {
                        console.log(error);
                    }
                    else { //only open the window if a proper response is returned
                        var lines = body.split('\n');

                        //skip the first two lines
                        lines = lines.splice(2, lines.length);

                        lines.forEach(function (line) {
                            var words = line.split('\t');
                            if(words[2]!= undefined && study.mutationCaseIds.indexOf(words[2])<0)
                                study.mutationCaseIds.push(words[2]);

                        });



                        mutationResults++;

                        //console.log(mutationResults + " " + cancerStudies.length);
                        if(mutationResults >= cancerStudies.length) { //if we are at the last element

                            self.printStudies();
                        }

                    }
                });
            });

        },



        /**
         * For debugging
         */
        printStudies: function(){
            cancerStudies.forEach(function(study) {
                if(study.seqCaseCnt > 0)
                    console.log(study.id + ": %"+ (study.mutationCaseIds.length*100/study.seqCaseCnt));
               // console.log(study.seqCaseCnt + " " + study.caseIds.length);
            });
        }

    }


}