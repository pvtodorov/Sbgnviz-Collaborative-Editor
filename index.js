/*
 *	Model initialization
 *  Event handlers of model updates
 *	Author: Funda Durupinar Babur<f.durupinar@gmail.com>
 */
var app = module.exports = require('derby').createApp('chat', __filename);


app.loadViews(__dirname + '/views');
//app.loadStyles(__dirname + '/styles');
//app.serverUse(module, 'derby-stylus');


var ONE_DAY = 1000 * 60 * 60 * 24;

var ONE_HOUR = 1000 * 60 * 60;

var ONE_MINUTE = 1000 * 60;

var docReady = false;

var menu;


var userCount;
var socket;

var modelManager;
var oneColor = require('onecolor');
app.on('model', function (model) {


    model.fn('pluckUserIds', function (items, additional) {
        var ids, item, key;


        if (items == null) {
            items = {};
        }
        ids = {};
        if (additional) {
            ids[additional] = true;

        }
        for (key in items) {
            item = items[key];
            //do not include previous messages

            if (item != null ? item.userId : void 0) {
                ids[item.userId] = true;
            }
        }


        return Object.keys(ids);
    });

    model.fn('biggerTime', function (item) {
        var duration = model.get('_page.durationId');
        var startTime;
        if (duration < 0)
            startTime = 0;
        else
            startTime = new Date - duration;

        return item.time > startTime;
    });


});

app.get('/', function (page, model, params) {
    function getId() {
        return model.id();
    }

    function idIsReserved() {
        var ret = model.get('documents.' + docId) != undefined;
        return ret;
    }

    var docId = getId();

    while (idIsReserved()) {
        docId = getId();
    }

    return page.redirect('/' + docId);
});


app.get('/:docId', function (page, model, arg, next) {
    var messagesQuery, room;
    room = arg.docId;



    var docPath = 'documents.' + arg.docId;



    model.subscribe(docPath, 'cy', function(err) {
            if (err) {
                return next(err);
            }
            model.setNull(docPath, { // create the empty new doc if it doesn't already exist
                id: arg.docId
            });


            // create a reference to the document
            model.ref('_page.doc', 'documents.' + arg.docId);
            model.subscribe(docPath, 'history');


        }

    );
    model.subscribe(docPath, 'images');



    //chat related
    model.set('_page.room', room);

    model.set('_page.durations', [{name: 'All', id: -1}, {name: 'One day', id: ONE_DAY}, {
        name: 'One hour',
        id: ONE_HOUR
    }, {name: 'One minute', id: ONE_MINUTE}]);


    model.set('_sbgnviz.samples',
        [{name: 'Activated STAT1alpha induction of the IRF1 gene', id: 0},
            {name: 'CaM-CaMK dependent signaling to the nucleus', id: 1},
            {name: 'Glycolysis', id: 2},
            {name: 'MAPK cascade', id: 3},
            {name: 'PolyQ proteins interference', id: 4},
            {name: 'Insulin-like Growth Factor (IGF) signalling', id: 5},
            {name: 'ATM mediated phosphorylation of repair proteins', id: 6},
            {name: 'Vitamins B6 activation to pyridoxal phosphate', id: 7}

        ]);




    //model.subscribe('messages');
    var userId = model.get('_session.userId');

    messagesQuery = model.query('messages', {
        room: room,
        time: {
            $gt: 0
        },
        targets: {
                $elemMatch:{id: userId}
            }
    });

    messagesQuery.subscribe(function (err) {

        if (err) {
            return next(err);
        }


        //just to initialize
        model.set('_page.doc.userIds',[model.get('_session.userId')]);

        model.subscribe('users');
        var  usersQuery = model.query('users', '_page.doc.userIds');
        usersQuery.subscribe(function (err) {
            if (err) {
                return next(err);
            }
            var  user = model.at('users.' + model.get('_session.userId'));



            userCount = model.at('chat.userCount');



            return userCount.fetch(function (err) {
                if(user.get()) {
                    if(user.get('colorCode') == null ){
                        user.set('colorCode', getNewColor());
                    }
                    if(user.get('name') != null)
                        return page.render();

                }
                if (err) {
                    return next(err);
                }

                return userCount.increment(function (err) {
                    if (err) {
                        return next(err);
                    }
                    user.set({
                        name: 'User ' + userCount.get(),
                        colorCode: getNewColor()
                    });




                    return page.render();
                });
            });
        });
    });
});



