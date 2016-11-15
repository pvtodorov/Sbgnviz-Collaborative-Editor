/**
 * Created by durupina on 11/14/16.
 */

var idxcardjson = require('../../src/reach-functions/idxcardjson-to-json-converter.js');


var loadFactoidModel = function(inputStr, menuFunctions){

    var socket = io();

    //parse each input sentence one by one


    var jsonGraphs = [];

    var lines = inputStr.split(".");

    console.log(lines);



    var lengthRequirement = lines.length - 1;
    var p = new Promise(function (resolve) {
        lines.forEach(function (line) {

                socket.emit("REACHQuery", "indexcard", line, function (data) {
                    console.log(line);

                    console.log(data);


                    try{
                        var jsonData = idxcardjson.createJson(JSON.parse(data));
                        jsonGraphs.push(jsonData);
                    }
                    catch (error){ //incorrect json -- don't add to the graphs to be merged
                        console.log(error);
                        lengthRequirement--;
                    }

                    //menuFunctions.mergeJson(jsonData);
                    if(jsonGraphs.length >= lengthRequirement)
                        resolve("success");

                });
        });
    });

    p.then(function(content){

        jsonGraphs.forEach(function(jsonData){
            console.log(jsonData);
            menuFunctions.mergeJson(jsonData);
        });

    }),
    function (xhr, status, error) {
        console.log(error);
    }
}

var FactoidInput = Backbone.View.extend({
    el: '#factoid-input-container',

    tagName: 'textarea',
    menuFunctions: require('./app-menu.js'),
    self:this,

    events: {
        "click #factoid-text-submit-button" : "getFactoidData",
        "click #factoid-text-clear-button" : "clearTextArea",
        "change #factoid-file-input": "loadFactoidFile"
    },

    variables: {
         factoidText: 'We introduce a new method. MDM2 phosphorylates TP53. A Sos-1-E3b1 complex directs Rac activation by entering into a tricomplex with Eps8.'
        //factoidText: 'We introduce a new method. MDM2 phosphorylates TP53. Eps8  directs Rac activation.'
    },



    initialize : function(menuFunctions) { //These handle file merging

        self.menuFunctions = menuFunctions;


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

    getFactoidData: function(e) {
        //clear the canvas first
        self.menuFunctions.newFile();

        loadFactoidModel($('#factoidBox').val(), self.menuFunctions);
    },

    loadFactoidFile: function(e){

        var reader = new FileReader();

        reader.onload = function (e) {

            loadFactoidModel(this.result, self.menuFunctions);
        };
        reader.readAsText($("#factoid-file-input")[0].files[0]);

    },

    clearTextArea: function(){
        this.variables.factoidText = '';
        this.render();
    }

});

if( typeof module !== 'undefined' && module.exports){ // expose as a nodejs module
    module.exports = new FactoidInput();
}