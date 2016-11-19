/**
 * Created by durupina on 11/14/16.
 */



var idxcardjson = require('../../src/reach-functions/idxcardjson-to-json-converter.js');

var menu =  require('./app-menu.js');

var socket = io();

function getSelectionText() {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
        (activeElTagName == "textarea" || activeElTagName == "input") &&
        /^(?:text|search|password|tel|url)$/i.test(activeEl.type) &&
        (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}

document.onmouseup = document.onkeyup =  function() {
    var txt = getSelectionText();

    if((/^\s*$/).test(txt)) {
        menu.removeHighlights();
    }
    else {
            menu.removeHighlights();
            menu.highlightWords(txt);
        }


};


var loadFactoidModel = function(inputStr, menuFunctions){


    //parse each input sentence one by one

    menu = menuFunctions;

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

                        jsonGraphs.push(jsonData);

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
        menu.mergeJsons(jsonGraphs);
        n.close();
    }),
    function (xhr, status, error) {
        console.log(error);
        n.setText( error);
    }
}

var FactoidInput = Backbone.View.extend({
    el: '#factoid-input-container',

    tagName: 'textarea',

    self:this,

    events: {
        "click #factoid-text-submit-button" : "getFactoidDataFromText",
        "click #factoid-text-clear-button" : "clearTextArea",
        "click #pmc-id-submit-button": "loadFactoidPMC",
        "change #factoid-file-input": "loadFactoidFile"
    },

    variables: {
        factoidText: 'We introduce a new method. MDM2 phosphorylates TP53. A Sos-1-E3b1 complex directs Rac activation by entering into a tricomplex with Eps8.',
        pmcID: "PMC2797771"
    },



    initialize : function(menuFunctions) { //These handle file merging

        menu = menuFunctions;


        this.render();
    },
    render: function(){

        // compile the template using underscore
        var template = _.template( $("#factoid-input-loading-template").html());
        // pass variables in using Underscore.js template
        template = template(this.variables);

        // load the compiled HTML into the Backbone "el"
        $(this.el).html(template);

        return this;
    },

    getFactoidDataFromText: function() {
        loadFactoidModel($('#factoidBox').val(), menu);
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

    clearTextArea: function(){
        this.variables.factoidText = '';
        this.render();
    }

});

if( typeof module !== 'undefined' && module.exports){ // expose as a nodejs module
    module.exports = new FactoidInput();
}