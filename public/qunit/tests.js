QUnit = require('qunitjs');
module.exports = function(){


    QUnit.module( "modelManager Tests" );

    QUnit.test('modelManager.setName()', function(assert) {
        ModelManager.setName("abc");
          assert.equal(ModelManager.getName(), "abc", "User name is correctly set.");
    });

    QUnit.test('modelManager.setSampleInd()', function(assert) {

        for(var i = 0; i < 5; i++) {
            ModelManager.setSampleInd(i);
            assert.equal(ModelManager.getSampleInd(), i, ("Sample index " + i + " is correctly set" ));
        }

    });


    function addModelNodeTest(id, firstTime){
        QUnit.test('modelManager.addModelNode()', function(assert) {

            var isNodeAdded = ModelManager.addModelNode(1000, {x: 100, y: 200, sbgnclass: "macromolecule", sbgnlabel:"tmpLabel" });
            if(firstTime)
                assert.equal(isNodeAdded, "success", "Node added to model.");
            else
                assert.notEqual(isNodeAdded, "success", "Node already added.");

            assert.ok(cy.getElementById(id),"Node added to cytoscape");
            assert.equal(cy.getElementById(id)._private.data.sbgnclass, "macromolecule", "Node sbgnclass is correct.");
            assert.equal(cy.getElementById(id)._private.data.sbgnlabel, "tmpLabel", "Node sbgnlabel is correct.");
            assert.equal(cy.getElementById(id)._private.position.x, 100, "Node position x is correct.");
            assert.equal(cy.getElementById(id)._private.position.y, 200, "Node position y is correct.");

        });
    }

    function deleteModelNodeTest(id){
        QUnit.test('modelManager.deleteModelNode()', function(assert){

            ModelManager.deleteModelNode(id);
            assert.equal(ModelManager.getModelNode(id), null, "Node removed from model.");
            assert.equal(cy.getElementById(id).length,0, "Node removed from cytoscape.");

        });
    }



    function initModelNodeTest(id){
        QUnit.test('modelManager.initNode()', function(assert) {
            var node = cy.getElementById(id);
            var modelNode = ModelManager.getModelNode(id);


            assert.equal(modelNode.sbgnclass, node.data('sbgnclass'), "Node sbgnclass correctly initialized.");
            assert.equal(modelNode.sbgnlabel, node.data('sbgnlabel'), "Node sbgnlabel correctly initialized.");
            assert.equal(modelNode.backgroundOpacity, node.data('backgroundOpacity'), "Node backgroundOpacity correctly initialized.");
            assert.equal(modelNode.backgroundColor, node.css('background-color'), "Node backgroundColor correctly initialized.");
            assert.equal(modelNode.borderColor, node.css('border-color'), "Node borderColor correctly initialized.");
            assert.equal(modelNode.borderWidth, node.css('border-width'), "Node borderWidth correctly initialized.");
            assert.equal(modelNode.isCloneMarker, node.data('sbgnclonemarker'), "Node isCloneMarker correctly initialized.");
            assert.equal(modelNode.isMultimer, node.data('sbgnclass').indexOf(' multimer') > 0, "Node isMultimer correctly initialized.");
            assert.equal(modelNode.sbgnStatesAndInfos.length, 0, "Node sbgnStatesAndInfos correctly initialized.");
            assert.equal(modelNode.parent, node.data('parent'), "Node parent correctly initialized.");
            assert.equal(modelNode.children, node.data('children'), "Node children correctly initialized.");
            assert.equal(modelNode.ports.length, 0, "Node ports correctly initialized.");
            assert.equal(modelNode.height, node._private.data.sbgnbbox.h, "Node height correctly initialized.");
            assert.equal(modelNode.width, node._private.data.sbgnbbox.w, "Node width correctly initialized.");

        });
    }

    function changeModelNodeAttributeTest(id){
        QUnit.test('modelManager.changeModelNodeAttribute()', function(assert) {

            ModelManager.changeModelNodeAttribute("sbgnclass", id, "phenotype");
            assert.equal("phenotype", cy.getElementById(id).data('sbgnclass'),  "Node sbgnclass correctly changed.");
            assert.equal(ModelManager.getModelNode(id).sbgnclass, cy.getElementById(id).data('sbgnclass'),  "Node sbgnclass correctly changed.");


            ModelManager.changeModelNodeAttribute("sbgnlabel", id, "label2");
            assert.equal("label2", cy.getElementById(id).data('sbgnlabel'),  "Node sbgnlabel correctly changed.");
            assert.equal(ModelManager.getModelNode(id).sbgnlabel, cy.getElementById(id).data('sbgnlabel'),  "Node sbgnlabel correctly changed.");
            

            ModelManager.changeModelNodeAttribute("backgroundOpacity", id, 1);
            assert.equal(1, cy.getElementById(id).data('backgroundOpacity'),  "Node backgroundOpacity correctly changed.");
            assert.equal(ModelManager.getModelNode(id).backgroundOpacity, cy.getElementById(id).data('backgroundOpacity'),  "Node backgroundOpacity correctly changed.");



            ModelManager.changeModelNodeAttribute("backgroundColor", id, '#333343');
            assert.equal('#333343', cy.getElementById(id).css('background-color'), "Node backgroundColor correctly changed.");
            assert.equal(ModelManager.getModelNode(id).backgroundColor, cy.getElementById(id).css('background-color'), "Node backgroundColor correctly changed.");

            ModelManager.changeModelNodeAttribute("borderColor", id, '#222222');

            assert.equal('#222222', cy.getElementById(id).css('border-color'), "Node borderColor correctly changed.");
            assert.equal(ModelManager.getModelNode(id).borderColor, cy.getElementById(id).css('border-color'), "Node borderColor correctly changed.");

            // assert.equal(ModelManager.getModelNode(id).borderWidth, cy.getElementById(id).css('border-width'), "Node borderWidth correctly changed.");
            // assert.equal(ModelManager.getModelNode(id).isCloneMarker, cy.getElementById(id).data('sbgnclonemarker'), "Node isCloneMarker correctly changed.");
            // assert.equal(ModelManager.getModelNode(id).isMultimer, cy.getElementById(id).data('sbgnclass').indexOf(' multimer') > 0, "Node isMultimer correctly changed.");
            // assert.equal(ModelManager.getModelNode(id).sbgnStatesAndInfos.length, 0, "Node sbgnStatesAndInfos correctly changed.");
            // assert.equal(ModelManager.getModelNode(id).parent, cy.getElementById(id).data('parent'), "Node parent correctly changed.");
            // assert.equal(ModelManager.getModelNode(id).children, cy.getElementById(id).data('children'), "Node children correctly changed.");
            // assert.equal(ModelManager.getModelNode(id).ports.length, 0, "Node ports correctly changed.");
            // assert.equal(ModelManager.getModelNode(id).height, cy.getElementById(id)._private.data.sbgnbbox.h, "Node height correctly changed.");
            // assert.equal(ModelManager.getModelNode(id).width, cy.getElementById(id)._private.data.sbgnbbox.w, "Node width correctly changed.");


        });
    }




    addModelNodeTest(1000, true);
    addModelNodeTest(1000);

    changeModelNodeAttributeTest(1000);

 //   deleteModelNodeTest(1000);

    QUnit.module( "menu-functions tests called from nodejs change model" );
    function addNodeFromMenuTest(id) {
        QUnit.test('menu.addNode()', function (assert) {

            MenuFunctions.addNode(id, 50, 70, "macromolecule", "nodeLabel", true);

            var modelNode = ModelManager.getModelNode(id);
            assert.ok(modelNode, "Node added to model through menu.")
            assert.equal(modelNode.id, 1000, "Node id correctly added.");
            assert.equal(modelNode.sbgnclass, "macromolecule", "Node sbgnclass correctly added.");
            assert.equal(modelNode.sbgnlabel, "nodeLabel", "Node label correctly added.");
            assert.equal(modelNode.position.x, 50, "Node position x correctly added.");
            assert.equal(modelNode.position.y, 70, "Node position y correctly added.");



        });
    }



    function deleteNodeFromMenuTest(id) {
        QUnit.test('menu.deleteNode()', function(assert) {
            MenuFunctions.deleteElement(1000, true);

            assert.equal(ModelManager.getModelNode(id), null, "Node deleted correctly.");
        });
    };


    // addNodeFromMenuTest(1000);
    // initModelNodeTest(1000);
    // deleteNodeFromMenuTest(1000);


    QUnit.module( "editor-actions tests called from nodejs change model" );
    var editorActions = require('../sample-app/sampleapp-components/js/EditorActionsManager.js');
    function addNodeFromEditorActionsTest() {

        QUnit.test('editorActions.addNode()', function (assert) {

            var node = editorActions.addNode({x:50, y:70, sbgnclass:"macromolecule", sync: true});

            var modelNode = ModelManager.getModelNode(node.id());
            assert.ok(modelNode, "Node added to model through menu.")
            assert.equal(modelNode.id, node.id(), "Node id correctly added.");
            assert.equal(modelNode.sbgnclass, "macromolecule", "Node sbgnclass correctly added.");
            assert.equal(modelNode.position.x, 50, "Node position x correctly added.");
            assert.equal(modelNode.position.y, 70, "Node position y correctly added.");



            //initialized
            assert.equal(modelNode.sbgnclass, node.data('sbgnclass'), "Node sbgnclass correctly initialized.");
            assert.equal(modelNode.sbgnlabel, node.data('sbgnlabel'), "Node sbgnlabel correctly initialized.");
            assert.equal(modelNode.backgroundOpacity, node.data('backgroundOpacity'), "Node backgroundOpacity correctly initialized.");
            assert.equal(modelNode.backgroundColor, node.css('background-color'), "Node backgroundColor correctly initialized.");
            assert.equal(modelNode.borderColor, node.css('border-color'), "Node borderColor correctly initialized.");
            assert.equal(modelNode.borderWidth, node.css('border-width'), "Node borderWidth correctly initialized.");
            assert.equal(modelNode.isCloneMarker, node.data('sbgnclonemarker'), "Node isCloneMarker correctly initialized.");
            assert.equal(modelNode.isMultimer, node.data('sbgnclass').indexOf(' multimer') > 0, "Node isMultimer correctly initialized.");
            assert.equal(modelNode.sbgnStatesAndInfos.length, 0, "Node sbgnStatesAndInfos correctly initialized.");
            assert.equal(modelNode.parent, node.data('parent'), "Node parent correctly initialized.");
            assert.equal(modelNode.children, node.data('children'), "Node children correctly initialized.");
            assert.equal(modelNode.ports.length, 0, "Node ports correctly initialized.");
            assert.equal(modelNode.height, node._private.data.sbgnbbox.h, "Node height correctly initialized.");
            assert.equal(modelNode.width, node._private.data.sbgnbbox.w, "Node width correctly initialized.");


        });
    }

    //addNodeFromEditorActionsTest();

    QUnit.log(function( details ) {
        console.log( "Log: ", details.result, details.message );
    });


    QUnit.done(function( details ) {
        console.log( "Total: ", details.total, " Failed: ", details.failed, " Passed: ", details.passed, " Runtime: ", details.runtime );
    });


};