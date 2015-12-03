/**
 *	Design for SBGNViz Editor actions.
 *  Command Design Pattern is used.
 *  A simple undo-redo manager is implemented(EditorActionsManager)
 *	Author: Istemi Bahceci<istemi.bahceci@gmail.com>
 */



module.exports.modelManager;

module.exports.updateServerGraph = function(){
    var sbgnmlText = jsonToSbgnml.createSbgnml();
    var cytoscapeJsGraph = sbgnmlToJson.convert(sbgnmlText);
    module.exports.modelManager.updateServerGraph(cytoscapeJsGraph);
};

module.exports.selectNode = function (node) {
    module.exports.modelManager.selectModelNode(node);
    return node;
}

module.exports.unselectNode =function (node) {
    module.exports.modelManager.unselectModelNode(node);
    return node;
}


module.exports.selectEdge = function(edge) {
    module.exports.modelManager.selectModelEdge(edge);
    return edge;
}


module.exports.unselectEdge = function(edge) {
    module.exports.modelManager.unselectModelEdge(edge);
    return edge;
}

module.exports.addNode = function(param) {

    var result;
    if (param.firstTime) {
        var newNode = param.newNode;
        result = addRemoveUtilities.addNode(newNode.x, newNode.y, newNode.sbgnclass);

    }
    else {
        result = addRemoveUtilities.restoreEles(param);
    }

    module.exports.modelManager.addModelNode(result.id(),  param.newNode, "me");

    return result;
}

module.exports.removeNodes = function(nodesToBeDeleted) {
    module.exports.modelManager.deleteModelNodes(nodesToBeDeleted, "me");

    return addRemoveUtilities.removeNodes(nodesToBeDeleted);
}

module.exports.removeEles =function(elesToBeRemoved) {

    module.exports.modelManager.deleteModelNodes(elesToBeRemoved.nodes(), "me");
    module.exports.modelManager.deleteModelEdges(elesToBeRemoved.edges(), "me");


    return addRemoveUtilities.removeEles(elesToBeRemoved);
}

module.exports.restoreEles = function(eles)
{

    eles.forEach(function(ele){

        if(ele.isNode())
            module.exports.modelManager.addModelNode(ele.id(), {x: ele.x, y:ele.y, sbgnclass:ele.data("sbgnclass")}, "me");
        else{
            var param = {
                source: ele.data("source"),
                target: ele.data("target"),
                sbgnclass: ele.data('sbgnclass')
            };
            module.exports.modelManager.addModelEdge(ele.id(), param, "me");
        }
    });

    return addRemoveUtilities.restoreEles(eles);
}

module.exports.addEdge = function(param)
{
    var result;
    if (param.firstTime) {
        var newEdge = param.newEdge;
        result = addRemoveUtilities.addEdge(newEdge.source, newEdge.target, newEdge.sbgnclass);
    }
    else {
        result = addRemoveUtilities.restoreEles(param);
    }

    module.exports.modelManager.addModelEdge(result.id(), param.newEdge, "me");
    return result;
}

module.exports.removeEdges = function(edgesToBeDeleted)
{
    module.exports.modelManager.deleteModelEdges(edgesToBeDeleted, "me");
    module.exports.updateServerGraph();
    return addRemoveUtilities.removeEdges(edgesToBeDeleted);
}

module.exports.expandNode = function(param) {
    var result = {
        firstTime: false
    };
    var node = param.node;
    result.node = node;
    result.nodesData = module.exports.getNodePositionsAndSizes();
    if (param.firstTime) {
        expandCollapseUtilities.expandNode(node);
    }
    else {
        expandCollapseUtilities.simpleExpandNode(node);
        module.exports.returnToPositionsAndSizes(param.nodesData);
    }
    return result;
}

module.exports.collapseNode = function(param) {
    var result = {
        firstTime: false
    };
    var node = param.node;
    result.node = node;
    result.nodesData = module.exports.getNodePositionsAndSizes();
    if (param.firstTime) {
        expandCollapseUtilities.collapseNode(node);
    }
    else {
        expandCollapseUtilities.simpleCollapseNode(node);
        module.exports.returnToPositionsAndSizes(param.nodesData);
    }
    return result;
}

