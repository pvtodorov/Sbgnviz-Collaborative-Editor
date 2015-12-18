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

module.exports =  function(model, docId, userId, userName) {


    var user = model.at('users.' + userId);



    model.ref('_page.doc', 'documents.' + docId);

    return{

        getModel: function(){
            return model;
        },

        addImage: function(data, user){
            model.pass({user:user}).push('_page.doc.images', data);
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


            return currentLayoutProperties;
        },
        setLayoutProperties: function(layoutProperties){
            model.set('_page.doc.layoutProperties', layoutProperties); //synclayout

        },


        getSampleInd: function(user){
            var ind = model.get('_page.doc.sampleInd');
            if(ind == null)
                ind = "0";
            this.setSampleInd(ind, user);

            return ind;

        },
        setSampleInd: function(ind, user){
            model.pass({user:user}).set('_page.doc.sampleInd', ind);
        },

        updateHistory: function(opName, elId, param){
            var command = {userName: userName,name: opName, id: elId, param: param, time: new Date};
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


        selectModelNode: function(node){

            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());
            if(nodePath.get('id') && user){
                nodePath.set('highlightColor' , user.get('colorCode'));

            }

        },

        unselectModelNode: function(node){
            var nodePath = model.at('_page.doc.cy.nodes.'  +node.id());


            if(nodePath.get('id')){
                nodePath.set('highlightColor' , null);
            }

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
          //  var pos = {x: param.x, y: param.y};



            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId+'.id', nodeId);
            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.position', {x: param.x, y: param.y});



            //Adding the node
            model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnclass', param.sbgnclass);




            this.updateHistory('add', nodeId, param);

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

        deleteModelNode: function(id, user){

            //"unselect" node so that it doesn't get highlighted after undo
            //TODO: does not work!!!!!!!
            this.changeModelNodeAttribute('highlightColor', id, null, user);
            this.changeModelNodeAttribute('backgroundColor', id, null, user);

            model.pass({user: user}).del(('_page.doc.cy.nodes.' + id));


            this.updateHistory('delete', id, "");

        },

        deleteModelNodes: function(selectedNodes,user){
            var self = this;
            for( var i = 0; i < selectedNodes.length; i++ ) {
                var node = selectedNodes[i];
                self.deleteModelNode(node.id(),user);
            }
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


        },

        unselectModelEdge: function(edge){
            var edgePath = model.at('_page.doc.cy.edges.'  + edge.id());
            if(edgePath.get('id'))
                edgePath.set('highlightColor' , null);

        },


        addModelEdge: function(edgeId, param, user){



            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId+'.id', edgeId);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.highlightColor', null);

            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.source', param.source);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.target', param.target);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edgeId +'.sbgnclass', param.sbgnclass);



            this.updateHistory('add', edgeId, param);


        },


        deleteModelEdge: function(id, user){

                model.pass({user:user}).del(('_page.doc.cy.edges.'  + id));

                this.updateHistory('delete', id, "");


        },


        deleteModelEdges: function(selectedEdges, user){
            var self = this;
            for( var i = 0; i < selectedEdges.length; i++ ) {
                var edge = selectedEdges[i];
                self.deleteModelEdge(edge.id(),user);

            }

        },

        //should be called before loading a new graph to prevent id confusion
        deleteAll: function(nodes, edges , user){

            this.deleteModelNodes(nodes,user);
            this.deleteModelEdges(edges,user);

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
        },



        initModelNode: function(node, user){


            node.addClass('changeBorderColor');

            var nodePath = model.at('_page.doc.cy.nodes.' + node.id());
            if (nodePath.get('id')) {

                var width = nodePath.get('width');
                if (width != null) {

                    node.data('width', width);
                    //node._private.style.width.value = width;
                    //node._private.style.width.pxValue = width;

                    this.changeModelNodeAttribute('sbgnbboxW', node.id(),width, user); //update sbgnbbox width as well
                    node._private.data.sbgnbbox.w = width;
                }

                else{
                    this.changeModelNodeAttribute('width', node.id(), node.width(), user);
                    this.changeModelNodeAttribute('sbgnbboxW', node.id(),node.width(), user); //update sbgnbbox width as well
                }

                var height = nodePath.get('height');
                if (height != null) {
                    node.data('height', height);
                    //node._private.style.height.value = height;
                    //node._private.style.height.pxValue = height;

                    this.changeModelNodeAttribute('sbgnbboxH', node.id(),height, user); //update sbgnbbox width as well
                    node._private.data.sbgnbbox.h = height;
                }

                 else{
                    //nodePath.pass({user: user}).set('height', node.height());
                    this.changeModelNodeAttribute('sbgnbboxH', node.id(),node.height(), user); //update sbgnbbox width as well
                    this.changeModelNodeAttribute('height', node.id(),node.height(), user);
                }

                var borderWidth = nodePath.get('borderWidth');
                if (borderWidth != null)
                    node.css('border-width', borderWidth);
                else
                    this.changeModelNodeAttribute('borderWidth', node.id(),node.css('border-width'), user);


                var borderColor = nodePath.get('borderColor');
                if (borderColor != null)
                    node.data('borderColor', borderColor);
                else
                    this.changeModelNodeAttribute('borderColor', node.id(),node.css('border-color'), user);


                var backgroundColor = nodePath.get('backgroundColor');

                if (backgroundColor != null)
                    node.css('background-color', backgroundColor);
                else
                    this.changeModelNodeAttribute('backgroundColor', node.id(),node.css('background-color'), user);

                var sbgnlabel = nodePath.get('sbgnlabel');

                if (sbgnlabel != null)
                    node.data('sbgnlabel', sbgnlabel );

                else
                    this.changeModelNodeAttribute('sbgnlabel', node.id(),node.data('sbgnlabel'), user);




                var isCloneMarker = nodePath.get('isCloneMarker');


                if (isCloneMarker != null)
                    node.data('sbgnclonemarker', isCloneMarker ? true : undefined);

                else
                 //   nodePath.pass({user: user}).set('isCloneMarker', false);
                this.changeModelNodeAttribute('isCloneMarker', node.id(),node.data('sbgnclonemarker'), user);


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


                var parent = nodePath.get('parent');


                if (parent != null)
                    node.data('parent', parent);
                else
                    this.changeModelNodeAttribute('parent', node.id(),node.data('parent'), user);


                var sbgnStatesAndInfos = nodePath.get('sbgnStatesAndInfos');



                if(sbgnStatesAndInfos != null)
                    node.data('sbgnstatesandinfos',sbgnStatesAndInfos);

                else
                    this.changeModelNodeAttribute('sbgnStatesAndInfos', node.id(),node.data('sbgnstatesandinfos'), user);


                var sbgnbboxW = nodePath.get('sbgnbboxW');
                if(sbgnbboxW != null)
                    node._private.data.sbgnbbox.w = sbgnbboxW;
                else
                    this.changeModelNodeAttribute('sbgnbboxW', node.id(),node._private.data.sbgnbbox.w, user);

                var sbgnbboxH = nodePath.get('sbgnbboxH');
                if(sbgnbboxH != null)
                    node._private.data.sbgnbbox.h = sbgnbboxH;
                else
                    this.changeModelNodeAttribute('sbgnbboxH', node.id(),node._private.data.sbgnbbox.h, user);

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

                var width = edgePath.get('width');

                if(width != null)
                    edge.css('width', width);
                else
                    this.changeModelEdgeAttribute('width', edge.id(),edge.css('width'), user);


                var cardinality = edgePath.get('cardinality');
                if(cardinality != null)
                    edge.data('sbgncardinality', cardinality);
                else
                    this.changeModelEdgeAttribute('cardinality', edge.id(),edge.data('sbgncardinality'), user);


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




        }
    }
}