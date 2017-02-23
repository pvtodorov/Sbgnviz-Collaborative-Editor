/*
 *	Shared model handling operations.
 *  Clients call these commands to update the model
 *	Author: Funda Durupinar Babur<f.durupinar@gmail.com>
 */


module.exports = function (model, docId, userId, userName) {

    var userPath = model.at('users.' + userId);


    model.ref('_page.doc', 'documents.' + docId);

    return ModelManager = { //global reference for testing


        getModel: function () {
            return model;
        },

        addImage: function (data, user, noHistUpdate) {
            model.pass({user: user}).push('_page.doc.images', data);
            if (!noHistUpdate)
                this.updateHistory({opName: 'add', opTarget: 'image', opAttr: data.filePath});
        },

        setName: function (userName) {

            model.fetch('users', userId, function (err) {
                userPath.set('name', userName);
            });
        },

        getName: function () {
            return model.get('users.' + userId + '.name');
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
            var userPath = model.at('users.' + userId);
            var edgePath = model.at('_page.doc.cy.edges.' + edge.id());
            if (edgePath.get() == null)
                return "Edge id not found";
            if (userPath) {
                model.pass({user: user}).set('_page.doc.cy.edges.' + edge.id()+ 'highlightColor', userPath.get('colorCode'));


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

        getSelectedModelNodes: function () {
            var nodes = model.get('_page.doc.cy.nodes');
            var selectedNodes = [];

            for (var att in nodes) {
                if (nodes.hasOwnProperty(att)) {
                    var node = nodes[att];
                    if (node.highlightColor != null) //could be selected by anyone
                        selectedNodes.push(node);
                }
            }

            return selectedNodes;
        },

        addModelNode: function (nodeId, param, user, noHistUpdate) {


            if (model.get("_page.doc.cy.nodes." + nodeId + '.id') != null)
                return "Node cannot be duplicated";

            model.pass({user: user}).set('_page.doc.cy.nodes.' + nodeId + '.id', nodeId);
            model.pass({user: user}).set('_page.doc.cy.nodes.' + nodeId + '.position', {x: param.x, y: param.y});
            model.pass({user: user}).set('_page.doc.cy.nodes.' + nodeId + '.class', param.class);
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

            model.pass({user: user}).set('_page.doc.cy.edges.' + edgeId + '.id', edgeId);
            model.pass({user: user}).set('_page.doc.cy.edges.' + edgeId + '.class', param.class);

            model.pass({user: user}).set('_page.doc.cy.edges.' + edgeId + '.source', param.source);
            model.pass({user: user}).set('_page.doc.cy.edges.' + edgeId + '.target', param.target);

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
        //attStr: attribute namein the model
        //historyData is for  sbgnStatesAndInfos only
        changeModelNodeAttribute: function (attStr, nodeId, attVal, user, noHistUpdate) { //historyData){

            var status = "Node id not found";
            var nodePath = model.at('_page.doc.cy.nodes.' + nodeId);


            var prevAttVal = nodePath.get(attStr);


            if(attStr === "width")
                attStr = "borderWidth";

            nodePath.pass({user: user}).set(attStr, attVal);


            if (attStr == "expandCollapseStatus") {
                if (attVal == "expand")
                    prevAttVal = "collapse";
                if (attVal == "collapse")
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
                var pos = nodePath.get('position');
                var sbgnclass = nodePath.get('class');
                var data = nodePath.get('data');
                var backgroundColor = nodePath.get('backgroundColor');

                // // var borderColor = nodePath.get('borderColor');
                // var borderWidth = nodePath.get('borderWidth');
                // var backgroundColor = nodePath.get('backgroundColor');
                // var width = nodePath.get('width');
                // var height = nodePath.get('height');
                // var parent = nodePath.get('parent');
                // var sbgnlabel = nodePath.get('sbgnlabel');
                // var isCloneMarker = nodePath.get('isCloneMarker');
                //
                // var sbgnStatesAndInfos = nodePath.get('sbgnStatesAndInfos');
                // var highlightColor = nodePath.get('highlightColor');
                // var ports = nodePath.get('ports');
                //
                // var labelsize = nodePath.get('labelsize');
                // var fontfamily = nodePath.get('fontfamily');
                // var fontweight = nodePath.get('fontweight');
                // var fontstyle = nodePath.get('fontstyle');
                // var opacity = nodePath.get('opacity');
                //

                var interactionCount = nodePath.get('interactionCount');


                prevParam = {
                    x: pos.x,
                    y: pos.y,
                    data:data,
                    // css:css
                    // class: sbgnclass,
                    // width: width,
                    // height: height,
                    // borderColor: borderColor,
                    // borderWidth: borderWidth,
                    // sbgnlabel: sbgnlabel,
                    // sbgnStatesAndInfos: sbgnStatesAndInfos,
                    // parent: parent,
                    // isCloneMarker: isCloneMarker,
                    // highlightColor: highlightColor,
                    // ports: ports,
                    // interactionCount: interactionCount,
                    // labelsize: labelsize,
                    // fontfamily: fontfamily,
                    // fontweight: fontweight,
                    // fontstyle: fontstyle,
                    // opacity: opacity
                };


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
                var source = edgePath.get('source');
                var target = edgePath.get('target');
                var sbgnClass = edgePath.get('class');
                var lineColor = edgePath.get('lineColor');
                var width = edgePath.get('width');
                var sbgncardinality = edgePath.get('sbgncardinality');
                var portsource = edgePath.get('portsource');
                var porttarget = edgePath.get('porttarget');
                var bendPointPositions = edgePath.get('bendPointPositions');
                var highlightColor = edgePath.get('highlightColor');
                var opacity = edgePath.get('opacity');

                prevParam = {
                    source: source,
                    target: target,
                    class: sbgnClass,
                    lineColor: lineColor,
                    width: width,
                    sbgncardinality: sbgncardinality,
                    portsource: portsource,
                    porttarget: porttarget,
                    bendPointPositions: bendPointPositions,
                    highlightColor: highlightColor,
                    opacity: opacity
                };

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

                    var source = edgePath.get('source');
                    var target = edgePath.get('target');
                    var sbgnclass = edgePath.get('class');
                    var lineColor = edgePath.get('lineColor');
                    var width = edgePath.get('width');
                    var sbgncardinality = edgePath.get('sbgncardinality');
                    var portsource = edgePath.get('portsource');
                    var porttarget = edgePath.get('porttarget');
                    var bendPointPositions = edgePath.get('bendPointPositions');
                    var opacity = edgePath.get('opacity');


                    prevParamsEdges.push({
                        source: source,
                        target: target,
                        class: sbgnclass,
                        lineColor: lineColor,
                        width: width,
                        sbgncardinality: sbgncardinality,
                        portsource: portsource,
                        porttarget: porttarget,
                        bendPointPositions: bendPointPositions,
                        opacity: opacity
                    });
                });


                selectedEles.edges.forEach(function (edge) {
                    self.deleteModelEdge(edge.id, user, true); //will not update children history
                });
            }

            if(selectedEles.nodes!= null) {
                selectedEles.nodes.forEach(function (node) {
                    var nodePath = model.at('_page.doc.cy.nodes.' + node.id);

                    var pos = nodePath.get('position');
                    var sbgnclass = nodePath.get('class');


                    var borderColor = nodePath.get('borderColor');
                    var borderWidth = nodePath.get('borderWidth');
                    var backgroundColor = nodePath.get('backgroundColor');
                    var width = nodePath.get('width');
                    var height = nodePath.get('height');
                    var parent = nodePath.get('parent');
                    var sbgnlabel = nodePath.get('sbgnlabel');
                    var isCloneMarker = nodePath.get('isCloneMarker');
                    var sbgnStatesAndInfos = nodePath.get('sbgnStatesAndInfos');
                    var highlightColor = nodePath.get('highlightColor');
                    var ports = nodePath.get('ports');
                    var labelsize = nodePath.get('labelsize');
                    var fontfamily = nodePath.get('fontfamily');
                    var fontweight = nodePath.get('fontweight');
                    var fontstyle = nodePath.get('fontstyle');
                    var opacity = nodePath.get('opacity');

                    prevParamsNodes.push({
                        x: pos.x,
                        y: pos.y,
                        class: sbgnclass,
                        width: width,
                        height: height,
                        borderColor: borderColor,
                        borderWidth: borderWidth,
                        sbgnlabel: sbgnlabel,
                        sbgnStatesAndInfos: sbgnStatesAndInfos,
                        parent: parent,
                        isCloneMarker: isCloneMarker,
                        highlightColor: highlightColor,
                        backgroundColor: backgroundColor,
                        ports: ports,
                        labelsize: labelsize,
                        fontweight: fontweight,
                        fontfamily: fontfamily,
                        fontstyle: fontstyle,
                        opacity: opacity
                    });
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
            ;


            if (!noHistUpdate)
                self.updateHistory({opName: 'restore', opTarget: 'element group', elId: elList});
        },
        /**
         * Restore operations for global undo/redo
         */
        restoreModelNode: function (nodeId, param, user, noHistUpdate) {

            this.addModelNode(nodeId, param, user, noHistUpdate);


            this.changeModelNodeAttribute('interactionCount', nodeId, param.interactionCount, user, noHistUpdate);
            this.changeModelNodeAttribute('ports', nodeId, param.ports, user, noHistUpdate);
            this.changeModelNodeAttribute('highlightColor', nodeId, param.highlightColor, user, noHistUpdate);
            this.changeModelNodeAttribute('class', nodeId, param.class, user, noHistUpdate);
            this.changeModelNodeAttribute('width', nodeId, param.width, user, noHistUpdate);
            this.changeModelNodeAttribute('height', nodeId, param.height, user, noHistUpdate);
            this.changeModelNodeAttribute('sbgnlabel', nodeId, param.sbgnlabel, user, noHistUpdate);
            this.changeModelNodeAttribute('backgroundColor', nodeId, param.backgroundColor, user, noHistUpdate);
            this.changeModelNodeAttribute('borderColor', nodeId, param.borderColor, user, noHistUpdate);
            this.changeModelNodeAttribute('borderWidth', nodeId, param.borderWidth, user, noHistUpdate);
            this.changeModelNodeAttribute('sbgnStatesAndInfos', nodeId, param.sbgnStatesAndInfos, user, noHistUpdate);
            this.changeModelNodeAttribute('parent', nodeId, param.parent, user, noHistUpdate);
            this.changeModelNodeAttribute('isCloneMarker', nodeId, param.isCloneMarker, user, noHistUpdate);
            this.changeModelNodeAttribute('labelsize', nodeId, param.labelsize, user, noHistUpdate);
            this.changeModelNodeAttribute('fontfamily', nodeId, param.fontfamily, user, noHistUpdate);
            this.changeModelNodeAttribute('fontweight', nodeId, param.fontweight, user, noHistUpdate);
            this.changeModelNodeAttribute('fontstyle', nodeId, param.fontstyle, user, noHistUpdate);
            this.changeModelNodeAttribute('opacity', nodeId, param.opacity, user, noHistUpdate);

            if (!noHistUpdate)
                this.updateHistory({opName: 'restore', opTarget: 'element', elType: 'node', elId: nodeId});
        },

        restoreModelEdge: function (edgeId, param, user, noHistUpdate) {

            this.addModelEdge(edgeId, param, user, noHistUpdate);


            this.changeModelEdgeAttribute('lineColor', edgeId, param.lineColor, user, noHistUpdate);
            this.changeModelEdgeAttribute('width', edgeId, param.width, user, noHistUpdate);
            this.changeModelEdgeAttribute('sbgncardinality', edgeId, param.sbgncardinality, user, noHistUpdate);
            this.changeModelEdgeAttribute('portsource', edgeId, param.portsource, user, noHistUpdate);
            this.changeModelEdgeAttribute('porttarget', edgeId, param.porttarget, user, noHistUpdate);
            this.changeModelEdgeAttribute('bendPointPositions', edgeId, param.bendPointPositions, user, noHistUpdate);
            this.changeModelEdgeAttribute('highlightColor', edgeId, param.highlightColor, user, noHistUpdate);
            this.changeModelEdgeAttribute('opacity', edgeId, param.opacity, user, noHistUpdate);


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

        //convert model to json structure
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
            if (data != null)
                node.data(data);

            else
                this.changeModelNodeAttribute('data', node.id(), node.data(), user, noHistUpdate);




            var pos = nodePath.get('position');
            if (pos != null)
                node.position(pos);

            else
                this.changeModelNodeAttribute('position', node.id(), node.position(), user, noHistUpdate);

            //Change css-related attributes one by one

            var backgroundColor = nodePath.get('backgroundColor');
            if (backgroundColor != null) {

                node.css("background-color", backgroundColor);
            }
            else
                this.changeModelNodeAttribute('backgroundColor', node.id(), node.css('background-color'), user, noHistUpdate);


            var borderWidth = nodePath.get('borderWidth');
            if (borderWidth != null) {

                node.css("border-width", borderWidth);
            }
            else
                this.changeModelNodeAttribute('borderWidth', node.id(), node.css('border-width'), user, noHistUpdate);

            var opacity = nodePath.get('opacity');
            if (opacity != null) {

                node.css("opacity", opacity);
            }
            else
                this.changeModelNodeAttribute('opacity', node.id(), node.css('opacity'), user, noHistUpdate);

            var visibility = nodePath.get('visibility');
            if (visibility != null) {

                node.css("visibility", visibility);
            }
            else
                this.changeModelNodeAttribute('visibility', node.id(), node.css('visibility'), user, noHistUpdate);
            
            
            var display = nodePath.get('display');
            if (display != null) {

                node.css("display", display);
            }
            else
                this.changeModelNodeAttribute('display', node.id(), node.css('display'), user, noHistUpdate);


        },
        initModelEdge: function (edge, user, noHistUpdate) {



            //edge.addClass('changeLineColor');


            var edgePath = model.at('_page.doc.cy.edges.' + edge.id());


            if (!noHistUpdate)
                this.updateHistory({opName: 'init', opTarget: 'element', elType: 'edge', elId: edge.id()});


            edgePath.set('id', edge.id());





            var data = edgePath.get('data');
            if (data != null)
                edge.data(data);

            else
                this.changeModelEdgeAttribute('data', edge.id(), edge.data(), user, noHistUpdate);


            var opacity = edgePath.get('opacity');

            if (opacity != null)
                edge.css('opacity', opacity );

            else
                this.changeModelEdgeAttribute('opacity', edge.id(),edge.css('opacity'), user, noHistUpdate);



            var lineColor = edgePath.get('lineColor');

            if (lineColor != null)
                edge.css('line-color', lineColor);
            else
                this.changeModelEdgeAttribute('lineColor', edge.id(), edge.css('line-color'), user, noHistUpdate);


            var width = edgePath.get('width');

            if (width != null) {
                edge.css('width', width);
            }
            else
                this.changeModelEdgeAttribute('width', edge.id(), edge.css('width'), user, noHistUpdate);

            var borderWidth = edgePath.get('borderWidth');

            if (borderWidth != null) {
                edge.css('border-width', borderWidth);
            }
            else
                this.changeModelEdgeAttribute('borderWidth', edge.id(), edge.css('border-width'), user, noHistUpdate);

            var backgroundColor = edgePath.get('backgroundColor');

            if (backgroundColor != null)
                edge.css('background-color', backgroundColor);
            else
                this.changeModelEdgeAttribute('backgroundColor', edge.id(), edge.css('background-color'), user, noHistUpdate);

            var backgroundOpacity = edgePath.get('backgroundOpacity');

            if (backgroundOpacity != null)
                edge.css('background-opacity', backgroundOpacity);
            else
                this.changeModelEdgeAttribute('backgroundOpacity', edge.id(), edge.css('background-opacity'), user, noHistUpdate);



        },


        //nodes and edges are cytoscape objects. they have css and data properties
        initModel: function ( nodes, edges, user, noHistUpdate) {

            var self = this;

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

        }
    }
}