module.exports.expandGivenNodes = function(param) {
    var nodes = param.nodes;
    var result = {
        firstTime: false
    };
    result.nodes = nodes;
    result.nodesData = module.exports.getNodePositionsAndSizes();
    if (param.firstTime) {
        expandCollapseUtilities.expandGivenNodes(nodes);
    }
    else {
        expandCollapseUtilities.simpleExpandGivenNodes(nodes);
        module.exports.returnToPositionsAndSizes(param.nodesData);
    }
    return result;
}

module.exports.collapseGivenNodes = function(param) {
    var nodes = param.nodes;
    var result = {};
    result.nodes = nodes;
    result.nodesData = module.exports.getNodePositionsAndSizes();
    if (param.firstTime) {
        expandCollapseUtilities.collapseGivenNodes(nodes);
    }
    else {
        expandCollapseUtilities.simpleCollapseGivenNodes(nodes);
        module.exports.returnToPositionsAndSizes(param.nodesData);
    }
    return result;
}

module.exports.expandAllNodes = function(param) {
    var result = {
        firstTime: false
    };
    result.nodesData = module.exports.getNodePositionsAndSizes();
    if (param.firstTime) {
        result.expandStack = expandCollapseUtilities.expandAllNodes();
    }
    else {
        result.expandStack = expandCollapseUtilities.simpleExpandAllNodes();
        module.exports.returnToPositionsAndSizes(param.nodesData);
    }
    return result;
}

module.exports.simpleExpandAllNodes = function() {
    return expandCollapseUtilities.simpleExpandAllNodes();
}

module.exports.collapseExpandedStack = function(expandedStack) {
    return expandCollapseUtilities.collapseExpandedStack(expandedStack);
}

module.exports.undoExpandAllNodes = function(param) {
    var result = {
        firstTime: false
    };
    result.nodesData = module.exports.getNodePositionsAndSizes();
    expandCollapseUtilities.collapseExpandedStack(param.expandStack);
    module.exports.returnToPositionsAndSizes(param.nodesData);
    return result;
}

module.exports.getNodePositionsAndSizes = function() {
    var positionsAndSizes = {};
    var nodes = cy.nodes();

    for (var i = 0; i < nodes.length; i++) {
        var ele = nodes[i];
        positionsAndSizes[ele.id()] = {
            width: ele.width(),
            height: ele.height(),
            x: ele.position("x"),
            y: ele.position("y")
        };
    }

    return positionsAndSizes;
}

module.exports.undoExpandNode = function(param) {
    var result = {
        firstTime: false
    };
    result.nodesData = module.exports.getNodePositionsAndSizes();
    result.node = expandCollapseUtilities.simpleCollapseNode(param.node);
    module.exports.returnToPositionsAndSizes(param.nodesData);
    return result;
}

module.exports.undoCollapseNode = function(param) {
    var result = {
        firstTime: false
    };
    result.nodesData = module.exports.getNodePositionsAndSizes();
    result.node = expandCollapseUtilities.simpleExpandNode(param.node);
    module.exports.returnToPositionsAndSizes(param.nodesData);
    return result;
}

module.exports.undoExpandGivenNodes = function(param) {
    var result = {
        firstTime: false
    };
    result.nodesData = module.exports.getNodePositionsAndSizes();
    result.nodes = expandCollapseUtilities.simpleCollapseGivenNodes(param.nodes);
    module.exports.returnToPositionsAndSizes(param.nodesData);
    return result;
}

module.exports.undoCollapseGivenNodes = function(param) {
    var result = {
        firstTime: false
    };
    result.nodesData = module.exports.getNodePositionsAndSizes();
    result.nodes = expandCollapseUtilities.simpleExpandGivenNodes(param.nodes);
    module.exports.returnToPositionsAndSizes(param.nodesData);
    return result;
}

module.exports.simpleExpandNode = function(node) {
    return expandCollapseUtilities.simpleExpandNode(node);
}

module.exports.simpleCollapseNode = function(node) {
    return expandCollapseUtilities.simpleCollapseNode(node);
}

module.exports.simpleExpandGivenNodes = function(nodes) {
    return expandCollapseUtilities.simpleExpandGivenNodes(nodes);
}

module.exports.simpleCollapseGivenNodes = function(nodes) {
    return expandCollapseUtilities.simpleCollapseGivenNodes(nodes);
}

