/**
 * Created by durupina on 2/10/17.
 */
/**
 * Created by durupina on 2/10/17.
 */
/**
 * Created by durupina on 2/10/17.
 */
//Listen and respond to cytoscape events triggered by cytoscape-undo-redo.js


module.exports = function(modelManager){
    cy.on("afterDo", function (event, actionName, args) {

        console.log(actionName);
        console.log(args);



    if(actionName === "changeData" || actionName === "changeFontProperties"){

        var modelElList = [];
        var paramList =[]
        args.eles.forEach(function(ele) {
            //var ele = param.ele;

            modelElList.push({id: ele.id(), isNode: ele.isNode()});
            paramList.push(ele.data());
            // paramList.push(ele.data(args.name));

        });
        modelManager.changeModelElementGroupAttribute("data", modelElList, paramList, "me");

    }

    else if(actionName === "changeNodeLabel"  || actionName === "resizeNodes" ||
        actionName === "addStateOrInfoBox" || actionName === "setMultimerStatus" || actionName === "setCloneMarkerStatus"){

            var modelElList = [];
            var paramList =[]
            args.nodes.forEach(function(ele) {
                //var ele = param.ele;

                modelElList.push({id: ele.id(), isNode: true});
                paramList.push(ele.data());
                // paramList.push(ele.data(args.name));

            });
            modelManager.changeModelElementGroupAttribute("data", modelElList, paramList, "me");

        }

    else if(actionName === "changeCss"){
        var modelElList = [];
        var paramList =[];

        args.eles.forEach(function(ele) {
            modelElList.push({id: ele.id(), isNode: ele.isNode()});
            paramList.push(ele.css(args.name));

        });

        var name = mapFromCyToModelName(args.name);
        modelManager.changeModelElementGroupAttribute(name, modelElList, paramList, "me");
    }


    else if(actionName === "drag"){

        var modelElList = [];
        var paramList =[]
        args.nodes.forEach(function(ele) {
            //var ele = param.ele;
            modelElList.push({id: ele.id(), isNode: true});
            paramList.push(ele.position());
        });

        console.log(paramList);
        modelManager.changeModelElementGroupAttribute("position", modelElList, paramList, "me");
    }


    // else if(actionName === "changeChildren"){
    //
    //     // cy.on("changeChildren",  function (event, collection) {
    //     collection.forEach(function(el){
    //         var nonCircularChildren = CircularJSON.stringify(el._private.children);
    //         modelManager.updateModelElChildren(el.id(), nonCircularChildren, "me");
    //     });
    // }

    // else if(actionName === "changeHighlightStatus"){
    //
    //         // cy.on("changeHighlightStatus", function (event,  highlightStatus, collection) {
    //     var modelElList = [];
    //     var paramList =[]
    //     collection.forEach(function(ele){
    //
    //         modelElList.push({id: ele.id(), isNode: ele.isNode()});
    //         paramList.push(highlightStatus);
    //
    //     });
    //
    //     modelManager.changeModelElementGroupAttribute("highlightStatus", modelElList, paramList, "me");
    // }
    //
    //
    // else if(actionName === "changeVisibilityStatus"){
    // // cy.on("changeVisibilityStatus", function (event,  visibilityStatus, collection) {
    //     var modelElList = [];
    //     var paramList =[]
    //     collection.forEach(function(ele){
    //
    //         modelElList.push({id: ele.id(), isNode: ele.isNode()});
    //         paramList.push(visibilityStatus);
    //
    //     });
    //
    //     modelManager.changeModelElementGroupAttribute("visibilityStatus", modelElList, paramList, "me");
    // }
    //
    // else if(actionName === "changeClasses"){
    //
    //     // cy.on("changeClasses",  function (event,  collection) {
    //
    //     var modelElList = [];
    //     var paramListClasses = [];
    //
    //
    //     //TODO: class operations usually affect the whole graph
    //     // cy.elements().forEach(function (ele) {
    //     collection.forEach(function (ele) {
    //         //var ele = param.ele;
    //         modelElList.push({id: ele.id(), isNode: true});
    //         paramListClasses.push(ele._private.classes);
    //
    //     });
    //
    //     modelManager.changeModelElementGroupAttribute("classes", modelElList, paramListClasses, "me");
    //
    //
    //
    //
    // }

    else if(actionName === "addNode"){
        var newNode = args.newNode;
        var param = {id: el.id(), x: newNode.x, y: newNode.y, class: newNode.data('class')};
        modelManager.addModelNode(newNode.id(), param, "me");
        modelManager.initModelNode(newNode, "me", true);

    }
   // cy.on("addEdge", function(event, collection, newEdge){
   //  else if(actionName === "addEdge"){
   //
   //
   //      collection.forEach(function (el) {
   //          var param = {id: el.id(), source: newEdge.source, target:newEdge.target, sbgnclass: newEdge.sbgnclass};
   //          modelManager.addModelEdge(el.id(), param, "me");
   //          modelManager.initModelEdge(el, "me", true);
   //      });
   //
   //  }
   //
   //  else if(actionName === "deleteEles"){
   //
   //      // cy.on("deleteEles", function(event, collection){
   //
   //      var nodeList = [];
   //      var edgeList = [];
   //      collection.forEach(function (el) {
   //          if(el.isNode())
   //              nodeList.push({id:el.id()});
   //          else
   //              edgeList.push({id:el.id()});
   //      });
   //
   //      modelManager.deleteModelElementGroup({nodes:nodeList, edges:edgeList},"me");
   //  }

    });
    // cy.on("createCompoundForSelectedNodes", function(event, compoundType, compoundNode, collection){
    //
    //
    //     //modelManager.updateModelHistory(compoundType);
    //     var compoundAtts = {x: compoundNode.position().x, y: compoundNode.position().y, sbgnclass: compoundNode._private.data.sbgnclass,
    //         width:compoundNode.width(), height: compoundNode.height()};
    //
    //     var modelElList = [];
    //     var paramList = [];
    //     collection.forEach(function(node){
    //         modelElList.push({id: node.id(), isNode:true});
    //         paramList.push(node.data('parent'));  //before changing parents
    //     });
    //
    //     modelManager.addModelCompound(compoundNode.id(), compoundAtts,modelElList, paramList, "me");
    //
    // });
    //
    // cy.on('layoutstop', function() {
    //     var modelElList = [];
    //     var paramList = [];
    //     cy.nodes().forEach(function(node){
    //         modelElList.push({id: node.id(), isNode: true});
    //         paramList.push(node.position());
    //
    //     });
    //     modelManager.changeModelElementGroupAttribute("position", modelElList, paramList, "me");
    //
    //
    // });
    //

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
