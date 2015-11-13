

var cyMod =  require('./sample-app-cytoscape-sbgn.js');


var sbgnLayoutProp;

 var sbgnContainer;

var editorActions;


//var sbgnProperties;

var setFileContent = function (fileName) {
    var span = document.getElementById('file-name');
    while (span.firstChild) {
        span.removeChild(span.firstChild);
    }
    span.appendChild(document.createTextNode(fileName));
};


function getXMLObject(itemId, loadXMLDoc) {
    switch (itemId) {
        case "0":
            $.ajax({
                url: './sample-app/samples/activated_stat1alpha_induction_of_the_irf1_gene.xml',
                success: loadXMLDoc
            });
            break;
        case "1":
            $.ajax({url: './sample-app/samples/glycolysis.xml', success: loadXMLDoc});
            break;
        case "2":
            $.ajax({url: './sample-app/samples/mapk_cascade.xml', success: loadXMLDoc});
            break;
        case "3":
            $.ajax({url: './sample-app/samples/polyq_proteins_interference.xml', success: loadXMLDoc});
            break;
        case "4":
            $.ajax({url: './sample-app/samples/insulin-like_growth_factor_signaling.xml', success: loadXMLDoc});
            break;
        case "5":
            $.ajax({
                url: './sample-app/samples/atm_mediated_phosphorylation_of_repair_proteins.xml', success: loadXMLDoc
            });
            break;
        case "6":
            $.ajax({
                url: './sample-app/samples/vitamins_b6_activation_to_pyridoxal_phosphate.xml', success: loadXMLDoc
            });
            break;

    }


};


module.exports.updateLayoutProperties = function(layoutProps){

    if(sbgnLayoutProp)
        sbgnLayoutProp.updateLayoutProperties(layoutProps);

}


