    /**
 * Menu class
 * Initializes sbgnContainer, editorActions modelManager, SBGNLayout properties and SBGN Properties,
 * Listens to menu actions
 *
 * **/


var jsonMerger = require('../../../src/utilities/json-merger.js');
var idxcardjson = require('../../../src/utilities/idxcardjson-to-json-converter.js');
var sbgnFiltering = require('../../../src/utilities/sbgn-filtering.js')();
var sbgnElementUtilities = require('../../../src/utilities/sbgn-element-utilities.js')();
var expandCollapseUtilities = require('../../../src/utilities/expand-collapse-utilities.js')();
var sbgnmlToJson =require('../../../src/utilities/sbgnml-to-json-converter.js')();
var cytoscape = require('cytoscape');




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

    cy.edges().removeData('weights');
    cy.edges().removeData('distances');

    cy.edges().css('curve-style', 'bezier');
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

    var editorActions = require('./EditorActionsManager.js');

    var sbgnContainer;

    var sbgnLayout;
    var sbgnProp;
    var pathsBetweenQuery;


     return MenuFunctions = { //global reference for testing

        refreshGlobalUndoRedoButtonsStatus: function(){
          editorActions.refreshGlobalUndoRedoButtonsStatus();
        },

     

         //Agent loads the file
        loadFileInNode: function(txtFile){


            editorActions.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
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

            editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

            editorActions.modelManager.setSampleInd(-1, "me"); //to notify other clients

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


            editorActions.showSelected(param);

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

            editorActions.hideSelected(param);

        },

        showAll: function(){
            editorActions.showAll({sync:true});
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



            editorActions.highlightSelected(param);

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



            editorActions.highlightSelected(param);

        },
        
        removeHighlights: function(){
            editorActions.removeHighlights({sync:true});
        },

        addEdge:function(elId, source, target, sbgnclass, syncVal){
            var param ={

                sync: syncVal,
                id:elId,
                source: source,
                target: target,
                sbgnclass: sbgnclass

            };



            var result = editorActions.addEdge(param);

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

            var result = editorActions.addNode(param);


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
                editorActions.deleteSelected(param);

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
                editorActions.changePosition(param);


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
                editorActions.changeIsMultimerStatus(param);

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
                editorActions.changeIsCloneMarkerStatus(param);

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
                    editorActions.changeParent(param);

                else if (propName == 'collapsedChildren') { //TODO???????
                    editorActions.changeCollapsedChildren(param);
                }

                else if (propName == "highlightStatus" || propName == "visibilityStatus")
                    editorActions.changeVisibilityOrHighlightStatus(param); //no do/undo here

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
                        editorActions.changeStyleData(param);
                    else if (propType == 'css')
                        editorActions.changeStyleCss(param);
                }
            }

         },

         changeExpandCollapseStatus: function(elId, status, syncVal) {
            var el = cy.$(('#' + elId))[0];

            setTimeout(function() { //wait for the layout to run on the other client's side
                if (status == 'expand') //no need to run incremental layout here -- other client will have run it already
                    editorActions.simpleExpandNode({node: el, sync: syncVal});
                else if (status == 'collapse')
                    editorActions.simpleCollapseNode({node: el, sync: syncVal});

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

                var jsonObj = editorActions.modelManager.getJsonFromModel();

                sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  editorActions));
                if(syncVal)
                    editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me");

            }
            else{

                
                getXMLObject(ind, function (xmlObject) {

                    var xmlText = new XMLSerializer().serializeToString(xmlObject);

                    var jsonObj = sbgnmlToJson.convert(xmlText);

                    sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  editorActions));

                    if(syncVal) {

                        editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me");
                    }

                });
          }


        },

        startInNode: function(modelManager){




            
            editorActions.modelManager = modelManager;

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



                    editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);


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


                editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
            }

        },

        start: function (modelManager) {

            var self = this;

            var socket = io();

            editorActions.modelManager = modelManager;



            sbgnLayout = new SBGNLayout(modelManager);

            var layoutProperties = modelManager.updateLayoutProperties(sbgnLayout.defaultLayoutProperties);

            sbgnLayout.initialize(layoutProperties);


            sbgnProp = new SBGNProperties();
            sbgnProp.initialize();

            pathsBetweenQuery = new PathsBetweenQuery();
            pathsBetweenQuery.initialize();



            var jsonObj = modelManager.getJsonFromModel();



            if (jsonObj == null) {//first time loading the graph-- load from the samples

                var ind = modelManager.getSampleInd("me");

                this.updateSample(ind, true);

            }
            else {//load from a previously loaded graph



                sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, editorActions));



                editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
            }

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

            $('#samples').click(function (e) {

                var ind = e.target.id;
                
                if(sbgnContainer)
                    editorActions.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");


                self.updateSample(ind, true);

                editorActions.modelManager.setSampleInd(ind, "me"); //let others know

            });

            $('#new-file-icon').click(function () {
                $('#new-file').trigger("click");
            });

            $('#new-file').click(function () {
                setFileContent("new_file.sbgnml");

                var jsonObj = {nodes: [], edges: []};

                editorActions.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
                cy.remove(cy.elements());
                sbgnContainer = new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, editorActions);
                editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

                //editorActions.manager.reset();
                //TODO: why is this here?
                //funda?????   cyMod.handleSBGNInspector(editorActions);
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


            $('#align-horizontal-top').click(function (e) {
                var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
                if (selectedNodes.length <= 1) {
                    return;
                }
                var nodesData = getNodesData();

                var modelNode = window.firstSelectedNode ? firstSelectedNode : selectedNodes[0];
                var commonTopY = modelNode.position("y") - modelNode.height() / 2;

                for (var i = 0; i < selectedNodes.length; i++) {
                    var node = selectedNodes[i];
                    var oldPosY = node.position('y');
                    var newPosY = commonTopY + node.height() / 2;
                    node.position({
                        y: newPosY
                    });
                    sbgnElementUtilities.propogateReplacementToChildren(node, 0, newPosY - oldPosY);
                }

                editorActions.moveNodesConditionally({sync:true, nodes: selectedNodes});  //enable synchronization
                
            });

            $("#align-horizontal-top-icon").click(function (e) {
                $("#align-horizontal-top").trigger('click');
            });

            $('#align-horizontal-middle').click(function (e) {
                var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
                if (selectedNodes.length <= 1) {
                    return;
                }
                var nodesData = getNodesData();

                var modelNode = window.firstSelectedNode ? firstSelectedNode : selectedNodes[0];
                var commonMiddleY = modelNode.position("y");

                for (var i = 0; i < selectedNodes.length; i++) {
                    var node = selectedNodes[i];
                    var oldPosY = node.position('y');
                    var newPosY = commonMiddleY;
                    node.position({
                        y: newPosY
                    });
                    sbgnElementUtilities.propogateReplacementToChildren(node, 0, newPosY - oldPosY);
                }

                editorActions.moveNodesConditionally({sync:true, nodes: selectedNodes});  //enable synchronization
                
            });

            $("#align-horizontal-middle-icon").click(function (e) {
                $("#align-horizontal-middle").trigger('click');
            });

            $('#align-horizontal-bottom').click(function (e) {
                var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
                if (selectedNodes.length <= 1) {
                    return;
                }
                var nodesData = getNodesData();

                var modelNode = window.firstSelectedNode ? firstSelectedNode : selectedNodes[0];
                var commonBottomY = modelNode.position("y") + modelNode.height() / 2;

                for (var i = 0; i < selectedNodes.length; i++) {
                    var node = selectedNodes[i];
                    var oldPosY = node.position('y');
                    var newPosY = commonBottomY - node.height() / 2;
                    node.position({
                        y: newPosY
                    });
                    sbgnElementUtilities.propogateReplacementToChildren(node, 0, newPosY - oldPosY);
                }

                editorActions.moveNodesConditionally({sync:true, nodes: selectedNodes});  //enable synchronization
                
            });

            $("#align-horizontal-bottom-icon").click(function (e) {
                $("#align-horizontal-bottom").trigger('click');
            });

            $('#align-vertical-left').click(function (e) {
                var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
                if (selectedNodes.length <= 1) {
                    return;
                }
                var nodesData = getNodesData();

                var modelNode = window.firstSelectedNode ? firstSelectedNode : selectedNodes[0];
                var commonLeftX = modelNode.position("x") - modelNode.width() / 2;

                for (var i = 0; i < selectedNodes.length; i++) {
                    var node = selectedNodes[i];
                    var oldPosX = node.position('x');
                    var newPosX = commonLeftX + node.width() / 2;
                    node.position({
                        x: newPosX
                    });
                    sbgnElementUtilities.propogateReplacementToChildren(node, newPosX - oldPosX, 0);
                }

                editorActions.moveNodesConditionally({sync:true, nodes: selectedNodes});  //enable synchronization
                
            });

            $("#align-vertical-left-icon").click(function (e) {
                $("#align-vertical-left").trigger('click');
            });

            $('#align-vertical-center').click(function (e) {
                var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
                if (selectedNodes.length <= 1) {
                    return;
                }
                var nodesData = getNodesData();

                var modelNode = window.firstSelectedNode ? firstSelectedNode : selectedNodes[0];
                var commonCenterX = modelNode.position("x");

                for (var i = 0; i < selectedNodes.length; i++) {
                    var node = selectedNodes[i];
                    var oldPosX = node.position('x');
                    var newPosX = commonCenterX
                    node.position({
                        x: newPosX
                    });
                    sbgnElementUtilities.propogateReplacementToChildren(node, newPosX - oldPosX, 0);
                }

                editorActions.moveNodesConditionally({sync:true, nodes: selectedNodes});  //enable synchronization
                
            });

            $("#align-vertical-center-icon").click(function (e) {
                $("#align-vertical-center").trigger('click');
            });

            $('#align-vertical-right').click(function (e) {
                var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
                if (selectedNodes.length <= 1) {
                    return;
                }
                var nodesData = getNodesData();

                var modelNode = window.firstSelectedNode ? firstSelectedNode : selectedNodes[0];
                var commonRightX = modelNode.position("x") + modelNode.width() / 2;

                for (var i = 0; i < selectedNodes.length; i++) {
                    var node = selectedNodes[i];
                    var oldPosX = node.position('x');
                    var newPosX = commonRightX - node.width() / 2;
                    node.position({
                        x: newPosX
                    });
                    sbgnElementUtilities.propogateReplacementToChildren(node, newPosX - oldPosX, 0);
                }

                editorActions.moveNodesConditionally({sync:true, nodes: selectedNodes});  //enable synchronization
                
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
                        socket.emit('BioPAXRequest', this.result, "sbgn");
                        socket.on('SBGNResult', function(sbgnData){

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

                        var jsonObj = sbgnmlToJson.convert(this.result);


                        //get another sbgncontainer
                        sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, editorActions));

                        editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);


                        editorActions.modelManager.setSampleInd(-1, "me"); //to notify other clients
                    }
                    // sbgnContainer =  new cyMod.SBGNContainer('#sbgn-network-container', jsonObj ,  editorActions);
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
                        'width': 420,
                        'height': 393,
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
                        'width': 400,
                        'height': 220,
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
                        'height': 320,
                        'transitionIn': 'none',
                        'transitionOut': 'none',
                    });
            });
            $("#hide-selected").click(function (e) {
                var param = {
                    sync: true,
                    selectedEles : cy.$(":selected")
                };

                editorActions.hideSelected(param);
                
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
                editorActions.showSelected(param);
                
            });
            $("#show-selected-icon").click(function (e) {
                $("#show-selected").trigger('click');
            });

            $("#show-all").click(function (e) {
                editorActions.showAll({sync:true});
                
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

                

              
               editorActions.removeEles(selectedEles);





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


                editorActions.deleteSelected(param);
                


            });

            $("#delete-selected-smart-icon").click(function (e) {
                $("#delete-selected-smart").trigger('click');
            });

            $("#neighbors-of-selected").click(function (e) {
                var param = {
                    sync: true,
                    selectedEles : cy.$(":selected"),
                    highlightNeighboursofSelected: true

                };

                editorActions.highlightSelected(param);
                


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

                editorActions.highlightSelected(param);
                
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


               editorActions.highlightSelected(param);
                


            });

            $("#remove-highlights").click(function (e) {

                editorActions.removeHighlights({sync:true});
                



            });
            $('#remove-highlights-icon').click(function (e) {
                $('#remove-highlights').trigger("click");
            });
            $("#make-compound-complex").click(function (e) {
                var selected = cy.nodes(":selected").filter(function (i, element) {
                    var sbgnclass = element.data("sbgnclass")
                    if (sbgnclass == 'unspecified entity'
                        || sbgnclass == 'simple chemical'
                        || sbgnclass == 'macromolecule'
                        || sbgnclass == 'nucleic acid feature'
                        || sbgnclass == 'complex') {
                        return true;
                    }
                    return false;
                });

                selected = sbgnElementUtilities.getRootsOfGivenNodes(selected);
                if (selected.length == 0 || !sbgnElementUtilities.allHaveTheSameParent(selected)) {
                    return;
                }
                var param = {
                    firstTime: true,
                    compoundType: "complex",
                    nodesToMakeCompound: selected
                };

                cy.elements().unselect();
                editorActions.createCompoundForSelectedNodes(param);
                
            });

            $("#make-compound-compartment").click(function (e) {
                var selected = cy.nodes(":selected");
                selected = sbgnElementUtilities.getRootsOfGivenNodes(selected);
                if (selected.length == 0 || !sbgnElementUtilities.allHaveTheSameParent(selected)) {
                    return;
                }

                var param = {
                    compoundType: "compartment",
                    nodesToMakeCompound: selected
                };
                cy.elements().unselect();
                editorActions.createCompoundForSelectedNodes(param);
                

            });

            $("#layout-properties").click(function (e) {
                var lp = editorActions.modelManager.updateLayoutProperties(sbgnLayout.defaultLayoutProperties);
                sbgnLayout.render(lp);
            });

            $("#layout-properties-icon").click(function (e) {
                $("#layout-properties").trigger('click');
            });

            $("#sbgn-properties").click(function (e) {
                sbgnProp.render();
            });

            $("#query-pathsbetween").click(function (e) {
                pathsBetweenQuery.render();
        
            });

            $("#properties-icon").click(function (e) {
                $("#sbgn-properties").trigger('click');
            });

            $("#collapse-selected").click(function (e) {
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
                    editorActions.collapseGivenNodes({
                        nodes: nodes,
                        sync: true
                    });
                else
                    editorActions.simpleCollapseGivenNodes({nodes:nodes, sync: true});
                
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
                    editorActions.simpleCollapseGivenNodes({
                        nodes: complexes,
                        sync: true
                    });
                else
                    editorActions.simpleCollapseGivenNodes({nodes:complexes, sync: true});
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
                    editorActions.expandGivenNodes({
                        nodes: cy.nodes(":selected"),
                        sync: true
                    });
                else
                    editorActions.simpleExpandGivenNodes({nodes:nodes, sync: true});
                
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
                    editorActions.expandAllNodes({
                        nodes: complexes,
                        sync: true,
                        selector: "complex-parent"
                    });
                else
                   editorActions.simpleExpandAllNodes({
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
                   editorActions.collapseGivenNodes({
                        nodes: cy.nodes(),
                        sync: true
                    });
                else
                   editorActions.simpleCollapseGivenNodes({nodes: cy.nodes(), sync: true});
                
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
                    editorActions.expandAllNodes({
                        firstTime: true
                    });
                else
                    editorActions.simpleExpandAllNodes();
                
            });

            $("#perform-layout-icon").click(function (e) {
                if (modeHandler.mode == "selection-mode") {
                    $("#perform-layout").trigger('click');
                }
            });


            $("#perform-layout").click(function (e) {

                var nodesData = getNodesData();

                beforePerformLayout();

                sbgnLayout.applyLayout(editorActions.modelManager);


                editorActions.performLayoutFunction({nodesData:nodesData});

                //       editorActions.manager._do(editorActions.ReturnToPositionsAndSizesCommand({nodesData: nodesData}));


            });


            $("#perform-incremental-layout").click(function (e) {

                var nodesData = getNodesData();

                beforePerformLayout();

                sbgnLayout.applyIncrementalLayout();

                //funda
                editorActions.performLayoutFunction({nodesData:nodesData});
                
            });

            $("#undo-last-action").click(function (e) {
                if(!editorActions.manager.isUndoStackEmpty()){ //funda added this check
                    editorActions.manager.undo();
                    
                }
            });

            $("#redo-last-action").click(function (e) {
                if(!editorActions.manager.isRedoStackEmpty()) { //funda added this check
                editorActions.manager.redo();
                
            }
            });

            $("#undo-last-action-global").click(function (e) {
                if(editorActions.modelManager.isUndoPossible()){
                    editorActions.modelManager.undoCommand();
                    
                }
            });

            $("#redo-last-action-global").click(function (e) {
                if(editorActions.modelManager.isRedoPossible()) {
                    editorActions.modelManager.redoCommand();
                    
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
                var cmdTxt = JSON.stringify(editorActions.modelManager.getHistory());

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

			//Create a new model from REACH everytime a message is posted
			// in the chat box.
		    $("#send-message").click(function(evt) {
				/**var jsonObj = jsonMerger.merge({"nodes":[{"data":{"id":"glyph1","sbgnbbox":{"x":757.7389400364164,"y":451.27057805909294,"w":"60.0","h":"60.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"glyph2","sbgnbbox":{"x":673.4382119936165,"y":513.03035359246,"w":"20.0","h":"20.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"glyph3","sbgnbbox":{"x":745.8545901737084,"y":598.6389016781147,"w":"120.0","h":"60.0"},"sbgnclass":"nucleic acid feature","sbgnlabel":"IRF1","sbgnstatesandinfos":[{"id":"glyph3a","clazz":"unit of information","label":{"text":"ct:mRNA"},"bbox":{"x":0,"y":-50,"w":"63.0","h":"18.0"}}],"parent":"","ports":[]}},{"data":{"id":"glyph4","sbgnbbox":{"x":930.8587846270509,"y":667.2152545198626,"w":"60.0","h":"60.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"glyph5","sbgnbbox":{"x":834.3517215316999,"y":676.3072990165708,"w":"20.0","h":"20.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"glyph6","sbgnbbox":{"x":828.9784747944263,"y":772.6256380249699,"w":"120.0","h":"60.0"},"sbgnclass":"macromolecule","sbgnlabel":"IRF1","sbgnstatesandinfos":[{"id":"glyph15a","clazz":"unit of information","label":{"text":"mt:prot"},"bbox":{"x":0,"y":-50,"w":"53.0","h":"18.0"}}],"parent":"","ports":[]}},{"data":{"id":"glyph7","sbgnbbox":{"x":463.73484915737936,"y":506.4011642790048,"w":"120.0","h":"60.0"},"sbgnclass":"nucleic acid feature","sbgnlabel":"IRF1","sbgnstatesandinfos":[{"id":"glyph14a","clazz":"unit of information","label":{"text":"ct:gene"},"bbox":{"x":0,"y":-50,"w":"55.0","h":"18.0"}}],"parent":"","ports":[]}},{"data":{"id":"glyph8","sbgnbbox":{"x":417.903827869643,"y":278.9888692920008,"w":"220.0","h":"270.0"},"sbgnclass":"complex","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"glyph9","sbgnbbox":{"x":417.903827869643,"y":236.8638692920008,"w":"180.0","h":"140.0"},"sbgnclass":"complex","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"glyph8","ports":[]}},{"data":{"id":"glyph10","sbgnbbox":{"x":417.903827869643,"y":236.8638692920008,"w":"140.0","h":"60.0"},"sbgnclass":"macromolecule","sbgnlabel":"STAT1α","sbgnstatesandinfos":[{"id":"glyph10a","clazz":"unit of information","label":{"text":"mt:prot"},"bbox":{"x":-25,"y":-50,"w":"53.0","h":"18.0"}},{"id":"glyph10b","clazz":"state variable","state":{"value":"P","variable":"Y701"},"bbox":{"x":25,"y":-50,"w":"69.0","h":"28.0"}},{"id":"glyph10c","clazz":"state variable","state":{"value":"P","variable":"Y727"},"bbox":{"x":0,"y":50,"w":"69.0","h":"28.0"}}],"parent":"glyph9","ports":[]}},{"data":{"id":"glyph11","sbgnbbox":{"x":392.903827869643,"y":336.8638692920008,"w":"120.0","h":"60.0"},"sbgnclass":"nucleic acid feature","sbgnlabel":"IRF1-GAS","sbgnstatesandinfos":[{"id":"glyph12a","clazz":"unit of information","label":{"text":"ct:grr"},"bbox":{"x":0,"y":-50,"w":"42.0","h":"18.0"}}],"parent":"glyph8","ports":[]}},{"data":{"id":"glyph12","sbgnbbox":{"x":594.4451096605073,"y":455.28354651150096,"w":"40.0","h":"40.0"},"sbgnclass":"and","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"glyph13","sbgnbbox":{"x":95.01940688540674,"y":102.2848960760362,"w":"180.0","h":"140.0"},"sbgnclass":"complex","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"glyph14","sbgnbbox":{"x":95.01940688540674,"y":102.2848960760362,"w":"140.0","h":"60.0"},"sbgnclass":"macromolecule","sbgnlabel":"STAT1α","sbgnstatesandinfos":[{"id":"glyph1a","clazz":"unit of information","label":{"text":"mt:prot"},"bbox":{"x":-25,"y":-50,"w":"53.0","h":"18.0"}},{"id":"glyph1b","clazz":"state variable","state":{"value":"P","variable":"Y701"},"bbox":{"x":25,"y":-50,"w":"69.0","h":"28.0"}},{"id":"glyph1c","clazz":"state variable","state":{"value":"P","variable":"Y727"},"bbox":{"x":0,"y":50,"w":"69.0","h":"28.0"}}],"parent":"glyph13","ports":[]}},{"data":{"id":"glyph15","sbgnbbox":{"x":316.66999479589833,"y":40.60249790706723,"w":"120.0","h":"60.0"},"sbgnclass":"nucleic acid feature","sbgnlabel":"IRF1-GAS","sbgnstatesandinfos":[{"id":"glyph2a","clazz":"unit of information","label":{"text":"ct:grr"},"bbox":{"x":0,"y":-50,"w":"42.0","h":"18.0"}}],"parent":"","ports":[]}},{"data":{"id":"glyph16","sbgnbbox":{"x":266.5440997410657,"y":129.03139291817354,"w":"20.0","h":"20.0"},"sbgnclass":"association","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}}],"edges":[{"data":{"id":"glyph12-glyph2","sbgnclass":"necessary stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"glyph12","target":"glyph2","portsource":"glyph12","porttarget":"glyph2"}},{"data":{"id":"glyph3-glyph5","sbgnclass":"necessary stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"glyph3","target":"glyph5","portsource":"glyph3","porttarget":"glyph5"}},{"data":{"id":"glyph1-glyph2","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"glyph1","target":"glyph2","portsource":"glyph1","porttarget":"glyph2"}},{"data":{"id":"glyph2-glyph3","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"glyph2","target":"glyph3","portsource":"glyph2","porttarget":"glyph3"}},{"data":{"id":"glyph4-glyph5","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"glyph4","target":"glyph5","portsource":"glyph4","porttarget":"glyph5"}},{"data":{"id":"glyph5-glyph6","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"glyph5","target":"glyph6","portsource":"glyph5","porttarget":"glyph6"}},{"data":{"id":"glyph16-glyph8","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"glyph16","target":"glyph8","portsource":"glyph16","porttarget":"glyph8"}},{"data":{"id":"glyph7-glyph12","sbgnclass":"logic arc","bendPointPositions":[],"sbgncardinality":0,"source":"glyph7","target":"glyph12","portsource":"glyph7","porttarget":"glyph12"}},{"data":{"id":"glyph8-glyph12","sbgnclass":"logic arc","bendPointPositions":[],"sbgncardinality":0,"source":"glyph8","target":"glyph12","portsource":"glyph8","porttarget":"glyph12"}},{"data":{"id":"glyph13-glyph16","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"glyph13","target":"glyph16","portsource":"glyph13","porttarget":"glyph16"}},{"data":{"id":"glyph15-glyph16","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"glyph15","target":"glyph16","portsource":"glyph15","porttarget":"glyph16"}}]}, {"nodes":[{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","sbgnbbox":{"x":379.1719556449567,"y":640.8500899430682,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","sbgnbbox":{"x":558.3108812475665,"y":513.5376126993848,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnbbox":{"x":541.0527934673597,"y":689.0772716670746,"w":"50.0","h":"25.0"},"sbgnclass":"nucleic acid feature","sbgnlabel":"CYP26A1","sbgnstatesandinfos":[{"id":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564.info.1","clazz":"unit of information","label":{"text":"mt:RNA"},"bbox":{"x":0,"y":-50,"w":"35.0","h":"10.0"}}],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","sbgnbbox":{"x":532.6885165498985,"y":141.65294783787022,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","sbgnbbox":{"x":530.00584435466,"y":633.767985256507,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","sbgnbbox":{"x":591.9768949863621,"y":536.9719560900085,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","sbgnbbox":{"x":468.5993550004501,"y":465.4259114560605,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","sbgnbbox":{"x":624.3824123870536,"y":580.8578656239456,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","sbgnbbox":{"x":414.85018011161384,"y":643.5752280818022,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","sbgnbbox":{"x":306.8265426819817,"y":629.5512855848278,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","sbgnbbox":{"x":506.4197299604085,"y":400.6123822011265,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","sbgnbbox":{"x":503.74223036693365,"y":476.59469148402843,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","sbgnbbox":{"x":398.2559958405153,"y":455.3183209465367,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","sbgnbbox":{"x":624.6902293071109,"y":462.6455193230946,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","sbgnbbox":{"x":568.6195923596432,"y":612.3910897396261,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","sbgnbbox":{"x":186.86258729561501,"y":640.4361882992641,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","sbgnbbox":{"x":372.6766116017976,"y":549.5543239099735,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","sbgnbbox":{"x":432.8843642752462,"y":489.05099186430346,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_ef25a9ce49393406f7bc1684ead7e807","sbgnbbox":{"x":254.52970508150224,"y":629.6265848368841,"w":"50.0","h":"25.0"},"sbgnclass":"nucleic acid feature","sbgnlabel":"STAT6","sbgnstatesandinfos":[{"id":"http___pathwaycommons_org_pc2_Rna_ef25a9ce49393406f7bc1684ead7e807.info.1","clazz":"unit of information","label":{"text":"mt:RNA"},"bbox":{"x":0,"y":-50,"w":"35.0","h":"10.0"}}],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","sbgnbbox":{"x":423.13254840679997,"y":601.272967287728,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Protein_d26524017b987cdf98a6a9430695771e","sbgnbbox":{"x":621.8037437590373,"y":134.23709616450083,"w":"48.0","h":"25.0"},"sbgnclass":"macromolecule","sbgnlabel":"IRF1","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","sbgnbbox":{"x":405.9278041831292,"y":521.8073307755774,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","sbgnbbox":{"x":489.2097111852393,"y":639.1491511693209,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","sbgnbbox":{"x":546.7482015273104,"y":208.8498225450512,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","sbgnbbox":{"x":420.97237849633274,"y":567.0234880101241,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","sbgnbbox":{"x":186.08357171514842,"y":575.507077853406,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","sbgnbbox":{"x":585.0383009691664,"y":575.6278055593278,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","sbgnbbox":{"x":561.7366388953311,"y":391.7025401059748,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","sbgnbbox":{"x":358.3831801213979,"y":458.32484317716194,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","sbgnbbox":{"x":363.94964434512366,"y":587.7972914016443,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","sbgnbbox":{"x":365.64759582355106,"y":385.3638269890341,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","sbgnbbox":{"x":344.9960153368613,"y":624.8291741598238,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","sbgnbbox":{"x":512.2210880860309,"y":480.8349896603207,"w":"50.0","h":"25.0"},"sbgnclass":"nucleic acid feature","sbgnlabel":"IRF1","sbgnstatesandinfos":[{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a.info.1","clazz":"unit of information","label":{"text":"mt:RNA"},"bbox":{"x":0,"y":-50,"w":"35.0","h":"10.0"}}],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","sbgnbbox":{"x":454.18116362106855,"y":632.8100574990959,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","sbgnbbox":{"x":630.2627794850011,"y":412.9475187070499,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","sbgnbbox":{"x":538.1108739731253,"y":469.21079801995427,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Protein_b260f9039367fffd0dca4e0ce97edb4f","sbgnbbox":{"x":44.61254503769817,"y":633.7609982876866,"w":"48.0","h":"25.0"},"sbgnclass":"macromolecule","sbgnlabel":"p300","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","sbgnbbox":{"x":639.0102391990533,"y":518.9324367935642,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_9acdedf04a5203f08bebaa3156f70fe3","sbgnbbox":{"x":289.4980075404368,"y":444.7676560887903,"w":"50.0","h":"25.0"},"sbgnclass":"nucleic acid feature","sbgnlabel":"FOXA1","sbgnstatesandinfos":[{"id":"http___pathwaycommons_org_pc2_Rna_9acdedf04a5203f08bebaa3156f70fe3.info.1","clazz":"unit of information","label":{"text":"mt:RNA"},"bbox":{"x":0,"y":-50,"w":"35.0","h":"10.0"}}],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","sbgnbbox":{"x":333.07750182463593,"y":507.42453616865987,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","sbgnbbox":{"x":128.79023379150522,"y":507.30808695974144,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","sbgnbbox":{"x":509.14031382050536,"y":598.5795950961362,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","sbgnbbox":{"x":588.3882263490391,"y":440.8701533104627,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","sbgnbbox":{"x":579.8278464349532,"y":484.36100545998534,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","sbgnbbox":{"x":199.29091870212676,"y":482.3512693303138,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","sbgnbbox":{"x":303.88922050201114,"y":578.0926009704543,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","sbgnbbox":{"x":447.60022258462334,"y":391.25641307319563,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Protein_b9c0bc5574b4d14eeccb174418ded6c0","sbgnbbox":{"x":107.61254503769817,"y":633.7609982876866,"w":"48.0","h":"25.0"},"sbgnclass":"macromolecule","sbgnlabel":"CBP","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2","sbgnbbox":{"x":266.09350430430493,"y":534.3794368088836,"w":"50.0","h":"25.0"},"sbgnclass":"nucleic acid feature","sbgnlabel":"EP300","sbgnstatesandinfos":[{"id":"http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2.info.1","clazz":"unit of information","label":{"text":"mt:RNA"},"bbox":{"x":0,"y":-50,"w":"35.0","h":"10.0"}}],"parent":"","ports":[]}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","sbgnbbox":{"x":469.63998322528596,"y":595.3265785447539,"w":"15.0","h":"15.0"},"sbgnclass":"source and sink","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"nucleus","sbgnbbox":{"x":241.899512344048,"y":101.88143373386163,"w":"279.31873","h":"142.28323"},"sbgnclass":"compartment","sbgnlabel":"nucleus","sbgnstatesandinfos":[],"parent":"","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Protein_0679ffea0b41853c398e3b382ab5e056","sbgnbbox":{"x":174.9280741029395,"y":171.1342573138254,"w":"48.0","h":"25.0"},"sbgnclass":"macromolecule","sbgnlabel":"Cbp/p300","sbgnstatesandinfos":[],"parent":"nucleus","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Complex_29fe1e062c4e58a2ebbee275849ce99d","sbgnbbox":{"x":131.54051506703414,"y":48.37861015389785,"w":"52.0","h":"29.0"},"sbgnclass":"complex","sbgnlabel":"STAT1 (dimer)","sbgnstatesandinfos":[{"id":"http___pathwaycommons_org_pc2_Complex_29fe1e062c4e58a2ebbee275849ce99d.info.1","clazz":"state variable","state":{"value":"Act"},"bbox":{"x":-38.46153846153847,"y":-100,"w":"21.0","h":"10.0"}}],"parent":"nucleus","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Protein_9f50c3c2c3a1a045d7a63f95299f404a_http___pathwaycommons_org_pc2_Complex_29fe1e062c4e58a2ebbee275849ce99d","sbgnbbox":{"x":131.54051506703414,"y":48.37861015389785,"w":"48.0","h":"25.0"},"sbgnclass":"macromolecule","sbgnlabel":"STAT1","sbgnstatesandinfos":[{"id":"http___pathwaycommons_org_pc2_Protein_9f50c3c2c3a1a045d7a63f95299f404a_http___pathwaycommons_org_pc2_Complex_29fe1e062c4e58a2ebbee275849ce99d.info.1","clazz":"state variable","state":{"value":"optyr","variable":"701"},"bbox":{"x":0,"y":-50,"w":"35.0","h":"10.0"}},{"id":"http___pathwaycommons_org_pc2_Protein_9f50c3c2c3a1a045d7a63f95299f404a_http___pathwaycommons_org_pc2_Complex_29fe1e062c4e58a2ebbee275849ce99d.state.2","clazz":"state variable","state":{"value":"opser","variable":"727"},"bbox":{"x":0,"y":50,"w":"35.0","h":"10.0"}}],"parent":"http___pathwaycommons_org_pc2_Complex_29fe1e062c4e58a2ebbee275849ce99d","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a","sbgnbbox":{"x":352.2585096210618,"y":124.28626188975682,"w":"52.0","h":"64.0"},"sbgnclass":"complex","sbgnlabel":"STAT1 (dimer)/Cbp/p300","sbgnstatesandinfos":[{"id":"http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a.info.1","clazz":"state variable","state":{"value":"Act"},"bbox":{"x":-38.46153846153847,"y":-76.5625,"w":"21.0","h":"10.0"}}],"parent":"nucleus","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Protein_0679ffea0b41853c398e3b382ab5e056_http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a","sbgnbbox":{"x":352.2585096210618,"y":104.28626188975682,"w":"48.0","h":"25.0"},"sbgnclass":"macromolecule","sbgnlabel":"Cbp/p300","sbgnstatesandinfos":[],"parent":"http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_Protein_9f50c3c2c3a1a045d7a63f95299f404a_http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a","sbgnbbox":{"x":352.2585096210618,"y":144.28626188975682,"w":"48.0","h":"25.0"},"sbgnclass":"macromolecule","sbgnlabel":"STAT1","sbgnstatesandinfos":[{"id":"http___pathwaycommons_org_pc2_Protein_9f50c3c2c3a1a045d7a63f95299f404a_http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a.info.1","clazz":"state variable","state":{"value":"optyr","variable":"701"},"bbox":{"x":0,"y":-50,"w":"35.0","h":"10.0"}},{"id":"http___pathwaycommons_org_pc2_Protein_9f50c3c2c3a1a045d7a63f95299f404a_http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a.state.2","clazz":"state variable","state":{"value":"opser","variable":"727"},"bbox":{"x":0,"y":50,"w":"35.0","h":"10.0"}}],"parent":"http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a","ports":[]}},{"data":{"id":"http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT","sbgnbbox":{"x":245.69649214184568,"y":120.85156560860491,"w":"15.0","h":"15.0"},"sbgnclass":"process","sbgnlabel":"null","sbgnstatesandinfos":[],"parent":"nucleus","ports":[]}}],"edges":[{"data":{"id":"http___pathwaycommons_org_pc2_Protein_0679ffea0b41853c398e3b382ab5e056-http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Protein_0679ffea0b41853c398e3b382ab5e056","target":"http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT","portsource":"http___pathwaycommons_org_pc2_Protein_0679ffea0b41853c398e3b382ab5e056","porttarget":"http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f-http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","target":"http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036-http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","target":"http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900-http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","target":"http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1-http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","target":"http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e-http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","target":"http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0-http___pathwaycommons_org_pc2_Rna_ef25a9ce49393406f7bc1684ead7e807","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","target":"http___pathwaycommons_org_pc2_Rna_ef25a9ce49393406f7bc1684ead7e807","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","porttarget":"http___pathwaycommons_org_pc2_Rna_ef25a9ce49393406f7bc1684ead7e807"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b-http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","target":"http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae-http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","target":"http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea-http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","target":"http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0-http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","target":"http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0"}},{"data":{"id":"http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT-http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT","target":"http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a","portsource":"http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT","porttarget":"http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea"}},{"data":{"id":"http___pathwaycommons_org_pc2_Complex_29fe1e062c4e58a2ebbee275849ce99d-http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Complex_29fe1e062c4e58a2ebbee275849ce99d","target":"http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT","portsource":"http___pathwaycommons_org_pc2_Complex_29fe1e062c4e58a2ebbee275849ce99d","porttarget":"http___pathwaycommons_org_pc2_ComplexAssembly_d8fe6ee19c0771806a2477446cd0151dLEFT_TO_RIGHT"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332-http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","target":"http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_2f86fcf993c706f756658adc4e4b7332"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c-http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","target":"http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a-http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","target":"http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_27bd1f9025b4f660351a3589cc774dea","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5-http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","target":"http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4-http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","target":"http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","porttarget":"http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_ef25a9ce49393406f7bc1684ead7e807-http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_ef25a9ce49393406f7bc1684ead7e807","target":"http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","portsource":"http___pathwaycommons_org_pc2_Rna_ef25a9ce49393406f7bc1684ead7e807","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf-http___pathwaycommons_org_pc2_Protein_d26524017b987cdf98a6a9430695771e","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","target":"http___pathwaycommons_org_pc2_Protein_d26524017b987cdf98a6a9430695771e","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","porttarget":"http___pathwaycommons_org_pc2_Protein_d26524017b987cdf98a6a9430695771e"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_74e4db7f0ccd662591c898e5c78b8ef5"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_7ab4b153628f659fa150fb2cfeafd54a"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4-http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","target":"http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c-http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","target":"http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60"}},{"data":{"id":"http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a-http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a","target":"http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","portsource":"http___pathwaycommons_org_pc2_Complex_c199c1e4b3a571678ad22e1815a45b9a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_a0ace1940af9a3b3b7235fae8a000da0"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf-http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","target":"http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_7dd8a0813c7907fe6023f86812adddbf"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_fc4afd5164262dee5fb53b490f8ada5f","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_2c1d0f59ff18fb474406f216b5741036"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_f9f3f53b8831f9f9d9913e0648d2fe6b"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_d1ab0dda4eb3a945f54c4f3966ef08d1","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5-http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","target":"http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_564ddf6a63b7737b39a4f585888213a5"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60-http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","target":"http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_102f65980746865940b5bd6a9fb7ec60"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_9acdedf04a5203f08bebaa3156f70fe3-http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_9acdedf04a5203f08bebaa3156f70fe3","target":"http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","portsource":"http___pathwaycommons_org_pc2_Rna_9acdedf04a5203f08bebaa3156f70fe3","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c-http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","target":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_6e71ab84e34a1dec862e4969107b5b1c","porttarget":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b-http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","target":"http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_a78bdd836a92e4d83ecf039c5f74230b"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e-http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","target":"http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_9c9c2686f459fc65673d049f1e66c03e","porttarget":"http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae-http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","target":"http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_76df01aa7585de57c32cde7d9c53f5ae","porttarget":"http___pathwaycommons_org_pc2_Rna_948de867ce947ff95c8eb6f99a106df2"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564-http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","target":"http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4","portsource":"http___pathwaycommons_org_pc2_Rna_d8da8397ae256dbca413302ae3ea6564","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_f42a2da1394ad21a2587d02f1e8f28f4"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d"}},{"data":{"id":"http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900-http___pathwaycommons_org_pc2_Rna_9acdedf04a5203f08bebaa3156f70fe3","sbgnclass":"production","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","target":"http___pathwaycommons_org_pc2_Rna_9acdedf04a5203f08bebaa3156f70fe3","portsource":"http___pathwaycommons_org_pc2_TemplateReaction_b858ddcfd0d2f6b81c404f5086b6f900","porttarget":"http___pathwaycommons_org_pc2_Rna_9acdedf04a5203f08bebaa3156f70fe3"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53-http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","target":"http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_9c137dfedbbc0a709192f3fdd9849b53"}},{"data":{"id":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d-http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","sbgnclass":"consumption","bendPointPositions":[],"sbgncardinality":0,"source":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","target":"http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","portsource":"SAS_For_http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_ea520ad2cf4c6efb04161b4f1b68ef7d"}},{"data":{"id":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a-http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","sbgnclass":"stimulation","bendPointPositions":[],"sbgncardinality":0,"source":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","target":"http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c","portsource":"http___pathwaycommons_org_pc2_Rna_91e84416e38f40fd964b60d27c92752a","porttarget":"http___pathwaycommons_org_pc2_TemplateReaction_235ae3c47ea9552704f882eae571304c"}}]}); //Merge the two SBGN models.

       			//get another sbgncontainer and display the new SBGN model.
       			editorActions.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
           		sbgnContainer = new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, editorActions);
                editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);  **/
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
						var jsonObj = jsonMerger.merge(newJson, currJson); //Merge the two SBGN models.

               			//get another sbgncontainer and display the new SBGN model.
            			editorActions.modelManager.deleteAll(cy.nodes(), cy.edges(), "me");
	               		sbgnContainer = new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, editorActions);
                        editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

						$("#perform-layout").trigger('click');
					}
				}
		    });

            $("#node-label-textbox").keydown(function (e) {
                if (e.which === 13) {
                    $("#node-label-textbox").blur();
                }
            });



        }
    }
}

