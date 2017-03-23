QUnit = require('qunitjs');
// agentAPI = require("../../agent-interaction/agentAPI");

module.exports = function(serverIp){


    QUnit.module( "Agent API Tests" );

    var agent;
    var agentId = '103abc';
    var agentName = "testAgent";


    function testNewAgent() {
        QUnit.test('new Agent', function (assert) {
            var Agent = require("../../agent-interaction/agentAPI");
            agent = new Agent(agentName, agentId);
            assert.ok(agent, "Agent created.");
        });
    }

    function testAgentProperties(){
        QUnit.test('Agent properties', function(assert) {
            assert.equal(agent.agentId, '103abc', "agentId is correct.");
            assert.equal(agent.agentName, "testAgent", "agentName is correct");
            assert.equal(agent.colorCode, "#00bfff", "colorCode is correct");
        });
    }



    function testLoadModel() {
        QUnit.test('Connect to server and load model', function (assert) {
            assert.expect(3);

            var done1 = assert.async();
            var done2 = assert.async();
            var done3 = assert.async();

            agent.connectToServer(serverIp, function (socket) {
                assert.ok(socket, "Socket connection achieved");
                done1();

                agent.loadModel(function () {
                    assert.ok(agent.pageDoc, "Agent acquired pageDoc");
                    done2();

                    agent.loadOperationHistory(function () {
                        assert.ok(agent.opHistory, "Agent acquired opHistory");
                        done3();
                    });
                });

            });
        });
    }

    function testChangeName(){
        QUnit.test('Change name', function (assert) {

            assert.expect(1);
            var done1 = assert.async();

            agent.changeName("HAL", function () {
                setTimeout(function () { //should wait here as well
                    assert.equal(agent.agentName, "HAL", "Agent name changed.");
                    done1();
                }, 100);

            });
        });

    }

    function testMessages() {
        QUnit.test('Message send/receive', function (assert) {
            assert.expect(1);
            var done1 = assert.async();
            var targets = agent.getUserList();

            agent.sendMessage("Hello", targets, function (data) {
                setTimeout(function () { //should wait here as well

                    assert.equal(data, "success", "Agent message sent.");
                    done1();
                }, 100);
            });

        });
    }

    function testGetRequests(){


        QUnit.test('Agent getNode and getEdge', function(assert) {
            assert.expect(2);
            var done1 = assert.async();
            var done2 = assert.async();

            agent.getNodeRequest("glyph0", function(){
                assert.equal(agent.selectedNode.id, "glyph0", "Node get operation is correct.");
                done1();
            });


            agent.getEdgeRequest("glyph15-glyph12", function(){
                assert.equal(agent.selectedEdge.id, "glyph15-glyph12", "Edge get operation is correct.");
                done2();
            });
        });

    }

    function testAddDeleteRequests(){


        QUnit.test('Agent addNode addEdge deleteNode deleteEdge', function(assert) {
            assert.expect(4);
            var done1 = assert.async();
            var done2 = assert.async();
            var done3 = assert.async();
            var done4 = assert.async();


            agent.sendRequest("agentAddNodeRequest", {param:{x:30, y:40, class:"macromolecule"}}, function(nodeId){
                setTimeout(function () { //should wait here as well
                    var val = ModelManager.getModelNode(nodeId);
                    assert.ok(val, "Node added.");
                    done1();
                },100);

            });


            var param = {source:"glyph9", target:"glyph15", class:"consumption"};
            var edgeId = (param.source+ "-" + param.target + "-" + param.class);
            agent.sendRequest("agentAddEdgeRequest", {id: edgeId, param:param}, function(){
                setTimeout(function () { //should wait here as well
                    var val = ModelManager.getModelEdge(edgeId);
                    assert.ok(val, "Edge added.");
                    done2();
                },100);

            });


            var nodeToDelete = "glyph33";
            agent.sendRequest("agentDeleteNodeRequest", {id:nodeToDelete}, function(nodeId){
                setTimeout(function () { //should wait here as well
                    var val = ModelManager.getModelNode(nodeToDelete);
                    assert.notOk(val, "Node deleted.");
                    done3();
                },100);

            });

            var edgeToDelete = "glyph7-glyph24";
            agent.sendRequest("agentDeleteEdgeRequest", {id:edgeToDelete}, function(nodeId){
                setTimeout(function () { //should wait here as well
                    var val = ModelManager.getModelEdge(edgeToDelete);
                    assert.notOk(val, "Edge deleted.");
                    done4();
                },100);

            });


        });

    }


    function testMoveNodeRequest(){


        QUnit.test('Agent moveNode', function(assert) {
            var nodeId = "glyph8";
            var pos = {x: 30, y:50};
            assert.expect(1);
            var done1 = assert.async();

            agent.sendRequest("agentMoveNodeRequest", {id: nodeId,  pos:pos}, function(){
                setTimeout(function () { //should wait here as well
                    var val = ModelManager.getModelNodeAttribute("position", nodeId);
                    assert.propEqual(val, pos, "Node move operation is correct.");
                    done1();
                },100);
            });



        });

    }

    function testNodeSetAttributeRequests() {

        QUnit.test('agentChangeNodeAttributeRequest', function (assert) {
            var id = "glyph8";

            var done = [];

            var attr = [
                {str: "highlightColor", val: "red"},
                {str: "data.label", val: "abc"},
                // {str: "data.class", val: "Phenotype"}, //changing this causes problems after reloading
                {str: "data.bbox.w", val: 40},
                {str: "data.bbox.h", val: 20},
                {str: "data.border-color", val: "green"},
                {str: "data.font-family", val: "Times"},
                {str: "data.font-weight", val: "bold"},
                {str: "data.font-size", val: 10},
                {str: "data.font-style", val: "normal"},
                {str: "data.border-width", val: 5},
                {str: "data.background-color", val: "blue"},
                {str: "data.background-opacity", val: 0.2},
                {str: "data.clonemarker", val: true},
                {str: "data.parent", val: "glyph1"},
                {
                    str: "data.statesandinfos",
                    val: [{
                        bbox: {x: 5, y: 5, w: 10, h: 10},
                        clazz: "state variable",
                        state: {value: "a", variable: "b"}
                    }, {bbox: {x: 7, y: 7, w: 15, h: 20}, clazz: "unit of information", label: {text: "abc"}}]
                },
            ];


            var expectCnt = attr.length;

            assert.expect(expectCnt);

            for (var i = 0; i < expectCnt; i++)
                done.push(assert.async());


            for (var i = 0; i < expectCnt; i++) {

                //Call like this because of asynchronicity
                var sendRequests = function (id, attStr, attVal, currDone) {
                    agent.sendRequest("agentChangeNodeAttributeRequest", {
                        id: id,
                        attStr: attStr,
                        attVal: attVal
                    }, function () {

                        setTimeout(function () { //should wait here as well

                            var val = ModelManager.getModelNodeAttribute(attStr, id);
                            assert.propEqual(val, attVal, (attStr + " is correct"));
                            currDone();
                        }, 100);
                    });
                }(id, attr[i].str, attr[i].val, done[i]);

            }
        });
    }

    function testEdgeSetAttributeRequests() {

        QUnit.test('agentChangeEdgeAttributeRequest', function(assert) {
            var id = "glyph8-glyph15";

            var done = [];

            var attr = [
                {str: "highlightColor", val: "red"},
                {str: "data.cardinality", val: 5},
                {str: "data.line-color", val: "blue"},
                {str: "data.width", val: 20},
                {str: "data.class", val: "necessary stimulation"},

            ];


            var expectCnt = attr.length;

            assert.expect(expectCnt);

            for (var i = 0; i < expectCnt; i++)
                done.push(assert.async());



            for (var i = 0; i < expectCnt; i++) {

                //Call like this because of asynchronicity
                var sendRequests = function (id, attStr, attVal, currDone) {
                    agent.sendRequest("agentChangeEdgeAttributeRequest", {
                        id: id,
                        attStr: attStr,
                        attVal: attVal
                    }, function () {

                        setTimeout(function () { //should wait here as well

                            var val = ModelManager.getModelEdgeAttribute(attStr, id);
                            assert.propEqual(val, attVal, (attStr + " is correct"));
                            currDone();
                        }, 100);
                    });
                }(id, attr[i].str, attr[i].val, done[i]);

            }
        });
    }


    function testLayout(){

        QUnit.test('Agent layout', function(assert) {

            assert.expect(1);
            var done1 = assert.async();
            agent.sendRequest("agentRunLayoutRequest", null, function(val){
                setTimeout(function () { //should wait here as well
                    assert.equal(val, "success", "Layout run.") ;
                    done1();
                },100);
            });
        });

    }

    function testNewFile(){

        QUnit.test('Agent new file', function(assert) {

            assert.expect(1);
            var done1 = assert.async();
            agent.sendRequest("agentNewFileRequest", null, function(){
                setTimeout(function () { //should wait here as well
                    var cy = ModelManager.getModelCy();
                    assert.ok((jQuery.isEmptyObject(cy.nodes) && jQuery.isEmptyObject(cy.edges)),"New file loaded") ;
                    done1();
                },100);
            });
        });

    }

    function testDisconnect(){

        QUnit.test('Agent disconnect', function(assert) {

            assert.expect(1);
            var done1 = assert.async();
            console.log(agent.socket);
            agent.disconnect(function(){

                assert.notOk(agent.socket.connected,"Agent disconnected." ) ;
                done1();
            });


        });

    }


    setTimeout(function() {
        testNewAgent();
    }, 100);



    setTimeout(function() {
        testAgentProperties();
    }, 100);


    setTimeout(function() {
        testLoadModel();
    }, 100);


    //Make sure the model is loaded first
    setTimeout(function() {
        testChangeName();
    }, 100);

    setTimeout(function() {
        testMessages();
    }, 100);


    setTimeout(function() {
        testGetRequests();
    },100);


    setTimeout(function() {
        testMoveNodeRequest();
    },100);

    setTimeout(function() {
        testNodeSetAttributeRequests();
    },100);


    setTimeout(function() {
        testEdgeSetAttributeRequests();
    },100);

    setTimeout(function() {
        testAddDeleteRequests();
    },100);


    //do this at the end
    setTimeout(function() {
        testLayout();
    }, 1000);

    //do this at the end
    setTimeout(function() {
        testNewFile();
    }, 2000);


    //do this at the end
    setTimeout(function() {
        testDisconnect();
    }, 3000);
};