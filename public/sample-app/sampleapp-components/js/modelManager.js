/*
 *	Shared model handling operations.
 *  Clients call these commands to update the model
 *	Author: Funda Durupinar Babur<f.durupinar@gmail.com>
 */

var CircularJSON = require('circular-json');
module.exports =  function(model, docId, userId, userName) {

    var user = model.at('users.' + userId);


    var isListeningCy = true;

    model.ref('_page.doc', 'documents.' + docId);

    return ModelManager = { //global reference for testing

        getIsListeningCy: function(){

            return isListeningCy;
        },
        setIsListeningCy: function(val){

            isListeningCy = val;
        },



        getModel: function(){
            return model;
        },

        addImage: function(data, user , noHistUpdate){
            model.pass({user:user}).push('_page.doc.images', data);
            if(!noHistUpdate)
                this.updateHistory({opName:'add', opTarget:'image', opAttr: data.filePath});
        },

        setName: function(userName){

           model.fetch('users', userId, function(err){
               user.set('name', userName);
           });
        },

        getName: function(){
            return model.get('users.' + userId +'.name');
        },

        setSampleInd: function(ind, user, noHistUpdate){
            model.pass({user:user}).set('_page.doc.sampleInd', ind);

            if(!noHistUpdate) {
                if (ind == -1)
                    this.updateHistory({opName:'load', opTarget:'model'});
                else
                    this.updateHistory({opName:'open', opTarget: 'sample', elId: ind});
            }
        },
        getSampleInd: function(user, noHistUpdate){
            var ind = model.get('_page.doc.sampleInd');
            if(ind == null)
                ind = "0";
            if(!noHistUpdate)
                this.setSampleInd(ind, user, noHistUpdate);

            if(!noHistUpdate) {
                if (ind == -1)
                    this.updateHistory({opName:'load', opTarget:'model'});
                else
                    this.updateHistory({opName:'open', opTarget: 'sample', elId: ind});
            }
            return ind;

        },


        updateLayoutProperties: function(layoutProperties, noHistUpdate){

            var currentLayoutProperties;
            var lp =  model.get('_page.doc.layoutProperties');

            if(lp == null)
                currentLayoutProperties = _.clone(layoutProperties);
            else
                currentLayoutProperties = _.clone(lp);


            model.set('_page.doc.layoutProperties', currentLayoutProperties); //synclayout

            if(!noHistUpdate)
                this.updateHistory({opName:'set',opTarget:'layout', opAttr: JSON.stringify(currentLayoutProperties)});
            return currentLayoutProperties;
        },
        setLayoutProperties: function(layoutProperties, noHistUpdate){
            model.set('_page.doc.layoutProperties', layoutProperties); //synclayout
            if(!noHistUpdate)
                this.updateHistory({opName:'set', opTarget:'layout', opAttr: JSON.stringify(layoutProperties)});
        },




        /***
         *
         * @param cmd  {opName, opTarget,  elType, elId, opAttr,param, prevParam}
         * opName: set, load, open, add, select, unselect
         * opTarget: element, element group,  model, sample,
         * elType: node, edge
         * opAttr: highlightColor, lineColor, borderColor etc.
         */

        updateHistory: function(cmd){
            var command = {userName: userName, date: new Date, opName: cmd.opName, opTarget: cmd.opTarget, elType: cmd.elType, opAttr: cmd.opAttr, elId: cmd.elId, param: cmd.param, prevParam: cmd.prevParam};


            var ind = model.push('_page.doc.history',command) - 1;

            model.set('_page.doc.undoIndex', ind);

        },

        getHistory: function(){
            return model.get('_page.doc.history');
        },

        getUndoActionStr: function(){

            var undoIndex = model.get('_page.doc.undoIndex');
            var cmd =  model.get('_page.doc.history.' + undoIndex);

            var cmdStr = cmd.opName + " " + cmd.opTarget;

            if(cmd.opAttr != null)
                cmdStr += " " + cmd.opAttr;
        //    if(cmd.elId != null)
          //      cmdStr += " " + cmd.elId;

            return cmdStr;

        },

        getRedoActionStr: function(){
            var undoIndex = model.get('_page.doc.undoIndex');
            var cmd =  model.get('_page.doc.history.'+ (undoIndex+1));

            var cmdStr = cmd.opName + " " + cmd.opTarget;
            if(cmd.opAttr != null)
                cmdStr += " " + cmd.opAttr;
          //  if(cmd.elId != null)
            //    cmdStr += " " + cmd.elId;

            return cmdStr;
        },
        isUndoPossible: function(){
            return(model.get('_page.doc.undoIndex') > 0)
        },
        isRedoPossible: function(){
            return(model.get('_page.doc.undoIndex') + 1 < model.get('_page.doc.history').length)
        },

        doCommand: function(type){
            var undoInd = model.get('_page.doc.undoIndex');
            var cmd;
            var cmdVal;
            if(type == "undo") {
                cmd = model.get('_page.doc.history.' + undoInd); // cmd: opName, opTarget, opAttr, elId, param
                cmdVal = cmd.prevParam;
            }
            else {
                cmd = model.get('_page.doc.history.' + (undoInd + 1)); // cmd: opName, opTarget, opAttr, elId, param
                cmdVal = cmd.param;
            }

            if(cmd.opName == "set data") {
                if (cmd.opTarget == "element" && cmd.elType == "node")
                    this.updateModelElData(cmd.elId, true, cmdVal, cmd.opAttr, null);  //user is null to enable updating in the editor
                else if (cmd.opTarget == "element" && cmd.elType == "edge")
                    this.updateModelElData(cmd.elId, false, cmdVal, cmd.opAttr, null);  //user is null to enable updating in the editor
            }

            else if(cmd.opName == "set style") {
                if (cmd.opTarget == "element" && cmd.elType == "node")
                    this.updateModelElStyle(cmd.elId, true, cmdVal, cmd.opAttr, null);  //user is null to enable updating in the editor
                else if (cmd.opTarget == "element" && cmd.elType == "edge")
                    this.updateModelElStyle(cmd.elId, false, cmdVal, cmd.opAttr, null);  //user is null to enable updating in the editor
            }
            else if(cmd.opName == "move")
                this.updateModelNodePosition(cmd.elId, cmd.prevParam, null);  //user is null to enable updating in the editor
            else if(cmd.opName == "highlight" || cmd.opName == "highlight" || cmd.opName == "hide" || cmd.opName == "show") {
                if (cmd.opTarget == "element" && cmd.elType == "node")
                    this.updateModelElClasses(cmd.elId, true, cmdVal, cmd.opAttr, null);  //user is null to enable updating in the editor
                else if (cmd.opTarget == "element" && cmd.elType == "edge")
                    this.updateModelElClasses(cmd.elId, false, cmdVal, cmd.opAttr, null);  //user is null to enable updating in the editor
            }


/*

            else if(cmd.opName == "add"){
                if(cmd.opTarget == "element" && cmd.elType == "node")
                    this.deleteModelNode(cmd.elId);
                else if(cmd.opTarget == "element" && cmd.elType == "edge")
                    this.deleteModelEdge(cmd.elId);
                else if(cmd.opTarget == "compound")
                    this.removeModelCompound(cmd.elId, cmd.param.childrenList, cmd.prevParam);
            }
            else if(cmd.opName == "delete"){
                if(cmd.opTarget == "element")
                    this.restoreModelElement(cmd.elType, cmd.elId, cmdVal);
                else if(cmd.opTarget == "element group")
                    this.restoreModelElementGroup(cmd.elId, cmdVal);
                else if(cmd.opTarget == "compound")
                        this.addModelCompound(cmd.elId, cmd.prevParam.compoundAtts, cmd.prevParam.childrenList, cmd.param);
                        }
*/


            if(type == "undo")
                undoInd = undoInd > 0 ? undoInd - 1 : 0;
            else
                undoInd = undoInd <  model.get('_page.doc.history').length -1 ? undoInd + 1  : model.get('_page.doc.history').length -1;

            model.set('_page.doc.undoIndex', undoInd);

        },

        redoCommand: function(){
            var undoInd = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + (undoInd+ 1)); // cmd: opName, opTarget, opAttr, elId, param

            if(cmd.opName == "set"){
                if(cmd.opTarget == "element" && cmd.elType == "node")
                    this.changeModelNodeAttribute(cmd.opAttr,cmd.elId, cmd.param, null); //user is null to enable updating in the editor
                else if(cmd.opTarget == "element" && cmd.elType == "edge")
                    this.changeModelEdgeAttribute(cmd.opAttr,cmd.elId, cmd.param, null);
                else if(cmd.opTarget == "element group") {
                    this.changeModelElementGroupAttribute(cmd.opAttr, cmd.elId, cmd.param);

                }


            }
            else if(cmd.opName == "add"){
                if(cmd.opTarget == "element")
                    this.restoreModelElement(cmd.elType, cmd.elId, cmd.param, null);
                else if(cmd.opTarget == "compound")
                    this.addModelCompound(cmd.elId, cmd.param.compoundAtts, cmd.param.childrenList, cmd.param);


            }
            else if(cmd.opName == "delete"){
                if(cmd.opTarget == "element" && cmd.elType == "node")
                    this.deleteModelNode(cmd.elId);
                else if(cmd.opTarget == "element" && cmd.elType == "edge")
                    this.deleteModelEdge(cmd.elId);
                else if(cmd.opTarget == "element group")
                    this.deleteModelElementGroup(cmd.elId);
                else if(cmd.opTarget == "compound")
                    this.removeModelCompound(cmd.elId, cmd.param.childrenList, cmd.param);


            }

            undoInd = undoInd <  model.get('_page.doc.history').length -1 ? undoInd + 1  : model.get('_page.doc.history').length -1;

            model.set('_page.doc.undoIndex', undoInd);

        },


        getModelNode: function(id){
            var nodePath = model.at('_page.doc.cy.nodes.'  + id);
            return nodePath.get();
        },

        getModelEdge: function(id){

            var edgePath = model.at('_page.doc.cy.edges.'  + id);

            return edgePath.get();
        },

        selectModelNode: function(node, noHistUpdate){

            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());
            if(nodePath.get() == null)
                return "Node id not found";
            if(user)
                nodePath.set('highlightColor' , user.get('colorCode'));


            return "success";

        },


        selectModelEdge: function(edge, noHistUpdate){
            var user = model.at('users.' + userId);
            var edgePath = model.at('_page.doc.cy.edges.'  +edge.id());
            if(edgePath.get() == null)
                return "Edge id not found";
            if( user) {
                edgePath.set('highlightColor', user.get('colorCode'));


            }

            return "success";

        },
        unselectModelNode: function(node, noHistUpdate){

            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());

            if(nodePath.get() == null)
                return "Node id not found";

            nodePath.set('highlightColor' , null);

            return "success";

        },




        unselectModelEdge: function(edge, noHistUpdate){

            var edgePath = model.at('_page.doc.cy.edges.'  +edge.id());
            if(edgePath.get() == null)
                return "Edge id not found";

            edgePath.set('highlightColor', null);

            return "success";


        },

        getSelectedModelNodes: function(){
            var nodes = model.get('_page.doc.cy.nodes');
            var selectedNodes = [];

           for(var att in nodes) {
               if (nodes.hasOwnProperty(att)) {
                   var node = nodes[att];
                   if (node.highlightColor != null) //could be selected by anyone
                       selectedNodes.push(node);
               }
           }

            return selectedNodes;
        },

        addModelNode: function(nodeId,  param, user, noHistUpdate){


            if(model.get("_page.doc.cy.nodes." + nodeId + '.id') != null)
                return "Node cannot be duplicated";
            //
             model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.id', nodeId);
            // model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.position', {x: param.x, y: param.y});
            // model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnclass', param.sbgnclass);
            //

            //adding the node in cytoscape
            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId+'.addedLater', {x: param.x, y: param.y, sbgnclass: param.sbgnclass});



            if(!noHistUpdate)
                //We don't want all the attributes of the param to be printed
                this.updateHistory({opName:'add',opTarget:'element', elType:'node', elId: nodeId, param:{x: param.x, y: param.y, sbgnclass: param.sbgnclass}});



            return "success";

        },

        addModelEdge: function(edgeId, param, user, noHistUpdate){

            if(model.get("_page.doc.cy.edges." + edgeId + '.id') != null)
                return "Edge cannot be duplicated";

            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.id', edgeId);

            //adding the edge...other operations should be called after this
            model.pass({user:user}).set('_page.doc.cy.edges.' +edgeId+'.addedLater', { source: param.source, target: param.target, sbgnclass: param.sbgnclass});



            if(!noHistUpdate)
                this.updateHistory({opName:'add',opTarget:'element', elType:'edge', elId: edgeId, param:param});

            return "success";

        },

        //change children's parents to their old parents
        removeModelCompound: function(compoundId, childrenList, prevParentList, user, noHistUpdate){

            var nodePath = model.at('_page.doc.cy.nodes.'  + compoundId);
            var compoundAtts = {id: compoundId, sbgnclass: nodePath.get('sbgnclass'), x: nodePath.get('position.x'), y: nodePath.get('position.y'), width: nodePath.get('width'), height: nodePath.get('height')};

            //isolate the compound first, then delete
            this.changeModelElementGroupAttribute("parent", childrenList, prevParentList, null, true);
            this.deleteModelNode(compoundId, user, true);



            if(!noHistUpdate)
                this.updateHistory({opName:'delete',opTarget:'compound', elId: compoundId, prevParam:{childrenList: childrenList, compoundAtts: compoundAtts}, param:prevParentList});

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
        addModelCompound: function(compoundId, compoundAtts, childrenList, prevParentList, user, noHistUpdate){

            this.addModelNode(compoundId, compoundAtts, user, true);


            this.changeModelNodeAttribute('width', compoundId, compoundAtts.width, user, true);
            this.changeModelNodeAttribute('height', compoundId, compoundAtts.height, user, true );


            var parentList = [];
            var nodeIds = [];
            childrenList.forEach(function(el){
                nodeIds.push(el.id);
                parentList.push(compoundId);
            });


            this.changeModelElementGroupAttribute("parent", childrenList, parentList, user, true);




            if(!noHistUpdate)
                this.updateHistory({opName:'add',opTarget:'compound', elId: compoundId, param:{childrenList: childrenList, compoundAtts: compoundAtts}, prevParam:prevParentList});

        },


        //attStr: attribute namein the model
        //historyData is for  sbgnStatesAndInfos only
        changeModelElementGroupAttribute: function(attStr, elList, paramList,  user, noHistUpdate) { //historyData){

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
            elList.forEach(function(el){
                var currAttVal = paramList[ind++];

                if(el.isNode)
                    self.changeModelNodeAttribute(attStr, el.id, currAttVal, null, true); //don't update individual histories
                else
                    self.changeModelEdgeAttribute(attStr, el.id, currAttVal, null, true);

            });

            return "success";

        },
        //attStr: attribute namein the model
        //historyData is for  sbgnStatesAndInfos only
        changeModelNodeAttribute: function(attStr, nodeId, attVal,  user, noHistUpdate){ //historyData){

            var status = "Node id not found";
            var nodePath = model.at('_page.doc.cy.nodes.'  + nodeId);


            var prevAttVal = nodePath.get(attStr);


            nodePath.pass({user:user}).set(attStr,attVal);


            if(attStr == "expandCollapseStatus") {
                if (attVal == "expand")
                    prevAttVal = "collapse";
                if (attVal == "collapse")
                    prevAttVal = "expand";
            }


            if(!noHistUpdate) {

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

            status = "success";


            return status;

        },
        changeModelEdgeAttribute: function(attStr, edgeId, attVal,  user, noHistUpdate){
            var status = "Edge id not found";
            var edgePath = model.at('_page.doc.cy.edges.'  + edgeId);
            var prevAttVal = edgePath.get(attStr);
            edgePath.pass({user:user}).set(attStr, attVal);


                if(!noHistUpdate) {

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
        deleteModelNode: function(nodeId, user, noHistUpdate){
            var nodePath = model.at('_page.doc.cy.nodes.'  + nodeId);

            if(nodePath.get() == null)
                return "Node id not found";

            if(!noHistUpdate){
                var prevParam = model.get('_page.doc.nodes.' + nodeId);
                this.updateHistory({opName:'delete',opTarget:'element', elType:'node', elId: nodeId, prevParam: prevParam});
            }

            model.pass({user: user}).del(('_page.doc.cy.nodes.' + nodeId));

            return "success";

        },


        deleteModelEdge: function(edgeId, user, noHistUpdate){

            var edgePath = model.at('_page.doc.cy.edges.'  + edgeId);

            if(edgePath.get() == null)
                return "Edge id not found";

            if(!noHistUpdate){
                var prevParam = model.get('_page.doc.edges.' + edgeId);
                this.updateHistory({opName:'delete',opTarget:'element', elType:'node', elId: edgeId, prevParam: prevParam});
            }

            model.pass({user: user}).del(('_page.doc.cy.edges.' + edgeId));


            return "success";

        },


        deleteModelElementGroup: function(selectedEles, user, noHistUpdate){
            var self = this;
            var prevNodes = [];
            var prevEdges = [];


            selectedEles.forEach(function(el){ //edges first
                if (el.isEdge()){

                    var prevEdge = model.get('_page.doc.cy.edges.' + el.id());

                    prevEdges.push(prevEdge);
                    self.deleteModelEdge(el.id());
                }
            });

            selectedEles.forEach(function(el){
                if (el.isNode()){

                    var prevNode = model.get('_page.doc.cy.nodes.' + el.id());

                    prevNodes.push(prevNode);
                    self.deleteModelNode(el.id());
                }
            });


            if(!noHistUpdate)
                this.updateHistory({opName:'delete',opTarget:'element group',  elId: null, prevParam: {nodes: prevNodes, edges: prevEdges}});


        },

        restoreModelElementGroup: function(elList, param, user, noHistUpdate){
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
            };


            if(!noHistUpdate)
                self.updateHistory({opName:'restore', opTarget:'element group', elId:elList});
        },
        /**
         * Restore operations for global undo/redo
         */
        restoreModelNode: function(nodeId, param, user, noHistUpdate){

            this.addModelNode(nodeId, param, user, noHistUpdate);


            this.changeModelNodeAttribute('ports', nodeId,param.ports,user, noHistUpdate );
            this.changeModelNodeAttribute('highlightColor', nodeId,param.highlightColor,user, noHistUpdate );
            this.changeModelNodeAttribute('sbgnclass', nodeId,param.sbgnclass,user, noHistUpdate );
            this.changeModelNodeAttribute('width', nodeId,param.width,user, noHistUpdate );
            this.changeModelNodeAttribute('height', nodeId,param.height,user , noHistUpdate);
            this.changeModelNodeAttribute('sbgnlabel', nodeId,param.sbgnlabel,user, noHistUpdate );
            this.changeModelNodeAttribute('backgroundColor', nodeId,param.backgroundColor,user, noHistUpdate );
            this.changeModelNodeAttribute('borderColor', nodeId,param.borderColor,user , noHistUpdate);
            this.changeModelNodeAttribute('borderWidth', nodeId,param.borderWidth,user , noHistUpdate);
            this.changeModelNodeAttribute('sbgnStatesAndInfos', nodeId, param.sbgnStatesAndInfos,user, noHistUpdate );
            this.changeModelNodeAttribute('parent', nodeId,param.parent,user, noHistUpdate );
            this.changeModelNodeAttribute('isCloneMarker', nodeId,param.isCloneMarker,user , noHistUpdate);
            this.changeModelNodeAttribute('isMultimer', nodeId, param.isMultimer,user, noHistUpdate );

            if(!noHistUpdate)
                this.updateHistory({opName:'restore', opTarget:'element', elType:'node',  elId:nodeId});
        },

        restoreModelEdge: function(edgeId, param, user, noHistUpdate){

            this.addModelEdge(edgeId, param, user, noHistUpdate);


            this.changeModelEdgeAttribute('lineColor', edgeId,param.lineColor,user, noHistUpdate );
            this.changeModelEdgeAttribute('width', edgeId,param.width,user, noHistUpdate );
            this.changeModelEdgeAttribute('sbgncardinality', edgeId,param.sbgncardinality,user , noHistUpdate);
            this.changeModelEdgeAttribute('portsource', edgeId,param.portsource,user , noHistUpdate);
            this.changeModelEdgeAttribute('porttarget', edgeId,param.porttarget,user , noHistUpdate);
            this.changeModelEdgeAttribute('bendPointPositions', edgeId,param.bendPointPositions,user , noHistUpdate);
            this.changeModelEdgeAttribute('highlightColor', edgeId,param.highlightColor,user, noHistUpdate );


            if(!noHistUpdate)
                this.updateHistory({opName:'restore', opTarget:'element', elType:'edge',  elId:edgeId});
        },


        restoreModelElement: function(elType, elId, param, user, noHistUpdate){

            if(elType == "node")
                this.restoreModelNode(elId, param, user, noHistUpdate);
            else
                this.restoreModelEdge(elId, param, user, noHistUpdate);


        },


        //should be called before loading a new graph to prevent id confusion
        deleteAll: function(nodes, edges , user, noHistUpdate){

            var self = this;
            if(!noHistUpdate)
                this.updateHistory({opName:'new', opTarget:'model'});


            edges.forEach(function(edge){
                self.deleteModelEdge(edge.id(), user, noHistUpdate);
            });

            nodes.forEach(function(node){
                self.deleteModelNode(node.id(), user, noHistUpdate);
            });


        },

        //convert model to json structure
        getJsonFromModel: function(){

            var nodes = model.get('_page.doc.cy.nodes');


            if(nodes == null)
                return null;

            var edges = model.get('_page.doc.cy.edges');

            var jsonNodes = [];
            var jsonEdges = [];



            for(var att in nodes){


                if(nodes.hasOwnProperty(att)) {
                    var node = nodes[att];
                    var circularData = CircularJSON.parse(node.data);

                    var jsonNode = {
                        data: {
                            backgroundOpacity: circularData.backgroundOpacity,
                            borderColor: circularData.borderColor,
                            id: circularData.id,
                            parent: circularData.parent,
                            ports: circularData.ports,
                            sbgnbbox: circularData.sbgnbbox,
                            sbgnclass: circularData.sbgnclass,
                            sbgnclonemarker: circularData.isCloneMarker,
                            sbgnlabel: circularData.sbgnlabel,
                            sbgnstatesandinfos: circularData.sbgnstatesandinfos,
                            height: circularData.height,
                            width: circularData.width
                        }
                    };

                    jsonNodes.push(jsonNode);
                }
            };


            for(var att in edges) {
                if (edges.hasOwnProperty(att)) {
                    var edge = edges[att];
                    var circularData = CircularJSON.parse(edge.data);
                    var jsonEdge = {
                        data: {
                            bendPointPositions: circularData.bendPointPositions,
                            id: circularData.id,
                            lineColor: circularData.lineColor,
                            portsource: circularData.portsource,
                            porttarget: circularData.porttarget,
                            source: circularData.source,
                            target: circularData.target,
                            sbgncardinality: circularData.sbgncardinality,
                            sbgnclass: circularData.sbgnclass,
                            parent: circularData.parent
                        }
                    };

                    jsonEdges.push(jsonEdge);
                }
            }


            return{nodes:jsonNodes, edges:jsonEdges};
        },



        initModelNode: function(node, user, noHistUpdate){
            var nodePath = model.at('_page.doc.cy.nodes.' + node.id());

            if(!noHistUpdate)
                this.updateHistory({opName:'init', opTarget:'element', elType:'node', elId: node.id()});


            nodePath.set('id', node.id());
            this.updateModelElData(node.id(), true,CircularJSON.stringify(node._private.data), "all", "me");
            this.updateModelElStyle(node.id(), true, CircularJSON.stringify(node._private.style), "all", "me");

        },
        initModelEdge: function(edge, user, noHistUpdate){
            edge.addClass('changeLineColor');



            var edgePath = model.at('_page.doc.cy.edges.' + edge.id());


            if(!noHistUpdate)
                this.updateHistory({opName:'init', opTarget: 'element', elType:'edge', elId: edge.id()});


            edgePath.set('id', edge.id());
            this.updateModelElData(edge.id(),false, CircularJSON.stringify(edge._private.data), "all", "me");
            this.updateModelElStyle(edge.id(), false, CircularJSON.stringify(edge._private.style), "all", "me");


        },

        //nodes and edges are cytoscape objects. they have css and data properties
        initModel: function(jsonObj, nodes, edges, user, noHistUpdate){

            var elIds = "";
            var elTypes = [];


            jsonObj.nodes.forEach(function(node){
                //do not set id here: it means node addition
                model.pass({user:user}).set('_page.doc.cy.nodes.' + node.data.id + '.position', {x: node.data.sbgnbbox.x, y: node.data.sbgnbbox.y}); //initialize position

              //  model.pass({user:user}).set('_page.doc.cy.nodes.' + node.data.id + '.id', node.data.id);
                elIds += node.data.id + " ";
                elTypes.push("node");

            });


            jsonObj.edges.forEach(function(edge){
            //    model.pass({user:user}).set('_page.doc.cy.edges.' + edge.data.id + '.source', edge.data.source); //initialize position
                elIds += edge.data.id + " ";
                elTypes.push("edge");
            });

            var self = this;


            if(!noHistUpdate){
                this.updateHistory({opName:'init',  opTarget:'model'});
            }



            nodes.forEach(function (node) {
                self.initModelNode(node, user, true);

            });

            edges.forEach(function (edge) {
                self.initModelEdge(edge, user, true);
            });




        },

        updateModelElData: function(id, isNode, data, dataType, user){


            var prevData;

            if(isNode) {
                prevData = model.get('_page.doc.cy.nodes.' + id + '.data');
                model.pass({user: user}).set('_page.doc.cy.nodes.' + id + '.data', data);
            }
            else {
                prevData = model.get('_page.doc.cy.edges.' + id + '.data');
                model.pass({user: user}).set('_page.doc.cy.edges.' + id + '.data', data);
            }


            this.updateHistory({
                opName: 'set data',
                opTarget: 'element',
                elType: isNode?'node':'edge',
                elId: id,
                opAttr: dataType,
                param: data,
                prevParam: prevData
            });



        },

        updateModelElStyle: function(id,isNode, style, dataType, user){
            var prevStyle;

            if(isNode) {
                prevStyle = model.get('_page.doc.cy.nodes.' + id + '.style');
                model.pass({user: user}).set('_page.doc.cy.nodes.' + id + '.style', style);
                if(dataType == "background-color" || dataType == "all") {
                    var jsonStyle = CircularJSON.parse(style);
                    model.set('_page.doc.cy.nodes.' + id + '.backgroundColor', jsonStyle["background-color"].strValue); //update background color for selection
                }

            }
            else {
                prevStyle = model.get('_page.doc.cy.edges.' + id + '.style');
                model.pass({user: user}).set('_page.doc.cy.edges.' + id + '.style', style);

            }



            this.updateHistory({
                opName: 'set style',
                opTarget: 'element',
                elType: isNode?'node':'edge',
                elId: id,
                opAttr: dataType,
                param: style,
                prevParam: prevStyle
            });



        },

        updateModelElClasses: function(id, isNode, classes, opName, user){
            var prevClasses;


            if(isNode) {
                prevClasses =  model.get('_page.doc.cy.nodes.' + id + '.classes');
                model.pass({user: user}).set('_page.doc.cy.nodes.' + id + '.classes', classes);
            }
            else {
                prevClasses =  model.get('_page.doc.cy.edges.' + id + '.classes');
                model.pass({user: user}).set('_page.doc.cy.edges.' + id + '.classes', classes);
            }

            this.updateHistory({
                opName: opName,
                opTarget: 'element',
                elType: isNode?'node':'edge',
                elId: id,
                opAttr: null,
                param: classes,
                prevParam: prevClasses
            });

        },


        //Can only be node
        updateModelNodePosition: function(id, position, user){


            var prevPosition = model.get('_page.doc.cy.nodes.'+ id + '.position');
            model.pass({user:user}).set('_page.doc.cy.nodes.' + id + '.position',  position);

            this.updateHistory({
                opName: 'move',
                opTarget: 'element',
                elType: 'node',
                elId: id,
                opAttr: null,
                param: position,
                prevParam: prevPosition
            });

        }


    }


}