    /**
 * Menu class
 * Initializes sbgnContainer, syncManager modelManager, SBGNLayout properties and SBGN Properties,
 * Listens to menu actions
 *
 * **/



var sbgnmlToJson =require('../../../src/utilities/sbgnml-to-json-converter.js')();
var cytoscape = require('cytoscape');

var idxcardjson = require('../../../src/utilities/idxcardjson-to-json-converter.js');

//Local functions
var setFileContent = function (fileName) {
    var span = document.getElementById('file-name');
    while (span.firstChild) {
        span.removeChild(span.firstChild);
    }
    span.appendChild(document.createTextNode(fileName));
};
var startSpinner = function(id) {

    if($('.' + id).length === 0){
        var containerWidth = $('#sbgn-network-container').width();
        var containerHeight = $('#sbgn-network-container').height();
        $('#sbgn-network-container:parent').prepend('<i style="position: absolute; z-index: 9999999; left: ' + containerWidth / 2 + 'px; top: ' + containerHeight / 2 + 'px;" class="fa fa-spinner fa-spin fa-3x fa-fw layout-spinner"></i>');
    }
};
var endSpinner = function(id) {
    if ($('.' + id).length > 0) {
        $('.' + id).remove();
    }
};

var beforePerformLayout = function(){
    var nodes = cy.nodes();
    var edges = cy.edges();

    nodes.removeData("ports");
    edges.removeData("portsource");
    edges.removeData("porttarget");

    nodes.data("ports", []);
    edges.data("portsource", []);
    edges.data("porttarget", []);

    // TODO do this by using extension API
    cy.$('.edgebendediting-hasbendpoints').removeClass('edgebendediting-hasbendpoints');
    edges.scratch('cyedgebendeditingWeights', []);
    edges.scratch('cyedgebendeditingDistances', []);
};



function getXMLObject(itemId, loadXMLDoc) {
    switch (itemId) {

        case "0":
            $.ajax({
                url: './sample-app/samples/activated_stat1alpha_induction_of_the_irf1_gene.xml',
                success: loadXMLDoc
            });
            break;
        case "1":
            $.ajax({url: './sample-app/samples/glycolysis.xml', success: loadXMLDoc});
            break;
        case "2":
            $.ajax({url: './sample-app/samples/mapk_cascade.xml', success: loadXMLDoc});
            break;
        case "3":
            $.ajax({url: './sample-app/samples/polyq_proteins_interference.xml', success: loadXMLDoc});
            break;
        case "4":
            $.ajax({url: './sample-app/samples/insulin-like_growth_factor_signaling.xml', success: loadXMLDoc});
            break;
        case "5":
            $.ajax({
                url: './sample-app/samples/atm_mediated_phosphorylation_of_repair_proteins.xml', success: loadXMLDoc
            });
            break;
        case "6":
            $.ajax({
                url: './sample-app/samples/vitamins_b6_activation_to_pyridoxal_phosphate.xml', success: loadXMLDoc
            });
            break;
        case "7":
            $.ajax({
                url: './sample-app/samples/MTORSmall.sbgn', success: loadXMLDoc
            });
            break;

    }


};




module.exports = function(modelManager){
    var cyMod =  require('./sample-app-cytoscape-sbgn.js');



    var sbgnContainer;

    var sbgnLayout;
    var sbgnProperties;
    var gridProperties;
    var pathsBetweenQuery;


     return MenuFunctions = { //global reference for testing

         changeVisibilityStatus: function(id){

         },


         refreshGlobalUndoRedoButtonsStatus: function(){
             if (!modelManager.isUndoPossible()) {
                 $("#undo-last-action-global").parent("li").addClass("disabled");
             }
             else {
                 $("#undo-last-action-global").html("Undo " +  modelManager.getUndoActionStr());
                 $("#undo-last-action-global").parent("li").removeClass("disabled");
             }

             if (!modelManager.isRedoPossible()) {
                 $("#redo-last-action-global").parent("li").addClass("disabled");
             }
             else {
                 $("#redo-last-action-global").html("Redo " +  modelManager.getRedoActionStr());
                 $("#redo-last-action-global").parent("li").removeClass("disabled");
             }

         },

         loadFile:function(txtFile){

             modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
             var jsonObj = sbgnmlToJson.convert(txtFile);



             //get another sbgncontainer
             sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, modelManager));

             modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
             modelManager.setSampleInd(-1, "me"); //to notify other clients

         },
     

         //Agent loads the file
         loadFileInNode: function(txtFile){


            modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
            var jsonObj = sbgnmlToJson.convert(txtFile);

            //initialize cytoscape
            cytoscape({
                elements: jsonObj,
                headless: true,
                styleEnabled: true,


                ready: function () {
                    cy = this;
                }
            });

            //no container is necessary

            modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

            modelManager.setSampleInd(-1, "me"); //to notify other clients

         },

         //Methods for agents to interact with cytoscape
         showNodes: function(selectedNodeIds){
            //unselect all others
            cy.nodes().unselect();


            selectedNodeIds.forEach(function(nodeId){
                cy.getElementById( nodeId).select();
            });


            var param = {
                sync: true,
                selectedEles :  cy.$(":selected")
            };


            syncManager.showSelected(param);

        },

        hideNodes: function(selectedNodeIds){
            //unselect all others
            cy.nodes().unselect();


            selectedNodeIds.forEach(function(nodeId){
                cy.getElementById( nodeId).select();
            });


            var param = {
                sync: true,
                selectedEles : cy.$(":selected")
            };

            syncManager.hideSelected(param);

        },

        showAll: function(){
            syncManager.showAll({sync:true});
        },
