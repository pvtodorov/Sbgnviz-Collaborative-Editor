var CircularJSON = require('circular-json');


//funda: changed #555 to #555555
var sbgnStyleSheet = cytoscape.stylesheet()
    .selector("node")
    .css({
        "border-color": "#555",
        "border-width": "1.5px",
        'background-color': '#FFFFFF',
        'background-opacity': 0.5,
        'text-opacity': 1,
        'opacity': 1,
        'font-size': 11
    })
    .selector("node[?sbgnclonemarker][sbgnclass='perturbing agent']")
    .css({
        'background-image': 'sample-app/sampleapp-images/clone_bg.png',
        'background-position-x': '50%',
        'background-position-y': '100%',
        'background-width': '100%',
        'background-height': '25%',
        'background-fit': 'none',
        'background-image-opacity': function (ele) {
            if(!ele.data('sbgnclonemarker')){
                return 0;
            }
            return ele.css('background-opacity');
        }
    })
    .selector("node[sbgnclass][sbgnclass!='complex'][sbgnclass!='process'][sbgnclass!='association'][sbgnclass!='dissociation'][sbgnclass!='compartment'][sbgnclass!='source and sink']")
    .css({
        'content': function (ele) {
            return sbgnElementUtilities.getElementContent(ele);
        },
        'text-valign': 'center',
        'text-halign': 'center'
    })
    .selector("node[sbgnclass]")
    .css({
        'shape': function (ele) {
            return sbgnElementUtilities.getCyShape(ele);
        },
        'font-weight': function(ele) {
            return ele.data('fontweight') ? ele.data('fontweight') : sbgnElementUtilities.defaultFontProperties.fontweight;
        },
        'font-family': function(ele) {
            return ele.data('fontfamily') ? ele.data('fontfamily') : sbgnElementUtilities.defaultFontProperties.fontfamily;
        },
        'font-style': function(ele) {
            return ele.data('fontstyle') ? ele.data('fontstyle') : sbgnElementUtilities.defaultFontProperties.fontstyle;
        },
        'font-size': function (ele) {
            var labelsize = sbgnElementUtilities.getLabelTextSize(ele);
            if(labelsize) {
                return labelsize;
            }

            return ele.css('font-size');
        }
    })
    .selector("node[sbgnclass='perturbing agent']")
    .css({
        'shape-polygon-points': '-1, -1,   -0.5, 0,  -1, 1,   1, 1,   0.5, 0, 1, -1'
    })
    //    .selector("node[sbgnclass='association']")
    //    .css({
    //      'background-color': '#6B6B6B'
    //    })
    .selector("node[sbgnclass='tag']")
    .css({
        'shape-polygon-points': '-1, -1,   0.25, -1,   1, 0,    0.25, 1,    -1, 1'
    })
    .selector("node[sbgnclass='complex']")
    .css({
//      'background-color': '#F4F3EE',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'content': function(ele){
            return sbgnElementUtilities.getElementContent(ele);
        }
    })
    .selector("node[sbgnclass='compartment']")
    .css({
        'border-width': 3.75,
        'background-opacity': 0,
//      'background-color': '#FFFFFF',
        'content': function(ele){
            return sbgnElementUtilities.getElementContent(ele);
        },
        'text-valign': 'bottom',
        'text-halign': 'center'
    })
    .selector("node[sbgnbbox]")
    .css({
        'width': 'data(sbgnbbox.w)',
        'height': 'data(sbgnbbox.h)'
    })
    .selector("node[expanded-collapsed='collapsed']")
    .css({
        'width': 36,
        'height': 36
    })
    .selector("node:selected")
    .css({
        'border-color': '#d67614',
        'target-arrow-color': '#000',
        'text-outline-color': '#000'})
    .selector("node:active")
    .css({
        'background-opacity': 0.7, 'overlay-color': '#d67614',
        'overlay-padding': '14'
    })
    .selector("edge")
    .css({
        'curve-style': 'bezier',
        'line-color': '#555',
        'target-arrow-fill': 'hollow',
        'source-arrow-fill': 'hollow',
        'width': 1.5,
        'target-arrow-color': '#555',
        'source-arrow-color': '#555',
        'text-border-color': function(ele){
            if(ele.selected()) {
                return '#d67614';
            }
            return ele.data('lineColor') || ele.css('line-color');
        },
        'color': function(ele){
            if(ele.selected()) {
                return '#d67614';
            }
            return ele.data('lineColor') || ele.css('line-color');
        }
//          'target-arrow-shape': 'data(sbgnclass)'
    })
    .selector("edge[sbgncardinality > 0]")
    .css({
        'text-rotation': 'autorotate',
        'text-background-shape': 'rectangle',
        'text-border-opacity': '1',
        'text-border-width': '1',
        'text-background-color': 'white',
        'text-background-opacity': '1'
    })
    .selector("edge[sbgnclass='consumption'][sbgncardinality > 0]")
    .css({
        'source-label': function(ele) {
            return '' + ele.data('sbgncardinality');
        },
        'source-text-margin-y': '-10',
        'source-text-offset': function(ele) {
            return sbgnElementUtilities.getCardinalityDistance(ele);
        }
    })
    .selector("edge[sbgnclass='production'][sbgncardinality > 0]")
    .css({
        'target-label': function(ele) {
            return '' + ele.data('sbgncardinality');
        },
        'target-text-margin-y': '-10',
        'target-text-offset': function(ele) {
            return sbgnElementUtilities.getCardinalityDistance(ele);
        }
    })
    .selector("edge[sbgnclass]")
    .css({
        'target-arrow-shape': function (ele) {
            return sbgnElementUtilities.getCyArrowShape(ele);
        },
        'source-arrow-shape': 'none'
    })
    .selector("edge[sbgnclass='inhibition']")
    .css({
        'target-arrow-fill': 'filled'
    })
    .selector("edge[sbgnclass='consumption']")
    .css({
//      'line-style': 'consumption'
    })
    .selector("edge[sbgnclass='production']")
    .css({
        'target-arrow-fill': 'filled',
//      'line-style': 'production'
    })
    .selector("edge:selected")
    .css({
        'line-color': '#d67614',
        'source-arrow-color': '#d67614',
        'target-arrow-color': '#d67614'
    })
    .selector("edge:active")
    .css({
        'background-opacity': 0.7, 'overlay-color': '#d67614',
        'overlay-padding': '8'
    })
    .selector("core")
    .css({
        'selection-box-color': '#d67614',
        'selection-box-opacity': '0.2', 'selection-box-border-color': '#d67614'
    })
    .selector(".ui-cytoscape-edgehandles-source")
    .css({
        'border-color': '#5CC2ED',
        'border-width': 3
    })
    .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
    .css({
        'background-color': '#5CC2ED'
    })
    .selector("edge.ui-cytoscape-edgehandles-preview")
    .css({
        'line-color': '#5CC2ED'
    })
    .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
    .css({
        'shape': 'rectangle',
        'width': 15,
        'height': 15
    })
    .selector('edge.meta')
    .css({
        'line-color': '#C4C4C4',
        'source-arrow-color': '#C4C4C4',
        'target-arrow-color': '#C4C4C4'
    })
    .selector("edge.meta:selected")
    .css({
        'line-color': '#d67614',
        'source-arrow-color': '#d67614',
        'target-arrow-color': '#d67614'
    })
    .selector("node.changeBackgroundOpacity[backgroundOpacity]")
    .css({
        'background-opacity': 'data(backgroundOpacity)'
    })
    .selector("node.changeLabelTextSize")
    .css({
        'font-size': function (ele) {
            return sbgnElementUtilities.getLabelTextSize(ele);
        }
    })
    .selector("node.changeContent")
    .css({
        'content': function (ele) {
            return sbgnElementUtilities.getElementContent(ele);
        }
    })
    .selector("node.changeBorderColor")
    .css({
        'border-color': 'data(borderColor)'
    })
    .selector("node.changeBorderColor:selected")
    .css({
        'border-color': '#d67614'
    })
    .selector("edge.changeLineColor")
    .css({
        'line-color': 'data(lineColor)',
        'source-arrow-color': 'data(lineColor)',
        'target-arrow-color': 'data(lineColor)'
    })
    .selector("edge.changeLineColor:selected")
    .css({
        'line-color': '#d67614',
        'source-arrow-color': '#d67614',
        'target-arrow-color': '#d67614'
    })
    .selector('edge.changeLineColor.meta')
    .css({
        'line-color': '#C4C4C4',
        'source-arrow-color': '#C4C4C4',
        'target-arrow-color': '#C4C4C4'
    })
    .selector("edge.changeLineColor.meta:selected")
    .css({
        'line-color': '#d67614',
        'source-arrow-color': '#d67614',
        'target-arrow-color': '#d67614'
    }).selector("node.changeClonedStatus")
    .css({
        'background-image-opacity': function (ele) {
            if(!ele.data('sbgnclonemarker')){
                return 0;
            }
            return ele.css('background-opacity');
        }
    }).selector("node.noderesized")
    .css({
        'width': 'data(sbgnbbox.w)',
        'height': 'data(sbgnbbox.h)'
    });
