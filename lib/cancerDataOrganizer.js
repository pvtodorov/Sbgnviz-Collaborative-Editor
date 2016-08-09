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
                } else {

                    //console.log(body);
                    var lines = body.split('\n');
                    //skip first line
                    lines = lines.slice(1, lines.length);

                    lines.forEach(function (line) {
                        var words = line.split('\t');
                        if (words[0].length > 0 && words[0] == (study.id  + "_sequenced")) { //only check _sequenced
                            var caseIds = words[4].split(' ');
                            study.seqCaseCnt = caseIds.length;

                        }

                    });
                }
            });
        },


        /**
         * A recursive function to get mutation data for each genetic profile id  and case set id
         * @param geneList
         * @param cancerStudies
         * @param mutationIndex
         * @param callback
         */

        getNewMutationData: function(geneList, cancerStudies, mutationIndex, callback){


             if (mutationIndex >= cancerStudies.length) {
           // if (mutationIndex >= 10) { //funda simdilik
                callback(cancerStudies);
                return;
            }

            var self = this;
            var study = cancerStudies[mutationIndex];

            var url = "http://www.cbioportal.org/webservice.do?cmd=getMutationData&genetic_profile_id=" + (study.id + "_mutations") +
                "&case_set_id=" + (study.id + "_sequenced") + "&gene_list=" + geneList;




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
                        if (words[2] != undefined && study.mutationCaseIds.indexOf(words[2]) < 0)
                            study.mutationCaseIds.push(words[2]);

                    });


                    console.log("cBioPortal mutation # " + mutationIndex + ' of ' + cancerStudies.length);

                    self.getNewMutationData(geneList, cancerStudies, ++mutationIndex, callback);

                }
            });
        },
        /**
         * Get the length of mutation data for all the study ids of all the profile ids in the cancerStudies variable
         * @param geneList
         */
        getAllMutationCounts: function(geneList, callback){



            var mutationIndex = 0;
            //initialize
            cancerStudies.forEach(function(study){
               study.mutationCaseIds.length  = 0;
            });


            //recursive function that increases mutationIndex number each time
            this.getNewMutationData(geneList, cancerStudies, mutationIndex, callback);

        },

        /**
         * Get the length of mutation data for studyId
         * @param proteinName
         * @param studyId
         * @param callback
         */

        getMutationCountInContext: function(proteinName, studyId, callback) {

            var mutationCnt = 0;
            var url = "http://www.cbioportal.org/webservice.do?cmd=getMutationData&genetic_profile_id=" + (studyId + "_mutations") +
                "&case_set_id=" + (studyId + "_sequenced") + "&gene_list=" + proteinName;




            request(url, function (error, response, body) {

                if (error) {
                    console.log(error);
                }
                else { //only open the window if a proper response is returned
                    var lines = body.split('\n');

                    if(lines.length > 3){ //otherwise no mutation data is found within the current context

                        //skip the first two lines
                        lines = lines.splice(2, lines.length);

                        lines.forEach(function (line) {
                            var words = line.split('\t');
                            if (words[2] != undefined)
                                mutationCnt++;

                        });
                        if (callback) callback(mutationCnt);
                    }



                }
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