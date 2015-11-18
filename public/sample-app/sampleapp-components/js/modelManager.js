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
        setName: function(userName){

           model.fetch('users', userId, function(err){
               user.set('name', userName);
           });

        },
        updateLayoutProperties: function(defaultLayoutProperties){

            var currentLayoutProperties;
            var lp =  model.get('_page.doc.layoutProperties');
            if(lp == null)
                currentLayoutProperties = _.clone(defaultLayoutProperties);
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
              //  this.updateServerGraph();
            }

        },
        moveModelNode: function(nodeId, pos,user){
            var nodePath = model.at('_page.doc.cy.nodes.'  +nodeId);
            if(nodePath.get('id')){

                // if(!node.selected) //selected nodes will still be highlighted even if they are freed
                model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId+ '.highlightColor' , null);
                model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.position' , pos);


                //this.updateServerGraph();
            }


            this.updateHistory('move', nodeId, coordinateRound(pos, 3));

        },
        addModelNode: function(nodeId,  param, user){
          //  var pos = {x: param.x, y: param.y};


            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId+'.id', nodeId);
            model.pass({user:user}).set('_page.doc.cy.nodes.' +nodeId +'.position', {x: param.x, y: param.y});



            //Adding the node
            model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnclass', param.sbgnclass);


            model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.width', 50);
            model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.height', 50);

            //model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnbboxW', 50);
            //model.pass({user:user}).set('_page.doc.cy.nodes.' + nodeId+'.sbgnbboxH', 50);



            //Initialization
        /*    model.pass({user:user}).set('_page.doc.cy.nodes.' + node.id() +'.highlightColor', null);
            model.pass({user:user}).set('_page.doc.cy.nodes.' + node.id() + '.backgroundColor', node.css('background-color'));
            model.pass({user:user}).set('_page.doc.cy.nodes.' + node.id() + '.borderWidth', node.css('border-width'));
            model.pass({user:user}).set('_page.doc.cy.nodes.' + node.id() + '.borderColor', node.css('border-color'));
*/



            this.updateHistory('add', nodeId, param);

            //this.updateServerGraph();
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
            model.pass({user: user}).del(('_page.doc.cy.nodes.' + id));

            this.updateHistory('delete', id, "");

            //this.updateServerGraph();
        },

        deleteModelNodes: function(selectedNodes,user){
            for( var i = 0; i < selectedNodes.length; i++ ) {
                var node = selectedNodes[i];
                model.pass({user: user}).del(('_page.doc.cy.nodes.' + node.id()));

                this.updateHistory('delete', node.id(), "");


            }

       //     this.updateServerGraph();


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


        addModelEdge: function(edge, param, user){

            var command = {userName: user.get('name'), name: 'add', id: edge.id(), param: param, time: new Date};
            model.push('_page.doc.history',command);

            model.pass({user:user}).set('_page.doc.cy.edges.' + edge.id() +'.id', edge.id());
            model.pass({user:user}).set('_page.doc.cy.edges.' + edge.id() +'.highlightColor', null);

            model.pass({user:user}).set('_page.doc.cy.edges.' + edge.id() +'.source', param.source);
            model.pass({user:user}).set('_page.doc.cy.edges.' + edge.id() +'.target', param.target);

            //Initialization
            model.pass({user:user}).set('_page.doc.cy.edges.' + edge.id() + '.lineColor', edge.data('lineColor'));
            model.pass({user:user}).set('_page.doc.cy.edges.' + edge.id() + '.width', edge.css('width'));
            model.pass({user:user}).set('_page.doc.cy.edges.' + edge.id() + '.cardinality', edge.data('sbgncardinality'));
            model.pass({user:user}).set('_page.doc.cy.edges.' + edge.id() +'.sbgnclass', param.sbgnclass);


            this.updateHistory('add', edge.id(), param);

        //    this.updateServerGraph();

        },

        deleteModelEdges: function(selectedEdges, user){
            for( var i = 0; i < selectedEdges.length; i++ ) {
                var edge = selectedEdges[i];
                model.pass({user:user}).del(('_page.doc.cy.edges.'  +edge.id()));

                this.updateHistory('delete', edge.id(), "");

            }

//            this.updateServerGraph();
        },

        getServerGraph: function(){


            return model.get('_page.doc.jsonObj');
        },

        setServerGraph: function(graph){

            model.set('_page.doc.jsonObj', graph);
        },

        updateServerGraph: function(cytoscapeJsGraph){
            //TODO: could be simplified to a single node/edge update

            model.set('_page.doc.jsonObj', cytoscapeJsGraph);
        },

        initModel: function(jsonObj, nodes, edges, user){

            jsonObj.nodes.forEach(function(node){

                model.set('_page.doc.cy.nodes.' + node.data.id + '.id', node.data.id);
                model.pass({user:user}).set('_page.doc.cy.nodes.' + node.data.id + '.position', {x: node.data.sbgnbbox.x, y: node.data.sbgnbbox.y}); //initialize position

            });
            jsonObj.edges.forEach(function(edge){
                model.set('_page.doc.cy.edges.' + edge.data.id + '.id', edge.data.id);
            });

            nodes.forEach(function (node) {

                node.addClass('changeBorderColor');

                var nodePath = model.at('_page.doc.cy.nodes.' + node.id());
                if (nodePath.get('id')) {

                    var width = nodePath.get('width');
                    if (width != null)
                        node.data('width', width);
                    else
                        nodePath.pass({user: user}).set('width', node.width());

                    var height = nodePath.get('height');
                    if (height != null)
                        node.data('height', height);
                    else
                        nodePath.pass({user: user}).set('height', node.height());


                    var borderWidth = nodePath.get('borderWidth');
                    if (borderWidth != null)
                        node.css('border-width', borderWidth);
                    else
                        nodePath.pass({user: user}).set('borderWidth', node.css('border-width'));


                    var borderColor = nodePath.get('borderColor');
                    if (borderColor != null)
                        node.data('borderColor', borderColor);
                    else
                        nodePath.pass({user: user}).set('borderColor', node.css('border-color'));


                    var backgroundColor = nodePath.get('backgroundColor');

                    if (backgroundColor != null)
                        node.css('background-color', backgroundColor);
                    else
                        nodePath.pass({user: user}).set('backgroundColor', node.css('background-color'));


                    var isCloneMarker = nodePath.get('isCloneMarker');

                    if (isCloneMarker != null)
                        node.data('sbgnclonemarker', isCloneMarker ? true : undefined);

                    else
                        nodePath.pass({user: user}).set('isCloneMarker', false);


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
                        nodePath.pass({user: user}).set('parent', node.data('parent'));


                    var sbgnStatesAndInfos = nodePath.get('sbgnStatesAndInfos');
                    if(sbgnStatesAndInfos != null){
                        node.data('sbgnstatesandinfos',sbgnStatesAndInfos);
                    }


                }

            });

            edges.forEach(function (edge) {

                edge.addClass('changeLineColor');

                var edgePath = model.at('_page.doc.cy.edges.' + edge.id());
                if (edgePath.get('id')) {
                    var lineColor = edgePath.get('lineColor');

                    if (lineColor != null)
                        edge.data('lineColor', lineColor);
                    else{
                        edgePath.pass({user:user}).set('lineColor', edge.css('line-color'));

                    }

                    var width = edgePath.get('width');
                    if(width != null)
                        edge.css('width', width);
                    else
                        edgePath.pass({user:user}).set('width', edge.css('width'));


                    var cardinality = edgePath.get('cardinality');
                    if(cardinality != null)
                        edge.data('sbgncardinality', cardinality);
                    else
                        edgePath.pass({user:user}).set('cardinality', edge.data('sbgncardinality'));

                }
            });

        }
    }
}