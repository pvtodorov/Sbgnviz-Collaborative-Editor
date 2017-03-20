/*
 *	Shared model handling operations.
 *  Clients call these commands to update the model
 *	Author: Funda Durupinar Babur<f.durupinar@gmail.com>
 */


module.exports = function (model, docId, userId, userName) {




    model.ref('_page.doc', 'documents.' + docId);

    var userPath = model.at('_page.doc.users.' + userId);

    return ModelManager = { //global reference for testing


        getModel: function () {
            return model;
        },

        getPageDoc: function(){
            return model.get('_page.doc');
        },

        addImage: function (data, user, noHistUpdate) {
            model.pass({user: user}).push('_page.doc.images', data);
            if (!noHistUpdate)
                this.updateHistory({opName: 'add', opTarget: 'image', opAttr: data.filePath});
        },

        setName: function (userName) {

            model.set('_page.doc.users.' + userId +'.name', userName);

        },

        getName: function () {
            return model.get('_page.doc.users.' + userId + '.name');
        },


        updateLayoutProperties: function (layoutProperties, noHistUpdate) {

            var currentLayoutProperties;
            var lp = model.get('_page.doc.layoutProperties');

            if (lp == null)
                currentLayoutProperties = _.clone(layoutProperties);
            else
                currentLayoutProperties = _.clone(lp);


            model.set('_page.doc.layoutProperties', currentLayoutProperties); //synclayout

            if (!noHistUpdate)
                this.updateHistory({
                    opName: 'set',
                    opTarget: 'layout',
                    opAttr: JSON.stringify(currentLayoutProperties)
                });
            return currentLayoutProperties;
        },
        setLayoutProperties: function (layoutProperties, noHistUpdate) {
            model.set('_page.doc.layoutProperties', layoutProperties); //synclayout
            if (!noHistUpdate)
                this.updateHistory({opName: 'set', opTarget: 'layout', opAttr: JSON.stringify(layoutProperties)});
        },


        /***
         *
         * @param cmd  {opName, opTarget,  elType, elId, opAttr,param, prevParam}
         * opName: set, load, open, add, select, unselect
         * opTarget: element, element group,  model, sample,
         * elType: node, edge
         * opAttr: highlightColor, lineColor, borderColor etc.
         */

        updateHistory: function (cmd) {
            var command = {
                userName: userName,
                date: new Date,
                opName: cmd.opName,
                opTarget: cmd.opTarget,
                elType: cmd.elType,
                opAttr: cmd.opAttr,
                elId: cmd.elId,
                param: cmd.param,
                prevParam: cmd.prevParam
            };


            if (cmd != null) {

                var ind = model.push('_page.doc.history', command) - 1;

                model.set('_page.doc.undoIndex', ind);
            }

        },

        getHistory: function () {
            return model.get('_page.doc.history');
        },

        getUndoActionStr: function () {

            var undoIndex = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + undoIndex);


            var cmdStr = cmd.opName + " " + cmd.opTarget;

            if (cmd.opAttr != null)
                cmdStr += " " + cmd.opAttr;
            //    if(cmd.elId != null)
            //      cmdStr += " " + cmd.elId;

            return cmdStr;

        },

        getRedoActionStr: function () {
            var undoIndex = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + (undoIndex + 1));

            var cmdStr = cmd.opName + " " + cmd.opTarget;
            if (cmd.opAttr != null)
                cmdStr += " " + cmd.opAttr;
            //  if(cmd.elId != null)
            //    cmdStr += " " + cmd.elId;

            return cmdStr;
        },
        isUndoPossible: function () {
            return (model.get('_page.doc.undoIndex') > 0)
        },
        isRedoPossible: function () {
            return (model.get('_page.doc.undoIndex') + 1 < model.get('_page.doc.history').length)
        },

        undoCommand: function () {
            var undoInd = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + undoInd); // cmd: opName, opTarget, opAttr, elId, param

            if (cmd.opName == "set") {
                if (cmd.opTarget == "element" && cmd.elType == "node")
                    this.changeModelNodeAttribute(cmd.opAttr, cmd.elId, cmd.prevParam, null); //user is null to enable updating in the editor

                else if (cmd.opTarget == "element" && cmd.elType == "edge")
                    this.changeModelEdgeAttribute(cmd.opAttr, cmd.elId, cmd.prevParam, null);
                else if (cmd.opTarget == "element group")
                    this.changeModelElementGroupAttribute(cmd.opAttr, cmd.elId, cmd.prevParam, null);

            }
            else if (cmd.opName == "add") {
                if (cmd.opTarget == "element" && cmd.elType == "node")
                    this.deleteModelNode(cmd.elId);
                else if (cmd.opTarget == "element" && cmd.elType == "edge")
                    this.deleteModelEdge(cmd.elId);
                else if (cmd.opTarget == "compound")
                    this.removeModelCompound(cmd.elId, cmd.param.childrenList, cmd.prevParam);
            }
            else if (cmd.opName == "delete") {
                if (cmd.opTarget == "element")
                    this.restoreModelElement(cmd.elType, cmd.elId, cmd.prevParam);
                else if (cmd.opTarget == "element group")
                    this.restoreModelElementGroup(cmd.elId, cmd.prevParam);
                else if (cmd.opTarget == "compound")
                    this.addModelCompound(cmd.elId, cmd.prevParam.compoundAtts, cmd.prevParam.childrenList, cmd.param);

            }
            else if (cmd.opName == "init") {
                this.newModel();
            }
            else if (cmd.opName == "new") { //delete all
                this.restoreModel(cmd.prevParam);

            }
            else if (cmd.opName == "merge") {
                this.newModel("me", true);
                this.restoreModel(cmd.prevParam);

            }


            undoInd = undoInd > 0 ? undoInd - 1 : 0;
            model.set('_page.doc.undoIndex', undoInd);

        },

        redoCommand: function () {
            var undoInd = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + (undoInd + 1)); // cmd: opName, opTarget, opAttr, elId, param

            if (cmd.opName == "set") {
                if (cmd.opTarget == "element" && cmd.elType == "node")
                    this.changeModelNodeAttribute(cmd.opAttr, cmd.elId, cmd.param, null); //user is null to enable updating in the editor
                else if (cmd.opTarget == "element" && cmd.elType == "edge")
                    this.changeModelEdgeAttribute(cmd.opAttr, cmd.elId, cmd.param, null);
                else if (cmd.opTarget == "element group") {
                    this.changeModelElementGroupAttribute(cmd.opAttr, cmd.elId, cmd.param);

                }


            }
            else if (cmd.opName == "add") {
                if (cmd.opTarget == "element")
                    this.restoreModelElement(cmd.elType, cmd.elId, cmd.param, null);
                else if (cmd.opTarget == "compound")
                    this.addModelCompound(cmd.elId, cmd.param.compoundAtts, cmd.param.childrenList, cmd.param);


            }
            else if (cmd.opName == "delete") {
                if (cmd.opTarget == "element" && cmd.elType == "node")
                    this.deleteModelNode(cmd.elId);
                else if (cmd.opTarget == "element" && cmd.elType == "edge")
                    this.deleteModelEdge(cmd.elId);
                else if (cmd.opTarget == "element group")
                    this.deleteModelElementGroup(cmd.elId);
                else if (cmd.opTarget == "compound")
                    this.removeModelCompound(cmd.elId, cmd.param.childrenList, cmd.param);

            }
            else if (cmd.opName == "init") {
                this.restoreModel(cmd.param);
            }
            else if (cmd.opName == "new") { //delete all
                this.newModel();
            }
            else if (cmd.opName == "merge") { //delete all
                this.restoreModel(cmd.param);

            }


            undoInd = undoInd < model.get('_page.doc.history').length - 1 ? undoInd + 1 : model.get('_page.doc.history').length - 1;

            model.set('_page.doc.undoIndex', undoInd);

        },


        getModelNode: function (id) {
            var nodePath = model.at('_page.doc.cy.nodes.' + id);
            return nodePath.get();
        },

        getModelEdge: function (id) {

            var edgePath = model.at('_page.doc.cy.edges.' + id);

            return edgePath.get();
        },

        selectModelNode: function (node, user, noHistUpdate) {

            var nodePath = model.at('_page.doc.cy.nodes.' + node.id());
            if (nodePath.get() == null)
                return "Node id not found";

            if(userPath)
                model.pass({user: user}).set('_page.doc.cy.nodes.' + node.id()+ '.highlightColor', userPath.get('colorCode'));


            return "success";

        },


        selectModelEdge: function (edge, user,  noHistUpdate) {

            var edgePath = model.at('_page.doc.cy.edges.' + edge.id());
            if (edgePath.get() == null)
                return "Edge id not found";
            if (userPath) {
                model.pass({user: user}).set('_page.doc.cy.edges.' + edge.id()+ '.highlightColor', userPath.get('colorCode'));


            }

            return "success";

        },
        unselectModelNode: function (node,  user, noHistUpdate) {

            var nodePath = model.at('_page.doc.cy.nodes.' + node.id());

            if (nodePath.get() == null)
                return "Node id not found";

            model.pass({user: user}).set('_page.doc.cy.nodes.' + node.id() + '.highlightColor', null);

            return "success";

        },


        unselectModelEdge: function (edge,  user, noHistUpdate) {

            var edgePath = model.at('_page.doc.cy.edges.' + edge.id());
            if (edgePath.get() == null)
                return "Edge id not found";

            model.pass({user: user}).set('_page.doc.cy.edges.' + edge.id() + '.highlightColor', null);

            return "success";


        },


        addModelNode: function (nodeId, param, user, noHistUpdate) {


            if (model.get("_page.doc.cy.nodes." + nodeId + '.id') != null)
                return "Node cannot be duplicated";

            model.pass({user: user}).set('_page.doc.cy.nodes.' + nodeId + '.data.id', nodeId);
            model.pass({user: user}).set('_page.doc.cy.nodes.' + nodeId + '.position', {x: param.x, y: param.y});
            model.pass({user: user}).set('_page.doc.cy.nodes.' + nodeId + '.data.class', param.class);
            //     model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnlabel', param.sbgnlabel);

            //adding the node in cytoscape
            model.pass({user: user}).set('_page.doc.cy.nodes.' + nodeId + '.addedLater', true);


            if (!noHistUpdate)
            //We don't want all the attributes of the param to be printed
                this.updateHistory({
                    opName: 'add',
                    opTarget: 'element',
                    elType: 'node',
                    elId: nodeId,
                    param: {x: param.x, y: param.y, sbgnclass: param.sbgnclass}
                });


            return "success";

        },

        addModelEdge: function (edgeId, param, user, noHistUpdate) {

            if (model.get("_page.doc.cy.edges." + edgeId + '.id') != null)
                return "Edge cannot be duplicated";

            model.pass({user: user}).set('_page.doc.cy.edges.' + edgeId + '.data.id', edgeId);
            model.pass({user: user}).set('_page.doc.cy.edges.' + edgeId + '.data.class', param.class);

            model.pass({user: user}).set('_page.doc.cy.edges.' + edgeId + '.data.source', param.source);
            model.pass({user: user}).set('_page.doc.cy.edges.' + edgeId + '.data.target', param.target);

            //adding the edge...other operations should be called after this
            model.pass({user: user}).set('_page.doc.cy.edges.' + edgeId + '.addedLater', true);


            if (!noHistUpdate)
                this.updateHistory({opName: 'add', opTarget: 'element', elType: 'edge', elId: edgeId, param: param});

            return "success";

        },

        //change children's parents to their old parents
        removeModelCompound: function (compoundId, childrenList, prevParentList, user, noHistUpdate) {

            var nodePath = model.at('_page.doc.cy.nodes.' + compoundId);
            var compoundAtts = {
                id: compoundId,
                class: nodePath.get('class'),
                x: nodePath.get('position.x'),
                y: nodePath.get('position.y'),
                width: nodePath.get('width'),
                height: nodePath.get('height')
            };

            //isolate the compound first, then delete
            this.changeModelElementGroupAttribute("parent", childrenList, prevParentList, null, true);
            this.deleteModelNode(compoundId, user, true);


            if (!noHistUpdate)
                this.updateHistory({
                    opName: 'delete',
                    opTarget: 'compound',
                    elId: compoundId,
                    prevParam: {childrenList: childrenList, compoundAtts: compoundAtts},
                    param: prevParentList
                });

        },
        /***
         *
         * @param compoundId : new compound's id
         * @param compoundAtts: new compounds id, size, sbgnclass, position
         * @param childrenList: in the format {id:, isNode} for do/undo
         * @param prevParentList: children's old parents
         * @param user
         * @param noHistUpdate
         */
        addModelCompound: function (compoundId, compoundAtts, elList, paramList, user, noHistUpdate) {

            this.addModelNode(compoundId, compoundAtts, user, true);

            this.changeModelElementGroupAttribute("data", elList, paramList, user, true);

            if (!noHistUpdate)
                this.updateHistory({
                    opName: 'add',
                    opTarget: 'compound',
                    elId: compoundId,
                    param: {paramList: paramList, compoundAtts: compoundAtts},
                    prevParam: [] //TODO
                });

        },


        //attStr: attribute namein the model
        //historyData is for  sbgnStatesAndInfos only
        changeModelElementGroupAttribute: function (attStr, elList, paramList, user, noHistUpdate) { //historyData){

            var prevParamList = [];
            var self = this;

            if (!noHistUpdate) {

                elList.forEach(function (el) {

                    var prevAttVal;
                    if (el.isNode)
                        prevAttVal = model.get('_page.doc.cy.nodes.' + el.id + '.' + attStr);
                    else
                        prevAttVal = model.get('_page.doc.cy.edges.' + el.id + '.' + attStr);


                    prevParamList.push(prevAttVal);
                });


                this.updateHistory({
                    opName: 'set',
                    opTarget: 'element group',
                    elId: elList,
                    opAttr: attStr,
                    param: paramList,
                    prevParam: prevParamList
                });

            }

            var ind = 0;
            elList.forEach(function (el) {
                var currAttVal = paramList[ind++];

                if (el.isNode)
                    self.changeModelNodeAttribute(attStr, el.id, currAttVal, user, true); //don't update individual histories
                else
                    self.changeModelEdgeAttribute(attStr, el.id, currAttVal, user, true);

            });

            return "success";

        },

        getModelNodeAttribute:function(attStr, nodeId){
            var nodePath = model.at('_page.doc.cy.nodes.' + nodeId);

            return nodePath.get(attStr);
        },

        getModelEdgeAttribute:function(attStr, edgeId){
            var edgePath = model.at('_page.doc.cy.edges.' + edgeId);

            return edgePath.get(attStr);
        },
        //attStr: attribute namein the model
        //historyData is for  sbgnStatesAndInfos only
        changeModelNodeAttribute: function (attStr, nodeId, attVal, user, noHistUpdate) { //historyData){

            var status = "Node id not found";
            var nodePath = model.at('_page.doc.cy.nodes.' + nodeId);


            var prevAttVal = nodePath.get(attStr);


            if(attStr === "width") //as we read this directly from cy.data
                attStr = "borderWidth";



            nodePath.pass({user: user}).set(attStr, attVal);


            if (attStr == "expandCollapseStatus") {
                if (attVal == "expand")
                    prevAttVal = "collapse";
                else //if null or collapse
                    prevAttVal = "expand";
            }



            if (attStr != 'interactionCount') {
                model.increment('_page.doc.cy.nodes.' + nodeId + '.interactionCount', 1);

                if (!noHistUpdate) {

                    this.updateHistory({
                        opName: 'set',
                        opTarget: 'element',
                        elType: 'node',
                        elId: nodeId,
                        opAttr: attStr,
                        param: attVal,
                        prevParam: prevAttVal
                    });
                }
            }
            status = "success";


            return status;

        },


        changeModelEdgeAttribute: function (attStr, edgeId, attVal, user, noHistUpdate) {
            var status = "Edge id not found";
            var edgePath = model.at('_page.doc.cy.edges.' + edgeId);
            var prevAttVal = edgePath.get(attStr);
            edgePath.pass({user: user}).set(attStr, attVal);


            var sourceId = edgePath.get('source');
            var targetId = edgePath.get('target');
            if (sourceId)
                model.increment('_page.doc.cy.nodes.' + sourceId + '.interactionCount', 1);
            if (targetId)
                model.increment('_page.doc.cy.nodes.' + targetId + '.interactionCount', 1);


            if (!noHistUpdate) {

                this.updateHistory({
                    opName: 'set',
                    opTarget: 'element',
                    elType: 'edge',
                    elId: edgeId,
                    opAttr: attStr,
                    param: attVal,
                    prevParam: prevAttVal
                });

            }

            status = "success";


            return status;
        },

        //willUpdateHistory: Depending on the parent command, history will be updated or not
        deleteModelNode: function (nodeId, user, noHistUpdate) {
            var nodePath = model.at('_page.doc.cy.nodes.' + nodeId);

            if (nodePath.get() == null)
                return "Node id not found";

            if (!noHistUpdate) {


                prevParam = nodePath.get();




                this.updateHistory({
                    opName: 'delete',
                    opTarget: 'element',
                    elType: 'node',
                    elId: nodeId,
                    prevParam: prevParam
                });

            }

            model.pass({user: user}).del(('_page.doc.cy.nodes.' + nodeId));


            return "success";

        },


        deleteModelEdge: function (edgeId, user, noHistUpdate) {

            var edgePath = model.at('_page.doc.cy.edges.' + edgeId);
            if (edgePath.get() == null)
                return "Edge id not found";


            if (!noHistUpdate) {

                prevParam = edgePath.get();

                this.updateHistory({
                    opName: 'delete',
                    opTarget: 'element',
                    elType: 'edge',
                    elId: edgeId,
                    prevParam: prevParam
                });

            }

            model.pass({user: user}).del(('_page.doc.cy.edges.' + edgeId));

            return "success";

        },


        deleteModelElementGroup: function (selectedEles, user, noHistUpdate) {
            var prevParamsNodes = [];
            var prevParamsEdges = [];
            var self = this;

            if(selectedEles.edges!= null){
                selectedEles.edges.forEach(function (edge) {
                    var edgePath = model.at('_page.doc.cy.edges.' + edge.id);
                    prevParamsEdges.push(edgePath.get());
                });


                selectedEles.edges.forEach(function (edge) {
                    self.deleteModelEdge(edge.id, user, true); //will not update children history
                });
            }

            if(selectedEles.nodes!= null) {
                selectedEles.nodes.forEach(function (node) {
                    var nodePath = model.at('_page.doc.cy.nodes.' + node.id);


                    prevParamsNodes.push(nodePath.get());
                });


                selectedEles.nodes.forEach(function (node) {
                    self.deleteModelNode(node.id, user, true); //will not update children history
                });
            }
            if (!noHistUpdate)
                this.updateHistory({
                    opName: 'delete',
                    opTarget: 'element group',
                    elId: selectedEles,
                    prevParam: {nodes: prevParamsNodes, edges: prevParamsEdges}
                });


        },

        restoreModelElementGroup: function (elList, param, user, noHistUpdate) {
            var self = this;
            //Restore nodes first

            for (var i = 0; i < elList.nodes.length; i++) {
                self.restoreModelNode(elList.nodes[i].id, param.nodes[i], user, true);
            }

            //restore edges later
            for (var i = 0; i < elList.edges.length; i++) {
                self.restoreModelEdge(elList.edges[i].id, param.edges[i], user, true);
            }

            //change parents after adding them all
            for (var i = 0; i < elList.nodes.length; i++) {
                self.changeModelNodeAttribute('parent', elList.nodes[i].id, param.nodes[i].parent, null, false);
            }



            if (!noHistUpdate)
                self.updateHistory({opName: 'restore', opTarget: 'element group', elId: elList});
        },
        /**
         * Restore operations for global undo/redo
         */
        restoreModelNode: function (nodeId, param, user, noHistUpdate) {

            this.addModelNode(nodeId, {x: param.position.x, y: param.position.y, class:param.data.class}, user, noHistUpdate);

            for(att in param){
                if(param.hasOwnProperty(att) && att !== "addedLater"){
                    model.pass({user:user}).set(('_page.doc.cy.nodes.' + nodeId + '.' + att), param[att]);
                }
            }

            if (!noHistUpdate)
                this.updateHistory({opName: 'restore', opTarget: 'element', elType: 'node', elId: nodeId});
        },

        restoreModelEdge: function (edgeId, param, user, noHistUpdate) {

            this.addModelEdge(edgeId, {source: param.data.source, target:param.data.target, class: param.data.class}, user, noHistUpdate);



            for(att in param){
                if(param.hasOwnProperty(att) && att !== "addedLater"){
                    model.pass({user:user}).set(('_page.doc.cy.edges.' + edgeId + '.' + att), param[att]);
                }
            }


            if (!noHistUpdate)
                this.updateHistory({opName: 'restore', opTarget: 'element', elType: 'edge', elId: edgeId});
        },


        restoreModelElement: function (elType, elId, param, user, noHistUpdate) {

            if (elType == "node")
                this.restoreModelNode(elId, param, user, noHistUpdate);
            else
                this.restoreModelEdge(elId, param, user, noHistUpdate);


        },


        /**
         * This function is used to undo newModel and redo initModel
         * @param modelCy : nodes and edges to be restored
         * @param user
         * @param noHistUpdate
         */
        restoreModel: function (modelCy, user, noHistUpdate) {
            var prevParam = model.get('_page.doc.cy');
            model.set('_page.doc.cy', modelCy);

            this.setSampleInd(-1, null, true); //to get a new container

            if (!noHistUpdate)
                this.updateHistory({opName: 'restore', prevParam: prevParam, param: modelCy, opTarget: 'model'});

        },

        //should be called before loading a new graph to prevent id confusion
        newModel: function (user, noHistUpdate) {

            var self = this;
            var prevModelCy = model.get('_page.doc.cy');

            if (!noHistUpdate)
                this.updateHistory({opName: 'new', prevParam: prevModelCy, opTarget: 'model'});

            var edges = model.get('_page.doc.cy.edges');
            var nodes = model.get('_page.doc.cy.nodes');


            for (var att in edges) {
                if (edges.hasOwnProperty(att)) {
                    self.deleteModelEdge(edges[att].id, user, true);
                }
            }

            for (var att in nodes) {
                if (nodes.hasOwnProperty(att)) {
                    self.deleteModelNode(nodes[att].id, user, true);
                }
            }


        },


        //should be called before loading a new graph to prevent id confusion
        deleteAll: function (nodes, edges, user, noHistUpdate) {

            var self = this;
            if (!noHistUpdate)
                this.updateHistory({opName: 'new', opTarget: 'model'});


            edges.forEach(function (edge) {
                self.deleteModelEdge(edge.id(), user, noHistUpdate);
            });

            nodes.forEach(function (node) {
                self.deleteModelNode(node.id(), user, noHistUpdate);
            });


        },

        //convert model to array
        getJsonFromModel: function () {

            var nodes = model.get('_page.doc.cy.nodes');


            if (nodes == null)
                return null;

            var edges = model.get('_page.doc.cy.edges');

            var jsonNodes = [];
            var jsonEdges = [];


            for (var att in nodes) {

                if (nodes.hasOwnProperty(att)) {
                    var node = nodes[att];
                    var jsonNode = {
                        data: node.data
                    };

                    jsonNodes.push(jsonNode);
                }
            }
            ;


            for (var att in edges) {
                if (edges.hasOwnProperty(att)) {
                    var edge = edges[att];

                    var jsonEdge = {
                        data: edge.data
                    };

                    jsonEdges.push(jsonEdge);
                }
            }


            return {nodes: jsonNodes, edges: jsonEdges};


    },


        /***
         *
         * @param node: Cytoscape node
         * @param user: to make sure we don't update the data of same client
         * @param noHistUpdate
         */
        initModelNode: function (node, user, noHistUpdate) {


            var nodePath = model.at('_page.doc.cy.nodes.' + node.id());

            if (!noHistUpdate)
                this.updateHistory({opName: 'init', opTarget: 'element', elType: 'node', elId: node.id()});


            nodePath.set('id', node.id());


            var interactionCount = nodePath.get('interactionCount');

            if (interactionCount == null) //this is not stored in cy
                this.changeModelNodeAttribute('interactionCount', node.id(), 0, user, true); //don't update history

            var data = nodePath.get('data');
            //bbox is a random data parameter to make sure all data parts are already in the model
            //if the only data parameters are id and class, it means it has just been added without initialization
            if (data != null && data.bbox!=null) //it means data has been added before
                node.data(data);

            else
                this.changeModelNodeAttribute('data', node.id(), node.data(), user, noHistUpdate);


            //make this initially unselected
        //    nodePath.set('highlightColor', null);


            var pos = nodePath.get('position');
            if (pos != null)
                node.position(pos);

            else
                this.changeModelNodeAttribute('position', node.id(), node.position(), user, noHistUpdate);

            //Change css-related attributes one by one

            //Initializing css properties causes bypass problems!!

            // var backgroundColor = nodePath.get('backgroundColor');
            // if (backgroundColor != null) {
            //
            //     node.css("background-color", backgroundColor);
            // }
            // else
            //     this.changeModelNodeAttribute('backgroundColor', node.id(), node.css('background-color'), user, noHistUpdate);


            // var borderWidth = nodePath.get('borderWidth');
            // if (borderWidth != null) {
            //
            //     node.css("border-width", borderWidth);
            // }
            // else
            //     this.changeModelNodeAttribute('borderWidth', node.id(), node.css('border-width'), user, noHistUpdate);
            //
            // var opacity = nodePath.get('opacity');
            // if (opacity != null) {
            //
            //     node.css("opacity", opacity);
            // }
            // else
            //     this.changeModelNodeAttribute('opacity', node.id(), node.css('opacity'), user, noHistUpdate);
            //
            // var visibility = nodePath.get('visibility');
            // if (visibility != null) {
            //
            //     node.css("visibility", visibility);
            // }
            // else
            //     this.changeModelNodeAttribute('visibility', node.id(), node.css('visibility'), user, noHistUpdate);
            //
            //
            // var display = nodePath.get('display');
            // if (display != null) {
            //
            //     node.css("display", display);
            // }
            // else
            //     this.changeModelNodeAttribute('display', node.id(), node.css('display'), user, noHistUpdate);


        },
        initModelEdge: function (edge, user, noHistUpdate) {



            //edge.addClass('changeLineColor');


            var edgePath = model.at('_page.doc.cy.edges.' + edge.id());


            if (!noHistUpdate)
                this.updateHistory({opName: 'init', opTarget: 'element', elType: 'edge', elId: edge.id()});


            edgePath.set('id', edge.id());



            //make this initially unselected
            //edgePath.set('highlightColor', null);

            var data = edgePath.get('data');
            //cardinality is a random data parameter to make sure all data parts are already in the model
            //if the only data parameters are id and class, it means it has just been added without initialization
            if (data != null && data.cardinality != null)
                edge.data(data);

            else
                this.changeModelEdgeAttribute('data', edge.id(), edge.data(), user, noHistUpdate);


            // var opacity = edgePath.get('opacity');
            //
            // if (opacity != null)
            //     edge.css('opacity', opacity );
            //
            // else
            //     this.changeModelEdgeAttribute('opacity', edge.id(),edge.css('opacity'), user, noHistUpdate);
            //
            //
            //
            // var lineColor = edgePath.get('lineColor');
            //
            // if (lineColor != null)
            //     edge.css('line-color', lineColor);
            // else
            //     this.changeModelEdgeAttribute('lineColor', edge.id(), edge.css('line-color'), user, noHistUpdate);
            //
            //
            // var width = edgePath.get('width');
            //
            // if (width != null) {
            //     edge.css('width', width);
            // }
            // else
            //     this.changeModelEdgeAttribute('width', edge.id(), edge.css('width'), user, noHistUpdate);
            //
            // var borderWidth = edgePath.get('borderWidth');
            //
            // if (borderWidth != null) {
            //     edge.css('border-width', borderWidth);
            // }
            // else
            //     this.changeModelEdgeAttribute('borderWidth', edge.id(), edge.css('border-width'), user, noHistUpdate);
            //
            // var backgroundColor = edgePath.get('backgroundColor');
            //
            // if (backgroundColor != null)
            //     edge.css('background-color', backgroundColor);
            // else
            //     this.changeModelEdgeAttribute('backgroundColor', edge.id(), edge.css('background-color'), user, noHistUpdate);
            //
            // var backgroundOpacity = edgePath.get('backgroundOpacity');
            //
            // if (backgroundOpacity != null)
            //     edge.css('background-opacity', backgroundOpacity);
            // else
            //     this.changeModelEdgeAttribute('backgroundOpacity', edge.id(), edge.css('background-opacity'), user, noHistUpdate);



        },


        //nodes and edges are cytoscape objects. they have css and data properties
        initModel: function ( nodes, edges, user, noHistUpdate) {

            var self = this;

            console.log("inited");

            nodes.forEach(function (node) {
                self.initModelNode(node, user, true);

            });

            edges.forEach(function (edge) {
                self.initModelEdge(edge, user, true);
            });


            var newModelCy = model.get('_page.doc.cy');




            if (!noHistUpdate) {
                this.updateHistory({opName: 'init', param: newModelCy, opTarget: 'model'});
            }




            //notifies other clients to update their cy graphs
           model.pass({user:"me"}).set('_page.doc.cy.initTime', new Date());

        },



        setRollbackPoint: function () {
            var modelCy = this.getModelCy();
            model.set('_page.doc.prevCy', modelCy);
        },

        getModelCy: function () {
            return model.get('_page.doc.cy');
        },

        //for undo/redo only
        mergeJsons: function (user, noHistUpdate) {
            var modelCy = model.get('_page.doc.cy');
            var prevModelCy = model.get('_page.doc.prevCy');

            if (!noHistUpdate) {

                this.updateHistory({opName: 'merge', prevParam: prevModelCy, param: modelCy, opTarget: 'model'});
            }

        },
        performCyAction: function(actionName, args, res){
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


            else if(actionName === "deleteElesSimple" || actionName === "deleteNodesSmart"){

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
            
        }
    }
}