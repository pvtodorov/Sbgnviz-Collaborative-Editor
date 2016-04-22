/*
 *	Shared model handling operations.
 *  Clients call these commands to update the model
 *	Author: Funda Durupinar Babur<f.durupinar@gmail.com>
 */

function coordinateRound(coordinate, decimals) {

    var newC = {'x': preciseRound(coordinate.x, decimals),'y': preciseRound(coordinate.y, decimals)};
    return newC;
}

function preciseRound(num, decimals) {
    var t=Math.pow(10, decimals);
    return Number((Math.round((num * t) + (decimals>0?1:0)*(Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals));
}

module.exports =  function(model, docId, userId, userName) {



    var user = model.at('users.' + userId);



    model.ref('_page.doc', 'documents.' + docId);

    return{

        getModel: function(){
            return model;
        },

        addImage: function(data, user , noHistUpdate){
            model.pass({user:user}).push('_page.doc.images', data);
            if(!noHistUpdate)
                this.updateHistory('add', 'image', null, null, data.filePath);
        },

        setName: function(userName){

           model.fetch('users', userId, function(err){
               user.set('name', userName);
           });
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
                this.updateHistory('set','layout', null, null, JSON.stringify(currentLayoutProperties));
            return currentLayoutProperties;
        },
        setLayoutProperties: function(layoutProperties, noHistUpdate){
            model.set('_page.doc.layoutProperties', layoutProperties); //synclayout
            if(!noHistUpdate)
                this.updateHistory('set', 'layout', null, null, JSON.stringify(layoutProperties));
        },


        getSampleInd: function(user, noHistUpdate){
            var ind = model.get('_page.doc.sampleInd');
            if(ind == null)
                ind = "0";
            if(!noHistUpdate)
                this.setSampleInd(ind, user, noHistUpdate);

            if(!noHistUpdate) {
                if (ind == -1)
                    this.updateHistory('load', 'model');
                else
                    this.updateHistory('open', 'sample', ind);
            }
            return ind;

        },
        setSampleInd: function(ind, user, noHistUpdate){
            model.pass({user:user}).set('_page.doc.sampleInd', ind);

            if(!noHistUpdate) {
                if (ind == -1)
                    this.updateHistory('load', 'model');
                else
                    this.updateHistory('open', 'sample', ind);
            }
        },

        // opNAme: set, load, open, add, select, unselect
        // opTarget: node, edge, model, sample
        // opAttr: highlightColor, lineColor, borderColor etc.
        updateHistory: function(opName, opTarget,  elId, opAttr,param, prevParam){
            var command = {userName: userName, date: new Date, opName: opName, opTarget: opTarget, opAttr: opAttr, elId: elId, param: param, prevParam: prevParam};
            // if(param != "") {
            //
            //     if (param == Number(param)) {
            //         param = preciseRound(param, 3);
            //     }
            //     else {
            //         for (var att in param) {
            //             if (param[att] === Number(param[att]))
            //                 param[att] = preciseRound(param[att], 3);
            //         }
            //     }
            // }
            //
            // command.param = param;


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
            if(cmd.elId != null)
                cmdStr += " " + cmd.elId;

            return cmdStr;

        },

        getRedoActionStr: function(){
            var undoIndex = model.get('_page.doc.undoIndex');
            var cmd =  model.get('_page.doc.history.'+ (undoIndex+1));

            var cmdStr = cmd.opName + " " + cmd.opTarget;
            if(cmd.opAttr != null)
                cmdStr += " " + cmd.opAttr;
            if(cmd.elId != null)
                cmdStr += " " + cmd.elId;

            return cmdStr;
        },
        isUndoPossible: function(){
            return(model.get('_page.doc.undoIndex') > 0)
        },
        isRedoPossible: function(){
            return(model.get('_page.doc.undoIndex') + 1 < model.get('_page.doc.history').length)
        },

        redoCommand: function(){
            var undoInd = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + (undoInd+ 1)); // cmd: opName, opTarget, opAttr, elId, param

            if(cmd.opName == "set"){
                if(cmd.opTarget == "node")
                    this.changeModelNodeAttribute(cmd.opAttr,cmd.elId, cmd.param, null); //user is null to enable updating in the editor
                else if(cmd.opTarget == "edge")
                    this.changeModelEdgeAttribute(cmd.opAttr,cmd.elId, cmd.param, null);

                else if(cmd.opTarget == "node group") {
                    for (var i = 0; i < cmd.elId.length; i++)
                        this.changeModelNodeAttribute(cmd.opAttr,cmd.elId[i], cmd.param, null); //assuming that all the changed attribute values are the same
                }
                else if(cmd.opTarget == "edge group"){
                    for(var i = 0; i < cmd.elId.length; i++)
                        this.changeModelEdgeAttribute(cmd.opAttr,cmd.elId[i], cmd.param, null);//assuming that all the changed attribute values are the same

                }

            }
            else if(cmd.opName == "add"){
                if(cmd.opTarget == "node")
                    this.restoreModelNodeGlobal(cmd.elId, cmd.param, null);
                else if(cmd.opTarget == "edge")
                    this.restoreModelEdgeGlobal(cmd.elId, cmd.param, null);
            }
            else if(cmd.opName == "delete"){
                if(cmd.opTarget == "node")
                    this.deleteModelNode(cmd.elId, null);
                else if(cmd.opTarget == "edge")
                    this.deleteModelEdge(cmd.elId, null);

                else if(cmd.opTarget == "node group"){
                    for(var i = 0; i < cmd.elId.length; i++)
                        this.deleteModelNode(cmd.elId[i], null);
                }
                else if(cmd.opTarget == "edge group"){
                    for(var i = 0; i < cmd.elId.length; i++)
                        this.deleteModelEdge(cmd.elId[i], null);

                }
            }

            undoInd = undoInd <  model.get('_page.doc.history').length -1 ? undoInd + 1  : model.get('_page.doc.history').length -1;

            model.set('_page.doc.undoIndex', undoInd);

        },

        undoCommand: function(){
            var undoInd = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + undoInd); // cmd: opName, opTarget, opAttr, elId, param

            if(cmd.opName == "set"){
                if(cmd.opTarget == "node")
                    this.changeModelNodeAttribute(cmd.opAttr,cmd.elId, cmd.prevParam, null); //user is null to enable updating in the editor
                else if(cmd.opTarget == "edge")
                    this.changeModelEdgeAttribute(cmd.opAttr,cmd.elId, cmd.prevParam, null);

                else if(cmd.opTarget == "node group") {
                    for (var i = 0; i < cmd.elId.length; i++)
                        this.changeModelNodeAttribute(cmd.opAttr,cmd.elId[i], cmd.prevParam, null); //assuming that all the changed attribute values are the same
                }
                else if(cmd.opTarget == "edge group"){
                    for(var i = 0; i < cmd.elId.length; i++)
                        this.changeModelEdgeAttribute(cmd.opAttr,cmd.elId[i], cmd.prevParam, null);//assuming that all the changed attribute values are the same

                }

            }
            else if(cmd.opName == "add"){
                if(cmd.opTarget == "node")
                    this.deleteModelNode(cmd.elId, null);
                else if(cmd.opTarget == "edge")
                    this.deleteModelEdge(cmd.elId, null);
            }
            else if(cmd.opName == "delete"){
                if(cmd.opTarget == "node")
                    this.restoreModelNodeGlobal(cmd.elId, cmd.prevParam, null);
                else if(cmd.opTarget == "edge")
                    this.restoreModelEdgeGlobal(cmd.elId, cmd.prevParam, null);
                else if(cmd.opTarget == "node group"){
                    for(var i = 0; i < cmd.elId.length; i++) {
                        this.restoreModelNodeGlobal(cmd.elId[i], cmd.prevParam[i], null);
                    }

                    //change children after adding them all
                    for(var i = 0; i < cmd.elId.length; i++)
                        this.changeModelNodeAttribute('children', cmd.elId[i], cmd.prevParam[i].children, null);

                }
                else if(cmd.opTarget == "edge group"){
                    for(var i = 0; i < cmd.elId.length; i++)
                        this.restoreModelEdgeGlobal(cmd.elId[i], cmd.prevParam[i], null);

                }
            }


            undoInd = undoInd > 0 ? undoInd - 1 : 0;
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

            var status = "Node id not found";
            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());
            //if(nodePath.get('id') && user){
            if( user){
                nodePath.set('highlightColor' , user.get('colorCode'));

                status = "success";
            }


            if(!noHistUpdate)
                this.updateHistory('select','node',  node.id());
            return status;

        },

        selectModelEdge: function(edge, noHistUpdate){
            var status = "Edge id not found";
            var user = model.at('users.' + userId);
            var edgePath = model.at('_page.doc.cy.edges.'  +edge.id());
            //if(edgePath.get('id') && user) {
            if( user) {
                edgePath.set('highlightColor', user.get('colorCode'));
                status = "success";

                if(!noHistUpdate)
                    this.updateHistory('select', 'edge',  edge.id());

            }

            return status;


        },
        unselectModelNode: function(node, noHistUpdate){
            var status = "Node id not found";
            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());


            nodePath.set('highlightColor' , null);
            status = "success";

            if(!noHistUpdate)
                this.updateHistory('unselect', 'node',  node.id());

            return status;

        },




        unselectModelEdge: function(edge, noHistUpdate){
            var status = "Edge id not found";
            var edgePath = model.at('_page.doc.cy.edges.'  +edge.id());
            edgePath.set('highlightColor', null);
            status = "success";

            if(!noHistUpdate)
                this.updateHistory('unselect', 'edge',  edge.id());


            return status;


        },

        addModelNode: function(nodeId,  param, user, noHistUpdate){


            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.id', nodeId);
            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.position', {x: param.x, y: param.y});
            model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnclass', param.sbgnclass);
            model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnlabel', param.sbgnlabel);

            //adding the node...other operations should be called after this
            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId+'.addedLater', true);


            if(!noHistUpdate)
                //We don't want all the attributes of the param to be printed
                this.updateHistory('add', 'node', nodeId, null,  {x:param.x, y: param.y, sbgnclass: param.sbgnclass});

            return "success";

        },

        addModelEdge: function(edgeId, param, user, noHistUpdate){


            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.id', param.id);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.sbgnclass', param.sbgnclass);

            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.source', param.source);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.target', param.target);

            //adding the edge...other operations should be called after this
            model.pass({user:user}).set('_page.doc.cy.edges.' +edgeId+'.addedLater', true);



            if(!noHistUpdate)
                this.updateHistory('add', 'edge', edgeId, null, param);

            return "success";

        },

        //attStr: attribute namein the model
        //historyData is for  sbgnStatesAndInfos only
        changeModelNodeAttribute: function(attStr, nodeId, attVal,  user, noHistUpdate){ //historyData){

            var status = "Node id not found";
            var nodePath = model.at('_page.doc.cy.nodes.'  + nodeId);

          //  if(nodePath.get('id')){
                var prevAttVal = nodePath.get(attStr);

                nodePath.pass({user:user}).set(attStr,attVal);

                if(!noHistUpdate)
                    this.updateHistory('set', 'node', nodeId, attStr,  attVal, prevAttVal);

                //
                // if(historyData == null) //historydata is about statesAndInfos
                //     this.updateHistory('set', 'node', nodeId, attStr,  attVal, prevAttVal);
                // else
                //     this.updateHistory('set', 'node',  nodeId, attStr,   prevAttVal, historyData);


                status = "success";
          //  }


            return status;

        },
        changeModelEdgeAttribute: function(attStr, edgeId, attVal,  user, noHistUpdate){
            var status = "Edge id not found";
            var edgePath = model.at('_page.doc.cy.edges.'  + edgeId);
         //   if(edgePath.get('id')){

                var prevAttVal = edgePath.get(attStr);
                edgePath.pass({user:user}).set(attStr, attVal);

                if(!noHistUpdate)
                    this.updateHistory("set", "edge" , edgeId, attStr,  attVal, prevAttVal);

                status = "success";
         //   }



            return status;
        },

        //willUpdateHistory: Depending on the parent command, history will be updated or not
        deleteModelNode: function(nodeId, user, noHistUpdate){
            var status = "Node id not found";
            var nodePath = model.at('_page.doc.cy.nodes.'  + nodeId);
        //    if(nodePath.get('id')) {

                if(!noHistUpdate){
                    var pos = nodePath.get('position');
                    var sbgnclass = nodePath.get('sbgnclass');
                    var borderColor = nodePath.get('borderColor');
                    var borderWidth = nodePath.get('borderWidth');
                    var backgroundColor = nodePath.get('backgroundColor');
                    var width = nodePath.get('width');
                    var height = nodePath.get('height');
                    var parent = nodePath.get('parent');
                    var sbgnlabel = nodePath.get('sbgnlabel');
                    var isCloneMarker = nodePath.get('isCloneMarker');
                    var isMultimer = nodePath.get('isMultimer');
                    var sbgnStatesAndInfos = nodePath.get('sbgnStatesAndInfos');
                    var children = nodePath.get('children');


                    prevParam = {x: pos.x , y: pos.y , sbgnclass:sbgnclass, width: width, height: height,
                                 borderColor: borderColor, borderWidth: borderWidth, sbgnlabel: sbgnlabel,
                                 sbgnStatesAndInfos:sbgnStatesAndInfos, parent:parent, isCloneMarker: isCloneMarker,
                                 isMultimer: isMultimer, children: children};


                    this.updateHistory('delete', 'node',   nodeId, null, null, prevParam);
                }

                model.pass({user: user}).del(('_page.doc.cy.nodes.' + nodeId));

                status = "success";
        //    }

            return status;

        },


        deleteModelEdge: function(edgeId, user, noHistUpdate){

            var status = "Edge id not found";
            var edgePath = model.at('_page.doc.cy.edges.'  + edgeId);

          //  if(edgePath.get('id')) {


                if(!noHistUpdate) {
                    var source = edgePath.get('source');
                    var target = edgePath.get('target');
                    var sbgnClass = edgePath.get('sbgnclass');
                    var lineColor = edgePath.get('lineColor');
                    var lineWidth = edgePath.get('lineWidth');
                    var sbgncardinality = edgePath.get('sbgncardinality');
                    prevParam = {source: source , target:target , sbgnclass:sbgnClass, lineColor: lineColor,
                    lineWidth: lineWidth, sbgncardinality: sbgncardinality};



                    this.updateHistory('delete', 'edge',   edgeId, null, null, prevParam);
                }

                model.pass({user:user}).del(('_page.doc.cy.edges.'  + edgeId));
                status = "success";
         //   }

            return status;

        },



    deleteModelNodes: function(selectedNodes,user, noHistUpdate){
            var self = this;
            var nodeIds = [];
            var prevParams = [];

            if(selectedNodes != null){
                selectedNodes.forEach(function(node){
                    nodeIds.push(node.id());
                    var nodePath = model.at('_page.doc.cy.nodes.'  + node.id());


                    var pos = nodePath.get('position');
                    var sbgnclass = nodePath.get('sbgnclass');


                    var borderColor = nodePath.get('borderColor');
                    var borderWidth = nodePath.get('borderWidth');
                    var backgroundColor = nodePath.get('backgroundColor');
                    var width = nodePath.get('width');
                    var height = nodePath.get('height');
                    var parent = nodePath.get('parent');
                    var sbgnlabel = nodePath.get('sbgnlabel');
                    var isCloneMarker = nodePath.get('isCloneMarker');
                    var isMultimer = nodePath.get('isMultimer');
                    var sbgnStatesAndInfos = nodePath.get('sbgnStatesAndInfos');

                    prevParams.push({x: pos.x , y: pos.y , sbgnclass:sbgnclass, width: width, height: height,
                        borderColor: borderColor, borderWidth: borderWidth, sbgnlabel: sbgnlabel,
                        sbgnStatesAndInfos:sbgnStatesAndInfos, parent:parent, isCloneMarker: isCloneMarker,
                        isMultimer: isMultimer} );

                });

                if(!noHistUpdate)
                    this.updateHistory('delete', 'node group',  nodeIds, null, null, prevParams);

                selectedNodes.forEach(function(node){
                    self.deleteModelNode(node.id(),user, true); //no history update for child commands
                });

            }

        },

        deleteModelEdges: function(selectedEdges, user, noHistUpdate){
            var self = this;
            var edgeIds = [];
            var prevParams = [];

            if(selectedEdges != null) {

                selectedEdges.forEach(function(edge){
                    edgeIds.push(edge.id());

                    var edgePath = model.at('_page.doc.cy.edges.' + edge.id());

                    var source = edgePath.get('source');
                    var target = edgePath.get('target');
                    var sbgnclass = edgePath.get('sbgnclass');
                    var lineColor = edgePath.get('lineColor');
                    var lineWidth = edgePath.get('lineWidth');
                    var sbgncardinality = edgePath.get('sbgncardinality');
                    prevParams.push( {source: source , target:target , sbgnclass:sbgnclass, lineColor: lineColor,
                        lineWidth: lineWidth, sbgncardinality: sbgncardinality});

                });

                if(!noHistUpdate)
                    this.updateHistory('delete', 'edge group',  edgeIds, null, null,prevParams);

                selectedEdges.forEach(function(edge){
                    self.deleteModelEdge(edge.id(), user, true); //will not update children history
                });
            }

        },


        /**
         * Restore operations for local undo/redo
         */
        restoreModelNode: function(node, user, noHistUpdate){

            this.changeModelNodeAttribute('sbgnlabel', node.id(),node.data("sbgnlabel"),user, noHistUpdate );
            this.changeModelNodeAttribute('width', node.id(),node._private.data.sbgnbbox.w,user, noHistUpdate );
            this.changeModelNodeAttribute('height', node.id(),node._private.data.sbgnbbox.h,user , noHistUpdate);
            this.changeModelNodeAttribute('backgroundColor', node.id(),node.css("background-color"),user, noHistUpdate );
            this.changeModelNodeAttribute('borderColor', node.id(),node.data("border-color"),user , noHistUpdate);
            this.changeModelNodeAttribute('borderWidth', node.id(),node.css("border-width"),user , noHistUpdate);
            this.changeModelNodeAttribute('sbgnStatesAndInfos', node.id(),node.data("sbgnstatesandinfos"),user, noHistUpdate );
            this.changeModelNodeAttribute('parent', node.id(),node._private.data.parent,user, noHistUpdate );
            this.changeModelNodeAttribute('isCloneMarker', node.id(),node.data("sbgnclonemarker"),user , noHistUpdate);
            this.changeModelNodeAttribute('isMultimer', node.id(),(node.data("sbgnclass").indexOf(' multimer') > 0),user, noHistUpdate );
        },

        restoreModelEdge: function(edge, user, noHistUpdate){

            this.changeModelEdgeAttribute('lineColor', edge.id(),edge.css('line-color'), user, noHistUpdate);


        },

        restoreModelNodes: function(selectedNodes, user, noHistUpdate){
            var self = this;
            var nodeIds = "";

            if(selectedNodes != null){
                selectedNodes.forEach(function(node){
                    nodeIds += node.id() + " ";
                });

                if(!noHistUpdate)
                    this.updateHistory('restore', 'node group', nodeIds);

                selectedNodes.forEach(function(node){

                    self.addModelNode(node.id(),{
                        x: node.position("x"),
                        y: node.position("y"),
                        sbgnclass: node.data("sbgnclass"),
                    }, user, noHistUpdate);
                    self.restoreModelNode(node,user, noHistUpdate);
                    self.initModelNode(node,user,noHistUpdate);
                    
                });

            }



        },

        restoreModelEdges: function(selectedEdges, user, noHistUpdate){
            var self = this;
            var edgeIds = "";

            if(selectedEdges != null){
                selectedEdges.forEach(function(edge){
                    edgeIds += edge.id() + " ";
                });

                if(!noHistUpdate)
                    this.updateHistory('restore', 'edge group',  edgeIds);

                selectedEdges.forEach(function(edge){
                    self.addModelEdge(edge.id(),{
                        source: edge.data("source"),
                        target: edge.data("target"),
                        sbgnclass: edge.data("sbgnclass"),
                    }, user, noHistUpdate);
                    self.restoreModelEdge(edge,user, noHistUpdate);
                    self.restoreModelEdge(edge,user,noHistUpdate);

                });

            }

        },


        /**
         * Restore operations for global undo/redo
         */
        restoreModelNodeGlobal: function(nodeId, param, user, noHistUpdate){

            this.addModelNode(nodeId, param, user, noHistUpdate);



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
                this.updateHistory('restore', 'node',  nodeId);
        },

        restoreModelEdgeGlobal: function(edgeId, param, user, noHistUpdate){

            this.addModelEdge(edgeId, param, user, noHistUpdate);

            this.changeModelEdgeAttribute('lineColor', edgeId,param.lineColor,user, noHistUpdate );
            this.changeModelEdgeAttribute('lineWidth', edgeId,param.lineWidth,user, noHistUpdate );
            this.changeModelEdgeAttribute('sbgncardinality', edgeId,param.sbgncardinality,user , noHistUpdate);

            if(!noHistUpdate)
                this.updateHistory('restore', 'edge',  edgeId);
        },
        //should be called before loading a new graph to prevent id confusion
        deleteAll: function(nodes, edges , user, noHistUpdate){

            if(!noHistUpdate)
                this.updateHistory('new', 'model');


            this.deleteModelEdges(edges,user, noHistUpdate);
            this.deleteModelNodes(nodes,user, noHistUpdate);


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
                    var jsonNode = {
                        data: {
                            backgroundOpacity: node.backgroundOpacity,
                            borderColor: node.borderColor,
                            id: node.id,
                            parent: node.parent,
                            ports: node.ports,
                            sbgnbbox: {x: node.position.x, y: node.position.y, w: node.width, h: node.height},
                            sbgnclass: node.sbgnclass,
                            sbgnclonemarker: node.isCloneMarker,
                            sbgnlabel: node.sbgnlabel,
                            sbgnstatesandinfos: node.sbgnStatesAndInfos,
                            height: node.height,
                            width: node.width
                        }
                    };

                    jsonNodes.push(jsonNode);
                }
            };


            for(var att in edges) {
                if (edges.hasOwnProperty(att)) {
                    var edge = edges[att];

                    var jsonEdge = {
                        data: {
                            bendPointPositions: edge.bendPointPositions,
                            id: edge.id,
                            lineColor: edge.lineColor,
                            portsource: edge.portsource,
                            porttarget: edge.porttarget,
                            source: edge.source,
                            target: edge.target,
                            sbgncardinality: edge.sbgncardinality,
                            sbgnclass: edge.sbgnclass,
                            parent: edge.parent
                        }
                    };

                    jsonEdges.push(jsonEdge);
                }
            }


            return{nodes:jsonNodes, edges:jsonEdges};
        },


       //  updateModelFromJson: function(cytoscapeJsGraph){
       //
       //
       //      //convert json properties to model info
       //
       //      var nodes = model.get('_page.doc.cy.nodes');
       //      var edges = model.get('_page.doc.cy.edges');
       //
       //      var jsonNodes = [];
       //      var jsonEdges = [];
       //
       //      cytoscapeJsGraph.nodes.forEach(function(node){
       //          var nodePath = model.at('_page.doc.cy.nodes.' + node.data.id);
       //          nodePath.set('backgroundOpacity', node.data.backgroundOpacity);
       //          nodePath.set('borderColor', node.data.borderColor);
       //          nodePath.set('parent', node.data.parent);
       //          nodePath.set('ports', node.data.ports);
       //          nodePath.set('position.x', node.data.sbgnbbox.x);
       //          nodePath.set('position.y', node.data.sbgnbbox.y);
       //          nodePath.set('width', node.data.sbgnbbox.w);
       //          nodePath.set('height', node.data.sbgnbbox.h);
       //          nodePath.set('sbgnclass', node.data.sbgnclass);
       //          nodePath.set('isCloneMarker', node.data.sbgnclonemarker);
       //          nodePath.set('sbgnlabel', node.data.sbgnlabel);
       //          nodePath.set('sbgnStatesAndInfos', node.data.sbgnstatesandinfos);
       //          nodePath.set('backgroundOpacity', node.data.backgroundOpacity);
       //      });
       //
       //
       //      cytoscapeJsGraph.edges.forEach(function(edge) {
       //          var edgePath = model.at('_page.doc.cy.edges.' + edge.data.id);
       //          edgePath.set('bendPointPositions', edge.data.bendPointPositions);
       //          edgePath.set('lineColor', edge.data.lineColor);
       //          edgePath.set('parent', edge.data.parent);
       //          edgePath.set('source', edge.data.source);
       //          edgePath.set('target', edge.data.target);
       //          edgePath.set('portsource', edge.data.portsource);
       //          edgePath.set('porttarget', edge.data.porttarget);
       //          edgePath.set('sbgncardinality', edge.data.sbgncardinality);
       //          edgePath.set('sbgnclass', edge.data.sbgnclass);
       //      });
       //
       //
       //
       // //     model.set('_page.doc.jsonObj', cytoscapeJsGraph);
       //
       //
       //
       //      //this.updateHistory('load graph');
       //  },
       //


        initModelNode: function(node, user, noHistUpdate){


            var nodePath = model.at('_page.doc.cy.nodes.' + node.id());

            if(!noHistUpdate)
                this.updateHistory('init', 'node', null, node.id());

         //   if (nodePath.get('id')) {


            nodePath.set('id', node.id());

            var backgroundOpacity= nodePath.get('backgroundOpacity');

            if (backgroundOpacity != null)
                node.data('backgroundOpacity', backgroundOpacity );

            else
                this.changeModelNodeAttribute('backgroundOpacity', node.id(),node.data('backgroundOpacity'), user, noHistUpdate);



            var ports= nodePath.get('ports');

            if (ports != null)
                node.data('ports', ports );

            else
                this.changeModelNodeAttribute('ports', node.id(),node.data('ports'), user, noHistUpdate);



            var sbgnclass = nodePath.get('sbgnclass');

            if (sbgnclass != null)
                node.data('sbgnclass', sbgnclass );

            else
                this.changeModelNodeAttribute('sbgnclass', node.id(),node.data('sbgnclass'), user, noHistUpdate);

            var borderColor = nodePath.get('borderColor');

            if (borderColor != null)
                node.data('borderColor', borderColor);
            else
                this.changeModelNodeAttribute('borderColor', node.id(),node.css('border-color'), user, noHistUpdate); //initially css is active, it is then loaded to data('borderColor')

            var borderWidth = nodePath.get('borderWidth');
            if (borderWidth != null)
                node.css('border-width', borderWidth);
            else
                this.changeModelNodeAttribute('borderWidth', node.id(),node.css('border-width'), user, noHistUpdate);




            var backgroundColor = nodePath.get('backgroundColor');

            if (backgroundColor != null)
                node.css('background-color', backgroundColor);
            else
                this.changeModelNodeAttribute('backgroundColor', node.id(),node.css('background-color'), user, noHistUpdate);


            //SBGN properties are stored in the data component




            var sbgnlabel = nodePath.get('sbgnlabel');

            if (sbgnlabel != null)
                node.data('sbgnlabel', sbgnlabel );

            else
                this.changeModelNodeAttribute('sbgnlabel', node.id(),node.data('sbgnlabel'), user, noHistUpdate);



            var isCloneMarker = nodePath.get('isCloneMarker');


            if (isCloneMarker != null)
                node.data('sbgnclonemarker', isCloneMarker ? true : undefined);

            else
                this.changeModelNodeAttribute('isCloneMarker', node.id(),node.data('sbgnclonemarker'), user, noHistUpdate);

            //todo: restore doesn't get correct

            var isMultimer = nodePath.get('isMultimer');

            if (isMultimer != null) {

                var sbgnclass = node.data('sbgnclass');
                if (isMultimer) {
                    //if not multimer already
                    if (sbgnclass.indexOf(' multimer') <= -1) //todo funda changed
                        node.data('sbgnclass', sbgnclass + ' multimer');
                }
                else {
                    node.data('sbgnclass', sbgnclass.replace(' multimer', ''));
                }
            }

            else
                nodePath.pass({user: user}).set('isMultimer', false);

            var sbgnStatesAndInfos = nodePath.get('sbgnStatesAndInfos');



            if(sbgnStatesAndInfos != null)
                node.data('sbgnstatesandinfos',sbgnStatesAndInfos);

            else {

                var si = node.data('sbgnstatesandinfos');
                if(!si) si = [];
                this.changeModelNodeAttribute('sbgnStatesAndInfos', node.id(), si, user, noHistUpdate);
            }

            var parent = nodePath.get('parent');

            if (parent != null)
                node.data('parent', parent);
            else
                this.changeModelNodeAttribute('parent', node.id(),node.data('parent'), user, noHistUpdate);


            var children = nodePath.get('children');

            if (children != null)
                node.data('children', children);
            else
                this.changeModelNodeAttribute('children', node.id(),node.data('children'), user, noHistUpdate);


            var height = nodePath.get('height');

            if (height != null){
                node.data('height', height);
                node._private.data.sbgnbbox.h = height;
            }
            else {
                this.changeModelNodeAttribute('height', node.id(), node._private.data.sbgnbbox.h , user, noHistUpdate);
            }


            var width = nodePath.get('width');

            if (width != null) {
                node.data('width', width);
                node._private.data.sbgnbbox.w = width;
            }
            else
                this.changeModelNodeAttribute('width', node.id(),node._private.data.sbgnbbox.w, user, noHistUpdate);




            //IMPORTANT!!!!! Calling width height updates causes node moving errors

     //       }

        },
        initModelEdge: function(edge, user, noHistUpdate){
            edge.addClass('changeLineColor');

            var edgePath = model.at('_page.doc.cy.edges.' + edge.id());

            if(!noHistUpdate)
                this.updateHistory('init', 'edge', null, edge.id());
      //      if (edgePath.get('id')) {


            edgePath.set('id', edge.id());

            // if (parent != null)
            //     edge.data('parent', edge);
            // else
            //     this.changeModelEdgeAttribute('parent', edge.id(),edge.data('parent'), user, noHistUpdate);

            var bendPointPositions = edgePath.get('bendPointPositions');

            if (bendPointPositions != null)
                edge.data('bendPointPositions', bendPointPositions);
            else {
                var bp = edge.data('bendPointPositions');
                if(!bp) bp = [];

                this.changeModelEdgeAttribute('bendPointPositions', edge.id(), bp, user, noHistUpdate);
            }

            var sbgnclass = edgePath.get('sbgnclass');

            if (sbgnclass != null)
                edge.data('sbgnclass', sbgnclass);
            else
                this.changeModelEdgeAttribute('sbgnclass', edge.id(),edge.data('sbgnclass'), user, noHistUpdate);

            var sbgncardinality = edgePath.get('sbgncardinality');

            if (sbgncardinality != null)
                edge.data('sbgncardinality', sbgncardinality);
            else {
                var cardinality = edge.data('sbgncardinality');
                if(!cardinality)
                    cardinality = 0;

                this.changeModelEdgeAttribute('sbgncardinality', edge.id(), cardinality, user, noHistUpdate);
            }

            var lineColor = edgePath.get('lineColor');

            if (lineColor != null)
                edge.data('lineColor', lineColor);
            else
                this.changeModelEdgeAttribute('lineColor', edge.id(),edge.css('line-color'), user, noHistUpdate);



            var source = edgePath.get('source');

            if(source != null)
                edge.data('source', source);
            else
                this.changeModelEdgeAttribute('source', edge.id(),edge.data('source'), user, noHistUpdate);


            var target = edgePath.get('target');
            if(target != null)
                edge.data('target', target);
            else
                this.changeModelEdgeAttribute('target', edge.id(),edge.data('target'), user, noHistUpdate);




            var portsource = edgePath.get('portsource');

            if(portsource != null)
                edge.data('portsource', portsource);
            else
                this.changeModelEdgeAttribute('portsource', edge.id(),edge.data('portsource'), user, noHistUpdate);


            var porttarget = edgePath.get('porttarget');
            if(porttarget != null)
                edge.data('porttarget', porttarget);
            else
                this.changeModelEdgeAttribute('porttarget', edge.id(),edge.data('porttarget'), user, noHistUpdate);


            //      }

        },

        //nodes and edges are cytoscape objects. they have css and data properties
        initModel: function(jsonObj, nodes, edges, user, noHistUpdate){

            var nodeIds = "";
            var edgeIds = "";


            jsonObj.nodes.forEach(function(node){
                //do not set id here: it means node addition
                model.pass({user:user}).set('_page.doc.cy.nodes.' + node.data.id + '.position', {x: node.data.sbgnbbox.x, y: node.data.sbgnbbox.y}); //initialize position

              //  model.pass({user:user}).set('_page.doc.cy.nodes.' + node.data.id + '.id', node.data.id);
                nodeIds += node.data.id + " ";

            });


            jsonObj.edges.forEach(function(edge){
                edgeIds += edge.data.id + " ";

           //     model.pass({user:user}).set('_page.doc.cy.edges.' + edge.data.id + '.id', edge.data.id);
            });

            var self = this;

            if(!noHistUpdate){
                this.updateHistory('init',  'model');
                this.updateHistory('init','node group', nodeIds);
                this.updateHistory('init','edge group', edgeIds);
            }



            nodes.forEach(function (node) {
                self.initModelNode(node, user, noHistUpdate);

            });

            edges.forEach(function (edge) {
                self.initModelEdge(edge, user, noHistUpdate);
            });


        }
    }
}