module.exports.updateSample = function( ind){
    var self = this;
    self.modelManager = editorActions.modelManager;



    getXMLObject(ind, function (xmlObject) {


        jsonObj = sbgnmlToJson.convert(xmlObject);
        self.modelManager.setServerGraph(jsonObj);


        sbgnContainer =  (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj,  editorActions));


    });
}
module.exports.start = function(modelManager){

    var self = this;
    self.modelManager = modelManager;
    editorActions =require('./EditorActionsManager.js');
    editorActions.modelManager = modelManager;


    sbgnLayoutProp =new SBGNLayout();
    sbgnLayoutProp.initialize(self.modelManager);


    this.sbgnProperties  = new SBGNProperties();


    //self.modelManager.setSampleInd(0, "me");

    var jsonObj = self.modelManager.getServerGraph();

    if(jsonObj == null){//first time loading the graph-- load from the samples

        var ind = self.modelManager.getSampleInd("me");



        module.exports.updateSample(ind);


    }
    else{

        sbgnContainer = (new cyMod.SBGNContainer('#sbgn-network-container', jsonObj, editorActions));
    }



    $('#samples').click(function (e) {

        var ind = e.target.id;
        self.modelManager.setSampleInd(ind, "me");
        module.exports.updateSample(ind);

    });

    $('#new-file-icon').click(function (e) {
        $('#new-file').trigger("click");
    });

    $('#new-file').click(function (e) {
        setFileContent("new_file.sbgnml");

        (new cyMod.SBGNContainer('#sbgn-network-container', {cytoscapeJsGraph: {nodes: [], edges: []}},  editorActions));

        editorActions.manager.reset();
        cyMod.handleSBGNInspector(editorActions);
    });

    $('.add-node-menu-item').click(function (e) {
        if (!modeHandler.mode != "add-node-mode") {
            modeHandler.setAddNodeMode();
        }
        var value = $(this).attr('name');
        modeHandler.selectedNodeType = value;
        modeHandler.setSelectedIndexOfSelector("add-node-mode", value);
        modeHandler.setSelectedMenuItem("add-node-mode", value);
    });

    $('.add-edge-menu-item').click(function (e) {
        if (!modeHandler.mode != "add-edge-mode") {
            modeHandler.setAddEdgeMode();
        }
        var value = $(this).attr('name');
        modeHandler.selectedEdgeType = value;
        modeHandler.setSelectedIndexOfSelector("add-edge-mode", value);
        modeHandler.setSelectedMenuItem("add-edge-mode", value);
    });

    modeHandler.initilize();

    $('.sbgn-select-node-item').click(function (e) {
        //if (!modeHandler.mode != "add-node-mode") { //funda?
        if (!modeHandler.mode != "add-node-mode") {
            modeHandler.setAddNodeMode();
        }
        var value = $('img', this).attr('value');
        modeHandler.selectedNodeType = value;
        modeHandler.setSelectedIndexOfSelector("add-node-mode", value);
        modeHandler.setSelectedMenuItem("add-node-mode", value);
    });

    $('.sbgn-select-edge-item').click(function (e) {
        if (!modeHandler.mode != "add-edge-mode") {
            modeHandler.setAddEdgeMode();
        }
        var value = $('img', this).attr('value');
        modeHandler.selectedEdgeType = value;
        modeHandler.setSelectedIndexOfSelector("add-edge-mode", value);
        modeHandler.setSelectedMenuItem("add-edge-mode", value);
    });

    $('#node-list-set-mode-btn').click(function (e) {
        if (modeHandler.mode != "add-node-mode") {
            modeHandler.setAddNodeMode();
        }
    });

    $('#edge-list-set-mode-btn').click(function (e) {
        if (modeHandler.mode != "add-edge-mode") {
            modeHandler.setAddEdgeMode();
        }
    });

    $('#select-icon').click(function (e) {
        modeHandler.setSelectionMode();
    });

    $('#select-edit').click(function (e) {
        modeHandler.setSelectionMode();
    });


    $('#align-horizontal-top').click(function (e) {
        var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
        if (selectedNodes.length <= 1) {
            return;
        }
        var nodesData = getNodesData();

        var modelNode = window.firstSelectedNode?firstSelectedNode:selectedNodes[0];
        var commonTopY = modelNode.position("y") - modelNode.height() / 2;

        for(var i = 0; i < selectedNodes.length; i++){
            var node = selectedNodes[i];
            var oldPosY = node.position('y');
            var newPosY = commonTopY + node.height() / 2;
            node.position({
                y: newPosY
            });
            sbgnElementUtilities.propogateReplacementToChildren(node, 0, newPosY - oldPosY);
        }

        nodesData.firstTime = true;
        editorActionsManager._do(new ReturnToPositionsAndSizesCommand(nodesData));
    });

    $("#align-horizontal-top-icon").click(function (e) {
        $("#align-horizontal-top").trigger('click');
    });

    $('#align-horizontal-middle').click(function (e) {
        var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
        if (selectedNodes.length <= 1) {
            return;
        }
        var nodesData = getNodesData();

        var modelNode = window.firstSelectedNode?firstSelectedNode:selectedNodes[0];
        var commonMiddleY = modelNode.position("y");

        for(var i = 0; i < selectedNodes.length; i++){
            var node = selectedNodes[i];
            var oldPosY = node.position('y');
            var newPosY = commonMiddleY;
            node.position({
                y: newPosY
            });
            sbgnElementUtilities.propogateReplacementToChildren(node, 0, newPosY - oldPosY);
        }

        nodesData.firstTime = true;
        editorActionsManager._do(new ReturnToPositionsAndSizesCommand(nodesData));
    });

    $("#align-horizontal-middle-icon").click(function (e) {
        $("#align-horizontal-middle").trigger('click');
    });

    $('#align-horizontal-bottom').click(function (e) {
        var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
        if (selectedNodes.length <= 1) {
            return;
        }
        var nodesData = getNodesData();

        var modelNode = window.firstSelectedNode?firstSelectedNode:selectedNodes[0];
        var commonBottomY = modelNode.position("y") + modelNode.height() / 2;

        for(var i = 0; i < selectedNodes.length; i++){
            var node = selectedNodes[i];
            var oldPosY = node.position('y');
            var newPosY = commonBottomY - node.height() / 2;
            node.position({
                y: newPosY
            });
            sbgnElementUtilities.propogateReplacementToChildren(node, 0, newPosY - oldPosY);
        }

        nodesData.firstTime = true;
        editorActionsManager._do(new ReturnToPositionsAndSizesCommand(nodesData));
    });

    $("#align-horizontal-bottom-icon").click(function (e) {
        $("#align-horizontal-bottom").trigger('click');
    });

    $('#align-vertical-left').click(function (e) {
        var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
        if (selectedNodes.length <= 1) {
            return;
        }
        var nodesData = getNodesData();

        var modelNode = window.firstSelectedNode?firstSelectedNode:selectedNodes[0];
        var commonLeftX = modelNode.position("x") - modelNode.width() / 2;

        for(var i = 0; i < selectedNodes.length; i++){
            var node = selectedNodes[i];
            var oldPosX = node.position('x');
            var newPosX = commonLeftX + node.width() / 2;
            node.position({
                x: newPosX
            });
            sbgnElementUtilities.propogateReplacementToChildren(node, newPosX - oldPosX, 0);
        }

        nodesData.firstTime = true;
        editorActionsManager._do(new ReturnToPositionsAndSizesCommand(nodesData));
    });

    $("#align-vertical-left-icon").click(function (e) {
        $("#align-vertical-left").trigger('click');
    });

    $('#align-vertical-center').click(function (e) {
        var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
        if (selectedNodes.length <= 1) {
            return;
        }
        var nodesData = getNodesData();

        var modelNode = window.firstSelectedNode?firstSelectedNode:selectedNodes[0];
        var commonCenterX = modelNode.position("x");

        for(var i = 0; i < selectedNodes.length; i++){
            var node = selectedNodes[i];
            var oldPosX = node.position('x');
            var newPosX = commonCenterX
            node.position({
                x: newPosX
            });
            sbgnElementUtilities.propogateReplacementToChildren(node, newPosX - oldPosX, 0);
        }

        nodesData.firstTime = true;
        editorActionsManager._do(new ReturnToPositionsAndSizesCommand(nodesData));
    });

    $("#align-vertical-center-icon").click(function (e) {
        $("#align-vertical-center").trigger('click');
    });

    $('#align-vertical-right').click(function (e) {
        var selectedNodes = sbgnElementUtilities.getRootsOfGivenNodes(cy.nodes(":selected").filter(":visible"));
        if (selectedNodes.length <= 1) {
            return;
        }
        var nodesData = getNodesData();

        var modelNode = window.firstSelectedNode?firstSelectedNode:selectedNodes[0];
        var commonRightX = modelNode.position("x") + modelNode.width() / 2;

        for(var i = 0; i < selectedNodes.length; i++){
            var node = selectedNodes[i];
            var oldPosX = node.position('x');
            var newPosX = commonRightX - node.width() / 2;
            node.position({
                x: newPosX
            });
            sbgnElementUtilities.propogateReplacementToChildren(node, newPosX - oldPosX, 0);
        }

        nodesData.firstTime = true;
        editorActionsManager._do(new ReturnToPositionsAndSizesCommand(nodesData));
    });

    $("#align-vertical-right-icon").click(function (e) {
        $("#align-vertical-right").trigger('click');
    });


    $("body").on("change", "#file-input", function (e) {
        if ($("#file-input").val() == "") {
            return;
        }

        var fileInput = document.getElementById('file-input');
        var file = fileInput.files[0];
        var textType = /text.*/;

        var reader = new FileReader();

        reader.onload = function (e) {

            (new cyMod.SBGNContainer('#sbgn-network-container', {cytoscapeJsGraph:
                    sbgnmlToJson.convert(textToXmlObject(this.result))}),  editorActions);
        }
        reader.readAsText(file);
        setFileContent(file.name);
        $("#file-input").val("");
    });

    $("#node-legend").click(function (e) {
        e.preventDefault();
        $.fancybox(
            _.template($("#node-legend-template").html(), {}),
            {
                'autoDimensions': false,
                'width': 420,
                'height': 393,
                'transitionIn': 'none',
                'transitionOut': 'none',
            });
    });

    $("#node-label-textbox").blur(function () {
        $("#node-label-textbox").hide();
        $("#node-label-textbox").data('node', undefined);
    });

    $("#node-label-textbox").on('change', function(){
        var node = $(this).data('node');
        var param = {
            ele: node,
            data: $(this).attr('value')
        };
        editorActions.manager._do( editorActions.ChangeNodeLabelCommand(param));
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#edge-legend").click(function (e) {
        e.preventDefault();
        $.fancybox(
            _.template($("#edge-legend-template").html(), {}),
            {
                'autoDimensions': false,
                'width': 400,
                'height': 220,
                'transitionIn': 'none',
                'transitionOut': 'none',
            });
    });

    $("#quick-help").click(function (e) {
        e.preventDefault();
        $.fancybox(
            _.template($("#quick-help-template").html(), {}),
            {
                'autoDimensions': false,
                'width': 420,
                'height': "auto",
                'transitionIn': 'none',
                'transitionOut': 'none'
            });
    });

    $("#how-to-use").click(function (e) {
        var url = "http://www.cs.bilkent.edu.tr/~ivis/sbgnviz-js/SBGNViz.js-1.x.UG.pdf";
        var win = window.open(url, '_blank');
        win.focus();
    });

    $("#about").click(function (e) {
        e.preventDefault();
        $.fancybox(
            _.template($("#about-template").html(), {}),
            {
                'autoDimensions': false,
                'width': 300,
                'height': 320,
                'transitionIn': 'none',
                'transitionOut': 'none',
            });
    });
    $("#hide-selected").click(function (e) {
//    sbgnFiltering.hideSelected();
        var param = {};
        param.firstTime = true;
        editorActions.manager._do(editorActions.HideSelectedCommand(param));
        editorActions.refreshUndoRedoButtonsStatus();
    });
    $("#hide-selected-icon").click(function (e) {
        $("#hide-selected").trigger('click');
    });


    $("#show-selected").click(function (e) {
//    sbgnFiltering.showSelected();
        var param = {};
        param.firstTime = true;
        editorActions.manager._do(editorActions.ShowSelectedCommand(param));
        editorActions.refreshUndoRedoButtonsStatus();
    });
    $("#show-selected-icon").click(function (e) {
        $("#show-selected").trigger('click');
    });

    $("#show-all").click(function (e) {
//    sbgnFiltering.showAll();
        editorActions.manager._do(editorActions.ShowAllCommand());
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#delete-selected-simple").click(function (e) {

        var selectedEles = cy.$(":selected");



        editorActions.manager._do(editorActions.RemoveElesCommand(selectedEles));
        editorActions.refreshUndoRedoButtonsStatus();


    });

    $("#delete-selected-simple-icon").click(function (e) {
        $("#delete-selected-simple").trigger('click');
    });
    $("#delete-selected-smart").click(function (e) {
        //find which elements will be selected

        var allNodes = cy.nodes();
        var selectedNodes = cy.nodes(":selected");
        cy.elements().unselect();
        var nodesToShow = sbgnFiltering.expandRemainingNodes(selectedNodes, allNodes);
        var nodesNotToShow = allNodes.not(nodesToShow);
        var connectedEdges = nodesNotToShow.connectedEdges();
        var selectedEles = connectedEdges.remove();

        selectedEles = selectedEles.union(nodesNotToShow.remove());

        var param = {
           // firstTime: false,
            eles: selectedEles
        };
        editorActions.manager._do(editorActions.DeleteSelectedCommand(param));
        editorActions.refreshUndoRedoButtonsStatus();


    });

    $("#delete-selected-smart-icon").click(function (e) {
        $("#delete-selected-smart").trigger('click');
    });

    $("#neighbors-of-selected").click(function (e) {
//    sbgnFiltering.highlightNeighborsofSelected();
        var param = {
            firstTime: true,
        };
        editorActions.manager._do(editorActions.HighlightNeighborsofSelectedCommand(param));
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#processes-of-selected").click(function (e) {
//    sbgnFiltering.highlightProcessesOfSelected();
        var param = {
            firstTime: true
        };
        editorActions.manager._do(editorActions.HighlightProcessesOfSelectedCommand(param));
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#remove-highlights").click(function (e) {
//    sbgnFiltering.removeHighlights();
        editorActions.manager._do( editorActions.RemoveHighlightsCommand());
        editorActions.refreshUndoRedoButtonsStatus();
    });
    $('#remove-highlights-icon').click(function (e) {
        $('#remove-highlights').trigger("click");
    });
    $("#make-compound-complex").click(function (e) {
        var selected = cy.nodes(":selected").filter(function (i, element) {
            var sbgnclass = element.data("sbgnclass")
            if (sbgnclass == 'unspecified entity'
                || sbgnclass == 'simple chemical'
                || sbgnclass == 'macromolecule'
                || sbgnclass == 'nucleic acid feature'
                || sbgnclass == 'complex') {
                return true;
            }
            return false;
        }   );

        selected = sbgnElementUtilities.getRootsOfGivenNodes(selected);
        if(selected.length == 0 || !sbgnElementUtilities.allHaveTheSameParent(selected)){
            return;
        }
        var param = {
            firstTime: true,
            compoundType: "complex",
            nodesToMakeCompound: selected
        };
        editorActions.manager._do(editorActions.CreateCompoundForSelectedNodesCommand(param));
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#make-compound-compartment").click(function (e) {
        var selected = cy.nodes(":selected");
        selected = sbgnElementUtilities.getRootsOfGivenNodes(selected);
        if(selected.length == 0 || !sbgnElementUtilities.allHaveTheSameParent(selected)){
            return;
        }

        var param = {
            firstTime: true,
            compoundType: "compartment",
            nodesToMakeCompound: selected
        };
        editorActions.manager._do(editorActions.CreateCompoundForSelectedNodesCommand(param));
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#layout-properties").click(function (e) {
        sbgnLayoutProp.render();
    });

    $("#layout-properties-icon").click(function (e) {
        $("#layout-properties").trigger('click');
    });

    $("#sbgn-properties").click(function (e) {
        this.sbgnProperties.render();
    });
    $("#properties-icon").click(function (e) {
        $("#sbgn-properties").trigger('click');
    });

    $("#collapse-selected").click(function (e) {
        var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":selected"), "collapse");

        if (!thereIs) {
            return;
        }

        if (window.incrementalLayoutAfterExpandCollapse == null) {
            window.incrementalLayoutAfterExpandCollapse =
                (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
        }
        if (incrementalLayoutAfterExpandCollapse)
            editorActions.manager._do(editorActions.CollapseGivenNodesCommand({
                nodes: cy.nodes(":selected"),
                firstTime: true
            }));
        else
            editorActions.manager._do(editorActions.SimpleCollapseGivenNodesCommand(cy.nodes(":selected")));
        editorActions.refreshUndoRedoButtonsStatus();
    });
    $("#collapse-selected-icon").click(function (e) {
        if (modeHandler.mode == "selection-mode") {
            $("#collapse-selected").trigger('click');
        }
    });
    $("#expand-selected").click(function (e) {
        var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":selected"), "expand");

        if (!thereIs) {
            return;
        }

        if (window.incrementalLayoutAfterExpandCollapse == null) {
            window.incrementalLayoutAfterExpandCollapse =
                (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
        }
        if (incrementalLayoutAfterExpandCollapse)
            editorActions.manager._do(editorActions.ExpandGivenNodesCommand({
                nodes: cy.nodes(":selected"),
                firstTime: true
            }));
        else
            editorActions.manager._do(editorActions.SimpleExpandGivenNodesCommand(cy.nodes(":selected")));
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#expand-selected-icon").click(function (e) {
        if (modeHandler.mode == "selection-mode") {
            $("#expand-selected").trigger('click');
        }
    });

    $("#collapse-all").click(function (e) {
        var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "collapse");

        if (!thereIs) {
            return;
        }

        if (window.incrementalLayoutAfterExpandCollapse == null) {
            window.incrementalLayoutAfterExpandCollapse =
                (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
        }
        if (incrementalLayoutAfterExpandCollapse)
            editorActions.manager._do(editorActions.CollapseGivenNodesCommand({
                nodes: cy.nodes(),
                firstTime: true
            }));
        else
            editorActions.manager._do(editorActions.SimpleCollapseGivenNodesCommand(cy.nodes()));
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#expand-all").click(function (e) {
        var thereIs = expandCollapseUtilities.thereIsNodeToExpandOrCollapse(cy.nodes(":visible"), "expand");

        if (!thereIs) {
            return;
        }

        if (window.incrementalLayoutAfterExpandCollapse == null) {
            window.incrementalLayoutAfterExpandCollapse =
                (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true');
        }
        if (incrementalLayoutAfterExpandCollapse)
            editorActions.manager._do(editorActions.ExpandAllNodesCommand({
                firstTime: true
            }));
        else
            editorActions.manager._do(editorActions.SimpleExpandAllNodesCommand());
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#perform-layout-icon").click(function (e) {
        if (modeHandler.mode == "selection-mode") {
            $("#perform-layout").trigger('click');
        }
    });

    $("#perform-layout").click(function (e) {
        var nodesData = {};
        var nodes = cy.nodes();
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            nodesData[node.id()] = {
                width: node.width(),
                height: node.height(),
                x: node.position("x"),
                y: node.position("y")
            };
        }

        cy.nodes().removeData("ports");
        cy.edges().removeData("portsource");
        cy.edges().removeData("porttarget");

        cy.nodes().data("ports", []);
        cy.edges().data("portsource", []);
        cy.edges().data("porttarget", []);

        sbgnLayoutProp.applyLayout();
        editorActions.manager._do(editorActions.PerformLayoutCommand(nodesData));

        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#perform-incremental-layout").click(function (e) {
        cy.nodes().removeData("ports");
        cy.edges().removeData("portsource");
        cy.edges().removeData("porttarget");

        cy.nodes().data("ports", []);
        cy.edges().data("portsource", []);
        cy.edges().data("porttarget", []);

        sbgnLayoutProp.applyIncrementalLayout();
    });

    $("#undo-last-action").click(function (e) {
        editorActions.manager.undo();
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#redo-last-action").click(function (e) {
        editorActions.manager.redo();
        editorActions.refreshUndoRedoButtonsStatus();
    });

    $("#undo-icon").click(function (e) {
        $("#undo-last-action").trigger('click');
    });

    $("#redo-icon").click(function (e) {
        $("#redo-last-action").trigger('click');
    });

    $("#save-as-png").click(function (evt) {
        var pngContent = cy.png({scale: 3, full: true});

        // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, {type: contentType});
            return blob;
        }

        // this is to remove the beginning of the pngContent: data:img/png;base64,
        var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

        saveAs(b64toBlob(b64data, "image/png"), "network.png");

        //window.open(pngContent, "_blank");
    });

    $("#save-as-jpg").click(function (evt) {
        var pngContent = cy.jpg({scale: 3, full: true});

        // see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, {type: contentType});
            return blob;
        }

        // this is to remove the beginning of the pngContent: data:img/png;base64,
        var b64data = pngContent.substr(pngContent.indexOf(",") + 1);

        saveAs(b64toBlob(b64data, "image/jpg"), "network.jpg");
    });

    $("#load-file").click(function (evt) {
        $("#file-input").trigger('click');
    });

    $("#load-file-icon").click(function (evt) {
        $("#load-file").trigger('click');
    });

    $("#save-as-sbgnml").click(function (evt) {
        var sbgnmlText = jsonToSbgnml.createSbgnml(cy.nodes(":visible"), cy.edges(":visible"));

        var blob = new Blob([sbgnmlText], {
            type: "text/plain;charset=utf-8;",
        });
        var filename = document.getElementById('file-name').innerHTML;
        saveAs(blob, filename);
    });

    $("#save-icon").click(function (evt) {
        $("#save-as-sbgnml").trigger('click');
    });

    $("#save-command-history").click(function (evt) {
        var cmdTxt = JSON.stringify(modelManager.getHistory());

         var blob = new Blob([cmdTxt], {
            type: "text/plain;charset=utf-8;",
        });
        var filename = document.getElementById('file-name').innerHTML;
        saveAs(blob, filename);
    });



    $("body").on("click", ".biogene-info .expandable", function (evt) {
        var expanderOpts = {slicePoint: 150,
            expandPrefix: ' ',
            expandText: ' (...)',
            userCollapseText: ' (show less)',
            moreClass: 'expander-read-more',
            lessClass: 'expander-read-less',
            detailClass: 'expander-details',
            expandEffect: 'fadeIn',
            collapseEffect: 'fadeOut'
        };

        $(".biogene-info .expandable").expander(expanderOpts);
        expanderOpts.slicePoint = 2;
        expanderOpts.widow = 0;
    });

}


