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
    return (Math.round((num * t) + (decimals>0?1:0)*(Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
}
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}
module.exports =  function(model, docId, userId, userName) {



    var user = model.at('users.' + userId);



    model.ref('_page.doc', 'documents.' + docId);

    return{

        getModel: function(){
            return model;
        },

        addImage: function(data, user){
            model.pass({user:user}).push('_page.doc.images', data);
            this.updateHistory('image', null, data.filePath);
        },

        setName: function(userName){

           model.fetch('users', userId, function(err){
               user.set('name', userName);

           });

        },
        updateLayoutProperties: function(layoutProperties){

            var currentLayoutProperties;
            var lp =  model.get('_page.doc.layoutProperties');

            if(lp == null)
                currentLayoutProperties = _.clone(layoutProperties);
            else
                currentLayoutProperties = _.clone(lp);


            model.set('_page.doc.layoutProperties', currentLayoutProperties); //synclayout
            this.updateHistory('layout', null, JSON.stringify(currentLayoutProperties));
            return currentLayoutProperties;
        },
        setLayoutProperties: function(layoutProperties){
            model.set('_page.doc.layoutProperties', layoutProperties); //synclayout
            this.updateHistory('layout', null, JSON.stringify(layoutProperties));
        },


        getSampleInd: function(user){
            var ind = model.get('_page.doc.sampleInd');
            if(ind == null)
                ind = "0";
            this.setSampleInd(ind, user);

            if(ind == -1)
                this.updateHistory('load model');
            else
                this.updateHistory('open sample ', null, ind);

            return ind;

        },
        setSampleInd: function(ind, user){
            model.pass({user:user}).set('_page.doc.sampleInd', ind);

            if(ind == -1)
                this.updateHistory('load model');
            else
                this.updateHistory('open sample ', null, ind);
        },

        updateHistory: function(opName, elId, param){
            var command = {userName: userName, date: new Date, opName: opName, elId: elId, param: param};
            if(param != "") {

                if (param == Number(param)) {
                    param = preciseRound(param, 3);
                }
                else {
                    for (var att in param) {
                        if (param[att] === Number(param[att]))
                            param[att] = preciseRound(param[att], 3);
                    }
                }
            }

            command.param = param;
            model.push('_page.doc.history',command);

        },

        getHistory: function(){
            return model.get('_page.doc.history');

        },

        getModelNode: function(id){
            var nodePath = model.at('_page.doc.cy.nodes.'  + id);
            return nodePath.get();
        },



        getSelectedModelElementIds: function(){

            var selectedNodes = [];
            var nodes = model.get('_page.doc.cy.nodes');

            for (id in nodes) {
                if (nodes.hasOwnProperty(id)) {
                    if (model.get('_page.doc.cy.nodes.' + id + '.highlightColor') != null )
                        selectedNodes.push(id);
                }
            }

            return selectedNodes;
        },


        selectModelNode: function(node){

            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());
            if(nodePath.get('id') && user){
                nodePath.set('highlightColor' , user.get('colorCode'));

            }

            this.updateHistory('select', node.id());
        },

        unselectModelNode: function(node){
            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());


            if(nodePath.get('id')){
                nodePath.set('highlightColor' , null);
            }

            this.updateHistory('unselect', node.id());

        },
        moveModelNode: function(nodeId, pos,user){
            var nodePath = model.at('_page.doc.cy.nodes.'  +nodeId);
            if(nodePath.get('id')){


                // if(!node.selected) //selected nodes will still be highlighted even if they are freed
                model.set('_page.doc.cy.nodes.' +nodeId+ '.highlightColor' , null); //make my highlight color null as well
                model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.position' , pos);


            }


            this.updateHistory('move', nodeId, coordinateRound(pos, 3));

        },
        addModelNode: function(nodeId,  param, user){

            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId+'.id', nodeId);
            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.position', {x: param.x, y: param.y});

            //Adding the node. Other operations should be called afterwards
            model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnclass', param.sbgnclass);




            ////TODO: undo remove should set the previous width, height and color properties
            //model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.highlightColor', null);
            //model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.backgroundColor', '#f6f6f6');
            //model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnlabel', param.sbgnlabel);
            //if(param.width)
            //    model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.width', param.width);
            //if(param.height)
            //    model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.height', param.height);
            //if(param.backgroundColor)
            //    model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.backgroundColor', param.backgroundColor);
            //if(param.borderColor)
            //    model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.borderColor', param.borderColor);
            //if(param.borderWidth)
            //    model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.borderWidth', param.borderWidth);
            //if(param.parent)
            //    model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.parent', param.parent);
            //if(param.children)
            //    model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.children', param.children);
            //if(param.sbgnStatesAndInfos)
            //    model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnStatesAndInfos', param.sbgnStatesAndInfos);




            //We don't want all the attributes of the param to be printed
            this.updateHistory('add', nodeId, {x:param.x, y: param.y, sbgnclass: param.sbgnclass});

        },


        //attStr: attribute namein the model
        //historyData is for  sbgnStatesAndInfos only
        changeModelNodeAttribute: function(attStr, nodeId, attVal,  user, historyData){


            var nodePath = model.at('_page.doc.cy.nodes.'  + nodeId);
            if(nodePath.get('id'))
                nodePath.pass({user:user}).set(attStr,attVal);


            if(historyData == null) //historydata is about statesAndInfos
                this.updateHistory(attStr, nodeId, attVal);
            else
                this.updateHistory(attStr, nodeId, historyData);


        },

        deleteModelNode: function(nodeId, user){

            //"unselect" node so that it doesn't get highlighted after undo
            //TODO: does not work!!!!!!!
            this.changeModelNodeAttribute('highlightColor', nodeId, null, user);
            this.changeModelNodeAttribute('backgroundColor', nodeId, null, user);

            model.pass({user: user}).del(('_page.doc.cy.nodes.' + nodeId));


            this.updateHistory('delete', nodeId);

        },

        deleteModelNodes: function(selectedNodes,user){
            var self = this;
            if(selectedNodes != null){
                for( var i = 0; i < selectedNodes.length; i++ ) {
                    var node = selectedNodes[i];
                    self.deleteModelNode(node.id(),user);
                }
            }
        },

        highlight: function(val, user){


            model.pass({user: user}).set('_page.doc.cy.highlight.mode', val);


            if(val == 0)
                this.updateHistory('Remove highlights of selected elements');
            else if(val == 1)
                this.updateHistory('Highlight neighbors of selected elements');
            else if(val == 2)
                this.updateHistory('Highlight processes of selected elements');


        },

        hideShow: function(val, user){
            model.pass({user: user}).set('_page.doc.cy.hideShow.mode', val);


            if(val == 0)
                this.updateHistory('Hide selected elements');
            else if(val == 1)
                this.updateHistory('Show selected elements');


        },

        getModelEdge: function(id){

            var edgePath = model.at('_page.doc.cy.edges.'  + id);
            return edgePath.get();
        },

        changeModelEdgeAttribute: function(attStr, edgeId, attVal,  user){
            var edgePath = model.at('_page.doc.cy.edges.'  + edgeId);
            if(edgePath.get('id'))
                edgePath.pass({user:user}).set(attStr, attVal);

            this.updateHistory(attStr, edgeId, attVal);

        },

        selectModelEdge: function(edge){
            var user = model.at('users.' + userId);
            var edgePath = model.at('_page.doc.cy.edges.'  +edge.id());
            if(edgePath.get('id') && user)
                edgePath.set('highlightColor' ,user.get('colorCode'));

            this.updateHistory('select', edge.id());
        },

        unselectModelEdge: function(edge){
            var edgePath = model.at('_page.doc.cy.edges.'  + edge.id());
            if(edgePath.get('id'))
                edgePath.set('highlightColor' , null);

            this.updateHistory('unselect', edge.id());
        },


        addModelEdge: function(edgeId, param, user){



            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId+'.id', edgeId);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.highlightColor', null);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.lineColor', '#555555');


            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.source', param.source);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.target', param.target);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.sbgnclass', param.sbgnclass);

            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.width', '1.5');


            //We don't want all the attributes of the param to be printed
            this.updateHistory('add', edgeId, {source: param.source, target: param.target, sbgnclass: param.sbgnclass});


        },


        deleteModelEdge: function(id, user){

                model.pass({user:user}).del(('_page.doc.cy.edges.'  + id));

                this.updateHistory('delete', id);


        },


        deleteModelEdges: function(selectedEdges, user){
            var self = this;

            if(selectedEdges != null) {
                for (var i = 0; i < selectedEdges.length; i++) {
                    var edge = selectedEdges[i];
                    self.deleteModelEdge(edge.id(), user);

                }
            }
        },

        //should be called before loading a new graph to prevent id confusion
        deleteAll: function(nodes, edges , user){

            this.deleteModelNodes(nodes,user);
            this.deleteModelEdges(edges,user);

            this.updateHistory('new model');

        },

        getServerGraph: function(){

            return model.get('_page.doc.jsonObj');
        },

        //setServerGraph: function(graph){
        //
        //    model.set('_page.doc.jsonObj', graph);
        //},



        updateServerGraph: function(cytoscapeJsGraph){
            //TODO: could be simplified to a single node/edge update
            model.set('_page.doc.jsonObj', cytoscapeJsGraph);

            //this.updateHistory('load graph');
        },


        convertToCyNode: function(nodeId){

        },

        initModelNode: function(node, user){


            var nodePath = model.at('_page.doc.cy.nodes.' + node.id());

            if (nodePath.get('id')) {

                var borderColor = nodePath.get('borderColor');

                if (borderColor != null)
                    node.data('borderColor', borderColor);
                else
                    this.changeModelNodeAttribute('borderColor', node.id(),node.css('border-color'), user); //initially css is active, it is then loaded to data('borderColor')

                var borderWidth = nodePath.get('borderWidth');
                if (borderWidth != null)
                    node.css('border-width', borderWidth);
                else
                    this.changeModelNodeAttribute('borderWidth', node.id(),node.css('border-width'), user);




                var backgroundColor = nodePath.get('backgroundColor');

                if (backgroundColor != null)
                    node.css('background-color', backgroundColor);
                else
                    this.changeModelNodeAttribute('backgroundColor', node.id(),node.css('background-color'), user);


                //SBGN properties are stored in the data component
                var sbgnlabel = nodePath.get('sbgnlabel');



                if (sbgnlabel != null)
                    node.data('sbgnlabel', sbgnlabel );

                else
                    this.changeModelNodeAttribute('sbgnlabel', node.id(),node.data('sbgnlabel'), user);



                var isCloneMarker = nodePath.get('isCloneMarker');


                if (isCloneMarker != null)
                    node.data('sbgnclonemarker', isCloneMarker ? true : undefined);

                else
                    this.changeModelNodeAttribute('isCloneMarker', node.id(),node.data('sbgnclonemarker'), user);

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

                else
                    this.changeModelNodeAttribute('sbgnStatesAndInfos', node.id(),node.data('sbgnstatesandinfos'), user);


                var parent = nodePath.get('parent');

                if (parent != null)
                    node.data('parent', parent);
                else
                    this.changeModelNodeAttribute('parent', node.id(),node.data('parent'), user);

                var width = nodePath.get('width');

                if (width != null){
                    node._private.style.width.value = width;
                    node._private.style.width.pfValue = width;
                    node._private.data.sbgnbbox.w = width;
                }
                else
                    this.changeModelNodeAttribute('width', node.id(),node.width(), user);

                var height = nodePath.get('height');

                if (height != null){
                    node._private.style.height.value = height;
                    node._private.style.height.pfValue = height;
                    node._private.data.sbgnbbox.h = height;
                }
                else
                    this.changeModelNodeAttribute('height', node.id(),node.height(), user);


            }

        },
        initModelEdge: function(edge, user){
            edge.addClass('changeLineColor');

            var edgePath = model.at('_page.doc.cy.edges.' + edge.id());
            if (edgePath.get('id')) {
                var lineColor = edgePath.get('lineColor');

                if (lineColor != null)
                    edge.data('lineColor', lineColor);
                else
                    this.changeModelEdgeAttribute('lineColor', edge.id(),edge.css('line-color'), user);


                //sbgn properties??????
                //var width = edgePath.get('width');
                //
                //if(width != null)
                //    edge.css('width', width);
                //else
                //    this.changeModelEdgeAttribute('width', edge.id(),edge.css('width'), user);
                //
                //
                //var cardinality = edgePath.get('cardinality');
                //if(cardinality != null)
                //    edge.data('sbgncardinality', cardinality);
                //else
                //    this.changeModelEdgeAttribute('cardinality', edge.id(),edge.data('sbgncardinality'), user);


                //var sbgnclass = edgePath.get('sbgnclass');
                //if(sbgnclass != null)
                //    edge.data('sbgnclass', sbgnclass);
                //else
                //    this.changeModelEdgeAttribute('sbgnclass', edge.id(),edge.data('sbgnclass'), user);


                var source = edgePath.get('source');

                if(source != null)
                    edge.data('source', source);
                else
                    this.changeModelEdgeAttribute('source', edge.id(),edge.data('source'), user);


                var target = edgePath.get('target');
                if(target != null)
                    edge.data('target', target);
                else
                    this.changeModelEdgeAttribute('target', edge.id(),edge.data('target'), user);

            }

        },

        initModel: function(jsonObj, nodes, edges, user){




            jsonObj.nodes.forEach(function(node){

                model.pass({user:user}).set('_page.doc.cy.nodes.' + node.data.id + '.id', node.data.id);
                model.pass({user:user}).set('_page.doc.cy.nodes.' + node.data.id + '.position', {x: node.data.sbgnbbox.x, y: node.data.sbgnbbox.y}); //initialize position


            });
            jsonObj.edges.forEach(function(edge){

                var edgeId = edge.data.id;

                model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId + '.id', edgeId);
            });

            var self = this;
            nodes.forEach(function (node) {
                self.initModelNode(node, user);
            });

            edges.forEach(function (edge) {
                self.initModelEdge(edge, user);
            });



            model.set('_page.doc.cy.hideShow.mode', -1); //neither hide nor show

        }
    }
}