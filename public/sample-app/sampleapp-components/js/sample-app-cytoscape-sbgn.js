var CircularJSON = require('circular-json');


module.exports.SBGNContainer = function( el,  cytoscapeJsGraph, syncManager) {

    var addRemoveUtilities = require('../../../src/utilities/add-remove-utilities.js');
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


            var paramResize;
            cy.noderesize({
                handleColor: '#000000', // the colour of the handle and the line drawn from it
                hoverDelay: 1, // time spend over a target node before it is considered a target selection
                enabled: true, // whether to start the plugin in the enabled state
                minNodeWidth: 30,
                minNodeHeight: 30,
                triangleSize: 10,
                lines: 3,
                padding: 5,
                start: function (sourceNode) {
                    // fired when noderesize interaction starts (drag on handle)
                    var param = {
                        nodes: cy.collection([sourceNode]),
                        performOperation: false
                    };

                    cy.undoRedo().do("resizeNode", param);
                },
                complete: function (sourceNode, targetNodes, addedEntities) {
                    // fired when noderesize is done and entities are added
                },
                stop: function (sourceNode) {
                    sourceNode._private.data.sbgnbbox.w = sourceNode.width();
                    sourceNode._private.data.sbgnbbox.h = sourceNode.height();
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



            cy.on("changeStyleData",  function (event, dataType, collection) {

                collection.forEach(function(el) {
                         var nonCircularData = CircularJSON.stringify(el._private.data);
                        syncManager.modelManager.updateModelElData(el.id(), el.isNode(), nonCircularData, dataType, "me");

                });
            });

            cy.on("changeStyleCss",  function (event, dataType, collection) {
                collection.forEach(function(el){
                    var nonCircularStyle = CircularJSON.stringify(el._private.style);
                    syncManager.modelManager.updateModelElStyle(el.id(), el.isNode(), nonCircularStyle, dataType, "me");
                });
            });


            cy.on("changeClasses",  function (event, opName, collection) {

                collection.forEach(function(el) {
                    var nonCircularClasses = CircularJSON.stringify(el._private.classes);
                    var nonCircularStyle = CircularJSON.stringify(el._private.style);
                    var nonCircularData = CircularJSON.stringify(el._private.data);

                    syncManager.modelManager.updateModelElClasses(el.id(), el.isNode(), nonCircularClasses, opName, "me");
                    syncManager.modelManager.updateModelElStyle(el.id(), el.isNode(), nonCircularStyle, "all", "me");  //these are updated as well
                    syncManager.modelManager.updateModelElData(el.id(), el.isNode(), nonCircularData, "all", "me");
                });
            });

            cy.on("changePosition",  function (event, collection) {
                collection.forEach(function(el) {
                    syncManager.modelManager.updateModelNodePosition(el.id(),  el.position(), "me");
                });
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


                // syncManager.collapseNode({node:node, sync:true});
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


                   syncManager.unselectNode(this);



            });



            cy.on('select', 'node', function(event) { //Necessary for multiple selections
                syncManager.selectNode(this);

            });
            cy.on('unselect', 'node', function() { //causes sync problems in delete op

                syncManager.unselectNode(this);

            });
            cy.on('grab', 'node', function(event) { //Also works as 'select'


                syncManager.selectNode(this);
            });

            cy.on('select', 'edge', function(event) {
                syncManager.selectEdge(this);

            });

            cy.on('unselect', 'edge', function(event) {
                syncManager.unselectEdge(this);
            });


            cy.on('mouseover', 'node', function (event) {
                var node = this;
                if (modeHandler.mode != "selection-mode") {
                    node.mouseover = false;
                }
                else if (!node.mouseover) {
                    node.mouseover = true;
                    //make preset layout to redraw the nodes
                    cy.forceRender();
                }

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
                syncManager.modelManager.updateHistory({opName:"query", opTarget:"element", elType: "node", elId:node.id(), param: node._private.data.sbgnlabel});

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


                if (cancelSelection) {
                    this.unselect();
                    cancelSelection = null;
                    selectAgain.select();
                    selectAgain = null;
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
                    var sbgnclass = modeHandler.elementsHTMLNameToName[modeHandler.selectedNodeType];
                    var param = {
                        sync: true,
                        x: cyPosX,
                        y: cyPosY,
                        sbgnclass: sbgnclass
                    };


                    syncManager.addNode(param);


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



                /*               //Handle expand-collapse box
                var cyPosX = event.cyPosition.x;
                var cyPosY = event.cyPosition.y;



                if (modeHandler.mode == "selection-mode"
                    && cyPosX >= node._private.data.expandcollapseStartX
                    && cyPosX <= node._private.data.expandcollapseEndX
                    && cyPosY >= node._private.data.expandcollapseStartY
                    && cyPosY <= node._private.data.expandcollapseEndY) {


                    selectAgain = cy.filter(":selected");
                    cancelSelection = true;
                    var expandedOrcollapsed = this.data('expanded-collapsed');

                    var incrementalLayoutAfterExpandCollapse =
                        (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');

                    if (expandedOrcollapsed == 'expanded') {
                        if (incrementalLayoutAfterExpandCollapse)
                            syncManager.collapseNode({node:this, sync: true}); //funda

                        else
                            syncManager.simpleCollapseNode({node:this, sync: true});


                    }
                    else {
                        if (incrementalLayoutAfterExpandCollapse)
                            syncManager.expandNode({node:this, sync: true}); //funda
                        else
                            syncManager.simpleExpandNode({node:this, sync: true});


                    }
                }
                */

                $(".qtip").remove();

                if (event.originalEvent.shiftKey)
                    return;

                if (node.qtipTimeOutFcn != null) {
                    clearTimeout(node.qtipTimeOutFcn);
                    node.qtipTimeOutFcn = null;
                }

                 nodeQtipFunction(node); //shows the full label

            });


            cy.on('cxttap', 'edge', function (event) {
                var edge = this;
                var containerPos = $(cy.container()).position();

                var left = containerPos.left + event.cyRenderedPosition.x;
                left = left.toString() + 'px';

                var top = containerPos.top +  event.cyRenderedPosition.y;
                top = top.toString() + 'px';


                $('.ctx-bend-operation').css('display', 'none');

                var selectedBendIndex = cytoscape.sbgn.getContainingBendShapeIndex(event.cyPosition.x, event.cyPosition.y, edge);
                if(selectedBendIndex == -1){
                    $('#ctx-add-bend-point').css('display', 'block');
                    sbgnBendPointUtilities.currentCtxPos = event.cyPosition;
                    ctxMenu = document.getElementById("ctx-add-bend-point");
                }
                else {
                    $('#ctx-remove-bend-point').css('display', 'block');
                    sbgnBendPointUtilities.currentBendIndex = selectedBendIndex;
                    ctxMenu = document.getElementById("ctx-remove-bend-point");
                }

                ctxMenu.style.display = "block";
                ctxMenu.style.left = left;
                ctxMenu.style.top = top;



                sbgnBendPointUtilities.currentCtxEdge = edge;
            });
            var movedBendIndex;
            var movedBendEdge;
            var moveBendParam;

            cy.on('tapstart', 'edge', function (event) {
                var edge = this;
                movedBendEdge = edge;

                moveBendParam = {
                    edge: edge,
                    weights: edge.data('weights')?[].concat(edge.data('weights')):edge.data('weights'),
                    distances: edge.data('distances')?[].concat(edge.data('distances')):edge.data('distances')
                };

                var cyPosX = event.cyPosition.x;
                var cyPosY = event.cyPosition.y;

                if(edge._private.selected){
                    var index = cytoscape.sbgn.getContainingBendShapeIndex(cyPosX, cyPosY, edge);
                    if(index != -1){
                        movedBendIndex = index;
                        cy.panningEnabled(false);
                        cy.boxSelectionEnabled(false);
                    }
                }
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