function SBGNLayout(){

    return{
        defaultLayoutProperties: {
            name: 'cose-bilkent',
            nodeRepulsion: 4500,
            nodeOverlap: 10,
            idealEdgeLength: 50,
            edgeElasticity: 0.45,
            nestingFactor: 0.1,
            gravity: 0.4,
            numIter: 2500,
            tile: true,
            animate: true,
            randomize: true
        },

        el: '#sbgn-layout-table',
        currentLayoutProperties:  null,
        initialize: function(modelManager) {
            var self = this;

            self.currentLayoutProperties = modelManager.updateLayoutProperties(self.defaultLayoutProperties);


            self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);


        },

        applyLayout: function () {
            var options = this.currentLayoutProperties;
            options.fit = options.randomize;
            cy.elements().filter(':visible').layout(options);
        },
        applyIncrementalLayout: function () {
            var options = _.clone(this.currentLayoutProperties);
            options.randomize = false;
            options.animate = false;
            options.fit = false;
            cy.elements().filter(':visible').layout(options);
        },
        updateLayoutProperties: function(layoutProps){

            self.currentLayoutProperties = _.clone(layoutProps);

        },
        render: function () {

            var self = this;

            self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);

            $(self.el).html(self.template);


            $(self.el).dialog();

            var lp = modelManager.updateLayout(self.defaultLayoutProperties);



            $("#node-repulsion")[0].value = lp.nodeRepulsion.toString();
            $("#node-overlap")[0].value = lp.nodeOverlap.toString();
            $("#ideal-edge-length")[0].value = lp.idealEdgeLength.toString();
            $("#edge-elasticity")[0].value = lp.edgeElasticity.toString();
            $("#nesting-factor")[0].value = lp.nestingFactor.toString();
            $("#gravity")[0].value = lp.gravity.toString();
            $("#num-iter")[0].value = lp.numIter.toString();
            $("#tile")[0].checked = lp.tile;
            $("#animate")[0].checked = lp.animate;


            $("#save-layout").die("click").live("click", function (evt) {


                self.currentLayoutProperties.nodeRepulsion = Number($("#node-repulsion")[0].value);
                self.currentLayoutProperties.nodeOverlap = Number($("#node-overlap")[0].value);
                self.currentLayoutProperties.idealEdgeLength = Number($("#ideal-edge-length")[0].value);
                self.currentLayoutProperties.edgeElasticity = Number($("#edge-elasticity")[0].value);
                self.currentLayoutProperties.nestingFactor = Number($("#nesting-factor")[0].value);
                self.currentLayoutProperties.gravity = Number($("#gravity")[0].value);
                self.currentLayoutProperties.numIter = Number($("#num-iter")[0].value);
                self.currentLayoutProperties.tile = $("#tile")[0].checked;
                self.currentLayoutProperties.animate = $("#animate")[0].checked;


                modelManager.setLayoutProperties(self.currentLayoutProperties);




                $(self.el).dialog('close');
            });

            $("#default-layout").die("click").live("click", function (evt) {
                self.copyProperties();
                self.template = _.template($("#layout-settings-template").html(), self.currentLayoutProperties);
                $(self.el).html(self.template);
            });


            return this;
        },

    }};

