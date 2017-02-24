/**
 * Created by durupina on 2/10/17.
 */

//Listen and respond to cytoscape events triggered by cytoscape-undo-redo.js


module.exports = function(modelManager){

    //A new sample or file is loaded --update model and inform others
   $(document).on("sbgnvizLoadSampleEnd sbgnvizLoadFileEnd",  function(event, file){
       modelManager.newModel("me"); //do not delete cytoscape, only the model
      modelManager.initModel(cy.nodes(), cy.edges());

    });


    cy.on("afterDo afterRedo", function (event, actionName, args, res) {

        console.log(actionName);
        console.log(args);
        console.log(res);


        if (actionName === "changeData" || actionName === "changeFontProperties" ) {

            var modelElList = [];
            var paramList = [];
            args.eles.forEach(function (ele) {
                //var ele = param.ele;

                modelElList.push({id: ele.id(), isNode: ele.isNode()});
                paramList.push(ele.data());

            });
            modelManager.changeModelElementGroupAttribute("data", modelElList, paramList, "me");

        }

        else if (actionName === "changeNodeLabel" || actionName === "resizeNodes" ||
            actionName === "addStateOrInfoBox" || actionName === "setMultimerStatus" || actionName === "setCloneMarkerStatus") {

            var modelElList = [];
            var paramList = []
            args.nodes.forEach(function (ele) {
                //var ele = param.ele;

                modelElList.push({id: ele.id(), isNode: true});
                paramList.push(ele.data());

            });
            modelManager.changeModelElementGroupAttribute("data", modelElList, paramList, "me");

        }

        else if (actionName === "changeCss") {
            var modelElList = [];
            var paramList = [];

            args.eles.forEach(function (ele) {
                modelElList.push({id: ele.id(), isNode: ele.isNode()});
                paramList.push(ele.css(args.name));

            });

            var name = mapFromCyToModelName(args.name);
            modelManager.changeModelElementGroupAttribute(name, modelElList, paramList, "me");
        }

        else if (actionName === "hide" || actionName === "show") {
            var modelElList = [];
            var paramList = [];

            args.forEach(function (ele) {
                modelElList.push({id: ele.id(), isNode: ele.isNode()});
                paramList.push(actionName);

            });

            modelManager.changeModelElementGroupAttribute("visibilityStatus", modelElList, paramList, "me");
        }

        else if (actionName === "highlight") {
            var modelElList = [];
            var paramList = [];


            args.forEach(function (ele) {
                modelElList.push({id: ele.id(), isNode: ele.isNode()});
                paramList.push("highlighted");
            });

            modelManager.changeModelElementGroupAttribute("highlightStatus", modelElList, paramList, "me");
        }

        else if(actionName === "removeHighlights"){
            var modelElList = [];
            var paramList = [];


            cy.elements().forEach(function (ele) {
                modelElList.push({id: ele.id(), isNode: ele.isNode()});
                paramList.push("unhighlighted");

            });

            modelManager.changeModelElementGroupAttribute("highlightStatus", modelElList, paramList, "me");

        }
        else if (actionName === "expand" || actionName === "collapse") {

            var modelElList = [];
            var paramList = []
            args.nodes.forEach(function (ele) {
                modelElList.push({id: ele.id(), isNode: true});
                paramList.push(actionName);

            });
            modelManager.changeModelElementGroupAttribute("expandCollapseStatus", modelElList, paramList, "me");
        }


        else if (actionName === "drag" || actionName === "align") {

            var modelElList = [];
            var paramList = []
            args.nodes.forEach(function (ele) {
                //var ele = param.ele;
                modelElList.push({id: ele.id(), isNode: true});
                paramList.push(ele.position());
            });

            modelManager.changeModelElementGroupAttribute("position", modelElList, paramList, "me");
        }

        else if (actionName === "layout") {
            cy.on('layoutstop', function() {

                var modelElList = [];
                var paramList = [];
                args.eles.forEach(function (ele) {
                    //var ele = param.ele;
                    modelElList.push({id: ele.id(), isNode: true});
                    paramList.push(ele.position());
                });

                modelManager.changeModelElementGroupAttribute("position", modelElList, paramList, "me");
            });
        }
        else if(actionName === "deleteElesSimple"){

            var nodeList = [];
            var edgeList = [];

            args.eles.forEach(function (el) {
                if(el.isNode())
                    nodeList.push({id:el.id()});
                else
                    edgeList.push({id:el.id()});
            });

            modelManager.deleteModelElementGroup({nodes:nodeList,edges: edgeList}, "me"); //edges need to be deleted first
        }

        else if(actionName === "deleteNodesSmart"){

            var nodeList = [];
            var edgeList = [];

            res.forEach(function (el) {
                if(el.isNode())
                    nodeList.push({id:el.id()});
                else
                    edgeList.push({id:el.id()});
            });

            modelManager.deleteModelElementGroup({nodes:nodeList,edges: edgeList}, "me");
        }

        else if (actionName === "addNode") {
            var newNode = args.newNode;
            var id = res.eles.id();
            var param = {x: newNode.x, y: newNode.y, class: newNode.class};
            //Add to the graph first
            modelManager.addModelNode(id, param, "me");
            //assign other node properties-- css and data
            modelManager.initModelNode(res.eles[0], "me");

        }

         else if(actionName === "addEdge"){

            var newEdge = args.newEdge;
            var id = res.eles.id();
             var param = { source: newEdge.source, target:newEdge.target, class: newEdge.class};
             //Add to the graph first
             modelManager.addModelEdge(id, param, "me");
            //assign other edge properties-- css and data
             modelManager.initModelEdge(res.eles[0], "me");

         }

         else if(actionName === "paste"){
             res.forEach(function(el){ //first add nodes
                 if(el.isNode()){
                     var param = {x: el.position("x"), y: el.position("y"), class: el.data("class")};
                     modelManager.addModelNode(el.id(), param, "me");

                     modelManager.initModelNode(el, "me");
                 }
             });

            res.forEach(function(el){ //first add nodes
                if(el.isEdge()){
                    var param = { source: el.data("source"), target:el.data("target"), class: el.data("class")};
                    modelManager.addModelEdge(el.id(), param, "me");
                    modelManager.initModelEdge(el, "me");
                }
            });

        }
        else if(actionName === "changeParent"){
            var modelElList = [];
            var paramListData = [];
            var paramListPosition = [];
            res.nodes.forEach(function (ele) {
                //var ele = param.ele;

                modelElList.push({id: ele.id(), isNode: true});
                paramListData.push(ele.data());
                paramListPosition.push(ele.position());
                // paramList.push(ele.data(args.name));

            });
            modelManager.changeModelElementGroupAttribute("data", modelElList, paramListData, "me");
            modelManager.changeModelElementGroupAttribute("position", modelElList, paramListPosition, "me");


        }
        else if(actionName === "createCompoundForGivenNodes"){
            var paramList = [];
            var modelElList = [];

            res.children().forEach(function (ele) {
                //var ele = param.ele;

                modelElList.push({id: ele.id(), isNode: true});

                paramList.push(ele.data()); //includes parent information

            });



            var compoundAtts = {x: res.position("x"), y: res.position("y"), class:res.data("class")};


            modelManager.addModelCompound(res.id(), compoundAtts, modelElList,paramList, "me" );


            //assign other node properties-- css and data
            modelManager.initModelNode(res,"me"); //init with default values


        }






    });




        cy.on("mouseup", "node", function () {
            modelManager.unselectModelNode(this, "me");
        });


        cy.on('select', 'node', function (event) { //Necessary for multiple selections
            modelManager.selectModelNode(this, "me");

        });

        cy.on('unselect', 'node', function () { //causes sync problems in delete op
            modelManager.unselectModelNode(this, "me");
        });
        cy.on('grab', 'node', function (event) { //Also works as 'select'
            modelManager.selectModelNode(this, "me");
        });

        cy.on('select', 'edge', function (event) {
            modelManager.selectModelEdge(this, "me");

        });

        cy.on('unselect', 'edge', function (event) {
            modelManager.unselectModelEdge(this, "me");
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