function getNewColor(){
    var gR = 1.618033988749895; //golden ratio
    var h = Math.floor((Math.random() * gR * 360));//Math.floor((cInd * gR - Math.floor(cInd * gR))*360);
    var cHsl = [h, 70 + Math.random() * 30, 60 + Math.random() * 10];

  //  return ('hsla('+cHsl[0]  +', '+ cHsl[1] + '%, ' + cHsl[2] +'%, 1)');
    var strHsl = 'hsl('+cHsl[0]  +', '+ cHsl[1] + '%, ' + cHsl[2] +'%)';

  return oneColor(strHsl).hex();


}


function triggerContentChange(divId){
    //TODO: triggering here is not good


    $(('#' + divId)).trigger('contentchanged');

}
function playSound() {
    try {
        document.getElementById('notificationAudio').play();
        if (!document)
            throw err;
    }
    catch (err) {
        return err;
    }


}



app.proto.changeDuration = function () {

    return this.model.filter('messages', 'biggerTime').ref('_page.list');


};



app.proto.init = function (model) {
    var timeSort;


    //
    //model.on('all', '_page.doc.runLayout', function(op, val, prev,passed){
    //    if(val){
    //        if(docReady &&  passed.user == null) {
    //            if(val == true){
    //                $("#perform-layout").trigger('click');
    //            }
    //        }
    //
    //    }
    //});

    model.on('all', '_page.doc.cy.nodes.*', function(id, op, val, prev, passed){


        if(docReady &&  passed.user == null) {
            var node  = model.get('_page.doc.cy.nodes.' + id);

            if(!node || !node.id){ //node is deleted

                deleteElement(id);
            }
            //else insertion
        }

    });

    model.on('all', '_page.doc.cy.edges.*', function(id, op, val, prev, passed){


        if(docReady &&  passed.user == null) {
            var edge  = model.get('_page.doc.cy.edges.' + id); //check

            if(!edge|| !edge.id){ //node is deleted
                deleteElement(id);
            }
            //else insertion
        }

    });

    model.on('all', '_page.doc.sampleInd', function(op, ind, prev, passed){


        if(docReady && passed.user == null) {

            menu.updateSample(ind, false); //false = do not delete, sample changing client deleted them already
        }

    });


    //trigger variable to check whether parts of the graph should be highlighted
    model.on('change', '_page.doc.cy.highlight.mode', function(val, ind ,passed) {


        if(docReady  && passed.user == null){
            var requesterId = model.get('_page.doc.cy.highlight.requesterId');
            if(val == 0)
                menu.removeHighlights(requesterId);
            else if(val == 1)
                menu.highlightNeighbors(requesterId);
            else if(val == 2)
                menu.highlightProcesses(requesterId);
        }


    });

    model.on('all', '_page.doc.layoutProperties', function(index){


        if(docReady && menu ){
            var layoutProps = model.get('_page.doc.layoutProperties');

            menu.updateLayoutProperties(layoutProps);

        }

    });
    model.on('all', '_page.doc.cy.nodes.*.sbgnclass', function(id, op, sbgnclass, prev, passed){ //this property must be something that is only changed during insertion


        if(docReady && passed.user == null) {

            var pos = model.get('_page.doc.cy.nodes.'+ id + '.position');

            insertNode({id:id, position:pos,  sbgnclass: sbgnclass});


        }

    });

    model.on('all', '_page.doc.cy.edges.*.sbgnclass', function(id,op, sbgnclass, prev, passed){//this property must be something that is only changed during insertion

        if(docReady && passed.user == null ){
            //check if edge id exists in the current inspector graph
            var source = model.get('_page.doc.cy.edges.'+ id + '.source');
            var target = model.get('_page.doc.cy.edges.'+ id + '.target');

            insertEdge(source, target, sbgnclass);
        }

    });

    model.on('change', '_page.doc.cy.nodes.*.position', function(id, pos, prev, passed){

        if(docReady && passed.user == null){

            updateElementProperty(id, 'position', pos, 'position');
        }


    });

    model.on('change', '_page.doc.cy.nodes.*.highlightColor', function(id, highlightColor, prev,passed){


        if(docReady && passed.user == null) {

            var color;

            if (highlightColor != null)
                color =  highlightColor;//tinycolor(highlightColor).toHexString();
            else
                color = model.get('_page.doc.cy.nodes.' + id + '.backgroundColor');

            //console.log(tinycolor(highlightColor).toHexString() +  " " +  model.get('_page.doc.cy.nodes.' + id + '.backgroundColor'));

            updateElementProperty(id, 'background-color', color, 'css');
        }

    });
    model.on('all', '_page.doc.cy.nodes.*.sbgnlabel', function(id, op, label,prev, passed){

        if(docReady && passed.user == null) {
            updateElementProperty(id, 'sbgnlabel', label, 'data');
        }
    });
    model.on('all', '_page.doc.cy.nodes.*.borderColor', function(id, op, borderColor,prev, passed){

        if(docReady && passed.user == null) {
            updateElementProperty(id,  'borderColor', borderColor, 'data');

        }
    });

    model.on('all', '_page.doc.cy.nodes.*.borderWidth', function(id,  op,borderWidth,prev, passed){

        if(docReady && passed.user == null) {
            updateElementProperty(id,  'border-width', borderWidth, 'css');
        }
    });

    model.on('all', '_page.doc.cy.nodes.*.backgroundColor', function(id,  op, backgroundColor,prev, passed){

        if(docReady && passed.user == null) {

            updateElementProperty(id,  'background-color', backgroundColor, 'css');
        }
    });


    model.on('all', '_page.doc.cy.nodes.*.isMultimer', function(id,  op,isMultimer,prev, passed){

        if(docReady && passed.user == null) {
            updateMultimerStatus(id, isMultimer);

        }
    });

    model.on('all', '_page.doc.cy.nodes.*.isCloneMarker', function(id,  op,isCloneMarker,prev, passed){

        if(docReady && passed.user == null) {
            updateCloneMarkerStatus(id, isCloneMarker);
        }
    });

    model.on('all', '_page.doc.cy.nodes.*.parent', function(id,  op,parent,prev, passed){


        if(docReady && passed.user == null) {


            updateElementProperty(id,  'parent', parent, 'data');
        }
    });

    //a new compound node is added
    model.on('all', '_page.doc.cy.nodes.*.children', function(id, op, children,prev, passed){


        if(docReady && passed.user == null) {


            updateElementProperty(id,  'children', children, 'data');
            addRemoveUtilities.changeParentForNodeIds(children,  id);


        }
    });

    model.on('all', '_page.doc.cy.nodes.*.width', function(id,  op, width ,prev, passed){

        if(docReady && passed.user == null) {
            updateElementProperty(id,  'width', width, 'data');
        }
    });

    model.on('all', '_page.doc.cy.nodes.*.height', function(id,  op, height, prev, passed){

        if(docReady && passed.user == null) {
            updateElementProperty(id,  'height', height, 'data');
        }
    });

    model.on('all', '_page.doc.cy.nodes.*.sbgnbboxW', function(id,  op, width ,prev, passed){

        if(docReady && passed.user == null) {
            updateElementProperty(id,  'sbgnbbox.w', width, 'data');
        }
    });
    model.on('all', '_page.doc.cy.nodes.*.sbgnbboxH', function(id,  op, height, prev, passed){

        if(docReady && passed.user == null) {
            updateElementProperty(id,  'sbgnbbox.h', height, 'data');
        }
    });


    model.on('all', '_page.doc.cy.nodes.*.sbgnStatesAndInfos', function(id,  op, sbgnStatesAndInfos,prev, passed){


        if(docReady && passed.user == null) {
            updateElementProperty(id,  'sbgnstatesandinfos', sbgnStatesAndInfos, 'data');

        }
    });

    model.on('all', '_page.doc.cy.edges.*.lineColor', function(id,  op, lineColor,prev, passed){


        if(docReady && passed.user == null) {
            updateElementProperty(id,  'lineColor', lineColor, 'data');
        }
    });
    model.on('all', '_page.doc.cy.edges.*.highlightColor', function(id, op, highlightColor,prev, passed){

        if(docReady && passed.user == null) {
            var color;
            if (highlightColor != null)
                color = highlightColor;
               // color = tinycolor(highlightColor).toHexString();//util.tuple2hex(util.hsl2tuple(highlightColor));
            else
                color = model.get('_page.doc.cy.edges.' + id + '.lineColor');

            updateElementProperty(id, 'lineColor', color, 'data');
        }

    });


    model.on('all', '_page.doc.cy.edges.*.width', function(id,  op, width,prev, passed){
        if(docReady && passed.user == null) {
            updateElementProperty(id,  'width', width, 'css');
        }
    });

    model.on('all', '_page.doc.cy.edges.*.cardinality', function(id, op,  cardinality,prev, passed){

        if(docReady && passed.user == null) {
            updateElementProperty(id,  'sbgncardinality', cardinality, 'data');
        }
    });

    model.on('all', '_page.doc.images', function() {
        if (docReady)
            triggerContentChange('receivedImages');
    });

    model.on('all', '_page.doc.history', function(){
        if(docReady){
            triggerContentChange('command-history-area');
        }
    });


    model.on('insert', '_page.list', function (index) {


        var com = model.get('_page.list');
        var myId = model.get('_session.userId');


        if(docReady){
            triggerContentChange('messages');

        }

        if (com[com.length - 1].userId != myId) {

            playSound();

        }
    });


    timeSort = function (a, b) {
        return (a != null ? a.time : void 0) - (b != null ? b.time : void 0);
    };



    return model.sort('messages', timeSort).ref('_page.list');
};


