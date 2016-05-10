/**
 *	Design for SBGNViz Editor actions.
 *  Command Design Pattern is used.
 *  A simple undo-redo manager is implemented(EditorActionsManager)
 *	Author: Istemi Bahceci<istemi.bahceci@gmail.com>
 */



module.exports.modelManager;
var addRemoveUtilities = require('../../../src/utilities/add-remove-utilities.js')();
var expandCollapseUtilities = require('../../../src/utilities/expand-collapse-utilities.js')();
var sbgnFiltering = require('../../../src/utilities/sbgn-filtering.js')();


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

    var  newNode = addRemoveUtilities.addNode(param.x, param.y, param.sbgnclass, param.id);
    if(param.sbgnlabel!=null)
        newNode.data('sbgnlabel', param.sbgnlabel); //funda

    if(param.sync){
        module.exports.modelManager.updateHistory({opName: "add node", depth: -1}); //do not actually perform command, just group
        module.exports.modelManager.addModelNode(newNode.id(),  param, "me", 0);
        module.exports.modelManager.initModelNode(newNode, null, 1);

    }

    return newNode;
}
module.exports.removeEles =function(elesToBeRemoved) {

    //removeEles operation computes edges to be removed

    var removedEles = addRemoveUtilities.removeEles(elesToBeRemoved);
    var nodeList = [];
    var edgeList = [];

    removedEles.forEach(function (el) {
        if(el.isNode())
            nodeList.push(el.id());
        else
            edgeList.push(el.id());
    });


    module.exports.modelManager.updateHistory({opName: "remove elements simply", depth: -1}); //do not actually perform command, just group


    //first update children so that we can restore it later


    //first delete edges so that we can restore nodes first
    edgeList.forEach(function (elId) {
        module.exports.modelManager.deleteModelEdge(elId, "me", 0);
    });
    nodeList.forEach(function(elId){
        module.exports.modelManager.deleteModelNode(elId, "me", 0);
    });

    
    //module.exports.modelManager.deleteModelElementGroup({nodes:nodeList,edges: edgeList}, "me", 0); //edges need to be deleted first



}


module.exports.deleteSelected = function(param) {


    var eles = param.eles;


    if(param.sync) {
        module.exports.modelManager.updateHistory({opName: "remove elements smartly", depth: -1}); //do not actually perform command, just group
        var nodeList = [];
        var edgeList = [];

       // eles.forEach(function(el){
        //     if(el.isNode()) {
        //         var childIdList = [];
        //         el.children().forEach(function(child){
        //             childIdList.push(child.id());
        //         });
        //         module.exports.modelManager.changeModelNodeAttribute('children', el.id(),childIdList,"me", 0)
        //     }
        // });

        eles.forEach(function (el) {
            if(el.isNode()) {
                nodeList.push(el.id());
            }
            else
                edgeList.push(el.id());
        });

        edgeList.forEach(function (elId) {
            module.exports.modelManager.deleteModelEdge(elId, "me", 0);
        });

        nodeList.forEach(function(elId){
            module.exports.modelManager.deleteModelNode(elId, "me", 0);
        });

    }

    addRemoveUtilities.removeElesSimply(param.eles);

}

module.exports.addEdge = function(param) {
    var newEdge;
    newEdge = addRemoveUtilities.addEdge(param.source, param.target, param.sbgnclass, param.id);

    if(param.sync){
        module.exports.modelManager.updateHistory({opName: "add edge", depth: -1}); //do not actually perform command, just group
        module.exports.modelManager.addModelEdge(newEdge.id(), param, "me", 0);
        module.exports.modelManager.initModelEdge(newEdge,  null, 1); //no history update but let others update params

    }
    return newEdge;
}



