    /**
 * Menu class
 * Initializes sbgnContainer, editorActions modelManager, SBGNLayout properties and SBGN Properties,
 * Listens to menu actions
 *
 * **/


var sbgnFiltering = require('../../../src/utilities/sbgn-filtering.js')();
var sbgnElementUtilities = require('../../../src/utilities/sbgn-element-utilities.js')();
var expandCollapseUtilities = require('../../../src/utilities/expand-collapse-utilities.js')();
var sbgnmlToJson =require('../../../src/utilities/sbgnml-to-json-converter.js')();
var cytoscape = require('cytoscape');


// var textToXmlObject = function(text) {
//
//     try {
//         if (window.ActiveXObject) {
//             var doc = new ActiveXObject('Microsoft.XMLDOM');
//             doc.async = 'false';
//             doc.loadXML(text);
//
//         } }
//     catch(e){
//         var DOMParser = require('xmldom').DOMParser;
//         var parser = new DOMParser();
//         var doc = parser.parseFromString(text, 'text/xml');
//
//     }
//
//     return doc;
// };



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


    return {

        refreshGlobalUndoRedoButtonsStatus: function(){
          editorActions.refreshGlobalUndoRedoButtonsStatus();
        },

        updateServerGraph:function (){

                editorActions.updateServerGraph(cy.nodes(":visible"), cy.edges(":visible"));
        },


        loadFile: function(txtFile){


         //   var jsonObj = sbgnmlToJson.convert(textToXmlObject(txtFile));
            var jsonObj = sbgnmlToJson.convert(txtFile);

            editorActions.modelManager.updateServerGraph(jsonObj);



            //sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  editorActions));

            editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);
            //this.updateSample(-1, true);

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
                firstTime: true,
                selectedEles :  cy.$(":selected")
            };


            editorActions.manager._do(editorActions.ShowSelectedCommand(param));

        },

        hideNodes: function(selectedNodeIds){
            //unselect all others
            cy.nodes().unselect();


            selectedNodeIds.forEach(function(nodeId){
                cy.getElementById( nodeId).select();
            });


            var param = {
                sync: true,
                firstTime: true,
                selectedEles : cy.$(":selected")
            };

            editorActions.manager._do(editorActions.HideSelectedCommand(param));

        },

        showAll: function(){
            editorActions.manager._do(editorActions.ShowAllCommand({sync:true}));
        },

        highlightNeighbors: function(selectedNodeIds){
            //unselect all others
            cy.nodes().unselect();


            selectedNodeIds.forEach(function(nodeId){
                cy.getElementById( nodeId).select();
            });


            var param = {
                sync: true,
                firstTime: true,
                selectedEles : cy.$(":selected")
            };



            editorActions.manager._do(editorActions.HighlightNeighborsOfSelectedCommand(param));

        },
        
        highlightProcesses: function(selectedNodeIds){
            //unselect all others
            cy.nodes().unselect();


            selectedNodeIds.forEach(function(nodeId){
                cy.getElementById( nodeId).select();
            });


            var param = {
                sync: true,
                firstTime: true,
                selectedEles : cy.$(":selected")
            };



            editorActions.manager._do(editorActions.HighlightProcessesOfSelectedCommand(param));

        },
        
        removeHighlights: function(){
            editorActions.manager._do(editorActions.RemoveHighlightsCommand({sync:true}));
        },

        addEdge:function(elId, source, target, sbgnclass, syncVal){
            var param ={
                firstTime: true,
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
                firstTime: true,
                sync: syncVal,
                id:elId,
                x: x,
                y: y,
                sbgnclass: sbgnclass,
                sbgnlabel: sbgnlabel

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

                //editorActions.manager._do(editorActions.DeleteSelectedCommand(param));
            }
        },

        changePosition: function(elId, pos, syncVal){
            var el = cy.$(('#' + elId))[0];
            var param = {
                ele: el,
                id: elId,
                data: pos,
                sync: syncVal
            };


            if(el)
                //editorActions.manager._do(editorActions.ChangePositionCommand(param));
                editorActions.changePosition(param); //do/undo not performed here


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
                //editorActions.manager._do(editorActions.ChangeIsMultimerStatusCommand(param));

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
                //editorActions.manager._do(editorActions.ChangeIsCloneMarkerStatusCommand(param));

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
            var param = {
                ele: el,
                id: elId,
                dataType: propName,
                data: propValue,
                modelDataName: modelDataName,
                sync: syncVal
            };

            if(el) {

                if (propName == 'parent')//TODO
                    editorActions.changeParent(param);
                    //editorActions.manager._do(editorActions.ChangeParentCommand(param));

                else if (propName == 'children') {
                    editorActions.changeChildren(param);
                    //editorActions.manager._do(editorActions.ChangeChildrenCommand(param));
                }

                //else if(propName == 'highlighted'){
                //
                //    if(data == true)
                //        editorActions.manager._do(editorActions.ShowSelectedCommand(param));
                //    else
                //        editorActions.manager._do(editorActions.HideSelectedCommand(param));
                //}
                else if (propName == "highlightStatus" || propName == "visibilityStatus")
                    editorActions.changeVisibilityOrHighlightStatus(param); //no do/undo here

                else {
                    if (propType == 'data')
                        editorActions.changeStyleData(param);
                        //editorActions.manager._do(editorActions.ChangeStyleDataCommand(param));
                    else if (propType == 'css')
                        editorActions.changeStyleCss(param);
                        //editorActions.manager._do(editorActions.ChangeStyleCssCommand(param));
                }


              //  editorActions.refreshUndoRedoButtonsStatus();
            }

        },











        updateLayoutProperties: function(lp){

            if(sbgnLayout)
                sbgnLayout.updateLayoutProperties(lp);

        },




        updateSample: function(ind, syncVal){



            //just get a new sbgncontainer
            if(ind < 0){


                var jsonObj = editorActions.modelManager.getServerGraph();
                sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  editorActions));
                if(syncVal)
                    editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

            }
            else{

                
                getXMLObject(ind, function (xmlObject) {


          
                    var xmlText = new XMLSerializer().serializeToString(xmlObject);
                   
                    var jsonObj = sbgnmlToJson.convert(xmlText);
                    


                    editorActions.modelManager.updateServerGraph(jsonObj);


                    sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  editorActions));

                    if(syncVal)
                        editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);


                });
            }


        },

        startInNode: function(modelManager){



            editorActions.modelManager = modelManager;

            var jsonObj = modelManager.getServerGraph();

            if (jsonObj == null) {//first time loading the graph-- load from the samples

                var ind = modelManager.getSampleInd("me");

                if(ind < 0){ //load a new non-sample graph

                    jsonObj = editorActions.modelManager.getServerGraph();
                    cytoscape({
                        elements: cytoscapeJsGraph,
                        headless: true,
                        styleEnabled: true,


                        ready: function () {
                            cy = this;
                        }
                    });

                        editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

                }
                else{ //load a sample

                    getXMLObject(ind, function (xmlObject) {

                        var xmlText = new XMLSerializer().serializeToString(xmlObject);
                       // var $ = require('jquery');
                        var jsonObj = sbgnmlToJson.convert(xmlText);


                        editorActions.modelManager.updateServerGraph(jsonObj);


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
                }


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


            editorActions.modelManager = modelManager;


            sbgnLayout = new SBGNLayout(modelManager);

            var layoutProperties = modelManager.updateLayoutProperties(sbgnLayout.defaultLayoutProperties);

            sbgnLayout.initialize(layoutProperties);


            sbgnProp = new SBGNProperties();
            sbgnProp.initialize();




            var jsonObj = modelManager.getServerGraph();



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
                var param = {
                    edge: edge,
                    weights: edge.data('weights') ? [].concat(edge.data('weights')) : edge.data('weights'),
                    distances: edge.data('distances') ? [].concat(edge.data('distances')) : edge.data('distances')
                };

                sbgnBendPointUtilities.addBendPoint();
                editorActions.manager._do(editorActions.changeBendPointsCommand(param));
                refreshUndoRedoButtonsStatus();
            });

            $('#ctx-remove-bend-point').click(function (e) {
                var edge = sbgnBendPointUtilities.currentCtxEdge;
                var param = {
                    edge: edge,
                    weights: [].concat(edge.data('weights')),
                    distances: [].concat(edge.data('distances'))
                };

                sbgnBendPointUtilities.removeBendPoint();
                editorActions.manager._do(editorActions.changeBendPointsCommand(param));
                refreshUndoRedoButtonsStatus();
            });

            $('#samples').click(function (e) {

                var ind = e.target.id;




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
                sbgnContainer = new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, editorActions);
                editorActions.modelManager.initModel(jsonObj, cy.nodes(), cy.edges(), "me", false);

                editorActions.manager.reset();
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

                cy.nodes().forEach(function(node){
                    self.changePosition(node.id(), node.position(), "true");
                })

                editorActions.manager._do(editorActions.ReturnToPositionsAndSizesCommand({firstTime: true, sync: true,  nodesData: nodesData}));
                editorActions.refreshUndoRedoButtonsStatus();
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

                cy.nodes().forEach(function(node){
                    self.changePosition(node.id(), node.position(), "true");
                })

                editorActions.manager._do(editorActions.ReturnToPositionsAndSizesCommand({firstTime: true, sync: true,  nodesData: nodesData}));
                editorActions.refreshUndoRedoButtonsStatus();
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

                cy.nodes().forEach(function(node){
                    self.changePosition(node.id(), node.position(), "true");
                })

                editorActions.manager._do(editorActions.ReturnToPositionsAndSizesCommand({firstTime: true, sync: true, nodesData: nodesData}));
                editorActions.refreshUndoRedoButtonsStatus();
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

                cy.nodes().forEach(function(node){
                    self.changePosition(node.id(), node.position(), "true");
                })

                editorActions.manager._do(editorActions.ReturnToPositionsAndSizesCommand({firstTime: true, sync: true, nodesData: nodesData}));
                editorActions.refreshUndoRedoButtonsStatus();
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
                cy.nodes().forEach(function(node){
                    self.changePosition(node.id(), node.position(), "true");
                })


                editorActions.manager._do(editorActions.ReturnToPositionsAndSizesCommand({firstTime: true, sync: true, nodesData: nodesData}));
                editorActions.refreshUndoRedoButtonsStatus();
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
                cy.nodes().forEach(function(node){
                    self.changePosition(node.id(), node.position(), "true");
                })


                editorActions.manager._do(editorActions.ReturnToPositionsAndSizesCommand({firstTime: true, sync: true, nodesData: nodesData}));
                editorActions.refreshUndoRedoButtonsStatus();
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


                var reader = new FileReader();

                reader.onload = function (e) {


             //funda       var jsonObj = sbgnmlToJson.convert(textToXmlObject(this.result));
                    var jsonObj = sbgnmlToJson.convert(this.result);


                    editorActions.modelManager.updateServerGraph(jsonObj);


                    self.updateSample(-1, true);

                    editorActions.modelManager.setSampleInd(-1, "me"); //to notify other clients
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
                    firstTime: true,
                    selectedEles : cy.$(":selected")
                };

                editorActions.manager._do(editorActions.HideSelectedCommand(param));
                editorActions.refreshUndoRedoButtonsStatus();
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
                editorActions.manager._do(editorActions.ShowSelectedCommand(param));
                editorActions.refreshUndoRedoButtonsStatus();
            });
            $("#show-selected-icon").click(function (e) {
                $("#show-selected").trigger('click');
            });

            $("#show-all").click(function (e) {
                editorActions.manager._do(editorActions.ShowAllCommand({sync:true}));
                editorActions.refreshUndoRedoButtonsStatus();
            });

            $("#delete-selected-simple").click(function (e) {

                var selectedEles = cy.$(":selected");

                var param = {
                    // firstTime: false,
                    eles: selectedEles,
                    sync:true
                };


                //Funda unselect all nodes otherwise they don't get deleted
                cy.elements().unselect();

                

                editorActions.manager._do(editorActions.RemoveElesCommand(selectedEles));


                //  editorActions.manager._do(editorActions.DeleteSelectedCommand(param));

                editorActions.refreshUndoRedoButtonsStatus();


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


                editorActions.manager._do(editorActions.DeleteSelectedCommand(param));
                editorActions.refreshUndoRedoButtonsStatus();


            });

            $("#delete-selected-smart-icon").click(function (e) {
                $("#delete-selected-smart").trigger('click');
            });

            $("#neighbors-of-selected").click(function (e) {
                var param = {
                    sync: true,
                    firstTime: true,
                    selectedEles : cy.$(":selected")

                };

                editorActions.manager._do(editorActions.HighlightNeighborsOfSelectedCommand(param));
                editorActions.refreshUndoRedoButtonsStatus();


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
                    selectedEles : cy.$(":selected")
                };

                editorActions.manager._do(editorActions.HighlightProcessesOfSelectedCommand(param));
                editorActions.refreshUndoRedoButtonsStatus();
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
                    firstTime: true,
                    selectedEles : cy.$(":selected")
                };

                editorActions.manager._do(editorActions.HighlightProcessesOfSelectedCommand(param));
                editorActions.refreshUndoRedoButtonsStatus();


            });

            $("#remove-highlights").click(function (e) {

                editorActions.manager._do(editorActions.RemoveHighlightsCommand({sync:true}));
                editorActions.refreshUndoRedoButtonsStatus();



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
                editorActions.manager._do(editorActions.CreateCompoundForSelectedNodesCommand(param));
                editorActions.refreshUndoRedoButtonsStatus();
            });

            $("#make-compound-compartment").click(function (e) {
                var selected = cy.nodes(":selected");
                selected = sbgnElementUtilities.getRootsOfGivenNodes(selected);
                if (selected.length == 0 || !sbgnElementUtilities.allHaveTheSameParent(selected)) {
                    return;
                }

                var param = {
                    firstTime: true,
                    compoundType: "compartment",
                    nodesToMakeCompound: selected
                };
                cy.elements().unselect();
                editorActions.manager._do(editorActions.CreateCompoundForSelectedNodesCommand(param));
                editorActions.refreshUndoRedoButtonsStatus();

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
            $("#properties-icon").click(function (e) {
                $("#sbgn-properties").trigger('click');
            });

            $("#collapse-selected").click(function (e) {
                var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":selected"), "collapse");

                if (!thereIs) {
                    return;
                }

                if (window.incrementalLayoutAfterExpandCollapse == null) {
                    window.incrementalLayoutAfterExpandCollapse =
                        (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
                }
                if (incrementalLayoutAfterExpandCollapse)
                    editorActions.manager._do(editorActions.CollapseGivenNodesCommand({
                        nodes: cy.nodes(":selected"),
                        firstTime: true
                    }));
                else
                    editorActions.manager._do(editorActions.SimpleCollapseGivenNodesCommand(cy.nodes(":selected")));
                editorActions.refreshUndoRedoButtonsStatus();
            });
            $("#collapse-selected-icon").click(function (e) {
                if (modeHandler.mode == "selection-mode") {
                    $("#collapse-selected").trigger('click');
                }
            });
            $("#expand-selected").click(function (e) {
                var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":selected"), "expand");

                if (!thereIs) {
                    return;
                }

                if (window.incrementalLayoutAfterExpandCollapse == null) {
                    window.incrementalLayoutAfterExpandCollapse =
                        (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
                }
                if (incrementalLayoutAfterExpandCollapse)
                    editorActions.manager._do(editorActions.ExpandGivenNodesCommand({
                        nodes: cy.nodes(":selected"),
                        firstTime: true
                    }));
                else
                    editorActions.manager._do(editorActions.SimpleExpandGivenNodesCommand(cy.nodes(":selected")));
                editorActions.refreshUndoRedoButtonsStatus();
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
                    editorActions.manager._do(editorActions.CollapseGivenNodesCommand({
                        nodes: cy.nodes(),
                        firstTime: true
                    }));
                else
                    editorActions.manager._do(editorActions.SimpleCollapseGivenNodesCommand(cy.nodes()));
                editorActions.refreshUndoRedoButtonsStatus();
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
                    editorActions.manager._do(editorActions.ExpandAllNodesCommand({
                        firstTime: true
                    }));
                else
                    editorActions.manager._do(editorActions.SimpleExpandAllNodesCommand());
                editorActions.refreshUndoRedoButtonsStatus();
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


                editorActions.manager._do(editorActions.PerformLayoutCommand({nodesData:nodesData}));

                //       editorActions.manager._do(editorActions.ReturnToPositionsAndSizesCommand({nodesData: nodesData}));


                editorActions.refreshUndoRedoButtonsStatus();


            });


            $("#perform-incremental-layout").click(function (e) {
                beforePerformLayout();

                sbgnLayout.applyIncrementalLayout();
            });

            $("#undo-last-action").click(function (e) {
                if(!editorActions.manager.isUndoStackEmpty()){ //funda added this check
                    editorActions.manager.undo();
                    editorActions.refreshUndoRedoButtonsStatus();
                }
            });

            $("#redo-last-action").click(function (e) {
                if(!editorActions.manager.isRedoStackEmpty()) { //funda added this check
                editorActions.manager.redo();
                editorActions.refreshUndoRedoButtonsStatus();
            }
            });

            $("#undo-last-action-global").click(function (e) {
                if(editorActions.modelManager.isUndoPossible()){
                    editorActions.modelManager.undoCommand();
                    editorActions.refreshUndoRedoButtonsStatus();
                }
            });

            $("#redo-last-action-global").click(function (e) {
                if(editorActions.modelManager.isRedoPossible()) {
                    editorActions.modelManager.redoCommand();
                    editorActions.refreshUndoRedoButtonsStatus();
                }
            });

            $("#undo-icon").click(function (e) {
                $("#undo-last-action").trigger('click');
            });

            $("#redo-icon").click(function (e) {
                $("#redo-last-action").trigger('click');
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
                return calculateTilingPaddings(parseInt(sbgnStyleRules['tiling-padding-vertical'], 10));
            },
            tilingPaddingHorizontal: function () {
                return calculateTilingPaddings(parseInt(sbgnStyleRules['tiling-padding-horizontal'], 10));
            }
           // tilingPaddingVertical: 20,
           // tilingPaddingHorizontal: 20



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


            self.template = _.template($("#layout-settings-template").html(), templateProperties);


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


            self.template = _.template($("#layout-settings-template").html(), templateProperties);

            $(self.el).html(self.template);


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
            self.template = _.template($("#sbgn-properties-template").html(), self.currentSBGNProperties);
        },
        copyProperties: function () {
            this.currentSBGNProperties = _.clone(this.defaultSBGNProperties);
        },
        render: function () {
            var self = this;
            self.template = _.template($("#sbgn-properties-template").html(), self.currentSBGNProperties);
            $(self.el).html(self.template);

            $(self.el).dialog();

            $("#save-sbgn").die("click").live("click", function (evt) {

                var param = {};
                param.firstTime = true;
                param.previousSBGNProperties = _.clone(self.currentSBGNProperties);

                self.currentSBGNProperties.compoundPadding = Number(document.getElementById("compound-padding").value);
                self.currentSBGNProperties.dynamicLabelSize = $('select[name="dynamic-label-size"] option:selected').val();
                self.currentSBGNProperties.fitLabelsToNodes = document.getElementById("fit-labels-to-nodes").checked;
                self.currentSBGNProperties.incrementalLayoutAfterExpandCollapse =
                    document.getElementById("incremental-layout-after-expand-collapse").checked;

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