app.proto.create = function (model) {
    model.set('_page.showTime', true);
    docReady = true;



    socket = io();

    var id = model.get('_session.userId');
    var name = model.get('users.' + id +'.name');
   socket.emit("subscribeHuman", {userName:name,room:  model.get('_page.room'), userId: id}, function(userList){

        var userIds =[];
        userList.forEach(function(user){
            userIds.push(user.userId);
        });

        model.set('_page.doc.userIds', userIds );
    }); //subscribe to current doc as a new room


    //to capture user disconnection, this has to be through sockets-- not model
    socket.on('userList', function(userList){
        var userIds =[];
        userList.forEach(function(user){
            userIds.push(user.userId);
        });

        model.set('_page.doc.userIds', userIds );

    });

    socket.on('loadFile', function(txtFile){
        menu.loadFile(txtFile);
    });

    socket.on('newFile', function(){
        $('#new-file').trigger("click");
    });

    //better through sockets-- model operation causes complications
    socket.on('runLayout', function(){
        $("#perform-layout").trigger('click');
    });

    //TODO: make this a function in menu-functions
    socket.on('addCompound', function(data){

        //unselect all others
        cy.nodes().unselect();

        data.selectedNodes.forEach(function(nodeId){

            cy.getElementById( nodeId).select();
        });


        if(data.type == "complex")
            $("#make-compound-complex").trigger('click');
        else
            $("#make-compound-compartment").trigger('click');


    });




    modelManager = require('./public/sample-app/sampleapp-components/js/modelManager.js')(model, model.get('_page.room'), model.get('_session.userId'),name );




    menu =  require('./public/sample-app/sampleapp-components/js/sample-app-menu-functions.js')();

    //send modelManager to web client
    menu.start(modelManager);



    this.atBottom = true;



    return model.on('all', '_page.list', (function (_this) {

        return function () {
            if (!_this.atBottom) {
                return;
            }
            return _this.container.scrollTop = _this.list.offsetHeight;
        };
    })(this));
};