module.exports.expandNode = function(param) {
    expandCollapseUtilities.expandNode(param.node);
    if(param.sync) {
        module.exports.modelManager.updateHistory({opName: "expand node", depth: -1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", param.node.id(), "expand", "me", 0);
    }

}

module.exports.collapseNode = function(param) {
    expandCollapseUtilities.collapseNode(param.node);
    if(param.sync) {
        module.exports.modelManager.updateHistory({opName: "collapse node", depth: -1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", param.node.id(), "collapse", "me", 0);
    }

}
module.exports.simpleExpandNode = function(param) {
    expandCollapseUtilities.simpleExpandNode(param.node);
    if (param.sync) {
        module.exports.modelManager.updateHistory({opName: "simple expand node", depth: -1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", param.node.id(), "expand", "me", 0);
    }
}

module.exports.simpleCollapseNode = function(param) {
    expandCollapseUtilities.simpleCollapseNode(param.node);
    if(param.sync)
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", param.node.id(), "collapse", "me", 0);

}

module.exports.expandGivenNodes = function(param) {
    expandCollapseUtilities.expandGivenNodes(param.nodes);
    if(param.sync){
        module.exports.modelManager.updateHistory({opName: "expand nodes", depth: -1}); //do not actually perform command, just group
        param.nodes.forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "expand", "me", 0);
        });
    }
}

module.exports.collapseGivenNodes = function(param) {
    expandCollapseUtilities.collapseGivenNodes(param.nodes);
    if(param.sync){
        module.exports.modelManager.updateHistory({opName: "collapse nodes", depth: -1}); //do not actually perform command, just group
        param.nodes.forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "collapse", "me", 0);
        });
    }

}

module.exports.simpleExpandGivenNodes = function(param) {
    expandCollapseUtilities.simpleExpandGivenNodes(param.nodes);
    if(param.sync){
        module.exports.modelManager.updateHistory({opName: "simple expand nodes", depth: -1}); //do not actually perform command, just group
        param.nodes.forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "expand", "me", 0);
        });
    }
}

module.exports.simpleCollapseGivenNodes = function(param) {
    module.exports.modelManager.updateHistory({opName: "simple collapse nodes", depth: -1}); //do not actually perform command, just group
    expandCollapseUtilities.simpleCollapseGivenNodes(param.nodes);
    if(param.sync){
        param.nodes.forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "collapse", "me", 0);
        });
    }
}
module.exports.expandAllNodes = function() {
    module.exports.modelManager.updateHistory({opName: "expand nodes", depth: -1}); //do not actually perform command, just group
    expandCollapseUtilities.expandAllNodes();
    if(param.sync) {
        cy.nodes().forEach(function (node) {
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "expand", "me", 0);
        });
    }

}

module.exports.simpleExpandAllNodes = function() {
    expandCollapseUtilities.simpleExpandAllNodes();
    module.exports.modelManager.updateHistory({opName: "simple collapse nodes", depth: -1}); //do not actually perform command, just group
    if(param.sync) {
        cy.nodes().forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "collapse", "me", 0);
        });
    }

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



module.exports.performLayoutFunction = function(param) {

    module.exports.modelManager.updateHistory({opName:"run layout", depth:-1});
//notify other clients
    cy.on('layoutstop', function() {
        cy.nodes().forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("position", node.id(), node.position(), "me", 0);
        });

    });

}

module.exports.returnToPositionsAndSizesConditionally = function(param) {

    if (param.firstTime) {
        delete param.firstTime;
        return param;
    }
    return module.exports.returnToPositionsAndSizes(param);
}
module.exports.returnToPositionsAndSizes = function(param) {
    var currentPositionsAndSizes = {};
    var nodesData = param.nodesData;

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

    if(param.sync){
    //    var modelElList = [];
     //   var paramList = [];
        module.exports.modelManager.changeModelNodeAttribute("rollback positions and sizes", node.id(), node.position(), "me", 0);
        cy.nodes().forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("position", node.id(), node.position(), "me", 0);
            module.exports.modelManager.changeModelNodeAttribute("width", node.id(), node.width(), "me", 0);
            module.exports.modelManager.changeModelNodeAttribute("height", node.id(), node.height(), "me", 0);
  //          modelElList.push({id: node.id(), isNode: true});
    //        paramList.push(node.position());

        });