module.exports.performLayoutFunction = function(nodesData) {
    if (nodesData.firstTime) {
        delete nodesData.firstTime;
        return nodesData;
    }
    return module.exports.returnToPositionsAndSizes(nodesData);
}

module.exports.returnToPositionsAndSizes = function(nodesData) {
    var currentPositionsAndSizes = {};
    cy.nodes().positions(function (i, ele) {
        currentPositionsAndSizes[ele.id()] = {
            width: ele.width(),
            height: ele.height(),
            x: ele.position("x"),
            y: ele.position("y")
        };
        var data = nodesData[ele.id()];
        ele._private.data.width = data.width;
        ele._private.data.height = data.height;
        return {
            x: data.x,
            y: data.y
        };
    });

    return currentPositionsAndSizes;
}

module.exports.moveNodesConditionally = function(param) {

    if (param.move)
        module.exports.moveNodes(param.positionDiff, param.nodes);

    else{
        param.nodes.forEach(function(node){

            module.exports.modelManager.moveModelNode(node.id(), node.position(), "me");
        });

    }
    return param;
}

module.exports.moveNodesReversely = function(param) {
    var diff = {
        x: -1 * param.positionDiff.x,
        y: -1 * param.positionDiff.y
    };
    var result = {
        positionDiff: param.positionDiff,
        nodes: param.nodes,
        move: true
    };
    module.exports.moveNodes(diff, param.nodes);
    return result;
}

module.exports.moveNodes = function(positionDiff, nodes) {
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var oldX = node.position("x");
        var oldY = node.position("y");
        node.position({
            x: oldX + positionDiff.x,
            y: oldY + positionDiff.y
        });

        module.exports.modelManager.moveModelNode(node.id(), node.position(), "me");




        var children = node.children();
        module.exports.moveNodes(positionDiff, children);

    }
}

module.exports.deleteSelected = function(param) {
    module.exports.modelManager.deleteModelNodes(param.eles.nodes(), "me");
    module.exports.modelManager.deleteModelEdges(param.eles.edges(), "me");

    return addRemoveUtilities.removeElesSimply(param.eles);
}

module.exports.restoreSelected = function(eles) {
    var param = {};

    param.eles = module.exports.restoreEles(eles); //model updated in restoreEles
    param.firstTime = false;
    return param;
}

module.exports.hideSelected = function(param) {
    var currentNodes = cy.nodes(":visible");
    if (param.firstTime) {
        sbgnFiltering.hideSelected();
    }
    else {
        sbgnFiltering.showJustGivenNodes(param.nodesToShow);
    }
    return currentNodes;
}

module.exports.showSelected = function(param) {
    var currentNodes = cy.nodes(":visible");
    if (param.firstTime) {
        sbgnFiltering.showSelected();
    }
    else {
        sbgnFiltering.showJustGivenNodes(param.nodesToShow);
    }
    return currentNodes;
}

module.exports.showAll = function() {
    var currentNodes = cy.nodes(":visible");
    sbgnFiltering.showAll();
    return currentNodes;
}

module.exports.showJustGivenNodes = function(nodesToShow) {
    var param = {};
    param.nodesToShow = cy.nodes(":visible");
    param.firstTime = false;
    sbgnFiltering.showJustGivenNodes(nodesToShow);
    return param;
}

module.exports.highlightSelected = function(param) {
    var elementsToHighlight;
    var result = {};
    //If this is the first call of the function then call the original method
    if (param.firstTime) {
        if (sbgnFiltering.isAllElementsAreNotHighlighted()) {
            //mark that there was no highlighted element
            result.allElementsWasNotHighlighted = true;
        }
        var alreadyHighlighted = cy.elements("[highlighted='true']").filter(":visible");
        if (param.highlightNeighboursofSelected) {
            elementsToHighlight = sbgnFiltering.highlightNeighborsofSelected();
        }
        else if (param.highlightProcessesOfSelected) {
            elementsToHighlight = sbgnFiltering.highlightProcessesOfSelected();
        }
        elementsToHighlight = elementsToHighlight.not(alreadyHighlighted);
    }
    else {
        elementsToHighlight = param.elesToHighlight.not(cy.elements("[highlighted='true']").filter(":visible"));
        elementsToHighlight.data("highlighted", 'true');
        sbgnFiltering.highlightNodes(elementsToHighlight.nodes());
        sbgnFiltering.highlightEdges(elementsToHighlight.edges());

        //If there are some elements to not highlight handle them
        if (param.elesToNotHighlight != null) {
            var elesToNotHighlight = param.elesToNotHighlight;
            elesToNotHighlight.removeData("highlighted");
            sbgnFiltering.notHighlightNodes(elesToNotHighlight.nodes());
            sbgnFiltering.notHighlightEdges(elesToNotHighlight.edges());

            //If there are some elements to not highlight then allElementsWasNotHighlighted should be true
            result.allElementsWasNotHighlighted = true;
        }
    }
    result.elesToNotHighlight = elementsToHighlight;
    return result;
}

