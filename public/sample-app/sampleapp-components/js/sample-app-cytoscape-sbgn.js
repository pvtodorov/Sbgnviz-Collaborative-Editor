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
    //funda
    var notyModel = {layout: "bottomLeft", timeout: 5000, text: "Right click on a gene to see its details!"};

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
        showOverlay: false, minZoom: 0.125, maxZoom: 16,
        boxSelectionEnabled: true,
        motionBlur: true,
        wheelSensitivity: 0.1,

        ready: function () {

            var socket = io();

            window.cy = this;


            undoRedoActions.registerUndoRedoActions();

            // register the extensions

            cy.expandCollapse(getExpandCollapseOptions());

           cy.autopanOnDrag();

            var contextMenus = cy.contextMenus({
                menuItemClasses: ['customized-context-menus-menu-item']
            });



            cy.edgeBendEditing({
                // this function specifies the positions of bend points
                bendPositionsFunction: function(ele) {
                    return ele.data('bendPointPositions');
                },
                // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
                undoable: true,
                // title of remove bend point menu item
                removeBendMenuItemTitle: "Delete Bend Point"
            });

            contextMenus.appendMenuItems([
                {
                    id: 'ctx-menu-sbgn-properties',
                    title: 'Properties...',
                    coreAsWell: true,
                    onClickFunction: function (event) {
                        $("#sbgn-properties").trigger("click");
                    }
                },
                {
                    id: 'ctx-menu-delete',
                    title: 'Delete',
                    selector: 'node, edge',
                    onClickFunction: function (event) {
                        cy.undoRedo().do("removeEles", event.cyTarget);
                    }
                },
                {
                    id: 'ctx-menu-delete-selected',
                    title: 'Delete Selected',
                    onClickFunction: function () {
                        $("#delete-selected-simple").trigger('click');
                    },
                    coreAsWell: true // Whether core instance have this item on cxttap
                },
                {
                    id: 'ctx-menu-hide-selected',
                    title: 'Hide Selected',
                    onClickFunction: function () {
                        $("#hide-selected").trigger('click');
                    },
                    coreAsWell: true // Whether core instance have this item on cxttap
                },
                {
                    id: 'ctx-menu-show-all',
                    title: 'Show All',
                    onClickFunction: function () {
                        $("#show-all").trigger('click');
                    },
                    coreAsWell: true // Whether core instance have this item on cxttap
                },
                {
                    id: 'ctx-menu-expand', // ID of menu item
                    title: 'Expand', // Title of menu item
                    // Filters the elements to have this menu item on cxttap
                    // If the selector is not truthy no elements will have this menu item on cxttap
                    selector: 'node[expanded-collapsed="collapsed"]',
                    onClickFunction: function (event) { // The function to be executed on click
                        cy.undoRedo().do("expand", {
                            nodes: event.cyTarget
                        });
                    }
                },
                {
                    id: 'ctx-menu-collapse',
                    title: 'Collapse',
                    selector: 'node[expanded-collapsed="expanded"]',
                    onClickFunction: function (event) {
                        cy.undoRedo().do("collapse", {
                            nodes: event.cyTarget
                        });
                    }
                },
                {
                    id: 'ctx-menu-perform-layout',
                    title: 'Perform Layout',
                    onClickFunction: function () {
                        if (modeHandler.mode == "selection-mode") {
                            $("#perform-layout").trigger('click');
                        }
                    },
                    coreAsWell: true // Whether core instance have this item on cxttap
                },
                {
                    id: 'ctx-menu-select-all-object-of-this-type',
                    title: 'Select Objects of This Type',
                    selector: 'node, edge',
                    onClickFunction: function (event) {
                        var cyTarget = event.cyTarget;
                        var sbgnclass = cyTarget.data('sbgnclass');

                        cy.elements().unselect();
                        cy.elements('[sbgnclass="' + sbgnclass + '"]').select();
                    }
                },
                {
                    id: 'ctx-menu-show-hidden-neighbors',
                    title: 'Show Hidden Neighbors',
                    selector: 'node',
                    onClickFunction: function (event) {
                        var cyTarget = event.cyTarget;
                        showHiddenNeighbors(cyTarget);
                    }
                }
            ]);

            cy.clipboard({
                clipboardSize: 5, // Size of clipboard. 0 means unlimited. If size is exceeded, first added item in clipboard will be removed.
                shortcuts: {
                    enabled: false, // Whether keyboard shortcuts are enabled
                    undoable: true // and if undoRedo extension exists
                }
            });

            cy.viewUtilities({
                node: {
                    highlighted: {
                        'border-width': '10px'
                    }, // styles for when nodes are highlighted.
                    unhighlighted: {// styles for when nodes are unhighlighted.
                        'opacity': function (ele) {
                            return ele.css('opacity');
                        }
                    },
                    hidden: {
                        "display": "none"
                    }
                },
                edge: {
                    highlighted: {
                        'width': '10px'
                    }, // styles for when edges are highlighted.
                    unhighlighted: {// styles for when edges are unhighlighted.
                        'opacity': function (ele) {
                            return ele.css('opacity');
                        }
                    },
                    hidden: {
                        "display": "none"
                    }
                }
            });



            var edges = cy.edges();
            var nodes = cy.nodes();



            cy.nodeResize({
                padding: 2, // spacing between node and grapples/rectangle
                undoable: true, // and if cy.undoRedo exists

                grappleSize: 7, // size of square dots
                grappleColor: "#d67614", // color of grapples
                inactiveGrappleStroke: "inside 1px #d67614",
                boundingRectangle: true, // enable/disable bounding rectangle
                boundingRectangleLineDash: [1.5, 1.5], // line dash of bounding rectangle
                boundingRectangleLineColor: "darkgray",
                boundingRectangleLineWidth: 1.5,
                zIndex: 999,

                minWidth: function (node) {
                    var data = node.data("resizeMinWidth");
                    return data ? data : 10;
                }, // a function returns min width of node
                minHeight: function (node) {
                    var data = node.data("resizeMinHeight");
                    return data ? data : 10;
                }, // a function returns min height of node

                isFixedAspectRatioResizeMode: function (node) {
                    var sbgnclass = node.data("sbgnclass");
                    return mustBeSquare(sbgnclass);
                },// with only 4 active grapples (at corners)
                isNoResizeMode: function (node) { return node.is(".noResizeMode, :parent") }, // no active grapples

                cursors: { // See http://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor
                    // May take any "cursor" css property
                    default: "default", // to be set after resizing finished or mouseleave
                    inactive: "not-allowed",
                    nw: "nw-resize",
                    n: "n-resize",
                    ne: "ne-resize",
                    e: "e-resize",
                    se: "se-resize",
                    s: "s-resize",
                    sw: "sw-resize",
                    w: "w-resize"
                }
            });


            refreshPaddings();
            initilizeUnselectedDataOfElements();

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
                        var invalid = false;
                        if (!isEPNClass(sourceClass) || !isLogicalOperator(targetClass)) {
                            if (isLogicalOperator(sourceClass) && isEPNClass(targetClass)) {
                                //If just the direction is not valid reverse the direction
                                var temp = source;
                                source = target;
                                target = temp;
                            }
                            else {
                                invalid = true;
                            }
                        }

                        // the case that both sides are logical operators are valid too
                        if(isLogicalOperator(sourceClass) && isLogicalOperator(targetClass)) {
                            invalid = false;
                        }

                        if( invalid ) {
                            return;
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

                    if( !modeHandler.sustainMode ) {
                        modeHandler.setSelectionMode();
                    }

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

            container.cytoscapePanzoom(panProps); //funda



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

//Listen to explicitly triggered events
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



            //Listen events
            cy.on("beforeCollapse", "node", function (event) {
                var node = this;
                //The children info of complex nodes should be shown when they are collapsed
                if (node._private.data.sbgnclass == "complex") {
                    //The node is being collapsed store infolabel to use it later
                    var infoLabel = getInfoLabel(node);
                    node._private.data.infoLabel = infoLabel;
                }
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

            cy.on("resizeend", function(event, type, nodes) {
                nodeResizeEndFunction(nodes);
            });

            cy.on("afterDo", function(event, actionName, args){
                refreshUndoRedoButtonsStatus();

                if(actionName === 'expand' || actionName === 'collapse') {
                    args.nodes.filter('[tapstarted]').data('selected-by-expand-collapse', true);
                    args.nodes.unselect();
                    args.nodes.removeData('tapstarted');
                }
                else if (actionName === 'changeParent') {
                    refreshPaddings();
                }
            });

            cy.on("afterUndo", function(event, actionName, args){
                refreshUndoRedoButtonsStatus();

                if(actionName === 'resize') {
                    nodeResizeEndFunction(args.nodes);
                }
                else if (actionName === 'changeParent') {
                    refreshPaddings();
                }
            });

            cy.on("afterRedo", function(event, actionName, args){
                refreshUndoRedoButtonsStatus();

                if(actionName === 'resize') {
                    nodeResizeEndFunction(args.nodes);
                }
                else if (actionName === 'changeParent') {
                    refreshPaddings();
                }
            });
            cy.on("mousedown", "node", function (event) {
                var self = this;
                if (modeHandler.mode == 'selection-mode' && window.ctrlKeyDown) {
                    enableDragAndDropMode();
                    window.nodesToDragAndDrop = self.union(cy.nodes(':selected'));
                    window.dragAndDropStartPosition = event.cyPosition;
                }
            });

            cy.on("mouseup", function (event) {
                var self = event.cyTarget;
                if (window.dragAndDropModeEnabled) {
                    var newParent;
                    if (self != cy) {
                        newParent = self;

                        if(newParent.data("sbgnclass") != "complex" && newParent.data("sbgnclass") != "compartment") {
                            newParent = newParent.parent()[0];
                        }
                    }
                    var nodes = window.nodesToDragAndDrop;

                    if(newParent && newParent.data("sbgnclass") != "complex" && newParent.data("sbgnclass") != "compartment") {
                        return;
                    }

                    if (newParent && newParent.data("sbgnclass") == "complex") {
                        nodes = nodes.filter(function(i, ele) {
                            return isEPNClass(ele.data("sbgnclass"));
                        });
                    }

                    nodes = nodes.filter(function(i, ele) {
                        if(!newParent) {
                            return ele.data('parent') != null;
                        }
                        return ele.data('parent') !== newParent.id();
                    });

                    if (newParent) {
                        nodes = nodes.difference( newParent.ancestors() );
                    }

                    if(nodes.length === 0) {
                        return;
                    }

                    nodes = sbgnElementUtilities.getTopMostNodes(nodes);

                    disableDragAndDropMode();
                    var parentData = newParent ? newParent.id() : null;

                    var param = {
                        firstTime: true,
                        parentData: parentData, // It keeps the newParentId (Just an id for each nodes for the first time)
                        nodes: nodes,
                        posDiffX: event.cyPosition.x - window.dragAndDropStartPosition.x,
                        posDiffY: event.cyPosition.y - window.dragAndDropStartPosition.y
                    };

                    window.dragAndDropStartPosition = null;
                    window.nodesToDragAndDrop = null;

                    cy.undoRedo().do("changeParent", param);
                }
            });




            function removeQtip(e) {
                if (this.qtipTimeOutFcn != null) {
                    clearTimeout(this.qtipTimeOutFcn);
                    this.qtipTimeOutFcn = null;
                }
                this.mouseover = false;           //make preset layout to redraw the nodes
                this.removeData("showingTooltip");
                cy.off('mouseout', 'node', removeQtip);
                cy.off("drag", "node", removeQtip);
                $(".qtip").remove();
                cy.forceRender();
            }

            cy.on("mouseover", "node", function (e) {
                e.cy.$("[showingTooltip]").trigger("hideTooltip");
                e.cyTarget.trigger("showTooltip");
            });


            cy.on("hideTooltip", "node", removeQtip);

            cy.on('showTooltip', 'node', function (e) {
                var node = this;

                if (node.renderedStyle("label") == node.data("sbgnlabel") && node.data("sbgnstatesandinfos").length == 0 &&  node.data("sbgnclass") != "complex")
                    return;

                node.data("showingTooltip", true);
                $(".qtip").remove();

                if (e.originalEvent.shiftKey)
                    return;

                node.qtipTimeOutFcn = setTimeout(function () {
                    nodeQtipFunction(node);
                }, 1000);
                cy.on('mouseout', 'node', removeQtip);
                cy.on("drag", "node", removeQtip)
            });




            //        var cancelSelection;
//        var selectAgain;
            window.firstSelectedNode = null;
            cy.on('select', 'node', function (event) {
                var node = this;
//          if (cancelSelection) {
//            this.unselect();
//            cancelSelection = null;
//            selectAgain.select();
//            selectAgain = null;
//          }
                if (node.data('selected-by-expand-collapse')) {
                    node.unselect();
                    node.removeData('selected-by-expand-collapse');
                }

                if (cy.nodes(':selected').filter(':visible').length == 1) {
                    window.firstSelectedNode = node;
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

            cy.on('tapstart', 'node', function (event) {
                var node = this;
                cy.nodes().removeData('tapstarted');
                node.data('tapstarted', true);
            });

            cy.on('tapend', 'node', function (event) {
                cy.style().update();
            });

            cy.on('tap', function (event) {
                $('input').blur();

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

                    if( !modeHandler.sustainMode ) {
                        modeHandler.setSelectionMode();
                    }

                    cy.nodes()[cy.nodes().length - 1].select();
                }
            });

            var tappedBefore = null;

            cy.on('doubleTap', 'node', function (event) {
                if (modeHandler.mode == 'selection-mode') {
                    var node = this;

                    if (!canHaveSBGNLabel( node )) {
                        return;
                    }

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
                    $("#node-label-textbox").val(sbgnlabel);
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
                    + "</td><td><img style='padding-bottom: 8px;' class='template-reaction-delete-button' width='12px' height='12px' name='" + i + "' src='sampleapp-images/delete.png'/></td></tr>";
            }

            html += "<tr><td><img id='template-reaction-add-button' src='sampleapp-images/add.png'/></td></tr></table>";
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

var FontProperties = Backbone.View.extend({
    defaultFontProperties: {
        fontFamily: "",
        fontSize: "",
        fontWeight: "",
        fontStyle: ""
    },
    currentFontProperties: undefined,
    copyProperties: function () {
        this.currentFontProperties = _.clone(this.defaultFontProperties);
    },
    fontFamilies: ["", "Helvetica", "Arial", "Calibri", "Cambria", "Comic Sans MS", "Consolas", "Corsiva"
        ,"Courier New" ,"Droid Sans", "Droid Serif", "Georgia", "Impact"
        ,"Lato", "Roboto", "Source Sans Pro", "Syncopate", "Times New Roman"
        ,"Trebuchet MS", "Ubuntu", "Verdana"],
    getOptionIdByFontFamily: function(fontfamily) {
        var id = "font-properties-font-family-" + fontfamily;
        return id;
    },
    getFontFamilyByOptionId: function(id) {
        var lastIndex = id.lastIndexOf("-");
        var fontfamily = id.substr(lastIndex + 1);
        return fontfamily;
    },
    getFontFamilyHtml: function(self) {
        if(self == null){
            self = this;
        }

        var fontFamilies = self.fontFamilies;

        var html = "";
        html += "<select id='font-properties-select-font-family' class='input-medium layout-text' name='font-family-select'>";

        var optionsStr = "";

        for ( var i = 0; i < fontFamilies.length; i++ ) {
            var fontFamily = fontFamilies[i];
            var optionId = self.getOptionIdByFontFamily(fontFamily);
            var optionStr = "<option id='" + optionId + "'"
                + " value='" + fontFamily + "' style='" + "font-family: " + fontFamily + "'";

            if (fontFamily === self.currentFontProperties.fontFamily) {
                optionStr += " selected";
            }

            optionStr += "> ";
            optionStr += fontFamily;
            optionStr += " </option>";

            optionsStr += optionStr;
        }

        html += optionsStr;

        html += "</select>";

        return html;
    },
    initialize: function () {
        var self = this;
        self.defaultFontProperties.getFontFamilyHtml = function(){
            return self.getFontFamilyHtml(self);
        };
        self.copyProperties();
        self.template = _.template($("#font-properties-template").html());
        self.template = self.template(self.defaultFontProperties);
    },
    extendProperties: function (eles) {
        var self = this;
        var commonProperties = {};

        var commonFontSize = getCommonLabelFontSize(eles);
        var commonFontWeight = getCommonLabelFontWeight(eles);
        var commonFontFamily = getCommonLabelFontFamily(eles);
        var commonFontStyle = getCommonLabelFontStyle(eles);

        if( commonFontSize != null ) {
            commonProperties.fontSize = commonFontSize;
        }

        if( commonFontWeight != null ) {
            commonProperties.fontWeight = commonFontWeight;
        }

        if( commonFontFamily != null ) {
            commonProperties.fontFamily = commonFontFamily;
        }

        if( commonFontStyle != null ) {
            commonProperties.fontStyle = commonFontStyle;
        }

        self.currentFontProperties = $.extend({}, this.defaultFontProperties, commonProperties);
    },
    render: function (eles) {
        var self = this;
        self.extendProperties(eles);
        self.template = _.template($("#font-properties-template").html());
        self.template = self.template(self.currentFontProperties);
        $(self.el).html(self.template);

        dialogUtilities.openDialog(self.el);

        $(document).off("click", "#set-font-properties").on("click", "#set-font-properties", function (evt) {
            var data = {};

            var labelsize = $('#font-properties-font-size').val();
            var fontfamily = $('select[name="font-family-select"] option:selected').val();
            var fontweight = $('select[name="font-weight-select"] option:selected').val();
            var fontstyle = $('select[name="font-style-select"] option:selected').val();

            if ( labelsize != '' ) {
                data.labelsize = parseInt(labelsize);
            }

            if ( fontfamily != '' ) {
                data.fontfamily = fontfamily;
            }

            if ( fontweight != '' ) {
                data.fontweight = fontweight;
            }

            if ( fontstyle != '' ) {
                data.fontstyle = fontstyle;
            }

            var keys = Object.keys(data);

            if(keys.length === 0) {
                return;
            }

            var validAction = false;

            for ( var i = 0; i < eles.length; i++ ) {
                var ele = eles[i];

                keys.forEach(function(key, idx) {
                    if ( data[key] != ele.data(key) ) {
                        validAction = true;
                    }
                });

                if ( validAction ) {
                    break;
                }
            }

            if ( validAction === false ) {
                return;
            }

            var param = {
                eles: eles,
                data: data,
                firstTime: true
            };

            cy.undoRedo().do("changeFontProperties", param);

            self.copyProperties();
//      $(self.el).dialog('close');
        });

        return this;
    }
});