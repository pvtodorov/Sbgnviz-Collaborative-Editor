module.exports = function() {

    return{
    processTypes : ['process', 'omitted process', 'uncertain process',
        'association', 'dissociation', 'phenotype'],

    deleteSelected: function(){
        var allNodes = cy.nodes();
        var selectedNodes = cy.nodes(":selected");
        cy.elements().unselect();
        var nodesToShow = this.expandRemainingNodes(selectedNodes, allNodes);
        var nodesNotToShow = allNodes.not(nodesToShow);
        var connectedEdges = nodesNotToShow.connectedEdges();
        var removedEles = connectedEdges.remove();
        removedEles = removedEles.union(nodesNotToShow.remove());
        return removedEles;
    },
//funda changed this: selectedEles given as parameter
    hideSelected: function(selectedEles){
        var allNodes = cy.nodes(":visible");
        var selectedNodes = selectedEles;//cy.nodes(":selected");
        var nodesToShow = this.expandRemainingNodes(selectedNodes, allNodes);
        var nodesToHide = allNodes.not(nodesToShow);
        this.applyFilter(nodesToHide);
        cy.elements(":selected").unselect();
        return nodesToHide;

    },
//funda changed this: selectedEles given as parameter
    showSelected: function(selectedEles){
        var allNodes = cy.nodes();
        var selectedNodes = selectedEles;//cy.nodes(":selected");
        var nodesToShow = this.expandNodes(selectedNodes);
        var nodesToHide = allNodes.not(nodesToShow);
        this.applyFilter(nodesToHide);

        cy.elements(":selected").unselect();

        return nodesToShow;
    },

    showAll: function(){
        this.removeFilter(cy.nodes());
    },

    //funda changed this: selectedEles given as parameter
    highlightNeighborsOfSelected: function(selectedEles){
        selectedEles = selectedEles.add(selectedEles.parents("node[sbgnclass='complex']"));
        selectedEles = selectedEles.add(selectedEles.descendants());
        var neighborhoodEles = selectedEles.neighborhood();
        var nodesToHighlight = selectedEles.add(neighborhoodEles);
        nodesToHighlight = nodesToHighlight.add(nodesToHighlight.descendants());
        nodesToHighlight.data("highlighted", 'true');
        this.highlightGraph(nodesToHighlight.nodes(), nodesToHighlight.edges());
        return nodesToHighlight;
    },

    highlightProcessesOfSelected: function(selectedEles){
        selectedEles = this.expandNodes(selectedEles);
        selectedEles.data("highlighted", 'true');
        this.highlightGraph(selectedEles.nodes(), selectedEles.edges());
        return selectedEles;
    },

    removeHighlights: function(){
        this.highlightElements(cy.nodes(":visible").nodes("[highlighted!='true']"));
        this.highlightElements(cy.edges(":visible").edges("[highlighted!='true']"));
        cy.nodes(":visible").nodes().removeData("highlighted");
        cy.edges(":visible").edges().removeData("highlighted");
    },

    highlightGraph: function(nodes, edges){
        this.notHighlightElements(cy.nodes(":visible").nodes("[highlighted!='true']"));
        this.notHighlightElements(cy.edges(":visible").edges("[highlighted!='true']"));
        this.highlightElements(cy.nodes(":visible").nodes("[highlighted='true']"));
        this.highlightElements(cy.edges(":visible").edges("[highlighted='true']"));
        // cy.nodes("[highlighted=true]").not(nodes).css(this.notHighlightNode);
        // cy.edges().not(edges).css(this.notHighlightEdge);
    },

    highlightElements: function(elements){
        elements.removeClass("not-highlighted");
    },

    notHighlightElements: function(elements) {
        elements.addClass("not-highlighted");
    },
    //highlightNodes: function(nodes){
    //    nodes.removeClass("not-highlighted");
    //},
    //
    //notHighlightNodes: function(nodes){
    //    nodes.addClass("not-highlighted");
    //},
    //
    //highlightEdges: function(edges){
    //    edges.removeClass("not-highlighted");
    //},
    //
    //notHighlightEdges: function(edges){
    //    edges.addClass("not-highlighted");
    //},

    isAllElementsAreNotHighlighted: function(){
        var highlightedNodes = cy.nodes(":visible").nodes("[highlighted='true']");
        var highlightedEdges = cy.edges(":visible").edges("[highlighted='true']");
        return highlightedNodes.length + highlightedEdges.length == 0;
    },

    expandNodes: function(nodesToShow){
        var self = this;
        //add children
        nodesToShow = nodesToShow.add(nodesToShow.nodes().descendants());
        //add parents
        nodesToShow = nodesToShow.add(nodesToShow.parents());
        //add complex children
        nodesToShow = nodesToShow.add(nodesToShow.nodes("node[sbgnclass='complex']").descendants());

        // var processes = nodesToShow.nodes("node[sbgnclass='process']");
        // var nonProcesses = nodesToShow.nodes("node[sbgnclass!='process']");
        // var neighborProcesses = nonProcesses.neighborhood("node[sbgnclass='process']");

        var processes = nodesToShow.filter(function(){
            return self.processTypes.indexOf(this._private.data.sbgnclass)>=0;
            //funda return $.inArray(this._private.data.sbgnclass, self.processTypes) >= 0;
        });
        var nonProcesses = nodesToShow.filter(function(){
            return self.processTypes.indexOf(this._private.data.sbgnclass)=== -1;
            //funda return $.inArray(this._private.data.sbgnclass, self.processTypes) === -1;
        });
        var neighborProcesses = nonProcesses.neighborhood().filter(function(){
            return self.processTypes.indexOf(this._private.data.sbgnclass)>=0;
            //funda return $.inArray(this._private.data.sbgnclass, self.processTypes) >= 0;
        });

        nodesToShow = nodesToShow.add(processes.neighborhood());
        nodesToShow = nodesToShow.add(neighborProcesses);
        nodesToShow = nodesToShow.add(neighborProcesses.neighborhood());

        //add parents
        nodesToShow = nodesToShow.add(nodesToShow.nodes().parents());
        //add children
        nodesToShow = nodesToShow.add(nodesToShow.nodes("node[sbgnclass='complex']").descendants());

        return nodesToShow;
    },

    expandRemainingNodes: function(nodesToFilter, allNodes){
        nodesToFilter = this.expandNodes(nodesToFilter);
        var nodesToShow = allNodes.not(nodesToFilter);
        nodesToShow = this.expandNodes(nodesToShow);
        return nodesToShow;
    },

    applyFilter: function(nodesToFilterOut){
        //nodesToFilterOut = nodesToFilterOut.add(nodesToFilterOut.descendants());
//        nodesToFilterOut.hide();
        nodesToFilterOut.css('visibility', 'hidden');
        //nodesToFilterOut.data(filterType, true);
    },

    removeFilter: function(nodes){
        nodes.css('visibility', 'visible');
    },

   // removeFilterOfGivenNodes: function(nodes){
    //    nodes.css('visibility', 'visible');
    //},

    showJustGivenNodes:  function(nodes){
        var visibleNodes = cy.nodes(":visible");
        this.applyFilter(visibleNodes);
        this.removeFilter(nodes);

    }
    }
};