module.exports.notHighlightEles = function(param) {
    var elesToNotHighlight = param.elesToNotHighlight;
    var allElementsWasNotHighlighted = param.allElementsWasNotHighlighted;

    var result = {};

    if (param.allElementsWasNotHighlighted) {
        sbgnFiltering.removeHighlights();
        result.elesToHighlight = elesToNotHighlight;
        result.elesToNotHighlight = cy.elements(":visible").not(elesToNotHighlight);
    }
    else {
        sbgnFiltering.notHighlightNodes(elesToNotHighlight.nodes());
        sbgnFiltering.notHighlightEdges(elesToNotHighlight.edges());
        elesToNotHighlight.removeData("highlighted");

        result.elesToHighlight = elesToNotHighlight;
    }

    result.firstTime = false;
    return result;
}

module.exports.removeHighlights = function() {
    var result = {};
    if (sbgnFiltering.isAllElementsAreNotHighlighted()) {
        result.elesToHighlight = cy.elements(":visible");
    }
    else {
        result.elesToHighlight = cy.elements("[highlighted='true']").filter(":visible");
    }

    sbgnFiltering.removeHighlights();

    result.elesToNotHighlight = cy.elements(":visible").not(result.elesToHighlight);
    result.firstTime = false;
    return result;
}
/*
 * This method assumes that param.nodesToMakeCompound contains at least one node
 * and all of the nodes including in it have the same parent
 */
module.exports.createCompoundForSelectedNodes = function(param) {
    var nodesToMakeCompound = param.nodesToMakeCompound;
    var oldParentId = nodesToMakeCompound[0].data("parent");
    var newCompound;

    if (param.firstTime) {
        var eles = cy.add({
            group: "nodes",
            data: {
                sbgnclass: param.compoundType,
                parent: oldParentId,
                sbgnbbox: {
                },
                sbgnstatesandinfos: [],
                ports: []
            }
        });

        newCompound = eles[eles.length - 1];

    }
    else {
        newCompound = param.removedCompound.restore();
    }

    var newCompoundId = newCompound.id();

    newCompound._private.data.sbgnbbox.h = newCompound.height();
    newCompound._private.data.sbgnbbox.w = newCompound.width();

    addRemoveUtilities.changeParent(nodesToMakeCompound, oldParentId, newCompoundId);


    refreshPaddings();

    module.exports.modelManager.addModelNode(newCompound.id(), {x: newCompound._private.position.x, y: newCompound._private.position.y, sbgnclass: param.compoundType}, "me");


    module.exports.modelManager.changeModelNodeAttribute('width', newCompoundId, newCompound.width(),  "me");
    module.exports.modelManager.changeModelNodeAttribute('height', newCompoundId, newCompound.height() , "me");


    nodesToMakeCompound.forEach(function(node){
        module.exports.modelManager.changeModelNodeAttribute('sbgnbboxW', node.id(), newCompound.width(), "me");
        module.exports.modelManager.changeModelNodeAttribute('sbgnbboxH', node.id(), newCompound.height(), "me");
        module.exports.modelManager.changeModelNodeAttribute('parent',node.id(), node.data('parent'), "me");
    });


    return newCompound;
}

module.exports.removeCompound = function(compoundToRemove) {
    var compoundId = compoundToRemove.id();
    var newParentId = compoundToRemove.data("parent");
    var childrenOfCompound = compoundToRemove.children();

    addRemoveUtilities.changeParent(childrenOfCompound, compoundId, newParentId);
    var removedCompound = compoundToRemove.remove();

    refreshPaddings();

    var param = {
        nodesToMakeCompound: childrenOfCompound,
        removedCompound: removedCompound
    };

    return param;
}