app.proto.onScroll = function () {
    var bottom, containerHeight, scrollBottom;
    bottom = this.list.offsetHeight;
    containerHeight = this.container.offsetHeight;
    scrollBottom = this.container.scrollTop + containerHeight;

    return this.atBottom = bottom < containerHeight || scrollBottom > bottom - 10;

};


app.proto.changeColorCode = function(){

    var  user = this.model.at('users.' + this.model.get('_session.userId'));

    user.set('colorCode', getNewColor());

};



app.proto.add = function (model, filePath) {

    if(model == null)

        model = this.model;
    this.atBottom = true;



        var comment;
        comment = model.del('_page.newComment'); //to clear  the input box
        if (!comment) {
            return;
        }

        var targets  = [];
        var users = model.get('_page.doc.userIds');

        var myId = model.get('_session.userId');
        for(var i = 0; i < users.length; i++){
            var user = users[i];
            if(user == myId ||  document.getElementById(user).checked){
                targets.push({id: user});
            }
        }

        var msgUserId = model.get('_session.userId');
        var msgUserName = model.get('users.' + msgUserId +'.name');

        model.add('messages', {
            room: model.get('_page.room'),
            targets: targets,
            userId: msgUserId,
            userName: msgUserName,
            comment: comment,
            time: -1//val //server assigns the correct time
        });


        //append image  after updating the message list on the page
        //if(filePath!=null) {
        //    var msgs = $("div[class='message']");
        //    //append this to the message with the filepath as a thumbnail
        //    $("div[class='message']").each(function (index, element) {
        //        if ($(element).context.innerHTML.indexOf(filePath) > -1) {
        //            $(element).append("<div class = 'receivedImage' ></div>");
        //        //
        //        }
        //    });
        //

//s        }
};