//        module.exports.modelManager.changeModelElementGroupAttribute("position", modelElList, paramList, "me", 0);

    }


    return {sync: true, nodesData: currentPositionsAndSizes};
}

//This is used only to inform the model and perform undo. cytoscape moves the node
module.exports.moveNodesConditionally = function(param) {

    module.exports.modelManager.updateHistory({opName:"move node group", depth:-1}); //do not actually perform command, just group
    if(param.sync){

        var elParamList = module.exports.getDescendentNodes(param.nodes);

    }


    return param;
}

module.exports.getDescendentNodes = function(nodes) {
    if(nodes == null) return;
    nodes.forEach(function(node){

        module.exports.modelManager.changeModelNodeAttribute("position", node.id(), node.position(), "me", 1);
        var children = node.children();
        module.exports.getDescendentNodes(children);
        
    });

}

/***
 * This function actually changes the position of the node as updated in the model -- unlike moveNode
 * @param param = {ele:, data:}
 *
 */
module.exports.changePosition = function(param){
    var ele = param.ele;


    ele.position(param.data);

    ele['position'](param.data);
    if(param.sync){ //don't update history
        module.exports.modelManager.updateHistory({opName:"move node", depth:-1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute("position", ele.id(), ele.position(), "me", 1);

    }

}



module.exports.hideSelected = function(param) {
    var currentNodes = cy.nodes(":visible");
    
    var nodesToHide = sbgnFiltering.hideSelected(param.selectedEles); //funda changed
    if(param.sync) {//first hide on the other side to make sure elements don't get unselected
        module.exports.modelManager.updateHistory({opName:"hide selected", depth:-1});

        nodesToHide.forEach(function (el) {
            module.exports.modelManager.changeModelNodeAttribute("visibilityStatus", el.id(), "invisible", "me", 0);
        });

    }
    
}



module.exports.showSelected = function(param) {

    var nodesToShow = sbgnFiltering.showSelected(param.selectedEles); //funda changed

    if(param.sync){
        module.exports.modelManager.updateHistory({opName:"show selected", depth:-1});
        nodesToShow.forEach(function(el){
            module.exports.modelManager.changeModelNodeAttribute("visibilityStatus", el.id(), "visible", "me", 0);
        });


         var nodesToHide = cy.nodes().not(nodesToShow);

        nodesToHide.forEach(function(el){
            module.exports.modelManager.changeModelNodeAttribute("visibilityStatus", el.id(), "invisible", "me", 0);
        });
    }

    
}

module.exports.showAll = function(param) {
    sbgnFiltering.showAll();
    if(param.sync){
        module.exports.modelManager.updateHistory({opName:"show all", depth:-1});
        cy.nodes().forEach(function(el){
            module.exports.modelManager.changeModelNodeAttribute("visibilityStatus", el.id(), "visible", "me", 0);
        });

    }

    
}



//funda changed this to include selected nodes explicitly
module.exports.highlightSelected = function(param) {
    var elesToHighlight, elesToNotHighlight;
    
    //If this is the first call of the function then call the original method
        //find selected elements
        var alreadyHighlighted = cy.elements("[highlighted='true']").filter(":visible");
        if (param.highlightNeighboursofSelected) {

            elesToHighlight = sbgnFiltering.highlightNeighborsOfSelected(param.selectedEles);


        }
        else if (param.highlightProcessesOfSelected) {
            elesToHighlight = sbgnFiltering.highlightProcessesOfSelected(param.selectedEles);
        }
        elesToHighlight = elesToHighlight.not(alreadyHighlighted);
        elesToNotHighlight = cy.elements().not(elesToHighlight);


    if(param.sync){
        module.exports.modelManager.updateHistory({opName:"highlight selected", depth:-1}); //do not actually perform command, just group
        if(elesToHighlight != null) {
             elesToHighlight.forEach(function (el) {
                 if(el.isNode())
                    module.exports.modelManager.changeModelNodeAttribute("highlightStatus", el.id(), "highlighted", "me", 0);
                 else
                     module.exports.modelManager.changeModelEdgeAttribute("highlightStatus", el.id(), "highlighted", "me", 0);
            });
        }

        if(elesToNotHighlight != null){

            elesToNotHighlight.forEach(function (el) {
                if(el.isNode())
                    module.exports.modelManager.changeModelNodeAttribute("highlightStatus", el.id(), "notHighlighted", "me", 0);
                else
                    module.exports.modelManager.changeModelEdgeAttribute("highlightStatus", el.id(), "notHighlighted", "me", 0);

            });

        }

    }

   
}

//Remove highlights actually means remove fadeouts
module.exports.removeHighlights = function(param) {
   
   
    sbgnFiltering.removeHighlights();

    if(param.sync){
        module.exports.modelManager.updateHistory({opName:"remove highlights", depth:-1}); //do not actually perform command, just group

        cy.nodes().forEach(function (el) {

            module.exports.modelManager.changeModelNodeAttribute("highlightStatus", el.id(), "highlighted", "me", 0);
        });
        cy.edges().forEach(function(el){
            module.exports.modelManager.changeModelEdgeAttribute("highlightStatus", el.id(), "highlighted", "me", 0);
        });

    }
    
   
}

module.exports.changeChildren = function(param){
    var ele = param.ele;

    var elArr = [];
    var elIdArr = [];

    if(param.data) { //if it has children
        param.data.forEach(function (nodeId) {
            elArr.push(cy.getElementById(nodeId));
            elIdArr.push(nodeId);
        });

        ele._private.children = elArr;
        //ele._private.data.children = elIdArr;
        expandCollapseUtilities.refreshPaddings();

        if (param.sync) {
            module.exports.modelManager.updateHistory({opName:"change children", depth:-1}); //do not actually perform command, just group
            module.exports.modelManager.changeModelNodeAttribute(param.modelDataName, param.ele.id(), elIdArr, "me", 0);
        }
    }
}

module.exports.changeParent = function(param) {
    //If there is an inner param firstly call the function with it
    //Inner param is created if the change parent operation requires
    //another change parent operation in it.
    if (param.innerParam) {
        changeParent(param.innerParam);
    }

    var node = param.ele;
    var oldParentId = node._private.data.parent;
    var oldParent = node.parent()[0];
    var newParentId = param.data;

    var newParent = newParentId? cy.$(('#' + newParentId))[0] : undefined;
    var nodesData = getNodesData();//param.nodesData;

    //If new parent is not null some checks should be performed
    if (newParent) {
        //check if the node was the anchestor of it's new parent
        var wasAnchestorOfNewParent = false;
        var temp = newParent.parent()[0];
        while (temp != null) {
            if (temp == node) {
                wasAnchestorOfNewParent = true;
                break;
            }
            temp = temp.parent()[0];
        }
        //if so firstly remove the parent from inside of the node
        if (wasAnchestorOfNewParent) {
            var parentOfNewParent = newParent.parent()[0];
            addRemoveUtilities.changeParent(newParent, newParent._private.data.parent, node._private.data.parent);
            oldParentId = node._private.data.parent;
        }
    }



    //Change the parent of the node
    addRemoveUtilities.changeParent(node, oldParentId, newParent ? newParent._private.data.id : undefined);

    if (param.posX && param.posY) {
        node.position({
            x: param.posX,
            y: param.posY
        });
    }



    cy.nodes().updateCompoundBounds();
    module.exports.returnToPositionsAndSizesConditionally({nodesData:nodesData, sync: param.sync});

    if(param.sync){
        module.exports.modelManager.updateHistory({opName:"change parent", depth:-1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute('parent', param.node.id(), newParent.id(), "me", 0);


        expandCollapseUtilities.refreshPaddings();
    }


}

/*
 * This method assumes that param.nodesToMakeCompound contains at least one node
 * and all of the nodes including in it have the same parent
 */
module.exports.createCompoundForSelectedNodes = function(param) {
    var nodesToMakeCompound = param.nodesToMakeCompound;
    var oldParentId = nodesToMakeCompound[0].data("parent");
    var newCompound;

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



    var newCompoundId = newCompound.id();

    newCompound._private.data.sbgnbbox.h = newCompound.height();
    newCompound._private.data.sbgnbbox.w = newCompound.width();


    var modelElList = [];
    nodesToMakeCompound.forEach(function(node){
        modelElList.push(node.id());
    });


    addRemoveUtilities.changeParent(nodesToMakeCompound, oldParentId, newCompoundId);


    expandCollapseUtilities.refreshPaddings();

    ////Notify other clients


    if(param.sync) {
        module.exports.modelManager.updateHistory({opName:"add compound", depth:-1}); //do not actually perform command, just group
        module.exports.modelManager.addModelCompound(newCompound.id(), {
            x: newCompound._private.position.x,
            y: newCompound._private.position.y,
            sbgnclass: param.compoundType,
            width: newCompound.width(),
            height: newCompound.height()
        }, modelElList, oldParentId, "me", 0);

        //module.exports.modelManager.addModelNode(newCompound.id(), {x: newCompound._private.position.x, y: newCompound._private.position.y, sbgnclass: param.compoundType}, "me");
        module.exports.modelManager.initModelNode(newCompound, "me", 1);
    }


}

module.exports.removeCompound = function(param) {

    var compoundToRemove = param.compoundToRemove;
    var compoundId = compoundToRemove.id();
    var newParentId = compoundToRemove.data("parent");
    var childrenOfCompound = compoundToRemove.children();
    
    addRemoveUtilities.changeParent(childrenOfCompound, compoundId, newParentId);
    //change parents of children


    var removedCompound = compoundToRemove.remove();
    //remove children of compound node


    if(param.sync) {
        module.exports.modelManager.updateHistory({opName:"remove compound", depth:-1}); //do not actually perform command, just group
        childrenOfCompound.forEach(function (node) {
            module.exports.modelManager.changeModelNodeAttribute('parent', node.id(), newParentId, "me", 0);
        });

        module.exports.modelManager.changeModelNodeAttribute('children', removedCompound.id(), [], "me", 0);

        module.exports.modelManager.deleteModelNode(removedCompound.id(), "me", 1);
    }

    expandCollapseUtilities.refreshPaddings();


}

module.exports.resizeNode = function(param) {

    var ele = param.ele;

    
    //if (!param.firstTime) {
        ele.data("width", param.width);
        ele.data("height", param.height);

    //funda
    ele._private.data.sbgnbbox.w = param.width;
    ele._private.data.sbgnbbox.h = param.height;

    ele._private.autoWidth = param.width;
    ele._private.style.width.value = param.width;
    ele._private.style.width.pfValue = param.width;

    ele._private.autoHeight= param.height;
    ele._private.style.height.value = param.height;
    ele._private.style.height.pfValue = param.height;


    if(param.sync){
        module.exports.modelManager.updateHistory({opName:"resize node", depth:-1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute('width',  ele.id(), param.width, "me", 0);
        module.exports.modelManager.changeModelNodeAttribute('height', ele.id(), param.height, "me", 0);
    }

    
}


module.exports.changeStateVariable = function(param) {
    var state = param.state;
    var type = param.type;
    
    state.state[type] = param.valueOrVariable;
    cy.forceRender();


    var statesAndInfos = param.ele.data('sbgnstatesandinfos');


    var ind = statesAndInfos.indexOf(state);
    statesAndInfos[ind] = state;

    param.data = statesAndInfos;
    if(param.sync) {
        module.exports.modelManager.updateHistory({opName:"change state variable", depth:-1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me", 0);
    }

}

module.exports.changeUnitOfInformation = function(param) {
    var state = param.state;

    state.label.text = param.text;
    cy.forceRender();


    var statesAndInfos = param.ele.data('sbgnstatesandinfos');
    var ind = statesAndInfos.indexOf(state);
    statesAndInfos[ind] = state;

    param.data = statesAndInfos;

    if(param.sync){
        module.exports.modelManager.updateHistory({opName:"change unit of information", depth:-1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me", 0);
    }
    

}

module.exports.addStateAndInfo = function(param) {
    var obj = param.obj;
    var ele = param.ele;
    var statesAndInfos = ele._private.data.sbgnstatesandinfos;

    statesAndInfos.push(obj);
    relocateStateAndInfos(statesAndInfos);

    param.data = statesAndInfos;
    if(param.sync) {
        module.exports.modelManager.updateHistory({opName: "add state info", depth: -1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me", 0);
    }
    param.ele.unselect(); //to refresh inspector
    param.ele.select(); //to refresh inspector


    cy.forceRender();
    return {
        ele: ele,
        width: param.width,
        obj: obj
    };
}

module.exports.removeStateAndInfo = function(param) {
    var obj = param.obj;
    var ele = param.ele;
    var statesAndInfos = ele._private.data.sbgnstatesandinfos;

    var index = statesAndInfos.indexOf(obj);
    statesAndInfos.splice(index, 1);
    relocateStateAndInfos(statesAndInfos);

    param.data = statesAndInfos;
    if(param.sync) {
        module.exports.modelManager.updateHistory({opName: "remove state info", depth: -1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me", 0);
    }
    param.ele.unselect(); //to refresh inspector
    param.ele.select(); //to refresh inspector
    cy.forceRender();

    return {
        ele: ele,
        width: param.width,
        obj: obj
    };
}


//FUNDA: changed param.node to param.ele
module.exports.changeIsMultimerStatus = function(param) {
    var node = param.ele;
    var makeMultimer = param.data;
    var sbgnclass = node.data('sbgnclass');
    if (makeMultimer) {
        //if not multimer already
        if(sbgnclass.indexOf(' multimer') <= -1) // funda changed
            node.data('sbgnclass', sbgnclass + ' multimer');
    }
    else {
        node.data('sbgnclass', sbgnclass.replace(' multimer', ''));
    }


    if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
        $('#inspector-is-multimer').attr('checked', makeMultimer);
    }

    cy.forceRender();


    if(param.sync){
        module.exports.modelManager.updateHistory({opName: "change multimer status", depth: -1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute('isMultimer', param.ele.id(), param.data, "me", 0);
    }
}

module.exports.changeIsCloneMarkerStatus = function(param) {
    var node = param.ele;
    var makeCloneMarker = param.data;
    node._private.data.sbgnclonemarker = makeCloneMarker?true:undefined;

    //node.data('sbgnclonemarker', (makeCloneMarker?true:undefined)); //is not working in this case


    if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
        $('#inspector-is-clone-marker').attr('checked', makeCloneMarker);
    }

    cy.forceRender();

    if(param.sync){
        module.exports.modelManager.updateHistory({opName: "change clone marker status", depth: -1}); //do not actually perform command, just group
        module.exports.modelManager.changeModelNodeAttribute('isCloneMarker', param.ele.id(), param.data, "me", 0);
    }

}




module.exports.changeVisibilityOrHighlightStatus = function(param){

    var ele = param.ele;

    if (param.data == "visible") {
        sbgnFiltering.removeFilter(ele);

    }
    else if (param.data == "invisible") {
        sbgnFiltering.applyFilter(ele);
    }
    else if(param.data == null){
        if(param.dataType == "visibilityStatus")
            sbgnFiltering.removeFilter(ele);
        else
            sbgnFiltering.highlightElements(ele);

    }
    else if(param.data == "highlighted"){
        sbgnFiltering.highlightElements(ele);

    }
    else if(param.data == "notHighlighted"){
        sbgnFiltering.notHighlightElements(ele);
    }

}


module.exports.changeStyleData = function( param) {
    
    var ele = param.ele;
    ele.data(param.dataType, param.data);
    

    if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
        require('./sample-app-cytoscape-sbgn.js').handleSBGNInspector(module.exports);
    }


    if(param.dataType == 'width'){
        ele._private.autoWidth = param.data;
        ele._private.style.width.value = param.data;
        ele._private.style.width.pfValue = param.data;
        ele._private.data.sbgnbbox.w = param.data;

    }
    else if(param.dataType == 'height'){
        ele._private.autoHeight = param.data ;
        ele._private.style.height.value = param.data;
        ele._private.style.height.pfValue = param.data;
        ele._private.data.sbgnbbox.h = param.data;

    }

    else if(param.dataType == 'source'){
        ele._private.data.source = param.data;
        ele._private.source = cy.getElementById(param.data); //to take immediate effect on the graph
    }
    else if(param.dataType == 'target'){
        ele._private.data.target = param.data;
        ele._private.target = cy.getElementById(param.data); //to take immediate effect on the graph
    }
    else if(param.dataType == "highlightStatus"){
        if(param.data == "highlighted"){
            sbgnFiltering.highlightElements(ele);

        }
        else if(param.data == "notHighlighted"){
                sbgnFiltering.notHighlightElements(ele);
        }
    }
    else if(param.dataType == "visibilityStatus") {
        if (param.data == "visible") {
            sbgnFiltering.removeFilter(ele);

        }
        else if (param.data == "invisible") {
            sbgnFiltering.applyFilter(ele);
        }
    }
    else if(param.dataType == "sbgnlabel"){
        ele.removeClass('changeContent');
        ele.addClass('changeContent');

    }
    else if(param.dataType == "collapsedChildren"){
        
    }


    if(param.sync){
        module.exports.modelManager.updateHistory({opName:"change style data", depth:-1}); //do not actually perform command, just group

    if(ele.isNode())
        module.exports.modelManager.changeModelNodeAttribute(param.modelDataName, param.ele.id(), param.data, "me", 0);
    else
        module.exports.modelManager.changeModelEdgeAttribute(param.modelDataName, param.ele.id(), param.data, "me", 0);

    }


}

module.exports.changeStyleCss = function(param) {

    var ele = param.ele;

    ele.css(param.dataType, param.data);


    if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
        require('./sample-app-cytoscape-sbgn.js').handleSBGNInspector(module.exports);
    }

    if(param.sync) {
        module.exports.modelManager.updateHistory({opName:"change style css", depth:-1}); //do not actually perform command, just group
        if (ele.isNode()) {
            module.exports.modelManager.changeModelNodeAttribute(param.modelDataName, param.ele.id(), param.data, "me", 0);
        }
        else
            module.exports.modelManager.changeModelEdgeAttribute(param.modelDataName, param.ele.id(), param.data, "me", 0);

    }
}

module.exports.changeBendPoints = function(param){
    var edge = param.edge;
   
    //Check if we need to set the weights and distances by the param values
    if(param.set) {
        param.weights?edge.data('weights', param.weights):edge.removeData('weights');
        param.distances?edge.data('distances', param.distances):edge.removeData('distances');

        //refresh the curve style as the number of bend point would be changed by the previous operation
        if(param.weights){
            edge.css('curve-style', 'segments');
        }
        else {
            edge.css('curve-style', 'bezier');
        }
    }

}

module.exports.refreshGlobalUndoRedoButtonsStatus = function(){

    if (!module.exports.modelManager.isUndoPossible()) {
        $("#undo-last-action-global").parent("li").addClass("disabled");
    }
    else {
        $("#undo-last-action-global").html("Undo " +  module.exports.modelManager.getUndoActionStr());
        $("#undo-last-action-global").parent("li").removeClass("disabled");
    }

    if (!module.exports.modelManager.isRedoPossible()) {
        $("#redo-last-action-global").parent("li").addClass("disabled");
    }
    else {
        $("#redo-last-action-global").html("Redo " +  module.exports.modelManager.getRedoActionStr());
        $("#redo-last-action-global").parent("li").removeClass("disabled");
    }

}

