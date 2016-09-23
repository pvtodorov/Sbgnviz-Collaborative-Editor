var CircularJSON = require('circular-json');


module.exports.SBGNContainer = function( el,  cytoscapeJsGraph, modelManager) {

    // var addRemoveUtilities = require('../../../src/utilities/add-remove-utilities.js');
    //var expandCollapseUtilities = require('../../../src/utilities/expand-collapse-utilities.js')();
    var undoRedoActions = require('./register-undo-redo-actions.js');

    var bioGeneView = require('./biogene-info.js');

    var nodeLabelChanged = false;
    var prevNode;

    var self = this;



    //notifications
    var notyModel = {layout: "bottomLeft", timeout: 8000, text: "Right click on a gene to see its details!"};

    noty(notyModel);


    var container = $(el);
    var positionMap = {};


    //add position information to data for preset layout and initialize derbyjs model
    for (var i = 0; i < cytoscapeJsGraph.nodes.length; i++) {
        var id = cytoscapeJsGraph.nodes[i].data.id;
        var xPos = cytoscapeJsGraph.nodes[i].data.sbgnbbox.x;
        var yPos = cytoscapeJsGraph.nodes[i].data.sbgnbbox.y;
        positionMap[id] = {'x': xPos, 'y': yPos};
    }


    var cyOptions = {
        elements: cytoscapeJsGraph,
        style: sbgnStyleSheet,
        layout: {
            name: 'preset',
            positions: positionMap
        },
        showOverlay: false,
        minZoom: 0.125,
        maxZoom: 16,
        boxSelectionEnabled: true,
        motionBlur: true,
        wheelSensitivity: 0.1,

        ready: function () {

            var socket = io();
            window.cy = this;

            undoRedoActions.registerUndoRedoActions();

            cy.expandCollapse(getExpandCollapseOptions());

            cy.edgeBendEditing({
                // this function specifies the positions of bend points
                bendPositionsFunction: function(ele) {
                    return ele.data('bendPointPositions');
                },
                // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
                undoable: true
            });

            cy.clipboard({
                clipboardSize: 5, // Size of clipboard. 0 means unlimited. If size is exceeded, first added item in clipboard will be removed.
                shortcuts: {
                    enabled: true, // Whether keyboard shortcuts are enabled
                    undoable: true // and if undoRedo extension exists
                }
            });

            cy.viewUtilities({
                node: {
                    highlighted: {}, // styles for when nodes are highlighted.
                    unhighlighted: { // styles for when nodes are unhighlighted.
                        'border-opacity': 0.3,
                        'text-opacity': 0.3,
                        'background-opacity': 0.3
                    },
                    hidden: {
                        'display': 'none'
                    }
                },
                edge: {
                    highlighted: {}, // styles for when edges are highlighted.
                    unhighlighted: { // styles for when edges are unhighlighted.
                        'opacity': 0.3,
                        'text-opacity': 0.3,
                        'background-opacity': 0.3
                    },
                    hidden: {
                        'display': 'none'
                    }
                }
            });



            var edges = cy.edges();
            var nodes = cy.nodes();

            refreshPaddings();
            initilizeUnselectedDataOfElements();


            cy.noderesize({
                handleColor: '#000000', // the colour of the handle and the line drawn from it
                hoverDelay: 1, // time spend over a target node before it is considered a target selection
                enabled: true, // whether to start the plugin in the enabled state
                minNodeWidth: 30,
                minNodeHeight: 30,
                triangleSize: 20,
                lines: 3,
                padding: 5,
                start: function (sourceNode) {

                },
                complete: function (sourceNode, targetNodes, addedEntities) {
                    // fired when noderesize is done and entities are added
                },
                stop: function (sourceNode) {

                    sourceNode._private.data.sbgnbbox.w = sourceNode.width();
                    sourceNode._private.data.sbgnbbox.h = sourceNode.height();


                    //FUNDA  moved this here in order to synchronize with the final size
                    // fired when noderesize interaction starts (drag on handle)
                    var param = {
                        nodes: cy.collection([sourceNode]),
                        performOperation: false
                    };

                    cy.undoRedo().do("resizeNode", param);




                }
            });
            //For adding edges interactively
            cy.edgehandles({
                complete: function (sourceNode, targetNodes, addedEntities) {
                    // fired when edgehandles is done and entities are added
                    var param = {};
                    var source = sourceNode.id();
                    var target = targetNodes[0].id();
                    var sourceClass = sourceNode.data('sbgnclass');
                    var targetClass = targetNodes[0].data('sbgnclass');
                    var sbgnclass = modeHandler.elementsHTMLNameToName[modeHandler.selectedEdgeType];

                    if (sbgnclass == 'consumption' || sbgnclass == 'modulation'
                        || sbgnclass == 'stimulation' || sbgnclass == 'catalysis'
                        || sbgnclass == 'inhibition' || sbgnclass == 'necessary stimulation') {
                        if (!isEPNClass(sourceClass) || !isPNClass(targetClass)) {
                            if (isPNClass(sourceClass) && isEPNClass(targetClass)) {
                                //If just the direction is not valid reverse the direction
                                var temp = source;
                                source = target;
                                target = temp;
                            }
                            else {
                                return;
                            }
                        }
                    }
                    else if (sbgnclass == 'production') {
                        if (!isPNClass(sourceClass) || !isEPNClass(targetClass)) {
                            if (isEPNClass(sourceClass) && isPNClass(targetClass)) {
                                //If just the direction is not valid reverse the direction
                                var temp = source;
                                source = target;
                                target = temp;
                            }
                            else {
                                return;
                            }
                        }
                    }
                    else if (sbgnclass == 'logic arc') {
                        if (!isEPNClass(sourceClass) || !isLogicalOperator(targetClass)) {
                            if (isLogicalOperator(sourceClass) && isEPNClass(targetClass)) {
                                //If just the direction is not valid reverse the direction
                                var temp = source;
                                source = target;
                                target = temp;
                            }
                            else {
                                return;
                            }
                        }
                    }
                    else if (sbgnclass == 'equivalence arc') {
                        if (!(isEPNClass(sourceClass) && convenientToEquivalence(targetClass))
                            && !(isEPNClass(targetClass) && convenientToEquivalence(sourceClass))) {
                            return;
                        }
                    }

                    param.newEdge = {
                        source: source,
                        target: target,
                        sbgnclass: sbgnclass
                    };
                    param.firstTime = true;

                    cy.undoRedo().do("addEdge", param);
                    modeHandler.setSelectionMode();
                    cy.edges()[cy.edges().length - 1].select();
                }
            });





            try { //Todo FUNDA : gives error????
               cy.edgehandles('drawoff');
            }
            catch(err){
               console.log(err);
            }

       //     expandCollapseUtilities.initCollapsedNodes();

            var panProps = ({
                fitPadding: 10,
                fitSelector: ':visible',
                animateOnFit: function(){
                    return sbgnStyleRules['animate-on-drawing-changes'];
                },
                animateOnZoom: function(){
                    return sbgnStyleRules['animate-on-drawing-changes'];
                }
            });

          //  container.cytoscapePanzoom(panProps); //funda

            cy.gridGuide({
                drawGrid: sbgnStyleRules['show-grid'],
                snapToGrid: sbgnStyleRules['snap-to-grid'],
                discreteDrag: sbgnStyleRules['discrete-drag'],
                gridSpacing: sbgnStyleRules['grid-size'],
                resize: sbgnStyleRules['auto-resize-nodes'],
                guidelines: sbgnStyleRules['show-alignment-guidelines'],
                guidelinesTolerance: sbgnStyleRules['guideline-tolerance'],
                guidelinesStyle: {
                    strokeStyle: sbgnStyleRules['guideline-color']
                }
            });

        var lastMouseDownNodeInfo = null;


            function mapFromCyToModelName(cyName){
                var modelName = cyName;

                if(cyName == "border-width")
                    modelName = "borderWidth";
                else if(cyName == "background-color")
                    modelName = "backgroundColor";
                else if(cyName == "line-color")
                    modelName = "lineColor";


                else if(cyName == "sbgnstatesandinfos")
                    modelName = "sbgnStatesAndInfos";
                else if(cyName == "sbgnclonemarker")
                    modelName = "isCloneMarker";


                else if(cyName == "segment-weights")
                    modelName = "segmentWeights";
                else if(cyName == "curve-style")
                    modelName = "curveStyle";
                else if(cyName == "segment-distances")
                    modelName = "segmentDistances";
                else if(cyName == "edge-distances")
                    modelName = "edgeDistances";


                return modelName;
            }

            cy.on("changeStyleData",  function (event, dataType, collection) {

                var modelElList = [];
                var paramList =[]
                collection.forEach(function(ele) {
                    //var ele = param.ele;

                    modelElList.push({id: ele.id(), isNode: ele.isNode()});
                    paramList.push(ele.data(dataType));

                });


                var name = mapFromCyToModelName(dataType);

                modelManager.changeModelElementGroupAttribute(name, modelElList, paramList, "me");

             });

            cy.on("changeStyleCss",  function (event, dataType, collection) {
                var modelElList = [];
                var paramList =[];

                collection.forEach(function(ele) {
                    //var ele = param.ele;

                    modelElList.push({id: ele.id(), isNode: ele.isNode()});
                    paramList.push(ele.css(dataType));
                });

                var name = mapFromCyToModelName(dataType);
                modelManager.changeModelElementGroupAttribute(name, modelElList, paramList, "me");
            });

            cy.on("changeStyleScratch",  function (event, dataType, collection) {
                var modelElList = [];
                var paramList =[];

                collection.forEach(function(ele) {
                    //var ele = param.ele;

                    modelElList.push({id: ele.id(), isNode: ele.isNode()});
                    paramList.push(ele.scratch(dataType));
                });

                var name = mapFromCyToModelName(dataType);
                modelManager.changeModelElementGroupAttribute(name, modelElList, paramList, "me");
            });



            cy.on("changePosition",  function (event,  collection) {
                var modelElList = [];
                var paramList =[]
                collection.forEach(function(ele) {
                    //var ele = param.ele;

                    modelElList.push({id: ele.id(), isNode: ele.isNode()});
                    paramList.push(ele.position());
                });

                modelManager.changeModelElementGroupAttribute("position", modelElList, paramList, "me");
            });

            cy.on("changeChildren",  function (event, collection) {
                collection.forEach(function(el){
                    var nonCircularChildren = CircularJSON.stringify(el._private.children);
                    modelManager.updateModelElChildren(el.id(), nonCircularChildren, "me");
                });
            });

            cy.on("changeClasses",  function (event,  collection) {

                var modelElList = [];
                var paramListClasses = [];
                var paramListBackground = [];


                //TODO: class operations usually affect the whole graph
               // cy.elements().forEach(function (ele) {
                collection.forEach(function (ele) {
                    //var ele = param.ele;

                    modelElList.push({id: ele.id(), isNode: ele.isNode()});
                    paramListClasses.push(ele._private.classes);
                    paramListBackground.push(ele.css("background-opacity"));
                });

                modelManager.changeModelElementGroupAttribute("classes", modelElList, paramListClasses, "me");



                modelManager.changeModelElementGroupAttribute("backgroundOpacity", modelElList, paramListBackground, "me");

            });

            cy.on("addNode", function(event, id, newNode){

                var param = {id: id, x: newNode.x, y:newNode.y, sbgnclass: newNode.sbgnclass};
                modelManager.addModelNode(id,param,"me");

            });
            cy.on("addEdge", function(event, id, newEdge){
                var param = {id: id, source: newEdge.source, target:newEdge.target, sbgnclass: newEdge.sbgnclass};
                modelManager.addModelEdge(id,param,"me");

            });

            cy.on("removeEles", function(event, collection){

                var nodeList = [];
                var edgeList = [];
                collection.forEach(function (el) {
                    if(el.isNode())
                        nodeList.push({id:el.id()});
                    else
                        edgeList.push({id:el.id()});
                });

                modelManager.deleteModelElementGroup({nodes:nodeList, edges:edgeList},"me");
            });

            cy.on("changeHighlightStatus", function(event, current){

                //
                var modelElList = [];
                var paramList =[];
                //affects all the other elements, so  update all their classes
                cy.elements.forEach(function(ele){
                    modelElList.push({id: ele.id(), isNode: ele.isNode()});
                    paramList.push(ele._private.classes);
                });

                current.highlighteds.forEach(function(ele) {
                    modelElList.push({id: ele.id(), isNode: ele.isNode()});
                    paramList.push("highlighted");
                });

                current.unhighlighteds.forEach(function(ele) {
                    modelElList.push({id: ele.id(), isNode: ele.isNode()});
                    paramList.push("unhighlighted");
                });

                current.notHighlighteds.forEach(function(ele) {
                    modelElList.push({id: ele.id(), isNode: ele.isNode()});
                    paramList.push("nothighlighted");
                });

               modelManager.changeModelElementGroupAttribute("highlightStatus", modelElList, paramList, "me");


            });

            cy.on("createCompoundForSelectedNodes", function(event, compoundType, compoundNode, collection){


                //modelManager.updateModelHistory(compoundType);
                var compoundAtts = {x: compoundNode.position().x, y: compoundNode.position().y, sbgnclass: compoundNode._private.data.sbgnclass,
                width:compoundNode.width(), height: compoundNode.height()};

                var modelElList = [];
                var paramList = [];
                collection.forEach(function(node){
                    modelElList.push({id: node.id(), isNode:true});
                    paramList.push(node.data('parent'));  //before changing parents
                });

                modelManager.addModelCompound(compoundNode.id(), compoundAtts,modelElList, paramList, "me");

            });


            //Listen events
            cy.on("beforeCollapse", "node", function (event) {
                var node = this;
                //The children info of complex nodes should be shown when they are collapsed
                if (node._private.data.sbgnclass == "complex") {
                    //The node is being collapsed store infolabel to use it later
                    var infoLabel = getInfoLabel(node);
                    node._private.data.infoLabel = infoLabel;
                }

                var edges = cy.edges();

                // remove bend points before collapse
                for (var i = 0; i < edges.length; i++) {
                    var edge = edges[i];
                    if(edge.hasClass('edgebendediting-hasbendpoints')) {
                        edge.removeClass('edgebendediting-hasbendpoints');
                        delete edge._private.classes['edgebendediting-hasbendpoints'];
                    }
                }

                edges.scratch('cyedgebendeditingWeights', []);
                edges.scratch('cyedgebendeditingDistances', []);

            });

            cy.on("afterCollapse", "node", function (event) {
                var node = this;
                refreshPaddings();

                if (node._private.data.sbgnclass == "complex") {
                    node.addClass('changeContent');
                }



            });

            cy.on("beforeExpand", "node", function (event) {
                var node = this;
                node.removeData("infoLabel");
            });

            cy.on("afterExpand", "node", function (event) {
                var node = this;
                cy.nodes().updateCompoundBounds();

                //Don't show children info when the complex node is expanded
                if (node._private.data.sbgnclass == "complex") {
                    node.removeStyle('content');
                }

                refreshPaddings();
            });
            cy.on("mousedown", "node", function () {

                var self = this;
                if (modeHandler.mode == 'selection-mode' && window.ctrlKeyDown) {
                    enableDragAndDropMode();
                    window.nodeToDragAndDrop = self;
                }

            });

            cy.on("mouseup", function (event) {
                var self = event.cyTarget;
                if (window.dragAndDropModeEnabled) {
                    var nodesData = getNodesData();
                    nodesData.firstTime = true;
                    var newParent;
                    if (self != cy) {
                        newParent = self;
                    }
                    var node = window.nodeToDragAndDrop;

                    if (newParent && self.data("sbgnclass") != "complex" && self.data("sbgnclass") != "compartment") {
                        return;
                    }

                    if (newParent && self.data("sbgnclass") == "complex" && !isEPNClass(node.data("sbgnclass"))) {
                        return;
                    }

                    disableDragAndDropMode();

                    if (node.parent()[0] == newParent || node._private.data.parent == node.id()) {
                        return;
                    }

                    var param = {
                        newParent: newParent,
                        node: node,
                        nodesData: nodesData,
                        posX: event.cyPosition.x,
                        posY: event.cyPosition.y
                    };

                    cy.undoRedo().do("changeParent", param);
                }
            });

            //cy.on("mouseup", "node", function () {
            cy.on("mouseup", "node", function () {


                modelManager.unselectModelNode(this);



            });



            cy.on('select', 'node', function(event) { //Necessary for multiple selections
                modelManager.selectModelNode(this);

            });
            cy.on('unselect', 'node', function() { //causes sync problems in delete op

                modelManager.unselectModelNode(this);

            });
            cy.on('grab', 'node', function(event) { //Also works as 'select'


                modelManager.selectModelNode(this);
            });

            cy.on('select', 'edge', function(event) {
                modelManager.selectModelEdge(this);

            });

            cy.on('unselect', 'edge', function(event) {
                modelManager.unselectModelEdge(this);
            });


            cy.on('mouseover', 'node', function (event) {
                var node = this;

                $(".qtip").remove();

                if (event.originalEvent.shiftKey)
                    return;

                node.qtipTimeOutFcn = setTimeout(function () {
                    nodeQtipFunction(node);
                }, 1000);
            });

            cy.on('mouseout', 'node', function (event) {

                if (this.qtipTimeOutFcn != null) {
                    clearTimeout(this.qtipTimeOutFcn);
                    this.qtipTimeOutFcn = null;
                }
                this.mouseover = false;           //make preset layout to redraw the nodes
                cy.forceRender();
            });



            cy.on('cxttap', 'node', function (event) { //funda not working on Chrome!!!!!
                var node = this;
                $(".qtip").remove();

                var geneClass = node._private.data.sbgnclass;
                if (geneClass != 'macromolecule' && geneClass != 'nucleic acid feature' &&
                    geneClass != 'unspecified entity')
                    return;


                socket.emit('BioGeneQuery',  {
                    query: node._private.data.sbgnlabel, //gene name
                    org: "human",
                    format: "json"
                });
                modelManager.updateHistory({opName:"query", opTarget:"element", elType: "node", elId:node.id(), param: node._private.data.sbgnlabel});

                var queryResult = "";
                var p1 = new Promise(function (resolve, reject) {
                    socket.on("BioGeneResult", function (val) {
                        queryResult = JSON.parse(val);
                        resolve("success");

                    });
                });

                cy.$(('#' + node.id())).qtip({
                    content: {
                        text: function (event, api) {

                            p1.then(function (content) {
                               if (queryResult.count > 0) {
                                   var info = (new bioGeneView(queryResult.geneInfo[0])).render();
                                    var html = $('#biogene-container').html();
                                    api.set('content.text', html);
                               }
                                else {
                                    api.set('content.text', "No additional information available &#013; for the selected node!");
                                }

                            }), function (xhr, status, error) {
                                api.set('content.text', "Error retrieving data: " + error);
                            };
                            api.set('content.title', node._private.data.sbgnlabel);

                            return _.template($("#loading-small-template").html());

                        }
                    },
                    show: {
                        ready: true
                    },
                    position: {
                        my: 'top center',
                        at: 'bottom right',
                        adjust: {
                            cyViewport: true
                        },
                        effect: false
                    },
                    style: {
                        classes: 'qtip-bootstrap',
                        tip: {
                            width: 16,
                            height: 8
                        }
                    }
                });
            });

            var cancelSelection;
            var selectAgain;
            cy.on('select', 'node', function (event) {

                if (cy.nodes(':selected').filter(':visible').length == 1) {
                    window.firstSelectedNode = this;
                }
            });
            cy.on('unselect', 'node', function (event) {
                if (window.firstSelectedNode == this) {
                    window.firstSelectedNode = null;
                }
            });

            cy.on('select', function (event) {
                inspectorUtilities.handleSBGNInspector();
            });

            cy.on('unselect', function (event) {
                inspectorUtilities.handleSBGNInspector();
            });


            cy.on('tap', function (event) {
                $("#node-label-textbox").blur();
                $('.ctx-bend-operation').css('display', 'none');

                //label change synchronization is done in menu-functions
                if(nodeLabelChanged){

                    nodeLabelChanged = false;
                }

              //??  cy.nodes(":selected").length;
                if (modeHandler.mode == "add-node-mode") {
                    var cyPosX = event.cyPosition.x;
                    var cyPosY = event.cyPosition.y;
                    var param = {};
                    var sbgnclass = modeHandler.elementsHTMLNameToName[modeHandler.selectedNodeType];

                    param.newNode = {
                        x: cyPosX,
                        y: cyPosY,
                        sbgnclass: sbgnclass
                    };
                    param.firstTime = true;

                    cy.undoRedo().do("addNode", param);
                    modeHandler.setSelectionMode();
                    cy.nodes()[cy.nodes().length - 1].select();





                }
            });

            var tappedBefore = null;


            cy.on('doubleTap', 'node', function (event) {
                if (modeHandler.mode == 'selection-mode') {
                    var node = this;
                    var containerPos = $(cy.container()).position();
                    var left = containerPos.left + this.renderedPosition().x;
                    left -= $("#node-label-textbox").width() / 2;
                    left = left.toString() + 'px';
                    var top = containerPos.top + this.renderedPosition().y;
                    top -= $("#node-label-textbox").height() / 2;
                    top = top.toString() + 'px';

                    $("#node-label-textbox").css('left', left);
                    $("#node-label-textbox").css('top', top);
                    $("#node-label-textbox").show();
                    var sbgnlabel = this._private.data.sbgnlabel;
                    if (sbgnlabel == null) {
                        sbgnlabel = "";
                    }
                    $("#node-label-textbox").attr('value', sbgnlabel);
                    $("#node-label-textbox").data('node', this);
                    $("#node-label-textbox").focus();


                }
            });

            cy.on('tap', 'node', function (event) {

                var node = this;



                var tappedNow = event.cyTarget;
                setTimeout(function () {
                    tappedBefore = null;
                }, 300);
                if (tappedBefore === tappedNow) {
                    tappedNow.trigger('doubleTap');
                    tappedBefore = null;
                } else {
                    tappedBefore = tappedNow;
                }



                $(".qtip").remove();

                if (event.originalEvent.shiftKey)
                    return;

                if (node.qtipTimeOutFcn != null) {
                    clearTimeout(node.qtipTimeOutFcn);
                    node.qtipTimeOutFcn = null;
                }

                 nodeQtipFunction(node); //shows the full label

            });





        }
    };


    container.html("");
    container.cy(cyOptions);


    return this;
};


var getExpandCollapseOptions = function() {
    return {
        fisheye: function(){
            return sbgnStyleRules['rearrange-after-expand-collapse'];
        },
        animate: function(){
            return sbgnStyleRules['animate-on-drawing-changes'];
        }
    };
};