function SBGNProperties(){

    return {
        el: '#sbgn-properties-table',
        defaultSBGNProperties: {
            compoundPadding: parseInt(sbgnStyleRules['compound-padding'], 10),
            dynamicLabelSize: sbgnStyleRules['dynamic-label-size'],
            fitLabelsToNodes: (sbgnStyleRules['fit-labels-to-nodes'] == 'true'),
            incrementalLayoutAfterExpandCollapse: (sbgnStyleRules['incremental-layout-after-expand-collapse'] == 'true')
        },
        currentSBGNProperties: null,
        initialize: function () {
            var self = this;
            self.copyProperties();
            self.template = _.template($("#sbgn-properties-template").html(), self.currentSBGNProperties);
        },
        copyProperties: function () {
            this.currentSBGNProperties = _.clone(this.defaultSBGNProperties);
        },
        render: function () {
            var self = this;
            self.template = _.template($("#sbgn-properties-template").html(), self.currentSBGNProperties);
            $(self.el).html(self.template);

            $(self.el).dialog();

            $("#save-sbgn").die("click").live("click", function (evt) {

                var param = {};
                param.firstTime = true;
                param.previousSBGNProperties = _.clone(self.currentSBGNProperties);

                self.currentSBGNProperties.compoundPadding = Number(document.getElementById("compound-padding").value);
                self.currentSBGNProperties.dynamicLabelSize = $('select[name="dynamic-label-size"] option:selected').val();
                self.currentSBGNProperties.fitLabelsToNodes = document.getElementById("fit-labels-to-nodes").checked;
                self.currentSBGNProperties.incrementalLayoutAfterExpandCollapse =
                    document.getElementById("incremental-layout-after-expand-collapse").checked;

                //Refresh paddings if needed
                if (compoundPadding != self.currentSBGNProperties.compoundPadding) {
                    compoundPadding = self.currentSBGNProperties.compoundPadding;
                    refreshPaddings();
                }
                //Refresh label size if needed
                if (dynamicLabelSize != self.currentSBGNProperties.dynamicLabelSize) {
                    dynamicLabelSize = self.currentSBGNProperties.dynamicLabelSize;
                    cy.forceRender();
                }
                //Refresh truncations if needed
                if (fitLabelsToNodes != self.currentSBGNProperties.fitLabelsToNodes) {
                    fitLabelsToNodes = self.currentSBGNProperties.fitLabelsToNodes;
                    cy.forceRender();
                }

                window.incrementalLayoutAfterExpandCollapse =
                    self.currentSBGNProperties.incrementalLayoutAfterExpandCollapse;

                $(self.el).dialog('close');
            });

            $("#default-sbgn").die("click").live("click", function (evt) {
                self.copyProperties();
                self.template = _.template($("#sbgn-properties-template").html(), self.currentSBGNProperties);
                $(self.el).html(self.template);
            });

            return this;
        }
    }};