//propName and modelDataName can be different: propName: name in cytoscape, modelDataName: name in nodejs model
         //proptype is either data or css
         // changeElementData: function(elId, propName, modelDataName,propValue, propType, syncVal) {
         //     var el = cy.$(('#' + elId))[0];
         //
         //     if (el) {
         //
         //        el.data()
         //     }
         // },


         // //Here for agents
         // highlightNeighbors: function(selectedNodeIds){
         //
         //    cy.nodes().unselect();
         //
         //
         //    selectedNodeIds.forEach(function(nodeId){
         //        cy.getElementById( nodeId).select();
         //    });
         //
         //
         //
         //    var elesToHighlight = sbgnFiltering.getNeighboursOfSelected();
         //
         //    if(elesToHighlight.length === 0) {
         //        return;
         //    }
         //
         //    var notHighlightedEles = cy.elements(".nothighlighted").filter(":visible");
         //    var highlightedEles = cy.elements(':visible').difference(notHighlightedEles);
         //
         //    if(elesToHighlight.same(highlightedEles)) {
         //        return;
         //    }
         //
         //    var eles =  cy.undoRedo().do("highlight", elesToHighlight);
         //
         //    syncManager.highlightSelected(eles);
         //

            //
            // ///////////eski
            // //unselect all others
            // cy.nodes().unselect();
            //
            //
            // selectedNodeIds.forEach(function(nodeId){
            //     cy.getElementById( nodeId).select();
            // });
            //
            //
            // var param = {
            //     sync: true,
            //     selectedEles : cy.$(":selected"),
            //     highlightNeighboursofSelected: true
            // };
            //
            //
            //
            // syncManager.highlightSelected(param);

    //    },
        
        // highlightProcesses: function(selectedNodeIds){
        //     //unselect all others
        //     cy.nodes().unselect();
        //
        //
        //     selectedNodeIds.forEach(function(nodeId){
        //         cy.getElementById( nodeId).select();
        //     });
        //
        //
        //     var param = {
        //         sync: true,
        //         selectedEles : cy.$(":selected"),
        //         highlightProcessesOfSelected: true
        //     };
        //
        //
        //
        //     syncManager.highlightSelected(param);
        //
        // },
        //
        // removeHighlights: function(){
        //
        //     if (sbgnFiltering.noneIsNotHighlighted()){
        //         return;
        //     }
        //
        //     var eles  = cy.undoRedo().do("removeHighlights");
        //     syncManager.highlightSelected(eles.current);
        // },

        addEdge:function(elId, source, target, sbgnclass, syncVal){
            var param ={

                sync: syncVal,
                id:elId,
                source: source,
                target: target,
                sbgnclass: sbgnclass

            };



            var result = syncManager.addEdge(param);

            return result.id();

        },

        addNode:function(elId, x, y, sbgnclass, sbgnlabel, syncVal){
            var param ={
                sync: syncVal,
                id:elId,
                x: x,
                y: y,
                sbgnclass: sbgnclass,
                sbgnlabel: sbgnlabel //for agents

            };

            var result = syncManager.addNode(param);


            return result.id();
        },

        addCompound: function(dataType){

            if(dataType == "complex")
                $("#make-compound-complex").trigger('click');
            else
                $("#make-compound-compartment").trigger('click');


        },

        deleteElement: function(elId, syncVal){
            var el = cy.$(('#' + elId))[0];
            if(el){

                var param ={
                    eles:el,
                    sync: syncVal
                }
                syncManager.deleteSelected(param);

            }
        },


        updateLayoutProperties: function(lp){

            if(sbgnLayout)
                sbgnLayout.updateLayoutProperties(lp);

        },

        updateSample: function(ind, syncVal){


            if(ind < 0){ //for notifying other users -- this part is called through the model

                var jsonObj = modelManager.getJsonFromModel();

                sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  modelManager));
                if(syncVal)
                    modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me");

            }
            else{

                
                getXMLObject(ind, function (xmlObject) {

                    var xmlText = new XMLSerializer().serializeToString(xmlObject);

                    var jsonObj = sbgnmlToJson.convert(xmlText);



                    sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  modelManager));

                    if(syncVal) {

                        modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me");
                    }

                });
          }


        },

        startInNode: function(){

            var jsonObj = modelManager.getJsonFromModel();

            if (jsonObj == null) {//first time loading the graph-- load from the samples

                var ind = modelManager.getSampleInd("me");


                getXMLObject(ind, function (xmlObject) {

                    var xmlText = new XMLSerializer().serializeToString(xmlObject);
                   // var $ = require('jquery');
                    var jsonObj = sbgnmlToJson.convert(xmlText);


                    cytoscape({
                        elements: jsonObj,
                        headless: true,
                        styleEnabled: true,


                        ready: function () {
                            cy = this;
                        }
                    });



                    modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);


                });
      //          }


            }
            else { //load a previously loaded graph

                cytoscape({
                    elements: jsonObj,
                    headless: true,
                    styleEnabled: true,


                    ready: function () {
                        cy = this;
                    }
                });


                modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
            }

        },

        start: function () {


            //
            // //If we get a message om a separate window
            window.addEventListener('message', function(event) {



                if(event.data.graph)
                    self.loadFile(event.data.graph);


            }, false);



            var self = this;

            var socket = io();

            //modelManager = modelManager;


            //
            // sbgnLayout = new SBGNLayout(modelManager);
            //
            // var layoutProperties = modelManager.updateLayoutProperties(sbgnLayout.defaultLayoutProperties);
            //
            // sbgnLayout.initialize(layoutProperties);
            //
            //
            // sbgnProperties = new SBGNProperties();
            // sbgnProperties.initialize();
            //
            // pathsBetweenQuery = new PathsBetweenQuery(socket,  modelManager.getName());
            // pathsBetweenQuery.initialize();
            //
            // gridProperties = new GridProperties();
            // gridProperties.initialize();


            var promptSave = new PromptSave({
                el: '#sbgn-prompt-save-table'
            });

            var sbgnLayoutProp = new SBGNLayout({
                el: '#sbgn-layout-table'
            });

            var sbgnProperties = new SBGNProperties({
                el: '#sbgn-properties-table'
            });

            var gridProperties = new GridProperties({
                el: '#grid-properties-table'
            });

            var pathsBetweenQuery = new PathsBetweenQuery({
                el: '#query-pathsbetween-table'
            });

            var reactionTemplate = new ReactionTemplate({
                el: '#reaction-template-table'
            });




            var jsonObj = modelManager.getJsonFromModel();



            if (jsonObj == null) {//first time loading the graph-- load from the samples

                var ind = modelManager.getSampleInd("me");

                this.updateSample(ind, true);

            }
            else {//load from a previously loaded graph

                sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, modelManager));

                modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
            }


            //TODO: Funda closed for now
            // triggerIncrementalLayout = function(){
            //     beforePerformLayout();
            //
            //     var preferences = {
            //         randomize: false,
            //         animate: sbgnStyleRules['animate-on-drawing-changes']?'end':false,
            //         fit: false
            //     };
            //
            //     if(sbgnLayoutProp.currentLayoutProperties.animate === 'during'){
            //         delete preferences.animate;
            //     }
            //
            //     sbgnLayoutProp.applyLayout(preferences, false); // layout must not be undoable
            // };
            //
            // triggerIncrementalLayoutAfterExpandCollapse = function(){
            //     if(!sbgnStyleRules['rearrange-after-expand-collapse']) {
            //         return;
            //     }
            //
            //     triggerIncrementalLayout();
            // };
            //
            // // set layoutBy option of expand collapse extension
            // cy.setExpandCollapseOption('layoutBy', triggerIncrementalLayoutAfterExpandCollapse);
            //


            $('#samples').click(function (e) {

                var ind = e.target.id;
                
                if(sbgnContainer)
                    modelManager.deleteAll(cy.nodes(), cy.edges(), "me");


                self.updateSample(ind, true);

                modelManager.setSampleInd(ind, "me"); //let others know

            });

            $('#new-file-icon').click(function () {
                $('#new-file').trigger("click");
            });

            $('#new-file').click(function () {
                setFileContent("new_file.sbgnml");

                var jsonObj = {nodes: [], edges: []};

                modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
                cy.remove(cy.elements());
                sbgnContainer = new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, modelManager);
                modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

                //syncManager.manager.reset();
                //TODO: why is this here?
                //funda?????   cyMod.handleSBGNInspector(syncManager);
            });

            $('.add-node-menu-item').click(function (e) {
                if (!modeHandler.mode != "add-node-mode") {
                    modeHandler.setAddNodeMode();
                }
                var value = $(this).attr('name');
                modeHandler.selectedNodeType = value;
                modeHandler.setSelectedIndexOfSelector("add-node-mode", value);
                modeHandler.setSelectedMenuItem("add-node-mode", value);
            });

            $('.add-edge-menu-item').click(function (e) {
                if (!modeHandler.mode != "add-edge-mode") {
                    modeHandler.setAddEdgeMode();
                }
                var value = $(this).attr('name');
                modeHandler.selectedEdgeType = value;
                modeHandler.setSelectedIndexOfSelector("add-edge-mode", value);
                modeHandler.setSelectedMenuItem("add-edge-mode", value);
            });

            modeHandler.initialize();

            $('.sbgn-select-node-item').click(function (e) {
                //if (!modeHandler.mode != "add-node-mode") { //funda?
                if (!modeHandler.mode != "add-node-mode") {
                    modeHandler.setAddNodeMode();
                }
                var value = $('img', this).attr('value');
                modeHandler.selectedNodeType = value;
                modeHandler.setSelectedIndexOfSelector("add-node-mode", value);
                modeHandler.setSelectedMenuItem("add-node-mode", value);
            });

            $('.sbgn-select-edge-item').click(function (e) {
                if (!modeHandler.mode != "add-edge-mode") {
                    modeHandler.setAddEdgeMode();
                }
                var value = $('img', this).attr('value');
                modeHandler.selectedEdgeType = value;
                modeHandler.setSelectedIndexOfSelector("add-edge-mode", value);
                modeHandler.setSelectedMenuItem("add-edge-mode", value);
            });

            $('#node-list-set-mode-btn').click(function (e) {
                if (modeHandler.mode != "add-node-mode") {
                    modeHandler.setAddNodeMode();
                }
            });

            $('#edge-list-set-mode-btn').click(function (e) {
                if (modeHandler.mode != "add-edge-mode") {
                    modeHandler.setAddEdgeMode();
                }
            });

            $('#select-icon').click(function (e) {
                modeHandler.setSelectionMode();
            });

            $('#select-edit').click(function (e) {
                modeHandler.setSelectionMode();
            });
            $('#clone-selected').click(function (e) {
                var selectedNodes = cy.nodes(':selected');
                var cb = cy.clipboard();
                var _id = cb.copy(selectedNodes, "cloneOperation");
                cy.undoRedo().do("paste", { id: _id });
            });
            function getFirstSelectedNode() {
                return window.firstSelectedNode ? window.firstSelectedNode : cy.nodes(":selected")[0];
            }

            $('#align-horizontal-top').click(function (e) {
                cy.undoRedo().do("align", {
                    nodes: cy.nodes(":selected"),
                    horizontal: "top",
                    alignTo: getFirstSelectedNode()
                });
            });

            $("#align-horizontal-top-icon").click(function (e) {
                $("#align-horizontal-top").trigger('click');
            });

            $('#align-horizontal-middle').click(function (e) {
                cy.undoRedo().do("align", {
                    nodes: cy.nodes(":selected"),
                    horizontal: "center",
                    alignTo: getFirstSelectedNode()
                });
            });

            $("#align-horizontal-middle-icon").click(function (e) {
                $("#align-horizontal-middle").trigger('click');
            });

            $('#align-horizontal-bottom').click(function (e) {
                cy.undoRedo().do("align", {
                    nodes: cy.nodes(":selected"),
                    horizontal: "bottom",
                    alignTo: getFirstSelectedNode()
                });
            });

            $("#align-horizontal-bottom-icon").click(function (e) {
                $("#align-horizontal-bottom").trigger('click');
            });

            $('#align-vertical-left').click(function (e) {
                cy.undoRedo().do("align", {
                    nodes: cy.nodes(":selected"),
                    vertical: "left",
                    alignTo: getFirstSelectedNode()
                });
            });

            $("#align-vertical-left-icon").click(function (e) {
                $("#align-vertical-left").trigger('click');
            });

            $('#align-vertical-center').click(function (e) {
                cy.undoRedo().do("align", {
                    nodes: cy.nodes(":selected"),
                    vertical: "center",
                    alignTo: getFirstSelectedNode()
                });
            });

            $("#align-vertical-center-icon").click(function (e) {
                $("#align-vertical-center").trigger('click');
            });

            $('#align-vertical-right').click(function (e) {
                cy.undoRedo().do("align", {
                    nodes: cy.nodes(":selected"),
                    vertical: "right",
                    alignTo: getFirstSelectedNode()
                });
            });


            $("#align-vertical-right-icon").click(function (e) {
                $("#align-vertical-right").trigger('click');
            });



            $("body").on("change", "#file-input", function (e) {
                if ($("#file-input").val() == "") {
                    return;
                }

                var fileInput = document.getElementById('file-input');
                var file = fileInput.files[0];



                //first clear everything
                $('#new-file').trigger("click");


                var reader = new FileReader();

                reader.onload = function (e) {
                    if(file.name.indexOf(".owl") > -1) {

                        socket.emit('BioPAXRequest', this.result, "sbgn", function(sbgnData){ //convert to sbgn
                            //socket.on('SBGNResult', function(sbgnData){

                            if(sbgnData.graph!= null){


                                var jsonObj = sbgnmlToJson.convert(sbgnData.graph);
                                //get another sbgncontainer
                                sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, editorActions));
                                editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
                                editorActions.modelManager.setSampleInd(-1, "me"); //to notify other clients

                            }
                        });
                    }
                    else {

                        //FIXME this is causing a disconnection from the socket

                        socket.emit('BioPAXRequest', this.result, "biopax"); //convert to biopax

                        self.loadFile(this.result);

                    }
                    // sbgnContainer =  new cyMod.SBGNContainer('#sbgn-network-container', jsonObj ,  modelManager);
                }
                reader.readAsText(file);
                setFileContent(file.name);
                $("#file-input").val("");
            });

            $("#node-legend").click(function (e) {
                e.preventDefault();
                $.fancybox(
                    _.template($("#node-legend-template").html(), {}),
                    {
                        'autoDimensions': false,
                        'width': 504,
                        'height': 325,
                        'transitionIn': 'none',
                        'transitionOut': 'none',
                    });
            });

            $("#node-label-textbox").blur(function () {
                $("#node-label-textbox").hide();
                $("#node-label-textbox").data('node', undefined);
            });

            $("#node-label-textbox").on('change', function () {
                var node = $(this).data('node');
                var param = {
                    nodes: cy.collection(node),
                    sbgnlabel:  $(this).val(),
                    firstTime: true
                };

                cy.undoRedo().do("changeNodeLabel", param);
            });
            $("#edge-legend").click(function (e) {
                e.preventDefault();
                $.fancybox(
                    _.template($("#edge-legend-template").html(), {}),
                    {
                        'autoDimensions': false,
                        'width': 325,
                        'height': 285,
                        'transitionIn': 'none',
                        'transitionOut': 'none',
                    });
            });

            $("#quick-help").click(function (e) {
                e.preventDefault();
                $.fancybox(
                    _.template($("#quick-help-template").html(), {}),
                    {
                        'autoDimensions': false,
                        'width': 420,
                        'height': "auto",
                        'transitionIn': 'none',
                        'transitionOut': 'none'
                    });
            });

            $("#how-to-use").click(function (e) {
                var url = "http://www.cs.bilkent.edu.tr/~ivis/sbgnviz-js/SBGNViz.js-1.x.UG.pdf";
                var win = window.open(url, '_blank');
                win.focus();
            });

            $("#about").click(function (e) {
                e.preventDefault();
                $.fancybox(
                    _.template($("#about-template").html(), {}),
                    {
                        'autoDimensions': false,
                        'width': 300,
                        'height': 250,
                        'transitionIn': 'none',
                        'transitionOut': 'none',
                    });
            });

            $("#hide-selected").click(function (e) {
                var selectedEles = cy.$(":selected");

                if(selectedEles.length === 0){
                    return;
                }

                cy.undoRedo().do("hide", selectedEles);

            });

            $("#hide-selected-icon").click(function (e) {
                $("#hide-selected").trigger('click');
            });

            $("#show-selected").click(function (e) {
                if(cy.elements(":selected").length === cy.elements(':visible').length) {
                    return;
                }

                cy.undoRedo().do("show", cy.elements(":selected"));

            });

            $("#show-selected-icon").click(function (e) {
                $("#show-selected").trigger('click');
            });

            $("#show-all").click(function (e) {
                if(cy.elements().length === cy.elements(':visible').length) {
                    return;
                }

                cy.undoRedo().do("show", cy.elements());

            });



            $("#delete-selected-simple").click(function (e) {
                var selectedEles = cy.$(":selected");

                if(selectedEles.length == 0){
                    return;
                }
                cy.undoRedo().do("removeEles", selectedEles);


            });

            $("#delete-selected-simple-icon").click(function (e) {
                $("#delete-selected-simple").trigger('click');
            });
            $("#delete-selected-smart").click(function (e) {
                if(cy.$(":selected").length == 0){
                    return;
                }

                var param = {
                    firstTime: true
                };

                cy.undoRedo().do("deleteSelected", param);

            });

            $("#delete-selected-smart-icon").click(function (e) {
                $("#delete-selected-smart").trigger('click');
            });

            $("#neighbors-of-selected").click(function (e) {

                var elesToHighlight = sbgnFiltering.getNeighboursOfSelected();

                if(elesToHighlight.length === 0) {
                    return;
                }

                var notHighlightedEles = cy.elements(".nothighlighted").filter(":visible");
                var highlightedEles = cy.elements(':visible').difference(notHighlightedEles);

                if(elesToHighlight.same(highlightedEles)) {
                    return;
                }

                cy.undoRedo().do("highlight", elesToHighlight);
            });

            $("#highlight-neighbors-of-selected-icon").click(function (e) {
                $("#neighbors-of-selected").trigger('click');
            });

            $("#search-by-label-icon").click(function (e) {
                var text = $("#search-by-label-text-box").val().toLowerCase();
                if (text.length == 0) {
                    return;
                }
                cy.nodes().unselect();

                var nodesToSelect = cy.nodes(":visible").filter(function (i, ele) {
                    if (ele.data("sbgnlabel") && ele.data("sbgnlabel").toLowerCase().indexOf(text) >= 0) {
                        return true;
                    }
                    return false;
                });

                if (nodesToSelect.length == 0) {
                    return;
                }

                nodesToSelect.select();

                var nodesToHighlight = sbgnFiltering.getProcessesOfSelected();
                cy.undoRedo().do("highlight", nodesToHighlight);
            });

            $("#search-by-label-text-box").keydown(function (e) {
                if (e.which === 13) {
                    $("#search-by-label-icon").trigger('click');
                }
            });

            $("#highlight-search-menu-item").click(function (e) {
                $("#search-by-label-text-box").focus();
            });

            $("#processes-of-selected").click(function (e) {
                var elesToHighlight = sbgnFiltering.getProcessesOfSelected();

                if(elesToHighlight.length === 0) {
                    return;
                }

                var notHighlightedEles = cy.elements(".nothighlighted").filter(":visible");
                var highlightedEles = cy.elements(':visible').difference(notHighlightedEles);

                if(elesToHighlight.same(highlightedEles)) {
                    return;
                }

                cy.undoRedo().do("highlight", elesToHighlight);
            });

            $("#remove-highlights").click(function (e) {

                if (sbgnFiltering.noneIsNotHighlighted()){
                    return;
                }

                cy.undoRedo().do("removeHighlights");
            });

            $('#remove-highlights-icon').click(function (e) {
                $('#remove-highlights').trigger("click");
            });

            $("#make-compound-complex").click(function (e) {
                var selected = cy.nodes(":selected").filter(function (i, element) {
                    var sbgnclass = element.data("sbgnclass")
                    return isEPNClass(sbgnclass);
                });
                selected = sbgnElementUtilities.getTopMostNodes(selected);
                if (selected.length == 0 || !sbgnElementUtilities.allHaveTheSameParent(selected)) {
                    return;
                }
                var param = {
                    compundType: "complex",
                    nodesToMakeCompound: selected
                };

                cy.undoRedo().do("createCompoundForSelectedNodes", param);
                
            });

            $("#make-compound-compartment").click(function (e) {
                var selected = cy.nodes(":selected");
                selected = sbgnElementUtilities.getTopMostNodes(selected);
                if (selected.length == 0 || !sbgnElementUtilities.allHaveTheSameParent(selected)) {
                    return;
                }

                var param = {
                    compundType: "compartment",
                    nodesToMakeCompound: selected
                };

                cy.undoRedo().do("createCompoundForSelectedNodes", param);

            });

            $("#layout-properties").click(function (e) { //funda
              //  var lp = modelManager.updateLayoutProperties(sbgnLayout.defaultLayoutProperties);
                //sbgnLayout.render();
                sbgnLayoutProp.render();
            });

            $("#layout-properties-icon").click(function (e) {
                $("#layout-properties").trigger('click');
            });








            $("#sbgn-properties").click(function (e) {
                sbgnProperties.render();
            });

            $("#grid-properties").click(function (e) {
                gridProperties.render();
            });

            $("#query-pathsbetween").click(function (e) {
                pathsBetweenQuery.render();
            });

            $("#create-reaction-template").click(function (e) {
                reactionTemplate.render();
            });

            $("#properties-icon").click(function (e) {
                $("#sbgn-properties").trigger('click');
            });


            $("#collapse-selected").click(function (e) {
                var nodes = cy.nodes(":selected").filter("[expanded-collapsed='expanded']");
                var thereIs = nodes.collapsibleNodes().length > 0;

                if (!thereIs) {
                    return;
                }

                cy.undoRedo().do("collapse", {
                    nodes: nodes,
//      options: getExpandCollapseOptions()
                });


            });

            $("#collapse-complexes").click(function (e) {
                var complexes = cy.nodes("[sbgnclass='complex'][expanded-collapsed='expanded']");
                var thereIs = complexes.collapsibleNodes().length > 0;

                if (!thereIs) {
                    return;
                }

                cy.undoRedo().do("collapseRecursively", {
                    nodes: complexes,
//      options: getExpandCollapseOptions()
                });
            });

            $("#collapse-selected-icon").click(function (e) {
                if (modeHandler.mode == "selection-mode") {
                    $("#collapse-selected").trigger('click');
                }
            });

            $("#expand-selected").click(function (e) {
                var nodes = cy.nodes(":selected").filter("[expanded-collapsed='collapsed']");
                var thereIs = nodes.expandableNodes().length > 0;

                if (!thereIs) {
                    return;
                }

                cy.undoRedo().do("expand", {
                    nodes: nodes,
//      options: getExpandCollapseOptions()
                });
            });

            $("#expand-complexes").click(function (e) {
                var nodes = cy.nodes(":selected").filter("[sbgnclass='complex'][expanded-collapsed='collapsed']");
                var thereIs = nodes.expandableNodes().length > 0;

                if (!thereIs) {
                    return;
                }

                cy.undoRedo().do("expandRecursively", {
                    nodes: nodes,
//      options: getExpandCollapseOptions()
                });
            });

            $("#expand-selected-icon").click(function (e) {
                if (modeHandler.mode == "selection-mode") {
                    $("#expand-selected").trigger('click');
                }
            });

            $("#collapse-all").click(function (e) {
                var nodes = cy.nodes(':visible').filter("[expanded-collapsed='expanded']");
                var thereIs = nodes.collapsibleNodes().length > 0;

                if (!thereIs) {
                    return;
                }

                cy.undoRedo().do("collapseRecursively", {
                    nodes: nodes,
//      options: getExpandCollapseOptions()
                });
            });

            $("#expand-all").click(function (e) {
                var nodes = cy.nodes(':visible').filter("[expanded-collapsed='collapsed']");
                var thereIs = nodes.expandableNodes().length > 0;

                if (!thereIs) {
                    return;
                }

                cy.undoRedo().do("expandRecursively", {
                    nodes: nodes,
//      options: getExpandCollapseOptions()
                });
            });
            $("#perform-layout-icon").click(function (e) {
                if (modeHandler.mode == "selection-mode") {
                    $("#perform-layout").trigger('click');
                }
            });

            $("#perform-layout").click(function (e) {

                var nodesData = getNodesData();
                startSpinner("layout-spinner");

                beforePerformLayout();
                var preferences = {
                    animate: sbgnStyleRules['animate-on-drawing-changes']?'end':false
                };

                if(sbgnLayoutProp.currentLayoutProperties.animate == 'during'){
                    delete preferences.animate;
                }

                sbgnLayoutProp.applyLayout(preferences);

                nodesData.firstTime = true;

            });


            $("#perform-incremental-layout").click(function (e) {

                var nodesData = getNodesData();

                beforePerformLayout();

                sbgnLayout.applyIncrementalLayout();

                //funda
                syncManager.performLayoutFunction({nodesData:nodesData});
                
            });

            $("#undo-last-action").click(function (e) {
                if(!syncManager.manager.isUndoStackEmpty()){ //funda added this check
                    syncManager.manager.undo();
                    
                }
            });

            $("#redo-last-action").click(function (e) {
                if(!syncManager.manager.isRedoStackEmpty()) { //funda added this check
                syncManager.manager.redo();
                
            }
            });

            $("#undo-last-action-global").click(function (e) {
                if(modelManager.isUndoPossible()){
                    modelManager.doCommand("undo");
                    
                }
            });

            $("#redo-last-action-global").click(function (e) {
                if(modelManager.isRedoPossible()) {
                    modelManager.doCommand("redo");

                }
            });

            $("#undo-icon").click(function (e) { //funda changed to global
                $("#undo-last-action-global").trigger('click');
            });

            $("#redo-icon").click(function (e) { //funda changed to global
                $("#redo-last-action-global").trigger('click');
            });

            $("#save-as-png").click(function (evt) {
                var pngContent = cy.png({scale: 3, full: true});

                // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
                function b64toBlob(b64Data, contentType, sliceSize) {
                    contentType = contentType || '';
                    sliceSize = sliceSize || 512;

                    var byteCharacters = atob(b64Data);
                    var byteArrays = [];

                    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                        var slice = byteCharacters.slice(offset, offset + sliceSize);

                        var byteNumbers = new Array(slice.length);
                        for (var i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i);
                        }

                        var byteArray = new Uint8Array(byteNumbers);

                        byteArrays.push(byteArray);
                    }

                    var blob = new Blob(byteArrays, {type: contentType});
                    return blob;
                }

                // this is to remove the beginning of the pngContent: data:img/png;base64,
                var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

                saveAs(b64toBlob(b64data, "image/png"), "network.png");

                //window.open(pngContent, "_blank");
            });

            $("#save-as-jpg").click(function (evt) {
                var pngContent = cy.jpg({scale: 3, full: true});

                // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
                function b64toBlob(b64Data, contentType, sliceSize) {
                    contentType = contentType || '';
                    sliceSize = sliceSize || 512;

                    var byteCharacters = atob(b64Data);
                    var byteArrays = [];

                    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                        var slice = byteCharacters.slice(offset, offset + sliceSize);

                        var byteNumbers = new Array(slice.length);
                        for (var i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i);
                        }

                        var byteArray = new Uint8Array(byteNumbers);

                        byteArrays.push(byteArray);
                    }

                    var blob = new Blob(byteArrays, {type: contentType});
                    return blob;
                }

                // this is to remove the beginning of the pngContent: data:img/png;base64,
                var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

                saveAs(b64toBlob(b64data, "image/jpg"), "network.jpg");
            });

            $("#load-file").click(function (evt) {
                $("#file-input").trigger('click');
            });

            $("#load-file-icon").click(function (evt) {
                $("#load-file").trigger('click');
            });

            $("#save-as-sbgnml").click(function (evt) {
                var sbgnmlText = jsonToSbgnml.createSbgnml(cy.nodes(":visible"), cy.edges(":visible"));

                var blob = new Blob([sbgnmlText], {
                    type: "text/plain;charset=utf-8;",
                });
                var filename = document.getElementById('file-name').innerHTML;
                saveAs(blob, filename);
            });

            $("#save-icon").click(function (evt) {
                $("#save-as-sbgnml").trigger('click');
            });

            $("#save-command-history").click(function (evt) {
                var cmdTxt = JSON.stringify(modelManager.getHistory());

                var blob = new Blob([cmdTxt], {
                    type: "text/plain;charset=utf-8;",
                });
                var filename = document.getElementById('file-name').innerHTML;
                saveAs(blob, filename);
            });


            $("body").on("click", ".biogene-info .expandable", function (evt) {
                var expanderOpts = {
                    slicePoint: 150,
                    expandPrefix: ' ',
                    expandText: ' (...)',
                    userCollapseText: ' (show less)',
                    moreClass: 'expander-read-more',
                    lessClass: 'expander-read-less',
                    detailClass: 'expander-details',
                    expandEffect: 'fadeIn',
                    collapseEffect: 'fadeOut'
                };

                $(".biogene-info .expandable").expander(expanderOpts);
                expanderOpts.slicePoint = 2;
                expanderOpts.widow = 0;
            });



            $("#node-label-textbox").keydown(function (e) {
                if (e.which === 13) {
                    $("#node-label-textbox").blur();
                }
            });



        }
    }
}