app.proto.uploadFile = function(evt){

    try{
        var room = this.model.get('_page.room');
        var fileStr = this.model.get("_page.newFile").split('\\');
        var filePath = fileStr[fileStr.length-1];

        var file = evt.target.files[0];

        var reader = new FileReader();
        reader.onload = function(evt){
            modelManager.addImage({ img: evt.target.result,room: room, filePath: filePath});

        };

        reader.readAsDataURL(file);

        //Add file name as a text message
        this.model.set('_page.newComment', "Sent image: "  + filePath );//+  ' <img src="' + evt.target.result + '" onclick ="openImage(this)" onmouseover ="showQTip(this)" /> ');

        this.app.proto.add(this.model, filePath);


    }
    catch(error){ //clicking cancel when the same file is selected causes error
        console.log(error);

    }
};


app.proto.count = function (value) {
    return Object.keys(value || {}).length;
};



app.proto.formatTime = function (message) {
    var hours, minutes, seconds, period, time;
    time = message && message.time;
    if (!time) {
        return;
    }
    time = new Date(time);
    hours = time.getHours();

    minutes = time.getMinutes();

    seconds = time.getSeconds();

    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
};

app.proto.formatObj = function(obj){

    return JSON.stringify(obj);
}


//Model update functions
function deleteElement(elId){
    setTimeout(function(){
        try{
            var el = cy.$(('#' + elId));
                     cy.elements().unselect(); //unselect others

            //todo element is already selected? el.select(); //select this one

            addRemoveUtilities.removeElesSimply(el);
            updateServerGraph();

        }
        catch (err) {
            console.log("Please reload page. " + err);
        }
    }, 0);

}