module.exports.resizeNode = function(param) {
    var result = {
        firstTime: false
    };
    var ele = param.ele;
    result.width = param.initialWidth;
    result.height = param.initialHeight;
    result.ele = ele;

    //if (!param.firstTime) {
    ele.data("width", param.width);
    ele.data("height", param.height);




    module.exports.modelManager.changeModelNodeAttribute('width', ele.id(), param.width, "me");


    module.exports.modelManager.changeModelNodeAttribute('height', ele.id(), param.height, "me");

    //}
    return result;
}

module.exports.changeNodeLabel = function(param) {
    var result = {
    };
    var node = param.ele;
    result.ele = node;

    result.data = node._private.data.sbgnlabel;

    node._private.data.sbgnlabel = param.data;

    module.exports.modelManager.changeModelNodeAttribute('sbgnlabel', node.id(), param.data, "me");
    cy.forceRender();
    return result;
}

module.exports.changeStateVariable = function(param) {
    var result = {
    };
    var state = param.state;
    var type = param.type;
    result.state = state;
    result.type = type;
    result.valueOrVariable = state.state[type];
    result.ele = param.ele;
    result.width = param.width;

    state.state[type] = param.valueOrVariable;
    cy.forceRender();


    var statesAndInfos = param.ele.data('sbgnstatesandinfos');


    var ind = statesAndInfos.indexOf(state);
    statesAndInfos[ind] = state;

    param.data = statesAndInfos;
    module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me", param.state );
    return result;
}

module.exports.changeUnitOfInformation = function(param) {
    var result = {
    };
    var state = param.state;
    result.state = state;
    result.text = state.label.text;
    result.ele = param.ele;
    result.width = param.width;


    state.label.text = param.text;
    cy.forceRender();


    var statesAndInfos = param.ele.data('sbgnstatesandinfos');
    var ind = statesAndInfos.indexOf(state);
    statesAndInfos[ind] = state;

    param.data = statesAndInfos;

    module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me", param.state);

    return result;
}

module.exports.addStateAndInfo = function(param) {
    var obj = param.obj;
    var ele = param.ele;
    var statesAndInfos = ele._private.data.sbgnstatesandinfos;

    statesAndInfos.push(obj);
    relocateStateAndInfos(statesAndInfos);

    param.data = statesAndInfos;
    module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me", param.obj );
    module.exports.updateServerGraph();
    param.ele.unselect(); //to refresh inspector
    param.ele.select(); //to refresh inspector
    cy.forceRender();
    var result = {
        ele: ele,
        width: param.width,
        obj: obj
    };
    return result;
}

module.exports.removeStateAndInfo = function(param) {
    var obj = param.obj;
    var ele = param.ele;
    var statesAndInfos = ele._private.data.sbgnstatesandinfos;

    var index = statesAndInfos.indexOf(obj);
    statesAndInfos.splice(index, 1);
    relocateStateAndInfos(statesAndInfos);

    param.data = statesAndInfos;
    module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me", param.state);
    param.ele.unselect(); //to refresh inspector
    param.ele.select(); //to refresh inspector
    cy.forceRender();

    var result = {
        ele: ele,
        width: param.width,
        obj: obj
    };
    return result;
}

//FUNDA: changed param.node to param.ele
module.exports.changeIsMultimerStatus = function(param) {
    var node = param.ele;
    var makeMultimer = param.data;
    var sbgnclass = node.data('sbgnclass');
    if (makeMultimer) {
        //if not multimer already
        if(sbgnclass.indexOf(' multimer') <= -1) //todo funda changed
            node.data('sbgnclass', sbgnclass + ' multimer');
    }
    else {
        node.data('sbgnclass', sbgnclass.replace(' multimer', ''));
    }


  //  if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
  //      $('#inspector-is-multimer').attr('checked', makeMultimer);
  //  }
    var result = {
        data: !makeMultimer,
        ele: node
    };


    module.exports.modelManager.changeModelNodeAttribute('isMultimer', param.ele.id(), param.data, "me");
    return result;
}

module.exports.changeIsCloneMarkerStatus = function(param) {
    var node = param.ele;
    var makeCloneMarker = param.data;
    node._private.data.sbgnclonemarker = makeCloneMarker?true:undefined;

    //node.data('sbgnclonemarker', (makeCloneMarker?true:undefined)); //is not working in this case

    //cy.forceRender();
    if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
        $('#inspector-is-clone-marker').attr('checked', makeCloneMarker);
    }

    module.exports.modelManager.changeModelNodeAttribute('isCloneMarker', param.ele.id(), param.data);

    //result is for undo operation
    var result = {
        data: !makeCloneMarker,
        ele: node
    };


    return result;
}

