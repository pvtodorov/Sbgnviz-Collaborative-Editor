QUnit = require('qunitjs');
module.exports = function(){


    QUnit.module( "Menu functions tests to see if model is updated correctly." );

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



    QUnit.module( "Editor-actions tests to see if model is updated correctly." );

    var editorActions = require('../sample-app/sampleapp-components/js/EditorActionsManager.js');
    function addNodeFromEditorActionsTest() {

        QUnit.test('editorActions.addNode()', function (assert) {

            var node = editorActions.addNode({x:50, y:70, sbgnclass:"macromolecule", sync: true});

            var modelNode = ModelManager.getModelNode(node.id());
            assert.ok(modelNode, "Node added to model through editorActions.")
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
    
    function changeHighlightStatusTest(id){
        QUnit.test('editorActions.')
    }

   addNodeFromMenuTest(1000);
   deleteNodeFromMenuTest(1000);
    
    addNodeFromEditorActionsTest();


  

};