function PathsBetweenQuery(){

    return{
        el: '#query-pathsbetween-table',

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
                var format = "graph?format=SBGN";
                var kind = "&kind=PATHSBETWEEN";
                var limit = "&limit=" + self.currentQueryParameters.lengthLimit;
                var sources = "";
                var newfilename = "";

                var geneSymbolsArray = self.currentQueryParameters.geneSymbols.replace("\n", " ").replace("\t", " ").split(" ");
                for (var i = 0; i < geneSymbolsArray.length; i++) {
                    var currentGeneSymbol = geneSymbolsArray[i];
                    if (currentGeneSymbol.length == 0 || currentGeneSymbol == ' ' || currentGeneSymbol == '\n' || currentGeneSymbol == '\t') {
                        continue;
                    }

                    sources = sources + "&source=" + currentGeneSymbol;

                    // if (newfilename == '') {
                    //     newfilename = currentGeneSymbol;
                    // }
                    // else {
                    //     newfilename = newfilename + '_' + currentGeneSymbol;
                    // }
                }

           //     newfilename = newfilename + '_PBTWN.sbgnml';

           //     setFileContent(newfilename);
                pc2URL = pc2URL + format + kind + limit + sources;
                socket.emit('PCQuery',  pc2URL);



                $(self.el).dialog('close');
            });

            $("#cancel-query-pathsbetween").die("click").live("click", function (evt) {
                $(self.el).dialog('close');
            });


        }

    }
}

