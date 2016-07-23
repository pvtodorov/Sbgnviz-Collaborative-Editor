    /**
 * Menu class
 * Initializes sbgnContainer, syncManager modelManager, SBGNLayout properties and SBGN Properties,
 * Listens to menu actions
 *
 * **/


var sbgnFiltering = require('../../../src/utilities/sbgn-filtering.js')();
var sbgnElementUtilities = require('../../../src/utilities/sbgn-element-utilities.js')();
//var expandCollapseUtilities = require('../../../src/utilities/expand-collapse-utilities.js')();
var sbgnmlToJson =require('../../../src/utilities/sbgnml-to-json-converter.js')();
var cytoscape = require('cytoscape');

    var jsonCorrector = require('../../../src/utilities/json-corrector.js');
    var jsonMerger = require('../../../src/utilities/json-merger.js');
    var idxcardjson = require('../../../src/utilities/idxcardjson-to-json-converter.js');

//Local functions
var setFileContent = function (fileName) {
    var span = document.getElementById('file-name');
    while (span.firstChild) {
        span.removeChild(span.firstChild);
    }
    span.appendChild(document.createTextNode(fileName));
};

var beforePerformLayout = function(){
    cy.nodes().removeData("ports");
    cy.edges().removeData("portsource");
    cy.edges().removeData("porttarget");

    cy.nodes().data("ports", []);
    cy.edges().data("portsource", []);
    cy.edges().data("porttarget", []);

    // cy.edges().removeData('weights');
    // cy.edges().removeData('distances');
    //
    // cy.edges().css('curve-style', 'bezier');

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

module.exports = function(){
    var cyMod =  require('./sample-app-cytoscape-sbgn.js');

    var syncManager = require('./synchronizationManager.js');

    var sbgnContainer;

    var sbgnLayout;
    var sbgnProperties;
    var gridProperties;
    var pathsBetweenQuery;


     return MenuFunctions = { //global reference for testing

         changeVisibilityStatus: function(id){

         },


         refreshGlobalUndoRedoButtonsStatus: function(){
          syncManager.refreshGlobalUndoRedoButtonsStatus();
         },

         loadFile:function(txtFile){

             syncManager.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
             var jsonObj = sbgnmlToJson.convert(txtFile);



             //get another sbgncontainer
             sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, syncManager));

             syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
             syncManager.modelManager.setSampleInd(-1, "me"); //to notify other clients

         },
     

         //Agent loads the file
         loadFileInNode: function(txtFile){


            syncManager.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
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

            syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

            syncManager.modelManager.setSampleInd(-1, "me"); //to notify other clients

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

        highlightNeighbors: function(selectedNodeIds){
            //unselect all others
            cy.nodes().unselect();


            selectedNodeIds.forEach(function(nodeId){
                cy.getElementById( nodeId).select();
            });


            var param = {
                sync: true,
                selectedEles : cy.$(":selected"),
                highlightNeighboursofSelected: true
            };



            syncManager.highlightSelected(param);

        },
        
        highlightProcesses: function(selectedNodeIds){
            //unselect all others
            cy.nodes().unselect();


            selectedNodeIds.forEach(function(nodeId){
                cy.getElementById( nodeId).select();
            });


            var param = {
                sync: true,
                selectedEles : cy.$(":selected"),
                highlightProcessesOfSelected: true
            };



            syncManager.highlightSelected(param);

        },
        
        removeHighlights: function(){
            syncManager.removeHighlights({sync:true});
        },

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

        changePosition: function(elId, pos, syncVal){
            var el = cy.$(('#' + elId))[0];
            var param = {
                ele: el,
                data: pos,
                sync: syncVal
            };


            if(el)
                syncManager.changePosition(param);


        },


       changeMultimerStatus: function(elId, isMultimer){

            var el = cy.$(('#' + elId))[0];
            var param = {
                ele: el,
                id: elId,
                data: isMultimer,
                sync: false
            };

            if(el)
                syncManager.changeIsMultimerStatus(param);

        },

        changeCloneMarkerStatus: function(elId, isCloneMarker){

            var el = cy.$(('#' + elId))[0];
            var param = {
                ele: el,
                id: elId,
                data: isCloneMarker,
                sync: false
            };

            if(el)
                syncManager.changeIsCloneMarkerStatus(param);

        },

        //Changes background-color
        //A separate command for highlighting nodes as we don't want the do/undo stack to be affected
        changeHighlightColor: function(elId, color){
            var el = cy.$(('#' + elId))[0];
            if(el)
                el.css('background-color', color);

            

        },
        //propName and modelDataName can be different: propName: name in cytoscape, modelDataName: name in nodejs model
        //proptype is either data or css
        changeElementProperty: function(elId, propName, modelDataName,propValue, propType, syncVal){
            var el = cy.$(('#' + elId))[0];

            if(el) {

                var param = {
                    ele: el,
                    id: elId,
                    dataType: propName,
                    data: propValue,
                    modelDataName: modelDataName,
                    sync: syncVal
                };

                if (propName == 'parent')//TODO

                    syncManager.changeParent(param);

                else if (propName == 'collapsedChildren') { //TODO???????
                    syncManager.changeCollapsedChildren(param);
                }

                else if (propName == "highlightStatus" || propName == "visibilityStatus")

                    syncManager.changeVisibilityOrHighlightStatus(param); //no do/undo here

                else {
                    var param = {
                        ele: [el],
                        id: elId,
                        dataType: propName,
                        data: propValue,
                        modelDataName: modelDataName,
                        sync: syncVal
                    };


                    if (propType == 'data')
                        syncManager.changeStyleData(param);
                    else if (propType == 'css')
                        syncManager.changeStyleCss(param);
                }
            }

         },

         changeExpandCollapseStatus: function(elId, status, syncVal) {
            var el = cy.$(('#' + elId))[0];

            setTimeout(function() { //wait for the layout to run on the other client's side
                if (status == 'expand') //no need to run incremental layout here -- other client will have run it already
                    syncManager.simpleExpandNode({node: el, sync: syncVal});
                else if (status == 'collapse')
                    syncManager.simpleCollapseNode({node: el, sync: syncVal});

            },0);
        },

         changeBendPoints:function(elId, newBendPointPositions, syncVal){
             var edge = cy.getElementById(elId);



             this.changeElementProperty(elId, 'bendPointPositions', 'bendPointPositions', newBendPointPositions, 'data', syncVal);

             if(newBendPointPositions.length > 0 ){
                 var result = sbgnBendPointUtilities.convertToRelativeBendPositions(edge);

                 if(result.distances.length > 0){
                     edge.data('weights', result.weights);
                     edge.data('distances', result.distances);
                     edge.css('curve-style', 'segments');
                 }

                 if(newBendPointPositions.length == 0){
                     edge.removeData('distances');
                     edge.removeData('weights');
                     edge.css('curve-style', 'bezier');
                 }
             }


             cy.forceRender();

         },


        updateLayoutProperties: function(lp){

            if(sbgnLayout)
                sbgnLayout.updateLayoutProperties(lp);

        },

        updateSample: function(ind, syncVal){


            if(ind < 0){ //for notifying other users -- this part is called through the model

                var jsonObj = syncManager.modelManager.getJsonFromModel();

                sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  syncManager));
                if(syncVal)
                    syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me");

            }
            else{

                
                getXMLObject(ind, function (xmlObject) {

                    var xmlText = new XMLSerializer().serializeToString(xmlObject);

                    var jsonObj = sbgnmlToJson.convert(xmlText);

                    sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  syncManager));

                    if(syncVal) {

                        syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me");
                    }

                });
          }


        },

        startInNode: function(modelManager){




            
            syncManager.modelManager = modelManager;

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



                    syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);


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


                syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
            }

        },

        start: function (modelManager) {


            //
            // //If we get a message om a separate window
            window.addEventListener('message', function(event) {



                if(event.data.graph)
                    self.loadFile(event.data.graph);


            }, false);



            var self = this;

            var socket = io();

            syncManager.modelManager = modelManager;



            sbgnLayout = new SBGNLayout(modelManager);

            var layoutProperties = modelManager.updateLayoutProperties(sbgnLayout.defaultLayoutProperties);

            sbgnLayout.initialize(layoutProperties);


            sbgnProperties = new SBGNProperties();
            sbgnProperties.initialize();

            pathsBetweenQuery = new PathsBetweenQuery(socket,  syncManager.modelManager.getName());
            pathsBetweenQuery.initialize();

            gridProperties = new GridProperties();
            gridProperties.initialize();



            var jsonObj = modelManager.getJsonFromModel();



            if (jsonObj == null) {//first time loading the graph-- load from the samples

                var ind = modelManager.getSampleInd("me");

                this.updateSample(ind, true);

            }
            else {//load from a previously loaded graph

                sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, syncManager));

                syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
            }

            /*
            document.getElementById("ctx-add-bend-point").addEventListener("contextmenu", function (event) {
                event.preventDefault();
            }, false);

            document.getElementById("ctx-remove-bend-point").addEventListener("contextmenu", function (event) {
                event.preventDefault();
            }, false);


            //Listen to menu actions

            $('.ctx-bend-operation').click(function (e) {
                $('.ctx-bend-operation').css('display', 'none');
            });

            $('#ctx-add-bend-point').click(function (e) {
                var edge = sbgnBendPointUtilities.currentCtxEdge;

                //funda: add current bend point
                var newBendPointPositions = edge.data('bendPointPositions');
                newBendPointPositions.push(sbgnBendPointUtilities.currentCtxPos);



                sbgnBendPointUtilities.addBendPoint();

                self.changeBendPoints(edge.id(), newBendPointPositions, true);


            });

            $('#ctx-remove-bend-point').click(function (e) {
                var edge = sbgnBendPointUtilities.currentCtxEdge;

                sbgnBendPointUtilities.removeBendPoint();


                var bendPointPositions = edge.data('bendPointPositions');


                bendPointPositions.splice(sbgnBendPointUtilities.currentBendIndex,1);



                self.changeBendPoints(edge.id(), bendPointPositions, true);
            });
*/
            $('#samples').click(function (e) {

                var ind = e.target.id;
                
                if(sbgnContainer)
                    syncManager.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");


                self.updateSample(ind, true);

                syncManager.modelManager.setSampleInd(ind, "me"); //let others know

            });

            $('#new-file-icon').click(function () {
                $('#new-file').trigger("click");
            });

            $('#new-file').click(function () {
                setFileContent("new_file.sbgnml");

                var jsonObj = {nodes: [], edges: []};

                syncManager.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
                cy.remove(cy.elements());
                sbgnContainer = new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, syncManager);
                syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

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


                syncManager.moveNodesConditionally(cy.nodes(":selected")); //synchronize
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
                syncManager.moveNodesConditionally(cy.nodes(":selected")); //synchronize
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
                syncManager.moveNodesConditionally(cy.nodes(":selected")); //synchronize
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

                syncManager.moveNodesConditionally(cy.nodes(":selected")); //synchronize
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
                syncManager.moveNodesConditionally(cy.nodes(":selected")); //synchronize
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
                syncManager.moveNodesConditionally(cy.nodes(":selected")); //synchronize
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
                        socket.emit('BioPAXRequest', this.result, "sbgn"); //convert to sbgn
                        socket.on('SBGNResult', function(sbgnData){

                            if(sbgnData.graph!= null){

                                var jsonObj = sbgnmlToJson.convert(sbgnData.graph);



                                //get another sbgncontainer
                                sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, syncManager));



                                syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);



                                syncManager.modelManager.setSampleInd(-1, "me"); //to notify other clients

                            }
                        });


                    }
                    else {

                        //TODO
                        socket.emit('BioPAXRequest', this.result, "biopax"); //convert to biopax

                        self.loadFile(this.result);
                        // var jsonObj = sbgnmlToJson.convert(this.result);
                        //
                        //
                        // //get another sbgncontainer
                        // sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, syncManager));
                        //
                        // syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
                        //
                        //
                        // syncManager.modelManager.setSampleInd(-1, "me"); //to notify other clients
                    }
                    // sbgnContainer =  new cyMod.SBGNContainer('#sbgn-network-container', jsonObj ,  syncManager);
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
                self.changeElementProperty( $(this).data('node').id(), 'sbgnlabel', 'sbgnlabel', $(this).attr('value'), 'data', true);
                $("#node-label-textbox").blur(); //funda added
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
            /*
            $("#hide-selected").click(function (e) {
                var param = {
                    sync: true,
                    selectedEles : cy.$(":selected")
                };

                syncManager.hideSelected(param);
                
            });
            $("#hide-selected-icon").click(function (e) {
                $("#hide-selected").trigger('click');
            });


            $("#show-selected").click(function (e) {
                var param = {
                    sync: true,
                    firstTime: true,
                    selectedEles : cy.$(":selected")
                };
                syncManager.showSelected(param);
                
            });
            $("#show-selected-icon").click(function (e) {
                $("#show-selected").trigger('click');
            });

            $("#show-all").click(function (e) {
                syncManager.showAll({sync:true});
                
            });
*/
            $("#hide-selected").click(function (e) {
                var selectedEles = cy.$(":selected");

                if(selectedEles.length === 0){
                    return;
                }

                cy.undoRedo().do("hide", selectedEles);

                syncManager.hideSelected(selectedEles);

            });

            $("#hide-selected-icon").click(function (e) {
                $("#hide-selected").trigger('click');
            });

            $("#show-selected").click(function (e) {
                if(cy.elements(":selected").length === cy.elements(':visible').length) {
                    return;
                }

                cy.undoRedo().do("show", cy.elements(":selected"));
                syncManager.showSelected(cy.elements(":selected"));

            });

            $("#show-selected-icon").click(function (e) {
                $("#show-selected").trigger('click');
            });

            $("#show-all").click(function (e) {
                if(cy.elements().length === cy.elements(':visible').length) {
                    return;
                }

                cy.undoRedo().do("show", cy.elements());
                syncManager.showSelected(cy.elements());

            });



            $("#delete-selected-simple").click(function (e) {

                var selectedEles = cy.$(":selected");

                var param = {
                    // firstTime: false,
                    eles: selectedEles,
                    sync:true
                };


                //Funda unselect all nodes otherwise they don't get deleted
                //TODO cy.elements().unselect();


           //TODO     cy.undoRedo().do("removeEles", param);
              
               syncManager.removeEles(selectedEles);





            });

            $("#delete-selected-simple-icon").click(function (e) {
                $("#delete-selected-simple").trigger('click');
            });
            $("#delete-selected-smart").click(function (e) {
                //find which elements will be selected

                var allNodes = cy.nodes();
                var selectedNodes = cy.nodes(":selected");
                cy.elements().unselect();
                var nodesToShow = sbgnFiltering.expandRemainingNodes(selectedNodes, allNodes);
                var nodesNotToShow = allNodes.not(nodesToShow);
                var connectedEdges = nodesNotToShow.connectedEdges();
                var selectedEles = connectedEdges.remove();

                selectedEles = selectedEles.union(nodesNotToShow.remove());

                var param = {
                    // firstTime: false,
                    eles: selectedEles,
                    sync: true
                };


                cy.undoRedo().do("deleteSelected", param);

                //syncManager.deleteSelected(param);
                


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
                syncManager.highlightSelected(elesToHighlight);
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
/*
            $("#neighbors-of-selected").click(function (e) {
                var param = {
                    sync: true,
                    selectedEles : cy.$(":selected"),
                    highlightNeighboursofSelected: true

                };

                syncManager.highlightSelected(param);
                


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
                var param = {
                    firstTime: true,
                    sync: true,
                    selectedEles : cy.$(":selected"),
                    highlightProcessesOfSelected: true
                };

                syncManager.highlightSelected(param);
                
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
                var param = {
                    sync: true,
                    selectedEles : cy.$(":selected"),
                    highlightProcessesOfSelected: true
                };


               syncManager.highlightSelected(param);
                


            });

            $("#remove-highlights").click(function (e) {

                syncManager.removeHighlights({sync:true});
                



            });
            $('#remove-highlights-icon').click(function (e) {
                $('#remove-highlights').trigger("click");
            });

            */
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
                    compoundType: "complex",
                    nodesToMakeCompound: selected
                };

                cy.elements().unselect();
                syncManager.createCompoundForSelectedNodes(param);
                //cy.undoRedo().do("createCompoundForSelectedNodes", param);
                
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

                syncManager.createCompoundForSelectedNodes(param);
                

            });

            $("#layout-properties").click(function (e) { //funda
                var lp = syncManager.modelManager.updateLayoutProperties(sbgnLayout.defaultLayoutProperties);
                sbgnLayout.render(lp);
            });

            $("#layout-properties-icon").click(function (e) {
                $("#layout-properties").trigger('click');
            });

            $("#grid-properties").click(function (e) {
                gridProperties.render();
            });
            $("#sbgn-properties").click(function (e) {
                sbgnProperties.render();
            });

            $("#query-pathsbetween").click(function (e) {
                pathsBetweenQuery.render();
        
            });

            $("#properties-icon").click(function (e) {
                $("#sbgn-properties").trigger('click');
            });

        /*    $("#collapse-selected").click(function (e) {
                var nodes = cy.nodes(":selected").filter("[expanded-collapsed='expanded']");
                var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(nodes, "collapse");

                if (!thereIs) {
                    return;
                }

                if (window.incrementalLayoutAfterExpandCollapse == null) {
                    window.incrementalLayoutAfterExpandCollapse =
                        (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
                }
                if (incrementalLayoutAfterExpandCollapse)
                    syncManager.collapseGivenNodes({
                        nodes: nodes,
                        sync: true
                    });
                else
                    syncManager.simpleCollapseGivenNodes({nodes:nodes, sync: true});
                
            });
            $("#collapse-complexes").click(function (e) {
                var complexes = cy.nodes("[sbgnclass='complex'][expanded-collapsed='expanded']");
                var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(complexes, "collapse");

                if (!thereIs) {
                    return;
                }

                if (window.incrementalLayoutAfterExpandCollapse == null) {
                    window.incrementalLayoutAfterExpandCollapse =
                        (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
                }
                if (incrementalLayoutAfterExpandCollapse)
                    syncManager.simpleCollapseGivenNodes({
                        nodes: complexes,
                        sync: true
                    });
                else
                    syncManager.simpleCollapseGivenNodes({nodes:complexes, sync: true});
            });
            $("#collapse-selected-icon").click(function (e) {
                if (modeHandler.mode == "selection-mode") {
                    $("#collapse-selected").trigger('click');
                }
            });
            $("#expand-selected").click(function (e) {
                var nodes = cy.nodes(":selected").filter("[expanded-collapsed='collapsed']");
                var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(nodes, "expand");

                if (!thereIs) {
                    return;
                }

                if (window.incrementalLayoutAfterExpandCollapse == null) {
                    window.incrementalLayoutAfterExpandCollapse =
                        (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
                }
                if (incrementalLayoutAfterExpandCollapse)
                    syncManager.expandGivenNodes({
                        nodes: cy.nodes(":selected"),
                        sync: true
                    });
                else
                    syncManager.simpleExpandGivenNodes({nodes:nodes, sync: true});
                
            });


            $("#expand-complexes").click(function (e) {
                var complexes = cy.nodes("[sbgnclass='complex'][expanded-collapsed='collapsed']");
                var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(complexes, "expand");

                if (!thereIs) {
                    return;
                }

                if (window.incrementalLayoutAfterExpandCollapse == null) {
                    window.incrementalLayoutAfterExpandCollapse =
                        (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
                }
                if (incrementalLayoutAfterExpandCollapse)
                    syncManager.expandAllNodes({
                        nodes: complexes,
                        sync: true,
                        selector: "complex-parent"
                    });
                else
                   syncManager.simpleExpandAllNodes({
                        nodes: complexes,
                        sync: true,
                        selector: "complex-parent"
                    });
            });
            $("#expand-selected-icon").click(function (e) {
                if (modeHandler.mode == "selection-mode") {
                    $("#expand-selected").trigger('click');
                }
            });

            $("#collapse-all").click(function (e) {
                var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "collapse");

                if (!thereIs) {
                    return;
                }

                if (window.incrementalLayoutAfterExpandCollapse == null) {
                    window.incrementalLayoutAfterExpandCollapse =
                        (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
                }
                if (incrementalLayoutAfterExpandCollapse)
                    ditorActions.collapseGivenNodes({
                        nodes: cy.nodes(),
                        sync: true
                    });
                else
                   syncManager.simpleCollapseGivenNodes({nodes: cy.nodes(), sync: true});
                
            });

            $("#expand-all").click(function (e) {
                var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "expand");

                if (!thereIs) {
                    return;
                }

                if (window.incrementalLayoutAfterExpandCollapse == null) {
                    window.incrementalLayoutAfterExpandCollapse =
                        (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
                }
                if (incrementalLayoutAfterExpandCollapse)
                    syncManager.expandAllNodes({
                        firstTime: true
                    });
                else
                    syncManager.simpleExpandAllNodes();
                
            });
*/

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

                if($('.layout-spinner').length === 0){
                    var containerWidth = cy.width();
                    var containerHeight = cy.height();
                    $('#sbgn-network-container').prepend('<i style="position: absolute; z-index: 9999999; left: ' + containerWidth / 2 + 'px; top: ' + containerHeight / 2 + 'px;" class="fa fa-spinner fa-spin fa-3x fa-fw layout-spinner"></i>');
                }

                beforePerformLayout();

                var preferences = {
                    animate: sbgnStyleRules['animate-on-drawing-changes']?'end':false
                };

                if(sbgnLayoutProp.currentLayoutProperties.animate == 'during'){
                    delete preferences.animate;
                }

                sbgnLayout.applyLayout(preferences);


                syncManager.performLayoutFunction({nodesData:nodesData});

                //       syncManager.manager._do(syncManager.ReturnToPositionsAndSizesCommand({nodesData: nodesData}));


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
                if(syncManager.modelManager.isUndoPossible()){
                    syncManager.modelManager.undoCommand();
                    
                }
            });

            $("#redo-last-action-global").click(function (e) {
                if(syncManager.modelManager.isRedoPossible()) {
                    syncManager.modelManager.redoCommand();
                    
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
                var cmdTxt = JSON.stringify(syncManager.modelManager.getHistory());

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


            //TODO: Funda
//Create a new model from REACH everytime a message is posted
 //           			// in the chat box.
            /*$("#send-message").click(function(evt) {
                var httpRequest;
                if (window.XMLHttpRequest)
                    httpRequest = new XMLHttpRequest();
                else
                    httpRequest = new ActiveXObject("Microsoft.XMLHTTP");

                //Let REACH process the message posted in the chat box.
                httpRequest.open("POST", "http://agathon.sista.arizona.edu:8080/odinweb/api/text", true);
                httpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                httpRequest.send("text="+document.getElementById("inputs-comment").value+"&output=indexcard");
                httpRequest.onreadystatechange = function () {
                    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                        var reachResponse = JSON.parse(httpRequest.responseText);
                        var newJson = idxcardjson.createJson(reachResponse); //Translate the index card JSON data format into a valid JSON model for SBGNviz.
                        var currSbgnml = jsonToSbgnml.createSbgnml(cy.nodes(":visible"), cy.edges(":visible"));
                        var currJson = sbgnmlToJson.convert(currSbgnml);


                        if(newJson!=null){
                            var jsonObj = jsonMerger.merge(newJson, currJson); //Merge the two SBGN models.

                            //get another sbgncontainer and display the new SBGN model.
                            syncManager.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
                            sbgnContainer = new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, syncManager);
                            syncManager.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

                            $("#perform-layout").trigger('click');
                        }
                    }
                }
            });


*/

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



                socket.emit('PCQuery',  pc2URL);

                socket.on('PCQueryResult', function(owlData){

                    if(owlData.graph!=null) {
                        socket.emit('BioPAXRequest', owlData.graph, "sbgn"); //convert to sbgn
                        socket.on('SBGNResult', function (sbgnData) {
                            var w = window.open(("query_" + userName), "width = 1600, height = 1200, left = " + window.left + " right = " + window.right);

                            // // //FIXME: find a more elegant solution
                            setTimeout(function () {
                                w.postMessage(sbgnData, "*");
                            }, 1000);

                        });
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

function SBGNLayout(modelManager){


    return {

        defaultLayoutProperties: {
            name: 'cose-bilkent',
            nodeRepulsion: 4500,
            nodeOverlap: 10,
            idealEdgeLength: 50,
            edgeElasticity: 0.45,
            nestingFactor: 0.1,
            gravity: 0.25,
            numIter: 2500,
            tile: true,
            animationEasing: 'cubic-bezier(0.19, 1, 0.22, 1)',
            animate: 'end',
            animationDuration: 1000,
            randomize: true,
            tilingPaddingVertical: function () {
                return calculateTilingPaddings(parseInt(sbgnStyleRules['tiling-padding-vertical'], 10));
                //return expandCollapseUtilities.calculatePaddings(parseInt(sbgnStyleRules['tiling-padding-vertical'], 10)); //funda changed name
            },
            tilingPaddingHorizontal: function () {
                return calculateTilingPaddings(parseInt(sbgnStyleRules['tiling-padding-horizontal'], 10));
                //return expandCollapseUtilities.calculatePaddings(parseInt(sbgnStyleRules['tiling-padding-horizontal'], 10));//funda changed name
            }

        },

        el: '#sbgn-layout-table',
        currentLayoutProperties: null,


        initialize: function (lp) {
            var self = this;

            self.currentLayoutProperties = lp;


            self.copyProperties();

            var templateProperties = _.clone(self.currentLayoutProperties);
            templateProperties.tilingPaddingVertical = sbgnStyleRules['tiling-padding-vertical'];
            templateProperties.tilingPaddingHorizontal = sbgnStyleRules['tiling-padding-horizontal'];


            // self.template = _.template($("#layout-settings-template").html()); //funda: using lodash
            //  self.template(templateProperties);


        },
        copyProperties: function () {
            this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
        },
        applyLayout: function (preferences) {
            if (preferences === undefined) {
                preferences = {};
            }
            var options = $.extend({}, this.currentLayoutProperties, preferences);

            cy.elements().filter(':visible').layout(options);
        },


        // applyIncrementalLayout: function () {
        //     var options = _.clone(this.currentLayoutProperties);
        //     options.randomize = false;
        //     options.animate = false;
        //     options.fit = false;
        //     cy.elements().filter(':visible').layout(options);
        // },
       updateLayoutProperties: function(layoutProps){ //funda added

            this.currentLayoutProperties = _.clone(layoutProps);

        },
        render: function (lp) {

            var self = this;

            var templateProperties = _.clone(self.currentLayoutProperties);
            templateProperties.tilingPaddingVertical = sbgnStyleRules['tiling-padding-vertical'];
            templateProperties.tilingPaddingHorizontal = sbgnStyleRules['tiling-padding-horizontal'];


            self.template = _.template($("#layout-settings-template").html()); //funda

            $(self.el).html(self.template(templateProperties)); //funda


            $(self.el).dialog();


            $("#node-repulsion")[0].value = lp.nodeRepulsion.toString();
            $("#node-overlap")[0].value = lp.nodeOverlap.toString();
            $("#ideal-edge-length")[0].value = lp.idealEdgeLength.toString();
            $("#edge-elasticity")[0].value = lp.edgeElasticity.toString();
            $("#nesting-factor")[0].value = lp.nestingFactor.toString();
            $("#gravity")[0].value = lp.gravity.toString();
            $("#num-iter")[0].value = lp.numIter.toString();
            $("#tile")[0].checked = lp.tile;
            $("#animate")[0].checked = lp.animate;
            $("#gravity-range-compound")[0].value = lp.gravityRangeCompound.toString();
            $("#gravity-compound")[0].value = lp.gravityCompound.toString();
            $("#gravity-range")[0].value = lp.gravityRange.toString();


            $("#save-layout").die("click").live("click", function (evt) {


                self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion").value);
                self.currentLayoutProperties.nodeOverlap = Number(document.getElementById("node-overlap").value);
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

                modelManager.setLayoutProperties(self.currentLayoutProperties);




                $(self.el).dialog('close');
            });

            $("#default-layout").die("click").live("click", function (evt) {
                self.copyProperties();

                sbgnStyleRules['tiling-padding-vertical'] = defaultSbgnStyleRules['tiling-padding-vertical'];
                sbgnStyleRules['tiling-padding-horizontal'] = defaultSbgnStyleRules['tiling-padding-horizontal'];

                var templateProperties = _.clone(self.currentLayoutProperties);
                templateProperties.tilingPaddingVertical = sbgnStyleRules['tiling-padding-vertical'];
                templateProperties.tilingPaddingHorizontal = sbgnStyleRules['tiling-padding-horizontal'];

                self.template = _.template($("#layout-settings-template").html(), templateProperties);
                $(self.el).html(self.template);
            });


            return this;
        }

    }};

function SBGNProperties(){

    return {
        el: '#sbgn-properties-table',
        defaultSBGNProperties: {
            compoundPadding: parseInt(sbgnStyleRules['compound-padding'], 10),
            dynamicLabelSize: sbgnStyleRules['dynamic-label-size'],
            fitLabelsToNodes: sbgnStyleRules['fit-labels-to-nodes'],
            rearrangeAfterExpandCollapse: sbgnStyleRules['rearrange-after-expand-collapse'],
            animateOnDrawingChanges: sbgnStyleRules['animate-on-drawing-changes']
        },
        currentSBGNProperties: null,
        initialize: function () {
            var self = this;
            self.copyProperties();
        },
        copyProperties: function () {
            this.currentSBGNProperties = _.clone(this.defaultSBGNProperties);
        },
        render: function () {
            var self = this;
            self.template = _.template($("#sbgn-properties-template").html());
            $(self.el).html(self.template( self.currentSBGNProperties));

            $(self.el).dialog();

            $("#save-sbgn").die("click").live("click", function (evt) {

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

                $(self.el).dialog('close');
            });

            $("#default-sbgn").die("click").live("click", function (evt) {
                self.copyProperties();
                self.template = _.template($("#sbgn-properties-template").html(), self.currentSBGNProperties);
                $(self.el).html(self.template);
            });

            return this;
        }
    }}

    function GridProperties(){

        return {

            el: '#grid-properties-table',

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
                self.template = _.template($("#grid-properties-template").html()); //funda : format change
                self.template(self.currentGridProperties);

            },
            copyProperties: function () {
                this.currentGridProperties = _.clone(this.defaultGridProperties);
            },
            render: function () {
                var self = this;


                self.template = _.template($("#grid-properties-template").html()); //funda : format change
                self.template(self.currentGridProperties);
                $(self.el).html(self.template(self.currentGridProperties)); //funda

                $(self.el).dialog();

                $("#save-grid").die("click").live("click", function (evt) {
                    var self = this;

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

                    $(self.el).dialog('close');
                });

                $("#default-grid").die("click").live("click", function (evt) {
                    var self = this;

                    self.copyProperties();
                    self.template = _.template($("#grid-properties-template").html(), self.currentGridProperties);
                    $(self.el).html(self.template);
                });

                return this;
            }

        }
    }