// end of sbgnStyleSheet

module.exports.sbgnNetworkContainer = function( el,  cytoscapeJsGraph, modelManager) {

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



            window.cy = this;


            registerUndoRedoActions();

            //Call these first
            bindTriggeredEvents(modelManager);

            cytoscapeExtensionsAndContextMenu();
            bindCyEvents();

        }
    }



    container.html("");
    container.cy(cyOptions);


    return this;
};



function cytoscapeExtensionsAndContextMenu() {
        // register the extensions

        cy.expandCollapse(getExpandCollapseOptions());

        cy.autopanOnDrag();

        var contextMenus = cy.contextMenus({
            menuItemClasses: ['customized-context-menus-menu-item']
        });

        cy.edgeBendEditing({
            // this function specifies the positions of bend points
            bendPositionsFunction: function (ele) {
                return ele.data('bendPointPositions');
            },
            // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
            undoable: true,
            // title of remove bend point menu item
            removeBendMenuItemTitle: "Delete Bend Point",
            // whether to initilize bend points on creation of this extension automatically
            initBendPointsAutomatically: false
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
                    cy.undoRedo().do("deleteElesSimple", {
                        eles: event.cyTarget
                    });
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
                selector: 'node[expanded-collapsed!="collapsed"][sbgnclass="complex"],[expanded-collapsed!="collapsed"][sbgnclass="compartment"]',
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
                return sbgnElementUtilities.mustBeSquare(sbgnclass);
            }, // with only 4 active grapples (at corners)
            isNoResizeMode: function (node) {
                return node.is(".noResizeMode, :parent")
            }, // no active grapples

            cursors: {// See http://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor
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
                    if (!sbgnElementUtilities.isEPNClass(sourceClass) || !sbgnElementUtilities.isEPNClass(targetClass)) {
                        if (sbgnElementUtilities.isEPNClass(sourceClass) && sbgnElementUtilities.isEPNClass(targetClass)) {
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
                    if (!sbgnElementUtilities.isEPNClass(sourceClass) || !sbgnElementUtilities.isEPNClass(targetClass)) {
                        if (sbgnElementUtilities.isEPNClass(sourceClass) && sbgnElementUtilities.isEPNClass(targetClass)) {
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
                    if (!sbgnElementUtilities.isEPNClass(sourceClass) || !sbgnElementUtilities.isLogicalOperator(targetClass)) {
                        if (sbgnElementUtilities.isLogicalOperator(sourceClass) && sbgnElementUtilities.isEPNClass(targetClass)) {
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
                    if (sbgnElementUtilities.isLogicalOperator(sourceClass) && sbgnElementUtilities.isLogicalOperator(targetClass)) {
                        invalid = false;
                    }

                    if (invalid) {
                        return;
                    }
                }
                else if (sbgnclass == 'equivalence arc') {
                    if (!(sbgnElementUtilities.isEPNClass(sourceClass) && sbgnElementUtilities.convenientToEquivalence(targetClass))
                        && !(sbgnElementUtilities.isEPNClass(targetClass) && sbgnElementUtilities.convenientToEquivalence(sourceClass))) {
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

                if (!modeHandler.sustainMode) {
                    modeHandler.setSelectionMode();
                }

                cy.edges()[cy.edges().length - 1].select();
            }
        });

        cy.edgehandles('drawoff');

        var panProps = ({
            fitPadding: 10,
            fitSelector: ':visible',
            animateOnFit: function () {
                return sbgnStyleRules['animate-on-drawing-changes'];
            },
            animateOnZoom: function () {
                return sbgnStyleRules['animate-on-drawing-changes'];
            }
        });

    //funda    sbgnNetworkContainer.cytoscapePanzoom(panProps);


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
    }

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
function bindCyEvents() {
        // listen events

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

        cy.on("resizeend", function (event, type, nodes) {
            nodeResizeEndFunction(nodes);
        });

        cy.on("afterDo", function (event, actionName, args) {
            refreshUndoRedoButtonsStatus();

            if (actionName === 'expand' || actionName === 'collapse') {
                args.nodes.filter('[tapstarted]').data('selected-by-expand-collapse', true);
                args.nodes.unselect();
                args.nodes.removeData('tapstarted');
            }
            else if (actionName === 'changeParent') {
                refreshPaddings();
            }
        });

        cy.on("afterUndo", function (event, actionName, args) {
            refreshUndoRedoButtonsStatus();

            if (actionName === 'resize') {
                nodeResizeEndFunction(args.nodes);
            }
            else if (actionName === 'changeParent') {
                refreshPaddings();
            }
        });

        cy.on("afterRedo", function (event, actionName, args) {
            refreshUndoRedoButtonsStatus();

            if (actionName === 'resize') {
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

                    if (newParent.data("sbgnclass") != "complex" && newParent.data("sbgnclass") != "compartment") {
                        newParent = newParent.parent()[0];
                    }
                }
                var nodes = window.nodesToDragAndDrop;

                if (newParent && newParent.data("sbgnclass") != "complex" && newParent.data("sbgnclass") != "compartment") {
                    return;
                }

                if (newParent && newParent.data("sbgnclass") == "complex") {
                    nodes = nodes.filter(function (i, ele) {
                        return sbgnElementUtilities.isEPNClass(ele.data("sbgnclass"));
                    });
                }

                nodes = nodes.filter(function (i, ele) {
                    if (!newParent) {
                        return ele.data('parent') != null;
                    }
                    return ele.data('parent') !== newParent.id();
                });

                if (newParent) {
                    nodes = nodes.difference(newParent.ancestors());
                }

                if (nodes.length === 0) {
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

        cy.on("mouseover", "node", function (e) {
            e.cy.$("[showingTooltip]").trigger("hideTooltip");
            e.cyTarget.trigger("showTooltip");
        });


        cy.on("hideTooltip", "node", removeQtip);

        cy.on('showTooltip', 'node', function (e) {
            var node = this;

            if (node.renderedStyle("label") == node.data("sbgnlabel") && node.data("sbgnstatesandinfos").length == 0 && node.data("sbgnclass") != "complex")
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

                if (!modeHandler.sustainMode) {
                    modeHandler.setSelectionMode();
                }

                cy.nodes()[cy.nodes().length - 1].select();
            }
        });

        var tappedBefore = null;

        cy.on('doubleTap', 'node', function (event) {
            if (modeHandler.mode == 'selection-mode') {
                var node = this;

                if (!sbgnElementUtilities.canHaveSBGNLabel(node)) {
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


function bindTriggeredEvents(modelManager){
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

    cy.on("changeHighlightStatus", function (event,  highlightStatus, collection) {
        var modelElList = [];
        var paramList =[]
        collection.forEach(function(ele){

            modelElList.push({id: ele.id(), isNode: ele.isNode()});
            paramList.push(highlightStatus);

        });

        modelManager.changeModelElementGroupAttribute("highlightStatus", modelElList, paramList, "me");
    });
    cy.on("changeClasses",  function (event,  collection) {

        var modelElList = [];
        var paramListClasses = [];


        //TODO: class operations usually affect the whole graph
        // cy.elements().forEach(function (ele) {
        collection.forEach(function (ele) {
            //var ele = param.ele;
            modelElList.push({id: ele.id(), isNode: true});
            paramListClasses.push(ele._private.classes);

        });

        modelManager.changeModelElementGroupAttribute("classes", modelElList, paramListClasses, "me");




    });

    cy.on("addNode", function(event, collection, newNode){

        collection.forEach(function (el) {
            var param = {id: el.id(), x: newNode.x, y: newNode.y, sbgnclass: newNode.sbgnclass};
            modelManager.addModelNode(el.id(), param, "me");
            modelManager.initModelNode(el, "me", true);
        });

    });
    cy.on("addEdge", function(event, collection, newEdge){


        collection.forEach(function (el) {
            var param = {id: el.id(), source: newEdge.source, target:newEdge.target, sbgnclass: newEdge.sbgnclass};
            modelManager.addModelEdge(el.id(), param, "me");
            modelManager.initModelEdge(el, "me", true);
        });

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

        console.log(this);
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




}



// end of sbgnStyleSheet
//get the sbgn style rules
//funda getSBGNStyleRules();
