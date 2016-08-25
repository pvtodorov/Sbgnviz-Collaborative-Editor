/**
 *	Design for SBGNViz Editor actions.
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

  //  var socket = io();
  //  socket.emit("addNode", param, function(data){
      //  if(data == "ok") {
            var result = addRemoveUtilities.addNode(param.x, param.y, param.sbgnclass, param.id);
            if (param.sbgnlabel != null)
                result.data('sbgnlabel', param.sbgnlabel); //funda
            if (param.sync) {
                module.exports.modelManager.addModelNode(result.id(), param, "me");
                module.exports.modelManager.initModelNode(result, null, true);
            }

            return result;
     //   }
   // });

}
module.exports.removeEles =function(elesToBeRemoved) {

    //removeEles operation computes edges to be removed

    var undoEles = addRemoveUtilities.removeEles(elesToBeRemoved);
    var nodeList = [];
    var edgeList = [];

    undoEles.forEach(function (el) {
        if(el.isNode())
            nodeList.push({id:el.id()});
        else
            edgeList.push({id:el.id()});
    });


    module.exports.modelManager.deleteModelElementGroup({nodes:nodeList,edges: edgeList}, "me"); //edges need to be deleted first


    return undoEles;
}


module.exports.deleteSelected = function(param) {


    if(param.sync){
        var nodeList = [];
        var edgeList = [];


        param.eles.forEach(function (el) {
            if(el.isNode())
                nodeList.push({id:el.id()});
            else
                edgeList.push({id:el.id()});
        });

        module.exports.modelManager.deleteModelElementGroup({nodes:nodeList,edges: edgeList}, "me");

    }
    var undoEles = addRemoveUtilities.removeElesSimply(param.eles);

}

module.exports.addEdge = function(param)
{
    var result;
    result = addRemoveUtilities.addEdge(param.source, param.target, param.sbgnclass, param.id);

    if(param.sync){
        module.exports.modelManager.addModelEdge(result.id(), param, "me");
        module.exports.modelManager.initModelEdge(result,  null, true); //no history update but let others update params

    }
    return result;
}



module.exports.expandNode = function(param) {
        expandCollapseUtilities.expandNode(param.node);
    if(param.sync)
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", param.node.id(), "expand", "me");

}

module.exports.collapseNode = function(param) {
    expandCollapseUtilities.collapseNode(param.node);
    if(param.sync)
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", param.node.id(), "collapse", "me");

}
module.exports.simpleExpandNode = function(param) {
    expandCollapseUtilities.simpleExpandNode(param.node);
    if(param.sync)
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", param.node.id(), "expand", "me");
}

module.exports.simpleCollapseNode = function(param) {
    expandCollapseUtilities.simpleCollapseNode(param.node);
    if(param.sync)
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", param.node.id(), "collapse", "me");

}

module.exports.expandGivenNodes = function(param) {
    expandCollapseUtilities.expandGivenNodes(param.nodes);
    if(param.sync){
        param.nodes.forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "expand", "me");
        });
    }
}

module.exports.collapseGivenNodes = function(param) {
    expandCollapseUtilities.collapseGivenNodes(param.nodes);
    if(param.sync){
        param.nodes.forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "collapse", "me");
        });
    }

}

module.exports.simpleExpandGivenNodes = function(param) {
    expandCollapseUtilities.simpleExpandGivenNodes(param.nodes);
    if(param.sync){
        param.nodes.forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "expand", "me");
        });
    }
}

module.exports.simpleCollapseGivenNodes = function(param) {
    expandCollapseUtilities.simpleCollapseGivenNodes(param.nodes);
    if(param.sync){
        param.nodes.forEach(function(node){
            module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "collapse", "me");
        });
    }
}
module.exports.expandAllNodes = function() {
    expandCollapseUtilities.expandAllNodes();
    cy.nodes().forEach(function(node){
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "expand", "me");
    });

}

module.exports.simpleExpandAllNodes = function() {
    expandCollapseUtilities.simpleExpandAllNodes();
    cy.nodes().forEach(function(node){
        module.exports.modelManager.changeModelNodeAttribute("expandCollapseStatus", node.id(), "collapse", "me");
    });

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
    //module.exports.modelManager.updateHistory({opName:"run layout", opTarget:"model"});

//notify other clients
    cy.on('layoutstop', function() {
        var modelElList = [];
        var paramList = [];
        cy.nodes().forEach(function(node){
            modelElList.push({id: node.id(), isNode: true});
            paramList.push(node.position());

        });
        module.exports.modelManager.changeModelElementGroupAttribute("position", modelElList, paramList, "me", param.noHistUpdate);
    });

}

module.exports.returnToPositionsAndSizesConditionally = function(param) {

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
        var modelElList = [];
        var paramList = [];
        cy.nodes().forEach(function(node){
            modelElList.push({id: node.id(), isNode: true});
            paramList.push(node.position());

        });
        module.exports.modelManager.changeModelElementGroupAttribute("position", modelElList, paramList, "me");
        //
        // });
    }


    return {sync: true, nodesData: currentPositionsAndSizes};
}

//This is used only to inform the model and perform undo. cytoscape moves the node
module.exports.moveNodesConditionally = function(param) {

    if(param.sync){

        var elParamList = module.exports.getDescendentNodes(param.nodes);
        var modelElList = elParamList.els;
        var paramList = elParamList.params;

        module.exports.modelManager.changeModelElementGroupAttribute("position", modelElList, paramList, "me");

    }

    return param;
}

module.exports.getDescendentNodes = function(nodes) {
    var modelElList = [];
    var paramList = [];
    if(nodes == null) return;
    nodes.forEach(function(node){

        modelElList.push({id: node.id(), isNode: true});
        paramList.push(node.position());

        var children = node.children();
        if(children){
            var elParamList = module.exports.getDescendentNodes(children);
            elParamList.els.forEach(function(el){
                modelElList.push(el)
            });
            elParamList.params.forEach(function(param){
                paramList.push(param);
            });
        }

        
    });


    return {els: modelElList, params: paramList};

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
        module.exports.modelManager.changeModelNodeAttribute("position", ele.id(), ele.position(), "me", true);

    }
}



module.exports.hideSelected = function(param) {

    var nodesToHide = sbgnFiltering.hideSelected(param.selectedEles); //funda changed
    if(param.sync) {//first hide on the other side to make sure elements don't get unselected


        var modelElList = [];
        var paramList = [];
        nodesToHide.forEach(function (el) {
            modelElList.push({id: el.id(), isNode: el.isNode()});
            paramList.push("invisible");
        });
        module.exports.modelManager.changeModelElementGroupAttribute("visibilityStatus", modelElList, paramList, "me");
    }

}



module.exports.showSelected = function(param) {

    var nodesToShow = sbgnFiltering.showSelected(param.selectedEles); //funda changed

    if(param.sync){
        var modelElList  = [];
        var paramList = [];
        nodesToShow.forEach(function(el){
            modelElList.push({id: el.id(), isNode: el.isNode()});
            paramList.push("visible");
        });
        module.exports.modelManager.changeModelElementGroupAttribute("visibilityStatus",modelElList, paramList, "me");


         var nodesToHide = cy.nodes().not(nodesToShow);

        var modelElList  = [];
        var paramList = [];
        nodesToHide.forEach(function(el){
            modelElList.push({id: el.id(), isNode: el.isNode()});
            paramList.push("invisible");
        });
        module.exports.modelManager.changeModelElementGroupAttribute("visibilityStatus",modelElList, paramList, "me");
    }

}

module.exports.showAll = function(param) {
    sbgnFiltering.showAll();
    if(param.sync){
        var modelElList  = [];
        var paramList = [];
        cy.nodes().forEach(function(el){
            modelElList.push({id: el.id(), isNode: el.isNode()});
            paramList.push("visible");
        });
        module.exports.modelManager.changeModelElementGroupAttribute("visibilityStatus",modelElList, paramList, "me");

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
        if(elesToHighlight != null) {
            var modelElList = [];
            var paramList = [];
            elesToHighlight.forEach(function (el) {
                modelElList.push({id: el.id(), isNode: el.isNode()});
                paramList.push("highlighted");
            });
            module.exports.modelManager.changeModelElementGroupAttribute("highlightStatus", modelElList, paramList, "me");
        }

        if(elesToNotHighlight != null){

            var modelElList = [];
            var paramList = [];
            elesToNotHighlight.forEach(function (el) {
                modelElList.push({id: el.id(), isNode: el.isNode()});
                paramList.push("notHighlighted");
            });
            module.exports.modelManager.changeModelElementGroupAttribute("highlightStatus", modelElList, paramList, "me");

        }

    }

}

//Remove highlights actually means remove fadeouts
module.exports.removeHighlights = function(param) {

    sbgnFiltering.removeHighlights();

    if(param.sync){
        // cy.elements().forEach(function(el){
        //     module.exports.modelManager.changeModelNodeAttribute('highlightStatus', el.id(), "highlighted", "me");
        // });

        var modelElList = [];
        var paramList = [];
        cy.elements().forEach(function (el) {
            modelElList.push({id: el.id(), isNode: el.isNode()});
            paramList.push("highlighted");
        });
        module.exports.modelManager.changeModelElementGroupAttribute("highlightStatus", modelElList, paramList, "me");


    }


}


module.exports.changeParent = function(param) {

    var node = param.ele;
    var oldParentId = node._private.data.parent;

    var newParentId;
    var newParent;
    var nodesData;
    if(param.newParent == null) {
        newParentId = param.data;
        newParent = newParentId ? cy.$(('#' + newParentId))[0] : undefined;
        nodesData = getNodesData();//param.nodesData;
    }
    else {
        newParent = param.newParent;
        newParentId = param.newParent? param.newParent.id(): undefined;
        nodesData = param.nodesData;
    }

    //If new parent is not null some checks should be performed
    if (newParent) {
        //check if the node was the ancestor of it's new parent
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
    expandCollapseUtilities.refreshPaddings();

    if(param.sync){

        module.exports.modelManager.changeModelNodeAttribute('parent', param.ele.id(), newParentId, "me");

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
    var paramList = [];
    nodesToMakeCompound.forEach(function(node){
        // nodeIds.push(node.id());
        modelElList.push({id: node.id(), isNode:true});
        paramList.push(node.data('parent'));  //before changing parents
    });


    addRemoveUtilities.changeParent(nodesToMakeCompound, oldParentId, newCompoundId);


    expandCollapseUtilities.refreshPaddings();

    ////Notify other clients


    
    module.exports.modelManager.addModelCompound(newCompound.id(), {x: newCompound._private.position.x, y: newCompound._private.position.y, sbgnclass: param.compoundType, width: newCompound.width(), height: newCompound.height()},  modelElList, paramList, "me");
    
    //module.exports.modelManager.addModelNode(newCompound.id(), {x: newCompound._private.position.x, y: newCompound._private.position.y, sbgnclass: param.compoundType}, "me");
    module.exports.modelManager.initModelNode(newCompound,"me", true);
    //


}

module.exports.removeCompound = function(param) {

    var compoundToRemove = param.compoundToRemove;
    var compoundId = compoundToRemove.id();
    var newParentId = compoundToRemove.data("parent");
    var childrenOfCompound = compoundToRemove.children();

    addRemoveUtilities.changeParent(childrenOfCompound, compoundId, newParentId);
    //change parents of children
    childrenOfCompound.forEach(function(node){
        module.exports.modelManager.changeModelNodeAttribute('parent',node.id(), newParentId, "me");
    });


    var removedCompound = compoundToRemove.remove();
    //remove children of compound node
//no more children module.exports.modelManager.changeModelNodeAttribute('children', removedCompound.id(), [], "me");

    module.exports.modelManager.deleteModelNode(removedCompound.id(), "me", true);


    expandCollapseUtilities.refreshPaddings();


}

module.exports.resizeNode = function(param) {

    var ele = param.ele;


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
        module.exports.modelManager.changeModelNodeAttribute('width',  ele.id(), param.width, "me");
        module.exports.modelManager.changeModelNodeAttribute('height', ele.id(), param.height, "me");
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
    module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me" );

}

module.exports.changeUnitOfInformation = function(param) {
   
    var state = param.state;


    state.label.text = param.text;
    cy.forceRender();


    var statesAndInfos = param.ele.data('sbgnstatesandinfos');
    var ind = statesAndInfos.indexOf(state);
    statesAndInfos[ind] = state;

    param.data = statesAndInfos;

    if(param.sync)
        module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me");


 
}

module.exports.addStateAndInfo = function(param) {
    var obj = param.obj;
    var ele = param.ele;
    var statesAndInfos = ele.data('sbgnstatesandinfos');

    statesAndInfos.push(obj);
    relocateStateAndInfos(statesAndInfos);

    param.data = statesAndInfos;

    if(param.sync)
        module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me");


    param.ele.unselect(); //to refresh inspector
    param.ele.select(); //to refresh inspector


    cy.forceRender();

}

module.exports.removeStateAndInfo = function(param) {
    var obj = param.obj;
    var ele = param.ele;
    var statesAndInfos = ele.data('sbgnstatesandinfos');

    var index = statesAndInfos.indexOf(obj);
    statesAndInfos.splice(index, 1);
    relocateStateAndInfos(statesAndInfos);

    param.data = statesAndInfos;

    if(param.sync)
        module.exports.modelManager.changeModelNodeAttribute('sbgnStatesAndInfos', param.ele.id(), param.data, "me");
    param.ele.unselect(); //to refresh inspector
    param.ele.select(); //to refresh inspector
    cy.forceRender();


}



module.exports.changeIsMultimerStatus = function(param) {
    var modelElList = [];
    var paramList =[]
    param.ele.forEach(function(node) {
        //var node = param.ele;

        modelElList.push({id: node.id(), isNode: true});
        paramList.push(param.data);

        var makeMultimer = param.data;
        var sbgnclass = node.data('sbgnclass');
        if (makeMultimer) {
            //if not multimer already
            if (sbgnclass.indexOf(' multimer') <= -1) // funda changed
                node.data('sbgnclass', sbgnclass + ' multimer');
        }
        else {
            node.data('sbgnclass', sbgnclass.replace(' multimer', ''));
        }


        if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
            $('#inspector-is-multimer').attr('checked', makeMultimer);
        }

        cy.forceRender();

    });
    if(param.sync){
        module.exports.modelManager.changeModelElementGroupAttribute('isMultimer', modelElList, paramList, "me");

        // module.exports.modelManager.changeModelNodeAttribute('isMultimer', param.ele.id(), param.data, "me");
    }
}

module.exports.changeIsCloneMarkerStatus = function(param) {

    var modelElList = [];
    var paramList =[]
    param.ele.forEach(function(node) {
        //var node = param.ele;

        modelElList.push({id: node.id(), isNode: true});
        paramList.push(param.data);

        var makeCloneMarker = param.data;
        node._private.data.sbgnclonemarker = makeCloneMarker ? true : undefined;

        //node.data('sbgnclonemarker', (makeCloneMarker?true:undefined)); //is not working in this case


        if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == param.ele) {
            $('#inspector-is-clone-marker').attr('checked', makeCloneMarker);
        }

        cy.forceRender();


    });


    if (param.sync) {
        //module.exports.modelManager.changeModelNodeAttribute('isCloneMarker', param.ele.id(), param.data);
        module.exports.modelManager.changeModelElementGroupAttribute('isCloneMarker', modelElList, paramList, "me");
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
        if(param.propName == "visibilityStatus")
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

    var modelElList = [];
    var paramList =[]
    param.ele.forEach(function(ele){
    //var ele = param.ele;

        modelElList.push({id: ele.id(), isNode: ele.isNode()});
        paramList.push(param.data);

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
    });

    if(param.sync){

        module.exports.modelManager.changeModelElementGroupAttribute(param.modelDataName, modelElList, paramList, "me");

    }




}

module.exports.changeStyleCss = function(param) {
    var modelElList = [];
    var paramList =[]

    param.ele.forEach(function(ele) {
        //var ele = param.ele;

        modelElList.push({id: ele.id(), isNode: ele.isNode()});
        paramList.push(param.data);
        //var ele = param.ele;

        ele.css(param.dataType, param.data);


        if (cy.elements(":selected").length == 1 && cy.elements(":selected")[0] == ele) {
            require('./sample-app-cytoscape-sbgn.js').handleSBGNInspector(module.exports);
        }
    });

    if(param.sync) {
        module.exports.modelManager.changeModelElementGroupAttribute(param.modelDataName, modelElList, paramList, "me");

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