function PathsBetweenQuery(socket, userName){

    return{
        el: '#query-pathsbetween-table',

        defaultQueryParameters: {
            geneSymbols: "CDK4 RB1",
            lengthLimit: 1
            //    shortestK: 0,
            //    enableShortestKAlteration: false,
            //    ignoreS2SandT2TTargets: false
        },
        currentQueryParameters: null,
        initialize: function () {
            var self = this;
            self.copyProperties();

        },
        copyProperties: function () {
            this.currentQueryParameters = _.clone(this.defaultQueryParameters);
        },
        render: function () {
            var self = this;
          //  self.template = _.template($("#query-pathsbetween-template").html(), self.currentQueryParameters);
           // $(self.el).html(self.template);



            self.template = _.template($("#query-pathsbetween-template").html()); //funda
            self.template(self.currentQueryParameters);
            $(self.el).html(self.template(self.currentQueryParameters)); //funda




            $("#query-pathsbetween-enable-shortest-k-alteration").change(function (e) {
                if (document.getElementById("query-pathsbetween-enable-shortest-k-alteration").checked) {
                    $("#query-pathsbetween-shortest-k").prop("disabled", false);
                }
                else {
                    $("#query-pathsbetween-shortest-k").prop("disabled", true);
                }
            });

            $(self.el).dialog({width: 'auto'});

            $("#save-query-pathsbetween").die("click").live("click", function (evt) {

                self.currentQueryParameters.geneSymbols = document.getElementById("query-pathsbetween-gene-symbols").value;
                self.currentQueryParameters.lengthLimit = Number(document.getElementById("query-pathsbetween-length-limit").value);

                var pc2URL = "http://www.pathwaycommons.org/pc2/";
                //var format = "graph?format=SBGN";
                var format = "graph?format=BIOPAX";
                var kind = "&kind=PATHSBETWEEN";
                var limit = "&limit=" + self.currentQueryParameters.lengthLimit;
                var sources = "";

                var geneSymbolsArray = self.currentQueryParameters.geneSymbols.replace("\n", " ").replace("\t", " ").split(" ");
                for (var i = 0; i < geneSymbolsArray.length; i++) {
                    var currentGeneSymbol = geneSymbolsArray[i];
                    if (currentGeneSymbol.length == 0 || currentGeneSymbol == ' ' || currentGeneSymbol == '\n' || currentGeneSymbol == '\t') {
                        continue;
                    }

                    sources = sources + "&source=" + currentGeneSymbol;

                }


                pc2URL = pc2URL + format + kind + limit + sources;



                socket.emit('PCQuery',  {url: pc2URL, type:"sbgn"}, function(sbgnData){

                    if(sbgnData!=null) {

                        var w = window.open(("query_" + userName), "width = 1600, height = 1200, left = " + window.left + " right = " + window.right, function(){
                            w.postMessage(sbgnData, "*");

                        });

                        //
                        // //because window opening takes a while
                        // // // //FIXME: find a more elegant solution
                        // setTimeout(function () {
                        //     w.postMessage(sbgnData, "*");
                        // }, 1000);

                    }
                    else
                        alert("No results found!");

                });


                $(self.el).dialog('close');
            });

            $("#cancel-query-pathsbetween").die("click").live("click", function (evt) {
                $(self.el).dialog('close');
            });


        }

    }
}



    var ReactionTemplate = Backbone.View.extend({
        defaultTemplateParameters: {
            templateType: "association",
            macromoleculeList: ["", ""],
            templateReactionEnableComplexName: true,
            templateReactionComplexName: "",
            getMacromoleculesHtml: function(){
                var html = "<table>";
                for( var i = 0; i < this.macromoleculeList.length; i++){
                    html += "<tr><td>"
                        + "<input type='text' class='template-reaction-textbox input-small layout-text' name='"
                        + i + "'" + " value='" + this.macromoleculeList[i] + "'></input>"
                        + "</td><td><img style='padding-bottom: 8px;' class='template-reaction-delete-button' width='12px' height='12px' name='" + i + "' src='sample-app/sampleapp-images/delete.png'/></td></tr>";
                }

                html += "<tr><td><img id='template-reaction-add-button' src='sample-app/sampleapp-images/add.png'/></td></tr></table>";
                return html;
            },
            getComplexHtml: function(){
                var html = "<table>"
                    + "<tr><td><input type='checkbox' class='input-small layout-text' id='template-reaction-enable-complex-name'";

                if(this.templateReactionEnableComplexName){
                    html += " checked ";
                }

                html += "/>"
                    + "</td><td><input type='text' class='input-small layout-text' id='template-reaction-complex-name' value='"
                    + this.templateReactionComplexName + "'";

                if(!this.templateReactionEnableComplexName){
                    html += " disabled ";
                }

                html += "></input>"
                    + "</td></tr></table>";

                return html;
            },
            getInputHtml: function(){
                if(this.templateType === 'association') {
                    return this.getMacromoleculesHtml();
                }
                else if(this.templateType === 'dissociation'){
                    return this.getComplexHtml();
                }
            },
            getOutputHtml: function(){
                if(this.templateType === 'association') {
                    return this.getComplexHtml();
                }
                else if(this.templateType === 'dissociation'){
                    return this.getMacromoleculesHtml();
                }
            }
        },
        currentTemplateParameters: undefined,
        initialize: function () {
            var self = this;
            self.copyProperties();
            self.template = _.template($("#reaction-template").html());


            self.template = self.template(self.currentTemplateParameters);
        },
        copyProperties: function () {
            this.currentTemplateParameters = jQuery.extend(true, [], this.defaultTemplateParameters);
        },
        render: function () {
            var self = this;
            self.template = _.template($("#reaction-template").html());
            self.template = self.template(self.currentTemplateParameters);
            $(self.el).html(self.template);

            dialogUtilities.openDialog(self.el, {width:'auto'});

            $(document).off('change', '#reaction-template-type-select').on('change', '#reaction-template-type-select', function (e) {
                var optionSelected = $("option:selected", this);
                var valueSelected = this.value;
                self.currentTemplateParameters.templateType = valueSelected;

                self.template = _.template($("#reaction-template").html());
                self.template = self.template(self.currentTemplateParameters);
                $(self.el).html(self.template);

                $(self.el).dialog({width:'auto'});
            });

            $(document).off("change", "#template-reaction-enable-complex-name").on("change", "#template-reaction-enable-complex-name", function(e){
                self.currentTemplateParameters.templateReactionEnableComplexName =
                    !self.currentTemplateParameters.templateReactionEnableComplexName;
                self.template = _.template($("#reaction-template").html());
                self.template = self.template(self.currentTemplateParameters);
                $(self.el).html(self.template);

                $(self.el).dialog({width:'auto'});
            });

            $(document).off("change", "#template-reaction-complex-name").on("change", "#template-reaction-complex-name", function(e){
                self.currentTemplateParameters.templateReactionComplexName = $(this).val();
                self.template = _.template($("#reaction-template").html());
                self.template = self.template(self.currentTemplateParameters);
                $(self.el).html(self.template);

                $(self.el).dialog({width:'auto'});
            });

            $(document).off("click", "#template-reaction-add-button").on("click", "#template-reaction-add-button", function (event) {
                self.currentTemplateParameters.macromoleculeList.push("");

                self.template = _.template($("#reaction-template").html());
                self.template = self.template(self.currentTemplateParameters);
                $(self.el).html(self.template);

                $(self.el).dialog({width:'auto'});
            });

            $(document).off("change", ".template-reaction-textbox").on('change', ".template-reaction-textbox", function () {
                var index = parseInt($(this).attr('name'));
                var value = $(this).val();
                self.currentTemplateParameters.macromoleculeList[index] = value;

                self.template = _.template($("#reaction-template").html());
                self.template = self.template(self.currentTemplateParameters);
                $(self.el).html(self.template);

                $(self.el).dialog({width:'auto'});
            });

            $(document).off("click", ".template-reaction-delete-button").on("click", ".template-reaction-delete-button", function (event) {
                if(self.currentTemplateParameters.macromoleculeList.length <= 2){
                    return;
                }

                var index = parseInt($(this).attr('name'));
                self.currentTemplateParameters.macromoleculeList.splice(index, 1);

                self.template = _.template($("#reaction-template").html());
                self.template = self.template(self.currentTemplateParameters);
                $(self.el).html(self.template);

                $(self.el).dialog({width:'auto'});
            });

            $(document).off("click", "#create-template").on("click", "#create-template", function (evt) {
                var param = {
                    firstTime: true,
                    templateType: self.currentTemplateParameters.templateType,
                    processPosition: sbgnElementUtilities.convertToModelPosition({x: cy.width() / 2, y: cy.height() / 2}),
                    macromoleculeList: jQuery.extend(true, [], self.currentTemplateParameters.macromoleculeList),
                    complexName: self.currentTemplateParameters.templateReactionEnableComplexName?self.currentTemplateParameters.templateReactionComplexName:undefined,
                    tilingPaddingVertical: calculateTilingPaddings(parseInt(sbgnStyleRules['tiling-padding-vertical'], 10)),
                    tilingPaddingHorizontal: calculateTilingPaddings(parseInt(sbgnStyleRules['tiling-padding-horizontal'], 10))
                };

                cy.undoRedo().do("createTemplateReaction", param);

                self.copyProperties();
                $(self.el).dialog('close');
            });

            $(document).off("click", "#cancel-template").on("click", "#cancel-template", function (evt) {
                self.copyProperties();
                $(self.el).dialog('close');
            });

            return this;
        }
    });



    var PromptSave = Backbone.View.extend({

        initialize: function () {
            var self = this;
            self.template = _.template($("#prompt-save-template").html());
        },
        render: function (afterFunction) {
            var self = this;
            self.template = _.template($("#prompt-save-template").html());
            $(self.el).html(self.template);

            dialogUtilities.openDialog(self.el, {width: "auto", height: "auto", "minHeight": "none"});

            $(document).off("click", "#prompt-save-accept").on("click", "#prompt-save-accept", function (evt) {
                $("#save-as-sbgnml").trigger('click');
                afterFunction();
                $(self.el).dialog('close');
            });

            $(document).off("click", "#prompt-save-reject").on("click", "#prompt-save-reject", function (evt) {
                afterFunction();
                $(self.el).dialog('close');
            });

            $(document).off("click", "#prompt-save-cancel").on("click", "#prompt-save-cancel", function (evt) {
                $(self.el).dialog('close');
            });

            return this;
        }
    });

    var SBGNLayout = Backbone.View.extend({
        defaultLayoutProperties: {
            name: 'cose-bilkent',
            nodeRepulsion: 4500,
            idealEdgeLength: 50,
            edgeElasticity: 0.45,
            nestingFactor: 0.1,
            gravity: 0.25,
            numIter: 2500,
            tile: true,
            animationEasing: 'cubic-bezier(0.19, 1, 0.22, 1)',
            animate: 'end',
            animationDuration: 1000,
            randomize: false,
            tilingPaddingVertical: function () {
                return calculateTilingPaddings(parseInt(sbgnStyleRules['tiling-padding-vertical'], 10));
            },
            tilingPaddingHorizontal: function () {
                return calculateTilingPaddings(parseInt(sbgnStyleRules['tiling-padding-horizontal'], 10));
            },
            gravityRangeCompound: 1.5,
            gravityCompound: 1.0,
            gravityRange: 3.8,
            stop: function(){
                if($('.layout-spinner').length > 0){
                    $('.layout-spinner').remove();
                }
            }
        },
        currentLayoutProperties: null,
        initialize: function () {
            var self = this;
            self.copyProperties();

            var templateProperties = _.clone(self.currentLayoutProperties);
            templateProperties.tilingPaddingVertical = sbgnStyleRules['tiling-padding-vertical'];
            templateProperties.tilingPaddingHorizontal = sbgnStyleRules['tiling-padding-horizontal'];

            self.template = _.template($("#layout-settings-template").html());
            self.template = self.template(templateProperties);



        },
        copyProperties: function () {
            this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
        },
        applyLayout: function (preferences, undoable) {
            if(preferences === undefined){
                preferences = {};
            }
            var options = $.extend({}, this.currentLayoutProperties, preferences);
            if(undoable === false) {
                cy.elements().filter(':visible').layout(options);
            }
            else {
                cy.undoRedo().do("layout", {
                    options: options,
                    eles: cy.elements().filter(':visible')
                });
            }
        },
        render: function () {
            var self = this;

            var templateProperties = _.clone(self.currentLayoutProperties);
            templateProperties.tilingPaddingVertical = sbgnStyleRules['tiling-padding-vertical'];
            templateProperties.tilingPaddingHorizontal = sbgnStyleRules['tiling-padding-horizontal'];

            self.template = _.template($("#layout-settings-template").html());
            self.template = self.template(templateProperties);
            $(self.el).html(self.template);

            dialogUtilities.openDialog(self.el);

            $(document).off("click", "#save-layout").on("click", "#save-layout", function (evt) {
                self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion").value);
                self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length").value);
                self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity").value);
                self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor").value);
                self.currentLayoutProperties.gravity = Number(document.getElementById("gravity").value);
                self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter").value);
                self.currentLayoutProperties.tile = document.getElementById("tile").checked;
                self.currentLayoutProperties.animate = document.getElementById("animate").checked?'during':'end';
                self.currentLayoutProperties.randomize = !document.getElementById("incremental").checked;
                self.currentLayoutProperties.gravityRangeCompound = Number(document.getElementById("gravity-range-compound").value);
                self.currentLayoutProperties.gravityCompound = Number(document.getElementById("gravity-compound").value);
                self.currentLayoutProperties.gravityRange = Number(document.getElementById("gravity-range").value);

                sbgnStyleRules['tiling-padding-vertical'] = Number(document.getElementById("tiling-padding-vertical").value);
                sbgnStyleRules['tiling-padding-horizontal'] = Number(document.getElementById("tiling-padding-horizontal").value);
            });

            $(document).off("click", "#default-layout").on("click", "#default-layout", function (evt) {
                self.copyProperties();

                sbgnStyleRules['tiling-padding-vertical'] = defaultSbgnStyleRules['tiling-padding-vertical'];
                sbgnStyleRules['tiling-padding-horizontal'] = defaultSbgnStyleRules['tiling-padding-horizontal'];

                var templateProperties = _.clone(self.currentLayoutProperties);
                templateProperties.tilingPaddingVertical = sbgnStyleRules['tiling-padding-vertical'];
                templateProperties.tilingPaddingHorizontal = sbgnStyleRules['tiling-padding-horizontal'];

                self.template = _.template($("#layout-settings-template").html());
                self.template = self.template(templateProperties);
                $(self.el).html(self.template);
            });

            return this;
        }
    });

    var SBGNProperties = Backbone.View.extend({
        defaultSBGNProperties: {
            compoundPadding: parseInt(sbgnStyleRules['compound-padding'], 10),
            dynamicLabelSize: sbgnStyleRules['dynamic-label-size'],
            fitLabelsToNodes: sbgnStyleRules['fit-labels-to-nodes'],
            rearrangeAfterExpandCollapse: sbgnStyleRules['rearrange-after-expand-collapse'],
            animateOnDrawingChanges: sbgnStyleRules['animate-on-drawing-changes'],
            adjustNodeLabelFontSizeAutomatically: sbgnStyleRules['adjust-node-label-font-size-automatically']
        },
        currentSBGNProperties: null,
        initialize: function () {
            var self = this;
            self.copyProperties();
            self.template = _.template($("#sbgn-properties-template").html());
            self.template = self.template(self.currentSBGNProperties);
        },
        copyProperties: function () {
            this.currentSBGNProperties = _.clone(this.defaultSBGNProperties);
        },
        render: function () {
            var self = this;
            self.template = _.template($("#sbgn-properties-template").html());
            self.template = self.template(self.currentSBGNProperties);
            $(self.el).html(self.template);

            dialogUtilities.openDialog(self.el);

            $(document).off("click", "#save-sbgn").on("click", "#save-sbgn", function (evt) {

                var param = {};
                param.firstTime = true;
                param.previousSBGNProperties = _.clone(self.currentSBGNProperties);

                self.currentSBGNProperties.compoundPadding = Number(document.getElementById("compound-padding").value);
                self.currentSBGNProperties.dynamicLabelSize = $('select[name="dynamic-label-size"] option:selected').val();
                self.currentSBGNProperties.fitLabelsToNodes = document.getElementById("fit-labels-to-nodes").checked;
                self.currentSBGNProperties.rearrangeAfterExpandCollapse =
                    document.getElementById("rearrange-after-expand-collapse").checked;
                self.currentSBGNProperties.animateOnDrawingChanges =
                    document.getElementById("animate-on-drawing-changes").checked;
                self.currentSBGNProperties.adjustNodeLabelFontSizeAutomatically =
                    document.getElementById("adjust-node-label-font-size-automatically").checked;

                //Refresh paddings if needed
                if (sbgnStyleRules['compound-padding'] != self.currentSBGNProperties.compoundPadding) {
                    sbgnStyleRules['compound-padding'] = self.currentSBGNProperties.compoundPadding;
                    refreshPaddings();
                }
                //Refresh label size if needed
                if (sbgnStyleRules['dynamic-label-size'] != self.currentSBGNProperties.dynamicLabelSize) {
                    sbgnStyleRules['dynamic-label-size'] = '' + self.currentSBGNProperties.dynamicLabelSize;
                    cy.nodes().removeClass('changeLabelTextSize');
                    cy.nodes().addClass('changeLabelTextSize');
                }
                //Refresh truncations if needed
                if (sbgnStyleRules['fit-labels-to-nodes'] != self.currentSBGNProperties.fitLabelsToNodes) {
                    sbgnStyleRules['fit-labels-to-nodes'] = self.currentSBGNProperties.fitLabelsToNodes;
                    cy.nodes().removeClass('changeContent');
                    cy.nodes().addClass('changeContent');
                }

                sbgnStyleRules['rearrange-after-expand-collapse'] =
                    self.currentSBGNProperties.rearrangeAfterExpandCollapse;

                sbgnStyleRules['animate-on-drawing-changes'] =
                    self.currentSBGNProperties.animateOnDrawingChanges;

                //Refresh node label sizes if needed
                if (sbgnStyleRules['adjust-node-label-font-size-automatically'] != self.currentSBGNProperties.adjustNodeLabelFontSizeAutomatically) {
                    sbgnStyleRules['adjust-node-label-font-size-automatically'] = self.currentSBGNProperties.adjustNodeLabelFontSizeAutomatically;
                    cy.nodes().removeClass('changeLabelTextSize');
                    cy.nodes().addClass('changeLabelTextSize');
                }
            });

            $(document).off("click", "#default-sbgn").on("click", "#default-sbgn", function (evt) {
                self.copyProperties();
                self.template = _.template($("#sbgn-properties-template").html());
                self.template = self.template(self.currentSBGNProperties);
                $(self.el).html(self.template);
            });

            return this;
        }
    });

    var GridProperties = Backbone.View.extend({
        defaultGridProperties: {
            showGrid: sbgnStyleRules['show-grid'],
            snapToGrid: sbgnStyleRules['snap-to-grid'],
            discreteDrag: sbgnStyleRules['discrete-drag'],
            gridSize: sbgnStyleRules['grid-size'],
            autoResizeNodes: sbgnStyleRules['auto-resize-nodes'],
            showAlignmentGuidelines: sbgnStyleRules['show-alignment-guidelines'],
            guidelineTolerance: sbgnStyleRules['guideline-tolerance'],
            guidelineColor: sbgnStyleRules['guideline-color']
        },
        currentGridProperties: null,
        initialize: function () {
            var self = this;
            self.copyProperties();
            self.template = _.template($("#grid-properties-template").html());
            self.template = self.template(self.currentGridProperties);
        },
        copyProperties: function () {
            this.currentGridProperties = _.clone(this.defaultGridProperties);
        },
        render: function () {
            var self = this;
            self.template = _.template($("#grid-properties-template").html());
            self.template = self.template(self.currentGridProperties);
            $(self.el).html(self.template);

            dialogUtilities.openDialog(self.el);

            $(document).off("click", "#save-grid").on("click", "#save-grid", function (evt) {

                var param = {};
                param.firstTime = true;
                param.previousGrid = _.clone(self.currentGridProperties);

                self.currentGridProperties.showGrid = document.getElementById("show-grid").checked;
                self.currentGridProperties.snapToGrid = document.getElementById("snap-to-grid").checked;
                self.currentGridProperties.gridSize = Number(document.getElementById("grid-size").value);
                self.currentGridProperties.discreteDrag = document.getElementById("discrete-drag").checked;
                self.currentGridProperties.autoResizeNodes = document.getElementById("auto-resize-nodes").checked;
                self.currentGridProperties.showAlignmentGuidelines = document.getElementById("show-alignment-guidelines").checked;
                self.currentGridProperties.guidelineTolerance = Number(document.getElementById("guideline-tolerance").value);
                self.currentGridProperties.guidelineColor = document.getElementById("guideline-color").value;

                sbgnStyleRules["show-grid"] = document.getElementById("show-grid").checked;
                sbgnStyleRules["snap-to-grid"] = document.getElementById("snap-to-grid").checked;
                sbgnStyleRules["grid-size"] = Number(document.getElementById("grid-size").value);
                sbgnStyleRules["discrete-drag"] = document.getElementById("discrete-drag").checked;
                sbgnStyleRules["auto-resize-nodes"] = document.getElementById("auto-resize-nodes").checked;
                sbgnStyleRules["show-alignment-guidelines"] = document.getElementById("show-alignment-guidelines").checked;
                sbgnStyleRules["guideline-tolerance"] = Number(document.getElementById("guideline-tolerance").value);
                sbgnStyleRules["guideline-color"] = document.getElementById("guideline-color").value;


                cy.gridGuide({
                    drawGrid: self.currentGridProperties.showGrid,
                    snapToGrid: self.currentGridProperties.snapToGrid,
                    gridSpacing: self.currentGridProperties.gridSize,
                    discreteDrag: self.currentGridProperties.discreteDrag,
                    resize: self.currentGridProperties.autoResizeNodes,
                    guidelines: self.currentGridProperties.showAlignmentGuidelines,
                    guidelinesTolerance: self.currentGridProperties.guidelineTolerance,
                    guidelinesStyle: {
                        strokeStyle: self.currentGridProperties.guidelineColor
                    }
                });
            });

            $(document).off("click", "#default-grid").on("click", "#default-grid", function (evt) {
                self.copyProperties();
                self.template = _.template($("#grid-properties-template").html());
                self.template = self.template(self.currentGridProperties);
                $(self.el).html(self.template);
            });

            return this;
        }
    });

    var PathsBetweenQuery = Backbone.View.extend({
        defaultQueryParameters: {
            geneSymbols: "",
            lengthLimit: 1
//    shortestK: 0,
//    enableShortestKAlteration: false,
//    ignoreS2SandT2TTargets: false
        },
        currentQueryParameters: null,
        initialize: function () {
            var self = this;
            self.copyProperties();
            self.template = _.template($("#query-pathsbetween-template").html());
            self.template = self.template(self.currentQueryParameters);
        },
        copyProperties: function () {
            this.currentQueryParameters = _.clone(this.defaultQueryParameters);
        },
        render: function () {
            var self = this;
            self.template = _.template($("#query-pathsbetween-template").html());
            self.template = self.template(self.currentQueryParameters);
            $(self.el).html(self.template);

            $("#query-pathsbetween-enable-shortest-k-alteration").change(function(e){
                if(document.getElementById("query-pathsbetween-enable-shortest-k-alteration").checked){
                    $( "#query-pathsbetween-shortest-k" ).prop( "disabled", false );
                }
                else {
                    $( "#query-pathsbetween-shortest-k" ).prop( "disabled", true );
                }
            });

//    $(self.el).dialog({width:'auto'});
            dialogUtilities.openDialog(self.el, {width:'auto'});

            $(document).off("click", "#save-query-pathsbetween").on("click", "#save-query-pathsbetween", function (evt) {

                self.currentQueryParameters.geneSymbols = document.getElementById("query-pathsbetween-gene-symbols").value;
                self.currentQueryParameters.lengthLimit = Number(document.getElementById("query-pathsbetween-length-limit").value);
//      self.currentQueryParameters.shortestK = Number(document.getElementById("query-pathsbetween-shortest-k").value);
//      self.currentQueryParameters.enableShortestKAlteration =
//              document.getElementById("query-pathsbetween-enable-shortest-k-alteration").checked;
//      self.currentQueryParameters.ignoreS2SandT2TTargets =
//              document.getElementById("query-pathsbetween-ignore-s2s-t2t-targets").checked;

                var pc2URL = "http://www.pathwaycommons.org/pc2/";
                var format = "graph?format=SBGN";
                var kind = "&kind=PATHSBETWEEN";
                var limit = "&limit=" + self.currentQueryParameters.lengthLimit;
                var sources = "";
                var newfilename = "";

                var geneSymbolsArray = self.currentQueryParameters.geneSymbols.replace("\n"," ").replace("\t"," ").split(" ");
                for(var i = 0; i < geneSymbolsArray.length; i++){
                    var currentGeneSymbol = geneSymbolsArray[i];
                    if(currentGeneSymbol.length == 0 || currentGeneSymbol == ' ' || currentGeneSymbol == '\n' || currentGeneSymbol == '\t'){
                        continue;
                    }

                    sources = sources + "&source=" + currentGeneSymbol;

                    if(newfilename == ''){
                        newfilename = currentGeneSymbol;
                    }
                    else{
                        newfilename = newfilename + '_' + currentGeneSymbol;
                    }
                }

                newfilename = newfilename + '_PBTWN.sbgnml';

                setFileContent(newfilename);
                pc2URL = pc2URL + format + kind + limit + sources;

                var containerWidth = cy.width();
                var containerHeight = cy.height();
                $('#sbgn-network-container').html('<i style="position: absolute; z-index: 9999999; left: ' + containerWidth / 2 + 'px; top: ' + containerHeight / 2 + 'px;" class="fa fa-spinner fa-spin fa-3x fa-fw"></i>');

                $.ajax(
                    {
                        url: pc2URL,
                        type: 'GET',
                        success: function(data)
                        {
                            (new SBGNContainer({
                                el: '#sbgn-network-container',
                                model: {cytoscapeJsGraph: sbgnmlToJson.convert(data)}
                            })).render();
                            inspectorUtilities.handleSBGNInspector();
                        }
                    });

                $(self.el).dialog('close');
            });

            $(document).off("click", "#cancel-query-pathsbetween").on("click", "#cancel-query-pathsbetween", function (evt) {
                $(self.el).dialog('close');
            });

            return this;
        }
    });