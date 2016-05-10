/*
 *	Shared model handling operations.
 *  Clients call these commands to update the model
 *	Author: Funda Durupinar<f.durupinar@gmail.com>
 */


module.exports =  function(model, docId, userId, userName) {

    var user = model.at('users.' + userId);


    model.ref('_page.doc', 'documents.' + docId);

    return ModelManager = { //global reference for testing


        getModel: function(){
            return model;
        },

        addImage: function(data, user , depth){
            model.pass({user:user}).push('_page.doc.images', data);

            this.updateHistory({opName:'add', opTarget:'image', opAttr: data.filePath, depth: depth});
        },

        setName: function(userName){

           model.fetch('users', userId, function(err){
               user.set('name', userName);
           });
        },

        getName: function(){
            return model.get('users.' + userId +'.name');
        },

        setSampleInd: function(ind, user, depth){
            model.pass({user:user}).set('_page.doc.sampleInd', ind);

            if (ind == -1)
                this.updateHistory({opName:'load', opTarget:'model', depth: depth});
            else
                this.updateHistory({opName:'open', opTarget: 'sample', elId: ind, depth: depth});
        },

        getSampleInd: function(user, depth){
            var ind = model.get('_page.doc.sampleInd');
            if(ind == null)
                ind = "0";

            this.setSampleInd(ind, user, depth);


            if (ind == -1)
                this.updateHistory({opName:'load', opTarget:'model', depth: depth});
            else
                this.updateHistory({opName:'open', opTarget: 'sample', elId: ind,  depth: depth});

            return ind;

        },


        updateLayoutProperties: function(layoutProperties, depth){

            var currentLayoutProperties;
            var lp =  model.get('_page.doc.layoutProperties');

            if(lp == null)
                currentLayoutProperties = _.clone(layoutProperties);
            else
                currentLayoutProperties = _.clone(lp);


            model.set('_page.doc.layoutProperties', currentLayoutProperties); //synclayout


            this.updateHistory({opName:'set',opTarget:'layout', opAttr: JSON.stringify(currentLayoutProperties), depth: depth});
            return currentLayoutProperties;
        },

        setLayoutProperties: function(layoutProperties, depth){
            model.set('_page.doc.layoutProperties', layoutProperties); //synclayout

            this.updateHistory({opName:'set', opTarget:'layout', opAttr: JSON.stringify(layoutProperties), depth: depth});
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
            if(cmd.depth == null)
                return;

            var command = {userName: userName, date: new Date, opName: cmd.opName, opTarget: cmd.opTarget, elType: cmd.elType, opAttr: cmd.opAttr, elId: cmd.elId, param: cmd.param, prevParam: cmd.prevParam, depth:cmd.depth};


            var ind = model.push('_page.doc.history',command) - 1;

            model.set('_page.doc.undoIndex', ind);

        },

        getHistory: function(){
            return model.get('_page.doc.history');
        },

        getUndoInd: function(){
            var undoRootInd = model.get('_page.doc.undoIndex');

            var cmd = model.get('_page.doc.history.' + undoRootInd);
            while(cmd.depth > 0){
                cmd = model.get('_page.doc.history.' + undoRootInd);
                if(cmd.depth == 0)
                    break;
                undoRootInd = undoRootInd > 0 ? undoRootInd - 1 : 0;
            }

            return undoRootInd;
        },
        getRedoInd: function(){
            var redoRootInd = model.get('_page.doc.undoIndex') + 1;
            var cmd =model.get('_page.doc.history.' + redoRootInd);

            while(cmd.depth > 0){
                cmd = model.get('_page.doc.history.' + redoRootInd);
                if(cmd.depth == 0)
                redoRootInd = redoRootInd <  model.get('_page.doc.history').length; -1 ? redoRootInd + 1  : model.get('_page.doc.history').length;  - 1;
            }


        },

        getUndoActionStr: function(){

            var undoInd = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + undoInd);


            var cmdStr = cmd.opName + " " + cmd.opTarget;
            //
            // if(cmd.opAttr != null)
            //     cmdStr += " " + cmd.opAttr;
            //
             return cmdStr;

        },

        getRedoActionStr: function(){

            return null;
            // var redoInd = this.getRedoInd();
            // var cmd = model.get('_page.doc.history.' + redoInd);
            //
            //
            // var cmdStr = cmd.opName + " " + cmd.opTarget;
            // if(cmd.opAttr != null)
            //     cmdStr += " " + cmd.opAttr;
            //
            // return cmdStr;
        },
        isUndoPossible: function(){
            return(model.get('_page.doc.undoIndex') > 0)
        },
        isRedoPossible: function(){
            return(model.get('_page.doc.undoIndex') + 1 < model.get('_page.doc.history').length)
        },


        undoCommandGroup: function(){
            var undoInd = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + undoInd);


            while(cmd.depth > -1) { //command groups are separated by '-1's

                this.undoCommand(cmd);

                undoInd = model.get('_page.doc.undoIndex') - 1;
                if(undoInd < 0)
                    return;
                else {
                    model.set('_page.doc.undoIndex', undoInd);
                    cmd = model.get('_page.doc.history.' + undoInd);
                }
            }

            while(cmd.depth == -1 && undoInd > 0){ //leave at the next actual command

                undoInd = model.get('_page.doc.undoIndex') - 1;
                model.set('_page.doc.undoIndex', undoInd);
                cmd = model.get('_page.doc.history.' + undoInd);
            }
        },

        redoCommandGroup: function(){
            var undoInd = model.get('_page.doc.undoIndex');
            var cmd = model.get('_page.doc.history.' + (undoInd+1));

            while(cmd.depth > -1) { //don't do the next command
                this.redoCommand(cmd);


                undoInd = model.get('_page.doc.undoIndex') + 1;
                if(undoInd < model.get('_page.doc.history').length - 1){
                    model.set('_page.doc.undoIndex', undoInd);
                    cmd = model.get('_page.doc.history.' + undoInd);
                }
                else return;
            }

            while(cmd.depth == -1 && undoInd <  model.get('_page.doc.history').length - 1){ //leave at the next actual command
                undoInd = model.get('_page.doc.undoIndex') + 1;
                model.set('_page.doc.undoIndex', undoInd);
                cmd = model.get('_page.doc.history.' + undoInd);
            }
        },

        undoCommand: function(cmd){

            if(cmd.opName == "set"){
                if(cmd.opTarget == "node")
                    this.changeModelNodeAttribute(cmd.opAttr, cmd.elId, cmd.prevParam); //user is null to enable updating in the editor
                else if(cmd.opTarget == "edge")
                    this.changeModelEdgeAttribute(cmd.opAttr,cmd.elId, cmd.prevParam);


            }
            else if(cmd.opName == "add"){
                if(cmd.opTarget  == "node")
                    this.deleteModelNode(cmd.elId);
                else if(cmd.opTarget == "edge")
                    this.deleteModelEdge(cmd.elId);

            }
            else if(cmd.opName == "delete"){
                if(cmd.opTarget == "node")
                    this.restoreModelNode( cmd.elId, cmd.prevParam);
                else
                    this.restoreModelEdge( cmd.elId, cmd.prevParam);

            }

        },

        redoCommand: function(){

            var redoInd = this.getRedoInd();
            var cmd = model.get('_page.doc.history.' + redoInd);

            if(cmd.opName == "set"){
                if(cmd.opTarget ==  "node")
                    this.changeModelNodeAttribute(cmd.opAttr,cmd.elId, cmd.param); //user is null to enable updating in the editor
                else if(cmd.opTarget  == "edge")
                    this.changeModelEdgeAttribute(cmd.opAttr,cmd.elId, cmd.param);

            }
            else if(cmd.opName == "add"){
                if(cmd.opTarget == "node")
                    this.restoreModelNode( cmd.elId, cmd.param);
                if(cmd.opTarget == "edge")
                    this.restoreModelEdge( cmd.elId, cmd.param);
            }
            else if(cmd.opName == "delete"){
                if(cmd.opTarget == "node")
                    this.deleteModelNode(cmd.elId);
                else if(cmd.opTarget == "edge")
                    this.deleteModelEdge(cmd.elId);

            }



        },


        getModelNode: function(id){
            var nodePath = model.at('_page.doc.cy.nodes.'  + id);
            return nodePath.get();
        },

        getModelEdge: function(id){

            var edgePath = model.at('_page.doc.cy.edges.'  + id);

            return edgePath.get();
        },

        selectModelNode: function(node){


            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());
            if(nodePath.get() == null)
                return "Node id not found";
            if(user)
                nodePath.set('highlightColor' , user.get('colorCode'));


            return "success";

        },


        selectModelEdge: function(edge){
            var user = model.at('users.' + userId);
            var edgePath = model.at('_page.doc.cy.edges.'  +edge.id());
            if(edgePath.get() == null)
                return "Edge id not found";
            if( user) {
                edgePath.set('highlightColor', user.get('colorCode'));

            }

            return "success";

        },
        unselectModelNode: function(node){

            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());

            if(nodePath.get() == null)
                return "Node id not found";

            nodePath.set('highlightColor' , null);

            return "success";

        },




        unselectModelEdge: function(edge ){

            var edgePath = model.at('_page.doc.cy.edges.'  +edge.id());
            if(edgePath.get() == null)
                return "Edge id not found";

            edgePath.set('highlightColor', null);


            return "success";


        },

        addModelNode: function(nodeId,  param, user, depth){


            if(model.get("_page.doc.cy.nodes." + nodeId + '.id') != null)
                return "Node cannot be duplicated";

            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.id', nodeId);
            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.position', {x: param.x, y: param.y});
            model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnclass', param.sbgnclass);
            model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnlabel', param.sbgnlabel);

            //adding the node...other operations should be called after this
            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId+'.addedLater', true);

            //We don't want all the attributes of the param to be printed
            if(depth!= null)
                this.updateHistory({opName:'add',opTarget:'node', elType:'node', elId: nodeId, param:{x: param.x, y: param.y, sbgnclass: param.sbgnclass, depth:depth}});

            return "success";

        },

        addModelEdge: function(edgeId, param, user, depth){

            if(model.get("_page.doc.cy.edges." + edgeId + '.id') != null)
                return "Edge cannot be duplicated";

            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.id', edgeId);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.sbgnclass', param.sbgnclass);

            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.source', param.source);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.target', param.target);

            //adding the edge...other operations should be called after this
            model.pass({user:user}).set('_page.doc.cy.edges.' +edgeId+'.addedLater', true);


            if(depth!= null)
                this.updateHistory({opName:'add',opTarget:'edge', elType:'edge', elId: edgeId, param:param, depth:depth});

            return "success";

        },

        //change children's parents to their old parents
        removeModelCompound: function(compoundId, childrenList, prevParentId, user, depth){
            var self = this;
            var newDepth = depth;
            if(depth != null)
                newDepth = depth+1;

            var nodePath = model.at('_page.doc.cy.nodes.'  + compoundId);
            var compoundAtts = {id: compoundId, sbgnclass: nodePath.get('sbgnclass'), x: nodePath.get('position.x'), y: nodePath.get('position.y'), width: nodePath.get('width'), height: nodePath.get('height')};

            //isolate the compound first, then delete


            for(var i  = 0; i < childrenList.length; i++ ){
                self.changeModelNodeAttribute("parent", childrenList[i], prevParentId, user, newDepth);
            }

            this.changeModelNodeAttribute("children", compoundId, null, null, newDepth);
            this.deleteModelNode(compoundId, user, newDepth);



            if(depth!= null)
                this.updateHistory({opName:'delete',opTarget:'compound', elId: compoundId, prevParam:{childrenList: childrenList, compoundAtts: compoundAtts}, param:prevParentId, depth:depth});

        },
        /***
         *
         * @param compoundId : new compound's id
         * @param compoundAtts: new compounds id, size, sbgnclass, position
         * @param childrenList: in the format {id:, isNode} for do/undo
         * @param prevParentList: children's old parents
         * @param user
         * @param depth: command depth
         */
        addModelCompound: function(compoundId, compoundAtts, childrenList, prevParent, user, depth){

            var self = this;
            var newDepth = depth;
            if(depth != null)
                newDepth = depth+1;

            this.addModelNode(compoundId, compoundAtts, user, newDepth);


            this.changeModelNodeAttribute('width', compoundId, compoundAtts.width, user, newDepth);
            this.changeModelNodeAttribute('height', compoundId, compoundAtts.height, user, newDepth );


            var nodeIds = [];
            childrenList.forEach(function(childId){
                self.changeModelNodeAttribute("parent", childId, compoundId, user, newDepth);
                nodeIds.push(childId);
            });


          //  this.changeModelElementGroupAttribute("parent", childrenList, parentList, user, newDepth);



            this.changeModelNodeAttribute('children', compoundId, nodeIds, user, newDepth);


            if(depth!= null)
                this.updateHistory({opName:'add',opTarget:'compound', elId: compoundId, param:{childrenList: childrenList, compoundAtts: compoundAtts}, prevParam:prevParent, depth: depth});

        },


        //attStr: attribute namein the model
        //historyData is for  sbgnStatesAndInfos only
        changeModelNodeAttribute: function(attStr, nodeId, attVal,  user, depth){ //historyData){

            var status = "Node id not found";
            var nodePath = model.at('_page.doc.cy.nodes.'  + nodeId);
            if(nodePath.get() == null)
                return "Node id not found";


            var prevAttVal = nodePath.get(attStr);


            nodePath.pass({user:user}).set(attStr,attVal);


            if(attStr == "expandCollapseStatus") {
                if (attVal == "expand")
                    prevAttVal = "collapse";
                if (attVal == "collapse")
                    prevAttVal = "expand";
            }


            if(depth != null)
                this.updateHistory({
                        opName: 'set',
                        opTarget:'node',
                        elId: nodeId,
                        opAttr: attStr,
                        param: attVal,
                        prevParam: prevAttVal,
                        depth: depth
                    });



            return "success";

        },
        changeModelEdgeAttribute: function(attStr, edgeId, attVal,  user, depth){
            var edgePath = model.at('_page.doc.cy.edges.'  + edgeId);
            if(edgePath.get() == null)
                return "Edge id not found";
            var prevAttVal = edgePath.get(attStr);
            edgePath.pass({user:user}).set(attStr, attVal);


            if(depth != null)
                this.updateHistory({
                    opName: 'set',
                    // opTarget: 'element',
                    // elType: 'edge',
                    opTarget:'edge',
                    elId: edgeId,
                    opAttr: attStr,
                    param: attVal,
                    prevParam: prevAttVal,
                    depth: depth
                });


            return "success";
        },


        deleteModelNode: function(nodeId, user, depth){
            var nodePath = model.at('_page.doc.cy.nodes.'  + nodeId);

            if(nodePath.get() == null)
                return "Node id not found";


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
            var highlightColor = nodePath.get('backgroundColor');
            var ports = nodePath.get('ports');



            prevParam = {x: pos.x , y: pos.y , sbgnclass:sbgnclass, width: width, height: height,
                         borderColor: borderColor, borderWidth: borderWidth, sbgnlabel: sbgnlabel,
                         sbgnStatesAndInfos:sbgnStatesAndInfos, parent:parent, isCloneMarker: isCloneMarker,
                         isMultimer: isMultimer, children: children, highlightColor: highlightColor, ports: ports};


            if(depth!= null)
                this.updateHistory({opName:'delete',opTarget:'node', elId: nodeId, prevParam: prevParam, depth: depth});



            model.pass({user: user}).del(('_page.doc.cy.nodes.' + nodeId));



            return "success";

        },


        deleteModelEdge: function(edgeId, user, depth){

            var edgePath = model.at('_page.doc.cy.edges.'  + edgeId);
            if(edgePath.get() == null)
                return "Edge id not found";


            var source = edgePath.get('source');
            var target = edgePath.get('target');
            var sbgnClass = edgePath.get('sbgnclass');
            var lineColor = edgePath.get('lineColor');
            var width = edgePath.get('width');
            var sbgncardinality = edgePath.get('sbgncardinality');
            var portsource = edgePath.get('portsource');
            var porttarget = edgePath.get('porttarget');
            var bendPointPositions= edgePath.get('bendPointPositions');
            var highlightColor = edgePath.get('lineColor');

            prevParam = {source: source , target:target , sbgnclass:sbgnClass, lineColor: lineColor,
            width: width, sbgncardinality: sbgncardinality, portsource: portsource, porttarget:porttarget, bendPointPositions: bendPointPositions, highlightColor:highlightColor};

            if(depth!= null)
              this.updateHistory({opName:'delete',opTarget:'edge', elId: edgeId, prevParam: prevParam, depth:depth});


            model.pass({user:user}).del(('_page.doc.cy.edges.'  + edgeId));

            return "success";

        },


        // deleteModelElementGroup: function(selectedEles, user, depth){
        //     var prevParamsNodes = [];
        //     var prevParamsEdges = [];
        //     var self = this;
        //     var newDepth = depth;
        //     if(depth != null)
        //         newDepth = depth+1;
        //
        //
        //     selectedEles.edges.forEach(function(edge){
        //         var edgePath = model.at('_page.doc.cy.edges.' + edge.id);
        //
        //         var source = edgePath.get('source');
        //         var target = edgePath.get('target');
        //         var sbgnclass = edgePath.get('sbgnclass');
        //         var lineColor = edgePath.get('lineColor');
        //         var width = edgePath.get('width');
        //         var sbgncardinality = edgePath.get('sbgncardinality');
        //         var portsource = edgePath.get('portsource');
        //         var porttarget = edgePath.get('porttarget');
        //         var bendPointPositions= edgePath.get('bendPointPositions');
        //
        //         prevParamsEdges.push( {source: source , target:target , sbgnclass:sbgnclass, lineColor: lineColor,
        //             width: width, sbgncardinality: sbgncardinality, portsource: portsource, porttarget:porttarget, bendPointPositions: bendPointPositions});
        //     });
        //
        //
        //     selectedEles.edges.forEach(function(edge){
        //         self.deleteModelEdge(edge.id, user, newDepth); //child command
        //     });
        //
        //     selectedEles.nodes.forEach(function(node){
        //         var nodePath = model.at('_page.doc.cy.nodes.'  + node.id);
        //
        //         var pos = nodePath.get('position');
        //         var sbgnclass = nodePath.get('sbgnclass');
        //
        //
        //         var borderColor = nodePath.get('borderColor');
        //         var borderWidth = nodePath.get('borderWidth');
        //         var backgroundColor = nodePath.get('backgroundColor');
        //         var width = nodePath.get('width');
        //         var height = nodePath.get('height');
        //         var parent = nodePath.get('parent');
        //         var sbgnlabel = nodePath.get('sbgnlabel');
        //         var isCloneMarker = nodePath.get('isCloneMarker');
        //         var isMultimer = nodePath.get('isMultimer');
        //         var sbgnStatesAndInfos = nodePath.get('sbgnStatesAndInfos');
        //         var highlightColor = nodePath.get('highlightColor');
        //         var ports = nodePath.get('ports');
        //         var children = nodePath.get('children');
        //
        //
        //         prevParamsNodes.push({x: pos.x , y: pos.y , sbgnclass:sbgnclass, width: width, height: height,
        //             borderColor: borderColor, borderWidth: borderWidth, sbgnlabel: sbgnlabel,
        //             sbgnStatesAndInfos:sbgnStatesAndInfos, parent:parent, isCloneMarker: isCloneMarker,
        //             isMultimer: isMultimer,  highlightColor: highlightColor, backgroundColor: backgroundColor, ports:ports, children: children} );
        //     });
        //
        //
        //     selectedEles.nodes.forEach(function(node){
        //         self.deleteModelNode(node.id, user, newDepth); //will not update children history
        //     });
        //     if(depth!= null)
        //     this.updateHistory({opName:'delete',opTarget:'element group',  elId: selectedEles, prevParam: {nodes: prevParamsNodes, edges: prevParamsEdges, depth: depth}});
        //
        //
        // },

        // restoreModelElementGroup: function(elList, param, user, depth){
        //     var self = this;
        //     var newDepth = depth;
        //     if(depth != null)
        //         newDepth = depth+1;
        //
        //     //Restore nodes first
        //     for (var i = 0; i < elList. nodes.length; i++) {
        //         self.restoreModelNode(elList.nodes[i].id, param.nodes[i], user, newDepth);
        //     }
        //
        //     //restore edges later
        //     for (var i = 0; i < elList. edges.length; i++) {
        //         self.restoreModelEdge(elList.edges[i].id, param.edges[i], user, newDepth);
        //     }
        //
        //
        //     //change children after adding them all
        //     for (var i = 0; i < elList. nodes.length; i++) {
        //         self.changeModelNodeAttribute('children', elList.nodes[i].id, param.nodes[i].children, newDepth);
        //     };
        //
        //     if(depth!= null)
        //     self.updateHistory({opName:'restore', opTarget:'element group', elId:elList, depth:depth});
        // },
        /**
         * Restore operations for global undo/redo
         */
        restoreModelNode: function(nodeId, param, user, depth){
            var newDepth = depth;
            if(depth != null)
                newDepth = depth+1;
                

            this.addModelNode(nodeId, param, user, newDepth);


            this.changeModelNodeAttribute('ports', nodeId,param.ports,user, newDepth );
            this.changeModelNodeAttribute('highlightColor', nodeId,param.backgroundColor,user, newDepth );
            this.changeModelNodeAttribute('sbgnclass', nodeId,param.sbgnclass,user, newDepth );
            this.changeModelNodeAttribute('width', nodeId,param.width,user, newDepth );
            this.changeModelNodeAttribute('height', nodeId,param.height,user , newDepth);
            this.changeModelNodeAttribute('sbgnlabel', nodeId,param.sbgnlabel,user, newDepth );
            this.changeModelNodeAttribute('backgroundColor', nodeId,param.backgroundColor,user, newDepth );
            this.changeModelNodeAttribute('borderColor', nodeId,param.borderColor,user , newDepth);
            this.changeModelNodeAttribute('borderWidth', nodeId,param.borderWidth,user , newDepth);
            this.changeModelNodeAttribute('sbgnStatesAndInfos', nodeId, param.sbgnStatesAndInfos,user, newDepth );
            this.changeModelNodeAttribute('parent', nodeId,param.parent,user, newDepth );
            this.changeModelNodeAttribute('isCloneMarker', nodeId,param.isCloneMarker,user , newDepth);
            this.changeModelNodeAttribute('isMultimer', nodeId, param.isMultimer,user, newDepth );
            this.changeModelNodeAttribute('children', nodeId, param.children,user, newDepth );


            if(depth!= null)
                this.updateHistory({opName:'restore', opTarget:'node', elId:nodeId, depth: depth});
        },

        restoreModelEdge: function(edgeId, param, user, depth){
            var newDepth = depth;
            if(depth != null)
                newDepth = depth+1;


            this.addModelEdge(edgeId, param, user, newDepth);

            
            this.changeModelEdgeAttribute('lineColor', edgeId,param.lineColor,user, newDepth );
            this.changeModelEdgeAttribute('width', edgeId,param.width,user, newDepth );
            this.changeModelEdgeAttribute('sbgncardinality', edgeId,param.sbgncardinality,user , newDepth);
            this.changeModelEdgeAttribute('portsource', edgeId,param.portsource,user , newDepth);
            this.changeModelEdgeAttribute('porttarget', edgeId,param.porttarget,user , newDepth);
            this.changeModelEdgeAttribute('bendPointPositions', edgeId,param.bendPointPositions,user , newDepth);
            this.changeModelEdgeAttribute('highlightColor', edgeId,param.lineColor,user, newDepth );

            if(depth!= null)
                this.updateHistory({opName:'restore', opTarget:'edge', elId:edgeId,  depth: depth});
        },





        //should be called before loading a new graph to prevent id confusion
        deleteAll: function(nodes, edges , user, depth){
            var newDepth = depth;
            if(depth != null)
                newDepth = depth+1;




            this.deleteModelEdges(edges,user, newDepth);
            this.deleteModelNodes(nodes,user, newDepth);


            if(depth!= null)
                this.updateHistory({opName:'new', opTarget:'model', depth:depth});



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



        initModelNode: function(node, user, depth){

            var newDepth = depth;
            if(depth != null)
                newDepth = depth+1;

            var nodePath = model.at('_page.doc.cy.nodes.' + node.id());


            this.updateHistory({opName:'init', opTarget:'node', elType:'node', elId: node.id(), depth: depth});



            nodePath.set('id', node.id());


            var backgroundOpacity= nodePath.get('backgroundOpacity');

            if (backgroundOpacity != null)
                node.data('backgroundOpacity', backgroundOpacity );

            else
                this.changeModelNodeAttribute('backgroundOpacity', node.id(),node.data('backgroundOpacity'), user, newDepth);



            var ports= nodePath.get('ports');

            if (ports != null)
                node.data('ports', ports );

            else
                this.changeModelNodeAttribute('ports', node.id(),node.data('ports'), user, newDepth);


            
            var sbgnclass = nodePath.get('sbgnclass');

            if (sbgnclass != null)
                node.data('sbgnclass', sbgnclass );

            else
                this.changeModelNodeAttribute('sbgnclass', node.id(),node.data('sbgnclass'), user, newDepth);

            var borderColor = nodePath.get('borderColor');

            if (borderColor != null)
                node.data('borderColor', borderColor);
            else
                this.changeModelNodeAttribute('borderColor', node.id(),node.css('border-color'), user, newDepth); //initially css is active, it is then loaded to data('borderColor')

            var borderWidth = nodePath.get('borderWidth');
            if (borderWidth != null)
                node.css('border-width', borderWidth);
            else
                this.changeModelNodeAttribute('borderWidth', node.id(),node.css('border-width'), user, newDepth);




            var backgroundColor = nodePath.get('backgroundColor');

            if (backgroundColor != null)
                node.css('background-color', backgroundColor);
            else
                this.changeModelNodeAttribute('backgroundColor', node.id(),node.css('background-color'), user, newDepth);


            //SBGN properties are stored in the data component


            var sbgnlabel = nodePath.get('sbgnlabel');

            if (sbgnlabel != null)
                node.data('sbgnlabel', sbgnlabel );

            else
                this.changeModelNodeAttribute('sbgnlabel', node.id(),node.data('sbgnlabel'), user, newDepth);



            var isCloneMarker = nodePath.get('isCloneMarker');


            if (isCloneMarker != null)
                node.data('sbgnclonemarker', isCloneMarker ? true : undefined);

            else
                this.changeModelNodeAttribute('isCloneMarker', node.id(),node.data('sbgnclonemarker'), user, newDepth);

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

            else {
                //nodePath.pass({user: user}).set('isMultimer', false);
                var nodeIsMultimer = node.data('sbgnclass').indexOf(' multimer') > 0 ;
                this.changeModelNodeAttribute('isMultimer', node.id(), nodeIsMultimer, user, newDepth);
            }


            var sbgnStatesAndInfos = nodePath.get('sbgnStatesAndInfos');



            if(sbgnStatesAndInfos != null)
                node.data('sbgnstatesandinfos',sbgnStatesAndInfos);

            else {

                var si = node.data('sbgnstatesandinfos');
                if(!si) si = [];
                this.changeModelNodeAttribute('sbgnStatesAndInfos', node.id(), si, user, newDepth);
            }

            var parent = nodePath.get('parent');

            if (parent != null)
                node.data('parent', parent);
            else
                this.changeModelNodeAttribute('parent', node.id(),node.data('parent'), user, newDepth);


            var children = nodePath.get('children');


            if (children != null) {
                var childrenList = [];
                children.forEach(function(childId){
                   childrenList.push(cy.getElementById(childId));
                });

                node._private.children = childrenList;
                //node.data('children', children); //funda defined this
            }
            else{
                var childrenIdList = [];
                node.children().forEach(function(child){
                    childrenIdList.push(child.id());
                });
                this.changeModelNodeAttribute('children', node.id(), childrenIdList, user, newDepth);
                //node.data('children', childrenIdList); //assign
            }



            var height = nodePath.get('height');

            if (height != null){
                node.data('height', height);
                node._private.data.sbgnbbox.h = height;
            }
            else {
                this.changeModelNodeAttribute('height', node.id(), node._private.data.sbgnbbox.h , user, newDepth);
            }


            var width = nodePath.get('width');

            if (width != null) {
                node.data('width', width);
                node._private.data.sbgnbbox.w = width;
            }
            else
                this.changeModelNodeAttribute('width', node.id(),node._private.data.sbgnbbox.w, user, newDepth);




            //IMPORTANT!!!!! Calling width height updates causes node moving errors



        },
        initModelEdge: function(edge, user, depth){
            var newDepth = depth;
            if(depth != null)
                newDepth = depth+1;

            edge.addClass('changeLineColor');

            var edgePath = model.at('_page.doc.cy.edges.' + edge.id());


            this.updateHistory({opName:'init', opTarget: 'edge', elType:'edge', elId: edge.id(),depth:depth});


            edgePath.set('id', edge.id());

            // if (parent != null)
            //     edge.data('parent', edge);
            // else
            //     this.changeModelEdgeAttribute('parent', edge.id(),edge.data('parent'), user, newDepth;

            var bendPointPositions = edgePath.get('bendPointPositions');

            if (bendPointPositions != null)
                edge.data('bendPointPositions', bendPointPositions);
            else {
                var bp = edge.data('bendPointPositions');
                if(!bp) bp = [];

                this.changeModelEdgeAttribute('bendPointPositions', edge.id(), bp, user, newDepth);
            }

            var sbgnclass = edgePath.get('sbgnclass');

            if (sbgnclass != null)
                edge.data('sbgnclass', sbgnclass);
            else
                this.changeModelEdgeAttribute('sbgnclass', edge.id(),edge.data('sbgnclass'), user, newDepth);

            var sbgncardinality = edgePath.get('sbgncardinality');

            if (sbgncardinality != null)
                edge.data('sbgncardinality', sbgncardinality);
            else {
                var cardinality = edge.data('sbgncardinality');
                if(!cardinality)
                    cardinality = 0;

                this.changeModelEdgeAttribute('sbgncardinality', edge.id(), cardinality, user, newDepth);
            }

            var lineColor = edgePath.get('lineColor');

            if (lineColor != null)
                edge.data('lineColor', lineColor);
            else
                this.changeModelEdgeAttribute('lineColor', edge.id(),edge.css('line-color'), user, newDepth);


            var width = edgePath.get('width');

            if (width != null)
                edge.css('width', width);
            else
                this.changeModelEdgeAttribute('width', edge.id(),edge.css('width'), user, newDepth);



            var source = edgePath.get('source');

            if(source != null)
                edge.data('source', source);
            else
                this.changeModelEdgeAttribute('source', edge.id(),edge._private.data.source, user, newDepth);


            var target = edgePath.get('target');
            if(target != null)
                edge.data('target', target);
            else
                this.changeModelEdgeAttribute('target', edge.id(),edge._private.data.target, user, newDepth);




            var portsource = edgePath.get('portsource');

            if(portsource != null)
                edge.data('portsource', portsource);
            else
                this.changeModelEdgeAttribute('portsource', edge.id(),edge.data('portsource'), user, newDepth);


            var porttarget = edgePath.get('porttarget');
            if(porttarget != null)
                edge.data('porttarget', porttarget);
            else
                this.changeModelEdgeAttribute('porttarget', edge.id(),edge.data('porttarget'), user, newDepth);



        },

        //nodes and edges are cytoscape objects. they have css and data properties
        initModel: function(jsonObj, nodes, edges, user, depth){

            var elIds = "";
            var elTypes = [];

            var newDepth = depth;
            if(depth != null)
                newDepth = depth+1;


            jsonObj.nodes.forEach(function(node){
                //do not set id here: it means node addition
                model.pass({user:user}).set('_page.doc.cy.nodes.' + node.data.id + '.position', {x: node.data.sbgnbbox.x, y: node.data.sbgnbbox.y}); //initialize position

              //  model.pass({user:user}).set('_page.doc.cy.nodes.' + node.data.id + '.id', node.data.id);
                elIds += node.data.id + " ";
                elTypes.push("node");

            });


            jsonObj.edges.forEach(function(edge){
                elIds += edge.data.id + " ";
                elTypes.push("edge");
            });

            var self = this;


            this.updateHistory({opName:'init',  opTarget:'model', depth:depth});




            nodes.forEach(function (node) {
                self.initModelNode(node, user, newDepth);

            });

            edges.forEach(function (edge) {
                self.initModelEdge(edge, user, newDepth);
            });


        }
    }
}