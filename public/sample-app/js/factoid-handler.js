/**
 * Created by durupina on 11/14/16.
 */





module.exports =  function(menu, modelManager) {

    var idxcardjson = require('../../src/reach-functions/idxcardjson-to-json-converter.js');

    var socket = io();

    var jsonGraphs;
    var nodeMap;
    var text= 'We introduce a new method. MDM2 phosphorylates TP53. A Sos-1-E3b1 complex directs Rac activation by entering into a tricomplex with Eps8. MDM2 deactivates RAF.';
    var pmcID = "PMC2797771";

    return   {




        initialize: function(){



            $('#factoidBox')[0].value = text;

            var factoidModel = modelManager.getFactoidModel();


            if(factoidModel != null){

                jsonGraphs = factoidModel.jsonGraphs;
                nodeMap = factoidModel.nodeMap;

                var textFromJsons = "";
                jsonGraphs.forEach(function(jsonGraph){
                    textFromJsons+= jsonGraph.sentence;

                });
                text = textFromJsons;
                 $('#factoidBox')[0].value = text = textFromJsons;
            }


            this.listenToEvents();


        },

        loadFactoidModel: function(inputStr){


            //parse each input sentence one by one


            var jsonGraphs = [];

            var lines = inputStr.split(/[.;]+/m);

            lines.pop(); //pop the empty last line

            // console.log(lines);

            var n = noty({layout: "bottom",text: "Sending REACH queries"});


            var lengthRequirement = lines.length;
            var p = new Promise(function (resolve) {

                lines.forEach(function (line) {

                    console.log(line);
                    socket.emit("REACHQuery", "indexcard", line, function (data) {
                        //      console.log(line);
                        //       console.log(data);

                        try{

                            //    n.setText("REACH result #" + (jsonGraphs.length + 1) + " of " +lengthRequirement + " sent to JSON conversion.");
                            var jsonData = idxcardjson.createJson(JSON.parse(data));

                            jsonGraphs.push({sentence: line, json: jsonData});

                            console.log(jsonGraphs);
                            n.setText("REACH result #" + (jsonGraphs.length) + " of " + lengthRequirement + " converted to JSON.");

                            if(jsonGraphs.length >= lengthRequirement)
                                resolve("success");

                        }
                        catch (error){ //incorrect json -- don't add to the graphs to be merged
                            console.log(error);
                            n.setText("REACH result #" + (jsonGraphs.length+ 1) + " of " +lengthRequirement + " has a conversion error.");
                            lengthRequirement--;

                            if(jsonGraphs.length >= lengthRequirement)
                                resolve("success");

                        }

                    });
                });
            });

            p.then(function(content){

                n.setText( "Merging graphs...");

                jsonGraphs = jsonGraphs;
                nodeMap = menu.mergeJsons(jsonGraphs); //mapping between sentences and node labels



                //save it to the model
                modelManager.updateFactoidModel({jsonGraphs: jsonGraphs, nodeMap: nodeMap, text: text}, "me");



                n.close();
            }),
                function (xhr, status, error) {
                    console.log(error);
                    n.setText( error);
                }
        },



        highlightSentenceInText(nodeId, highlightColor){

            var el  = $('#factoidBox');



            console.log(nodeId);


            if(highlightColor == null){
                el.highlightTextarea('destroy');
                return;
            }



            var sentences = nodeMap[nodeId];


            if(sentences) {

                for(var i = 0; i < sentences.length; i++) {
                    var sentence = sentences[i];

                    var startInd = el[0].value.indexOf(sentence);
                    var endInd = startInd + sentence.length;

                    el.highlightTextarea({
                        ranges: [{
                            color: highlightColor,//('#FFFF0'),
                            ranges: [[startInd,endInd]]
                        }]
                    });

                }


            }
        },
        setFactoidModel: function(factoidModel){

            nodeMap = factoidModel.nodeMap;
            jsonGraphs = factoidModel.jsonGraphs;
            text = factoidModel.text;


        },


        loadFactoidPMC: function() {



            var link = "https://www.ncbi.nlm.nih.gov/pmc/articles/" + $('#pmcBox').val() ;
            socket.emit("HTTPRequest", link,  function(result){
                //console.log(result);

                $('#factoidBox')[0].value = result;
            });
            // loadFactoidModel($(, menu);
        },

        loadFactoidFile: function(e){


            var extension = $("#factoid-file-input")[0].files[0].name.split('.').pop().toLowerCase();


            if(extension == "pdf") {

                var reader = new FileReader();
                reader.onload = function (e) {

                    socket.emit('pdfConvertRequest',this.result, function(pages){

                        //Combine pages
                        var txt  = "";
                        pages.forEach(function(page){

                            page.forEach(function(el){

                                txt += el + " ";
                            });
                            // txt += '\n';
                        });



                        //TODO txtData needs some kind of cleaning
                        $('#factoidBox')[0].value = txt;

                    });



                };
                reader.readAsArrayBuffer($("#factoid-file-input")[0].files[0]);



            }
            else{
                var reader = new FileReader();
                reader.onload = function (e) {

                    $('#factoidBox')[0].value =  this.result; //change text

                };
                reader.readAsText($("#factoid-file-input")[0].files[0]);



            }

        },


        listenToEvents: function(){
            var self = this;

            $('#factoid-text-submit-button').click(function () {
                self.loadFactoidModel($('#factoidBox').val());

            });

            $('#factoid-text-clear-button').click(function () {
                self.text = '';
                $('#factoidBox')[0].value = '';

            });


            $('#factoid-file-input').change(function (e) {
                self.loadFactoidFile(e);

            });

            $('#pmc-id-submit-button').click(function (e) {
                self.loadFactoidPMC();

            });

        }


    };
}



// if( typeof module !== 'undefined' && module.exports){ // expose as a nodejs module
//     module.exports = new FactoidInput();