function SBGNLayout(modelManager){


    return{

        defaultLayoutProperties: {
            name: 'cose-bilkent',
            nodeRepulsion: 4500,
            nodeOverlap: 10,
            idealEdgeLength: 50,
            edgeElasticity: 0.45,
            nestingFactor: 0.1,
            gravity: 0.4,
            numIter: 2500,
            tile: true,//funda: true gives error
            animate: true,
            randomize: true,
            tilingPaddingVertical: function () {
                return expandCollapseUtilities.calculatePaddings(parseInt(sbgnStyleRules['tiling-padding-vertical'], 10)); //funda changed name
            },
            tilingPaddingHorizontal: function () {
                return expandCollapseUtilities.calculatePaddings(parseInt(sbgnStyleRules['tiling-padding-horizontal'], 10));//funda changed name
            }

        },

        el: '#sbgn-layout-table',
        currentLayoutProperties: null,


        initialize: function(lp) {
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
        applyLayout: function () {
            var options = this.currentLayoutProperties;
            options.fit = options.randomize;

            cy.elements().filter(':visible').layout(options);

        },

        applyIncrementalLayout: function () {
            var options = _.clone(this.currentLayoutProperties);
            options.randomize = false;
            options.animate = false;
            options.fit = false;
            cy.elements().filter(':visible').layout(options);
        },
        updateLayoutProperties: function(layoutProps){

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


            $("#save-layout").die("click").live("click", function (evt) {


                self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion").value);
                self.currentLayoutProperties.nodeOverlap = Number(document.getElementById("node-overlap").value);
                self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length").value);
                self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity").value);
                self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor").value);
                self.currentLayoutProperties.gravity = Number(document.getElementById("gravity").value);
                self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter").value);
                self.currentLayoutProperties.tile = document.getElementById("tile").checked;
                self.currentLayoutProperties.animate = document.getElementById("animate").checked;
                self.currentLayoutProperties.randomize = !document.getElementById("incremental").checked;

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
            fitLabelsToNodes: (sbgnStyleRules['fit-labels-to-nodes'] == 'true'),
            incrementalLayoutAfterExpandCollapse: (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true')
        },
        currentSBGNProperties: null,
        initialize: function () {
            var self = this;
            self.copyProperties();
     //       self.template = _.template($("#sbgn-properties-template").html());
     //       self.template(self.currentSBGNProperties);
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
                param.previousSBGNProperties = _.clone(self.currentSBGNProperties);

                self.currentSBGNProperties.compoundPadding = Number(document.getElementById("compound-padding").value);
                self.currentSBGNProperties.dynamicLabelSize = $('select[name="dynamic-label-size"] option:selected').val();
                self.currentSBGNProperties.fitLabelsToNodes = document.getElementById("fit-labels-to-nodes").checked;
                self.currentSBGNProperties.incrementalLayoutAfterExpandCollapse =
                    document.getElementById("incremental-layout-after-expand-collapse").checked;

                //Refresh paddings if needed
                if (sbgnStyleRules['compound-padding'] != self.currentSBGNProperties.compoundPadding) {
                    sbgnStyleRules['compound-padding'] = self.currentSBGNProperties.compoundPadding;
                    expandCollapseUtilities.refreshPaddings();
                }
                //Refresh label size if needed
                if (sbgnStyleRules['dynamic-label-size'] != self.currentSBGNProperties.dynamicLabelSize) {
                    sbgnStyleRules['dynamic-label-size'] = '' + self.currentSBGNProperties.dynamicLabelSize;
                    cy.nodes().removeClass('changeLabelTextSize');
                    cy.nodes().addClass('changeLabelTextSize');
                }
                //Refresh truncations if needed
                if (sbgnStyleRules['fit-labels-to-nodes'] != self.currentSBGNProperties.fitLabelsToNodes) {
                    sbgnStyleRules['fit-labels-to-nodes'] = '' + self.currentSBGNProperties.fitLabelsToNodes;
                    cy.nodes().removeClass('changeContent');
                    cy.nodes().addClass('changeContent');
                }

                sbgnStyleRules['incremental-layout-after-expand-collapse'] =
                    '' + self.currentSBGNProperties.incrementalLayoutAfterExpandCollapse;

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