module.exports.changeStyleData = function( param) {
    var result = {
    };
    var ele = param.ele;
    result.dataType = param.dataType;
    result.data = ele.data(param.dataType);
    result.ele = ele;

    ele.data(param.dataType, param.data);
    cy.forceRender();



//TODO: Funda closed this:
    //if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
    //    handleSBGNInspector();
    //}

    if(ele.isNode())
        module.exports.modelManager.changeModelNodeAttribute(param.modelDataName, param.ele.id(), param.data, "me");
    else
        module.exports.modelManager.changeModelEdgeAttribute(param.modelDataName, param.ele.id(), param.data, "me");

    return result;
}

module.exports.changeStyleCss = function(param) {
    var result = {
    };

    var ele = param.ele;
    result.dataType = param.dataType;

    result.data = ele.css(param.dataType);
    result.ele = ele;

    ele.css(param.dataType, param.data);
    cy.forceRender();


    //TODO: Funda closed
    //if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
    //    handleSBGNInspector();
    //}

    if(ele.isNode()){
        module.exports.modelManager.changeModelNodeAttribute(param.modelDataName, param.ele.id(), param.data, "me");
    }
    else
        module.exports.modelManager.changeModelEdgeAttribute(param.modelDataName, param.ele.id(), param.data, "me");

    return result;
}

/*
 *	Base command class
 * do: reference to the function that performs actual action for this command.
 * undo: reference to the action that is reverse of this action's command.
 * params: additional parameters for this command
 */
var Command = function (_do, undo, params, name, callback) {
    this.name = name;
    this._do = _do;
    this.undo = undo;
    this.params = params;
    if(callback!=null) callback();
};


module.exports.SelectNodeCommand = function (node)
{
    return new Command(module.exports.selectNode, module.exports.unselectNode, node, "selectNode");
};

module.exports.UnselectNodeCommand = function (node)
{
    return new Command(module.exports.unselectNode, module.exports.selectNode, node, "unselectNode");
};

module.exports.SelectEdgeCommand = function (edge)
{
    return new Command(module.exports.selectEdge, module.exports.unselectEdge, edge, "selectEdge");
};

module.exports.UnselectEdgeCommand = function (edge)
{
    return new Command(module.exports.unselectEdge, module.exports.selectEdge, edge, "unselectEdge");
};
module.exports.ChangeNodeLabelCommand = function (node)
{
    return new Command(module.exports.changeNodeLabel, module.exports.changeNodeLabel, node, "changeLabel",function(){
        module.exports.updateServerGraph()});
};
module.exports.AddNodeCommand = function (newNode)
{
    return new Command(module.exports.addNode, module.exports.removeNodes, newNode, "addNode" ,function(){
    module.exports.updateServerGraph()});
};

//var RemoveNodesCommand = function (nodesTobeDeleted)
//{
//  return new Command(removeNodes, restoreEles, nodesTobeDeleted);
//};

module.exports.RemoveElesCommand = function (elesTobeDeleted)
{
    return new Command(module.exports.removeEles, module.exports.restoreEles, elesTobeDeleted, "removeElements", function(){
        module.exports.updateServerGraph()});
};

module.exports.AddEdgeCommand = function (newEdge)
{
    return new Command(module.exports.addEdge, module.exports.removeEdges, newEdge, "addEdge",function(){
        module.exports.updateServerGraph()});;
};

//var RemoveEdgesCommand = function (edgesTobeDeleted)
//{
//  return new Command(removeEdges, restoreEles, edgesTobeDeleted);
//};

module.exports.ExpandNodeCommand = function (param) {
    return new Command(module.exports.expandNode, module.exports.undoExpandNode, param, "expandNode");
};

module.exports.CollapseNodeCommand = function (param) {
    return new Command(module.exports.collapseNode, module.exports.undoCollapseNode, param, "collapseNode");
};

module.exports.SimpleExpandNodeCommand = function (node) {
    return new Command(module.exports.simpleExpandNode, module.exports.simpleCollapseNode, node, "simpleExpandNode");
};