function insertNode(nodeData){
    setTimeout(function(){
        try{

            var param = {};
            param.newNode = {
                x: nodeData.position.x,
                y: nodeData.position.y,
                sbgnclass: nodeData.sbgnclass
            };
            var newNode = addRemoveUtilities.addNode(param.newNode.x, param.newNode.y, param.newNode.sbgnclass, nodeData.id);


            cy.forceRender();
            updateServerGraph();


        }
        catch (err) {
            console.log("Please reload page. " + err);
        }
    }, 0);

}


function insertEdge (sourceId, targetId, sbgnClass){
    setTimeout(function(){
        try {
            var param = {};
            param.newEdge = {
                source: sourceId,
                target: targetId,
                sbgnclass: sbgnClass
            };
            param.firstTime = true;

            addRemoveUtilities.addEdge(param.newEdge.source, param.newEdge.target, param.newEdge.sbgnclass);

            updateServerGraph();
        }
        catch (err) {
            console.log("Please reload page. " + err);
        }
    }, 0);
}




function updateElementProperty(elId, propName, propValue, propType){

    setTimeout(function(){
        try {
            var el = cy.$(('#' + elId));



             //TODO: correct resizing
             if(propName == 'width'){
                 el[0]._private.autoWidth = propValue;
                 //el[0]._private.style.width.value.strVal = propValue + "px";
                 el[0]._private.style.width.value = propValue;
                 el[0]._private.style.width.pxValue = propValue;


                 if(propType == 'data')
                    el[0]._private.data.sbgnbbox.w = propValue;

             }
             else if(propName == 'height'){
                 el[0]._private.autoHeight = propValue ;
                 //
                 // el[0]._private.style.height.value.strVal = propValue + "px";
                 el[0]._private.style.height.value = propValue;
                 el[0]._private.style.height.pxValue = propValue;
                 if(propType == 'data')
                    el[0]._private.data.sbgnbbox.h = propValue;

             }
            else if(propName == 'sbgnstatesandinfos'){
                 el[0]._private.data.sbgnstatesandinfos = propValue;
             }

            else if(propName == 'parent'){
                 el[0]._private.data.parent = propValue;



             }
             else if(propName == 'children'){
                var elArr = [];

                     propValue.forEach(function (nodeId) {
                         elArr.push(cy.getElementById(nodeId));
                     });



                 el[0]._private.children = elArr;
                 refreshPaddings();


             }

            else if (propType == 'position')
                el[propType](propValue);
            else
                el[propType](propName, propValue);


            //update server graph
            updateServerGraph();


            cy.forceRender();

        }

        catch (err) {
            console.log("Please reload page. " + err + "   Prop name:" + propName + " Element: "  + elId + " Prop type:" + propType + "  propValue: " + propValue);
        }
    },0);
}

//Update the inspector as well
function updateMultimerStatus(elId, isMultimer){
    setTimeout(function(){
        try {
            var node = cy.$(('#' + elId));


            var sbgnclass = node.data('sbgnclass');
            if (isMultimer) {
                //if not multimer already
                if(sbgnclass.indexOf(' multimer') <= -1) //todo funda changed
                    node.data('sbgnclass', sbgnclass + ' multimer');
            }
            else {
                node.data('sbgnclass', sbgnclass.replace(' multimer', ''));
            }

            cy.forceRender();
            updateServerGraph();
        }

        catch (err) {
            console.log("Please reload page. " + err);
        }
    },0);
}

function updateCloneMarkerStatus(elId, isCloneMarker){

    setTimeout(function(){

        try{
            var node = cy.$(('#' + elId))[0];




            //node.data('sbgnclonemarker', isCloneMarker?true:undefined);
            node._private.data.sbgnclonemarker = isCloneMarker?true:undefined;

            cy.forceRender();


            updateServerGraph();

        }
        catch (err) {
            console.log("Please reload page. " + err);
        }
    }, 0);
};

function updateServerGraph (){

    var sbgnmlText = jsonToSbgnml.createSbgnml();
    var cytoscapeJsGraph = sbgnmlToJson.convert(sbgnmlText);

    modelManager.updateServerGraph(cytoscapeJsGraph);
};