module.exports.simpleCollapseNodeCommand = function (node) {
    return new Command(module.exports.simpleCollapseNode, module.exports.simpleExpandNode, node, "simpleCollapseNode");
};

module.exports.ExpandGivenNodesCommand = function (param) {
    return new Command(module.exports.expandGivenNodes, module.exports.undoExpandGivenNodes, param, "expandGivenNodes");
};

module.exports.CollapseGivenNodesCommand = function (param) {
    return new Command(module.exports.collapseGivenNodes, module.exports.undoCollapseGivenNodes, param, "collapseGivenNodes");
};

module.exports.SimpleExpandGivenNodesCommand = function (nodes) {
    return new Command(module.exports.simpleExpandGivenNodes, module.exports.simpleCollapseGivenNodes, nodes, "simpleExpandGivenNodes");
};

module.exports.SimpleCollapseGivenNodesCommand = function (nodes) {
    return new Command(module.exports.simpleCollapseGivenNodes, module.exports.simpleExpandGivenNodes, nodes, "simpleCollapseGivenNodes");
};

module.exports.SimpleExpandAllNodesCommand = function () {
    return new Command(module.exports.simpleExpandAllNodes, module.exports.collapseExpandedStack, "simpleExpandAllNodes");
};

module.exports.ExpandAllNodesCommand = function (param) {
    return new Command(module.exports.expandAllNodes, module.exports.undoExpandAllNodes, param, "expandAllNodes");
};

module.exports.PerformLayoutCommand = function (nodesData) {
    return new Command(module.exports.performLayoutFunction, module.exports.returnToPositionsAndSizes, nodesData, "performLayout");
};

module.exports.MoveNodeCommand = function (param) {
    return new Command(module.exports.moveNodesConditionally, module.exports.moveNodesReversely, param, "moveNode",function(){
        module.exports.updateServerGraph()});
};

module.exports.DeleteSelectedCommand = function (param) {
    return new Command(module.exports.deleteSelected, module.exports.restoreSelected, param, "deleteSelected",function(){
        module.exports.updateServerGraph()});
};

module.exports.HideSelectedCommand = function (param) {
    return new Command(module.exports.hideSelected, module.exports.showJustGivenNodes, param, "hideSelected");
};

module.exports.ShowSelectedCommand = function (param) {
    return new Command(module.exports.showSelected, module.exports.showJustGivenNodes, param, "showSelected");
};

module.exports.ShowAllCommand = function () {
    return new Command(module.exports.showAll, module.exports.showJustGivenNodes, "showAll");
};

module.exports.HighlightNeighborsofSelectedCommand = function (param) {
    param.highlightNeighboursofSelected = true;
    return new Command(module.exports.highlightSelected, module.exports.notHighlightEles, param, "highlightNeighborsOfSelected");
};

module.exports.HighlightProcessesOfSelectedCommand = function (param) {
    param.highlightProcessesOfSelected = true;
    return new Command(module.exports.highlightSelected, module.exports.notHighlightEles, param, "highlightProcessesOfSelected");
};

module.exports.RemoveHighlightsCommand = function () {
    return new Command(module.exports.removeHighlights, module.exports.highlightSelected, "removeHighlights");
};

module.exports.CreateCompoundForSelectedNodesCommand = function (param) {
    return new Command(module.exports.createCompoundForSelectedNodes, module.exports.removeCompound, param, "createCompound",function(){
        module.exports.updateServerGraph()});
};

module.exports.ResizeNodeCommand = function (param) {
    return new Command(module.exports.resizeNode, module.exports.resizeNode, param, "resizeNode",function(){
        module.exports.updateServerGraph()});
};


module.exports.AddStateAndInfoCommand = function (param) {
    return new Command(module.exports.addStateAndInfo, module.exports.removeStateAndInfo, param, "addStateAndInfo",function(){
        module.exports.updateServerGraph()});
};

module.exports.RemoveStateAndInfoCommand = function (param) {
    return new Command(module.exports.removeStateAndInfo, module.exports.addStateAndInfo, param, "removeStateAndInfo",function(){
        module.exports.updateServerGraph()});
};

module.exports.ChangeStateVariableCommand = function (param) {
    return new Command(module.exports.changeStateVariable, module.exports.changeStateVariable, param, "changeStateVariable",function(){
        module.exports.updateServerGraph()});
};

module.exports.ChangeUnitOfInformationCommand = function (param) {
    return new Command(module.exports.changeUnitOfInformation, module.exports.changeUnitOfInformation, param, "changeUnitOfInformation",function(){
        module.exports.updateServerGraph()});
};

module.exports.ChangeStyleDataCommand = function (param) {
    return new Command(module.exports.changeStyleData, module.exports.changeStyleData, param, "changeStyleData",function(){
        module.exports.updateServerGraph()});
};

module.exports.ChangeStyleCssCommand = function (param) {
    return new Command(module.exports.changeStyleCss, module.exports.changeStyleCss, param, "changeStyleCss",function(){
        module.exports.updateServerGraph()});
};

module.exports.changeIsMultimerStatusCommand = function (param) {
    return new Command(module.exports.changeIsMultimerStatus, module.exports.changeIsMultimerStatus, param, "changeMultimerStatus",function(){
        module.exports.updateServerGraph()});
};

module.exports.changeIsCloneMarkerStatusCommand = function (param) {
    return new Command(module.exports.changeIsCloneMarkerStatus, module.exports.changeIsCloneMarkerStatus, param, "changeCloneMarkerStatus",function(){
        module.exports.updateServerGraph()});
}




/**
*  Description: A simple action manager that acts also as a undo-redo manager regarding Command Design Pattern
*	Author: Istemi Bahceci<istemi.bahceci@gmail.com>
*/
function Manager(refModelManager)
{
    modelManager = refModelManager;
    this.undoStack = [];
    this.redoStack = [];

    //Returns the name of the last undo action
    this.getUndoAction = function(){
        return this.undoStack[this.undoStack.length-1].name;
    };

    //Returns the name of the last redo action
    this.getRedoAction = function(){
        return this.redoStack[this.redoStack.length-1].name;
    };

    /*
     *  Executes given command by calling do method of given command
     *  pushes the action to the undoStack after execution.
     */
    this._do = function (command)
    {
        //_do function returns the parameters for undo function
        command.undoparams = command._do(command.params);
        if(command.name.indexOf("select")< 0) //do not include selection/unselection operations
            this.undoStack.push(command);
    };

/*
 *  Undo last command.
 *  Pushes the reversed action to the redoStack after undo operation.
 */
    this.undo = function ()
    {
    if (this.undoStack.length == 0) {
        return;
    }
        var lastCommand = this.undoStack.pop();
        var result = lastCommand.undo(lastCommand.undoparams);
        //If undo function returns something then do function params should be refreshed
        if (result != null) {
            lastCommand.params = result;
        }


        this.redoStack.push(lastCommand);
    };

    /*
     *  Redo last command that is previously undid.
     *  This method basically calls do method for the last command that is popped of the redoStack.
     */
    this.redo = function ()
    {
        if (this.redoStack.length == 0) {
            return;
        }
        var lastCommand = this.redoStack.pop();
        this._do(lastCommand);
    };

    /*
     *
     * This method indicates whether the undo stack is empty
     */
    this.isUndoStackEmpty = function () {
        return this.undoStack.length == 0;
    }

    /*
     *
     * This method indicates whether the redo stack is empty
     */
    this.isRedoStackEmpty = function () {
        return this.redoStack.length == 0;
    }

    /*
     *  Empties undo and redo stacks !
     */
    this.reset = function ()
    {
        this.undoStack = [];
        this.redoStack = [];
    };
}
module.exports.manager = new Manager();



/*
 * This function refreshs the enabled-disabled status of undo-redo buttons.
 * The status of buttons are determined by whether the undo-redo stacks are empty.
 */
module.exports.refreshUndoRedoButtonsStatus = function () {




    if (module.exports.manager.isUndoStackEmpty()) {
        $("#undo-last-action").parent("li").addClass("disabled");
    }
    else {
        $("#undo-last-action").html("Undo " + module.exports.manager.getUndoAction());
        $("#undo-last-action").parent("li").removeClass("disabled");
    }

    if (module.exports.manager.isRedoStackEmpty()) {
        $("#redo-last-action").parent("li").addClass("disabled");
    }
    else {
        $("#redo-last-action").html("Redo " + module.exports.manager.getRedoAction());
        $("#redo-last-action").parent("li").removeClass("disabled");
    }
}

