/**
 * Created by cbio on 10/5/15.
 */




function dynamicResize()
{

    var win = $(this); //this = window

    var windowWidth = win.width() - 80; //80px padding on the left
    var windowHeight = win.height()  - 10; //10px padding at the bottom

    var canvasWidth = 1000;
    var canvasHeight = 680;

    //if (windowWidth > canvasWidth) {
    $("#sbgn-network-container").width(windowWidth * 0.7 );
    $("#sbgn-inspector").width(windowWidth * 0.28);
    $(".nav-menu").width(windowWidth * 0.7);
    $(".navbar").width(windowWidth * 0.7);
    $("#sbgn-toolbar").width(windowWidth * 0.7);
    $("#chat-area").width(windowWidth * 0.28);
    $("#command-history-area").width(windowWidth * 0.28);

//    }

  //    if (windowHeight > canvasHeight) {
    if($("#sbgn-toolbar").width() < (444))
      $("#sbgn-network-container").css('top', '190px');
    else if($("#sbgn-toolbar").width() < (888))
        $("#sbgn-network-container").css('top', '140px');
    else
        $("#sbgn-network-container").css('top', '95px');


      $("#sbgn-network-container").height(windowHeight * 0.9);
      $("#sbgn-inspector").height(windowHeight * 0.20);
      $("#command-history-area").height(windowHeight * 0.21);
      $("#chat-area").height(windowHeight * 0.53);
   //  }
}

$(window).on('resize', dynamicResize);

$(document).ready(function ()
{
    dynamicResize();
    $('#command-history-area').live('contentchanged', function(){
        scrollToBottom('command-history-area');
    });

    $('#messages').live('contentchanged', function(){
        scrollToBottom('messages');

    });

    $('#receivedImages').live('contentchanged', function(){
        scrollToBottom('receivedImages');

    });



});
function showQTip(el){
    $(el).parent().qtip({
        content: { text:  function() {

            return "Click image to enlarge ";
        }

        },

        position: {
            my: 'center',
            at: 'center',
            adjust: {
                cyViewport: true
            },
            effect: false
        },
        mouseover: true,
        style: {
            classes: 'qtip-image',

            tip: {
                width: 16,
                height: 8
            }
        }
    });
}

function openImage(el){
    if(el.src){
        var url = el.src;
        window.open(url, 'Image', 'width=largeImage.stylewidth,height=largeImage.style.height,resizable=1');
    }


}



function scrollToBottom(docId){

    document.getElementById(docId).scrollTop = document.getElementById(docId).scrollHeight  - document.getElementById(docId).clientHeight;

}
//Handle keyboard events
$(document).keydown(function (e) {
    if (e.which === 90 && e.ctrlKey) {
        editorActionsManager.undo();
        refreshUndoRedoButtonsStatus();
    }
    else if (e.which === 89 && e.ctrlKey) {
        editorActionsManager.redo();
        refreshUndoRedoButtonsStatus();
    }
});

//Cytoscape extensions
cytoscape('collection', 'setWidth', function(val){
    var ele = this[0];
    var cy = ele._private.cy;
    var styleEnabled = cy._private.styleEnabled;

    if( ele ){
        if( styleEnabled ){
            ele._private.style.width.pxValue = val ;
            ele._private.style.width.value = val ;
            ele._private.style.width.strValue = ""+ Math.floor(val) + "px";
            ele._private.autoWidth  = val;

        } else {

            ele._private.data.width  = val;
        }
    }
});


cytoscape('collection', 'setHeight', function(val){
    var ele = this[0];
    var cy = ele._private.cy;
    var styleEnabled = cy._private.styleEnabled;

    if( ele ){
        if( styleEnabled ){
            ele._private.style.height.pxValue = val;
            ele._private.style.height.value = val ;
            ele._private.style.height.strValue = ""+ Math.floor(val) + "px";
            ele._private.autoHeight  = val;
        } else {

            ele._private.data.height  = val;
        }
    }
});

var refreshPaddings = function () {
    //If compound padding is not set yet set it by css value
    if (window.compoundPadding == null) {
        window.compoundPadding = parseInt(sbgnStyleRules['compound-padding'], 10);
    }
    var nodes = cy.nodes();
    var total = 0;
    var numOfSimples = 0;

    for (var i = 0; i < nodes.length; i++) {
        var theNode = nodes[i];
        if (theNode.children() == null || theNode.children().length == 0) {
            var collapsedChildren = theNode._private.data.collapsedChildren;
            if (collapsedChildren == null || collapsedChildren.length == 0) {
                total += Number(theNode._private.data.sbgnbbox.w);
                total += Number(theNode._private.data.sbgnbbox.h);
                numOfSimples++;
            }
            else {
                var result = expandCollapseUtilities.getCollapsedChildrenData(collapsedChildren, numOfSimples, total);
                numOfSimples = result.numOfSimples;
                total = result.total;
            }
        }
    }

    var calc_padding = (compoundPadding / 100) * Math.floor(total / (2 * numOfSimples));

    if (calc_padding < 10) {
        calc_padding = 10;
    }

    var complexesAndCompartments = cy.$("node[sbgnclass='complex'], node[sbgnclass='compartment']");
    complexesAndCompartments.css('padding-left', calc_padding + 8);
    complexesAndCompartments.css('padding-right', calc_padding + 8);
    complexesAndCompartments.css('padding-top', calc_padding + 8);
    complexesAndCompartments.css('padding-bottom', calc_padding + 8);
    //To refresh the nodes on the screen apply the preset layout
    cy.layout({
        name: "preset"
    });


};




//Returns true for unspecified entity,
//simple chemical, macromolecule, nucleic acid feature, and complexes
//As they may have some specific node properties(state variables, units of information etc.)
var isSpecialSBGNNodeClass = function (sbgnclass) {
    if (sbgnclass == 'unspecified entity' || sbgnclass == 'simple chemical'
        || sbgnclass == 'macromolecule' || sbgnclass == 'nucleic acid feature'
        || sbgnclass == 'complex'
        || sbgnclass == 'unspecified entity multimer' || sbgnclass == 'simple chemical multimer'
        || sbgnclass == 'macromolecule multimer' || sbgnclass == 'nucleic acid feature multimer'
        || sbgnclass == 'complex multimer') {
        return true;
    }
    return false;
};




var relocateStateAndInfos = function (stateAndInfos) {
    var length = stateAndInfos.length;
    if (length == 0) {
        return;
    }
    else if (length == 1) {
        stateAndInfos[0].bbox.x = 0;
        stateAndInfos[0].bbox.y = -50;
    }
    else if (length == 2) {
        stateAndInfos[0].bbox.x = 0;
        stateAndInfos[0].bbox.y = -50;

        stateAndInfos[1].bbox.x = 0;
        stateAndInfos[1].bbox.y = 50;
    }
    else if (length == 3) {
        stateAndInfos[0].bbox.x = -25;
        stateAndInfos[0].bbox.y = -50;

        stateAndInfos[1].bbox.x = 25;
        stateAndInfos[1].bbox.y = -50;

        stateAndInfos[2].bbox.x = 0;
        stateAndInfos[2].bbox.y = 50;
    }
    else {
        stateAndInfos[0].bbox.x = -25;
        stateAndInfos[0].bbox.y = -50;

        stateAndInfos[1].bbox.x = 25;
        stateAndInfos[1].bbox.y = -50;

        stateAndInfos[2].bbox.x = -25;
        stateAndInfos[2].bbox.y = 50;

        stateAndInfos[3].bbox.x = 25;
        stateAndInfos[3].bbox.y = 50;
    }
};

/*
 * This function obtains the info label of the given node by
 * it's children info recursively
 */
function getInfoLabel(node) {
    /*    * Info label of a collapsed node cannot be changed if
     * the node is collapsed return the already existing info label of it
     */
    if (node._private.data.collapsedChildren != null) {
        return node._private.data.infoLabel;
    }

    /*
     * If the node is simple then it's infolabel is equal to it's sbgnlabel
     */
    if (node.children() == null || node.children().length == 0) {
        return node._private.data.sbgnlabel;
    }

    var children = node.children();
    var infoLabel = "";
    /*
     * Get the info label of the given node by it's children info recursively
     */
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var childInfo = getInfoLabel(child);

        if (childInfo == null || childInfo == "") {
            continue;
        }

        if (infoLabel != "") {
            infoLabel += ":";
        }
        infoLabel += childInfo;
    }

    //return info label
    return infoLabel;
};

/*
 * This function create qtip for the given node
 */
function nodeQtipFunction(node) {
    /*    * Check the sbgnlabel of the node if it is not valid
     * then check the infolabel if it is also not valid do not show qtip
     */
    var label = node._private.data.sbgnlabel;

    if (label == null || label == "")
        label = getInfoLabel(node);

    if (label == null || label == "")
        return;

    node.qtip({
        content: function () {
            var contentHtml =
                "<b style='text-align:center;font-size:16px;'>" + label + "</b>";
            var sbgnstatesandinfos = node._private.data.sbgnstatesandinfos;
            for (var i = 0; i < sbgnstatesandinfos.length; i++) {
                var sbgnstateandinfo = sbgnstatesandinfos[i];
                if (sbgnstateandinfo.clazz == "state variable") {
                    var value = sbgnstateandinfo.state.value;
                    var variable = sbgnstateandinfo.state.variable;
                    var stateLabel = (variable == null /*|| typeof stateVariable === undefined */) ? value :
                    value + "@" + variable;
                    if (stateLabel == null) {
                        stateLabel = "";
                    }
                    contentHtml += "<div style='text-align:center;font-size:14px;'>" + stateLabel + "</div>";
                }
                else if (sbgnstateandinfo.clazz == "unit of information") {
                    var stateLabel = sbgnstateandinfo.label.text;
                    if (stateLabel == null) {
                        stateLabel = "";
                    }
                    contentHtml += "<div style='text-align:center;font-size:14px;'>" + stateLabel + "</div>";
                }
            }
            return contentHtml;
        },
        show: {
            ready: true
        },
        position: {
            my: 'top center',
            at: 'bottom center',
            adjust: {
                cyViewport: true
            }
        },
        style: {
            classes: 'qtip-bootstrap',
            tip: {
                width: 16,
                height: 8
            }
        }
    });
};

var isEPNClass = function (sbgnclass) {
    return (sbgnclass == 'unspecified entity'
    || sbgnclass == 'simple chemical'
    || sbgnclass == 'macromolecule'
    || sbgnclass == 'nucleic acid feature'
    || sbgnclass == 'complex');
};

var isPNClass = function (sbgnclass) {
    return (sbgnclass == 'process'
    || sbgnclass == 'omitted process'
    || sbgnclass == 'uncertain process'
    || sbgnclass == 'association'
    || sbgnclass == 'dissociation');
};

var isLogicalOperator = function (sbgnclass) {
    return (sbgnclass == 'and' || sbgnclass == 'or' || sbgnclass == 'not');
};

var convenientToEquivalence = function (sbgnclass) {
    return (sbgnclass == 'tag' || sbgnclass == 'terminal');
};

/*
 * This is a debugging function
 */
var printNodeInfo = function () {
    console.log("print node info");
    var nodes = cy.nodes();
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        console.log(node.data("id") + "\t" + node.data("parent"));
    }
    console.log("print edge info");
    var edges = cy.edges();
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        console.log(edge.data("id") + "\t" + edge.data("source") + "\t" + edge.data("target"));
    }
};

//get the style properties for the given selector
function getStyleRules(selector) {
    for (var i = 0; i < sbgnStyleSheet.length; i++) {
        var currentStyle = sbgnStyleSheet[i];
        if (currentStyle.selector == selector) {
            return currentStyle.properties;
        }
    }
};

/*
 * get the style rules for .sbgn selector and fill them into sbgnStyleRules map
 */
function getSBGNStyleRules(){
    if (window.sbgnStyleRules == null) {
        var styleRulesList = getStyleRules(".sbgn");
        window.sbgnStyleRules = {};
        for (var i = 0; i < styleRulesList.length; i++) {
            var rule = styleRulesList[i];
            window.sbgnStyleRules[rule.name] = rule.value;
        }
    }
    return sbgnStyleRules;
};



var sbgnStyleSheet = cytoscape.stylesheet()
    .selector("node")
    .css({
        'border-width': 1.5,
        'border-color': '#555555',
        'background-color': '#f6f6f6',
        'font-size': 11,
//          'shape': 'data(sbgnclass)',
        'background-opacity': 0.5,
    })
    .selector("node[sbgnclass]")
    .css({
      'shape': 'data(sbgnclass)' //gives error
        //'shape': '[sbgnclass]'
    })
//        .selector("node[!sbgnclass][width][height]")
//        .css({
//          'width': 'data(width)',
//          'height': 'data(height)'
//        })
    .selector("node[sbgnclass='complex']")
    .css({
        'background-color': '#F4F3EE',
        'expanded-collapsed': 'expanded',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': '16'
    })
    .selector("node[sbgnclass='compartment']")
    .css({
        'border-width': 3.75,
        'background-opacity': 0,
        'background-color': '#FFFFFF',
        'content': 'data(sbgnlabel)',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': '16',
        'expanded-collapsed': 'expanded'
    })
    .selector("node[sbgnclass='submap']")
    .css({
        'expanded-collapsed': 'expanded'
    })
    .selector("node[sbgnclass][sbgnclass!='complex'][sbgnclass!='compartment'][sbgnclass!='submap']")
    .css({
        'width': 'data(sbgnbbox.w)',
        'height': 'data(sbgnbbox.h)'
    })
    .selector("node:selected")
    .css({
        'border-color': '#d67614',
        'target-arrow-color': '#000000',
        'text-outline-color': '#000000'})
    .selector("node:active")
    .css({
        'background-opacity': 0.7, 'overlay-color': '#d67614',
        'overlay-padding': '14'
    })
    .selector("edge")
    .css({
        'line-color': '#555555',
        'target-arrow-fill': 'hollow',
        'source-arrow-fill': 'hollow',
        'width': 1.5,
        'target-arrow-color': '#555555',
        'source-arrow-color': '#555555',
//          'target-arrow-shape': 'data(sbgnclass)'
    })
    .selector("edge[sbgnclass]")
    .css({
        'target-arrow-shape': 'data(sbgnclass)' //funda
        //'target-arrow-shape': '[sbgnclass]'
    })
    .selector("edge[sbgnclass='inhibition']")
    .css({
        'target-arrow-fill': 'filled'
    })
    .selector("edge[sbgnclass='consumption']")
    .css({
        'target-arrow-shape': 'none',
        'source-arrow-shape': 'data(sbgnclass)',
        //'source-arrow-shape': '[sbgnclass]',
        'line-style': 'consumption'
    })
    .selector("edge[sbgnclass='production']")
    .css({
        'target-arrow-fill': 'filled',
        'line-style': 'production'
    })
    .selector("edge:selected")
    .css({
        'line-color': '#d67614',
        'source-arrow-color': '#d67614',
        'target-arrow-color': '#d67614'
    })
    .selector("edge:active")
    .css({
        'background-opacity': 0.7, 'overlay-color': '#d67614',
        'overlay-padding': '8'
    })
    .selector("core")
    .css({
        'selection-box-color': '#d67614',
        'selection-box-opacity': '0.2', 'selection-box-border-color': '#d67614'
    })
    .selector(".ui-cytoscape-edgehandles-source")
    .css({
        'border-color': '#5CC2ED',
        'border-width': 3
    })
    .selector(".ui-cytoscape-edgehandles-target, node.ui-cytoscape-edgehandles-preview")
    .css({
        'background-color': '#5CC2ED'
    })
    .selector("edge.ui-cytoscape-edgehandles-preview")
    .css({
        'line-color': '#5CC2ED'
    })
    .selector("node.ui-cytoscape-edgehandles-preview, node.intermediate")
    .css({
        'shape': 'rectangle',
        'width': 15,
        'height': 15
    })
    .selector('edge.not-highlighted')
    .css({
        'opacity': 0.3,
        'text-opacity': 0.3,
        'background-opacity': 0.3
    })
    .selector('node.not-highlighted')
    .css({
        'border-opacity': 0.3,
        'text-opacity': 0.3,
        'background-opacity': 0.3
    })
    .selector('edge.meta')
    .css({
        'line-color': '#C4C4C4',
        'source-arrow-color': '#C4C4C4',
        'target-arrow-color': '#C4C4C4'
    })
    .selector("edge.meta:selected")
    .css({
        'line-color': '#d67614',
        'source-arrow-color': '#d67614',
        'target-arrow-color': '#d67614'
    })
    .selector("node.collapsed")
    .css({
        'width': 60,
        'height': 60
    })
    .selector("node.changeBackgroundOpacity")
    .css({
        'background-opacity': 'data(backgroundOpacity)'
    })
    .selector("node.changeBorderColor")
    .css({
        'border-color': 'data(borderColor)'
    })
    .selector("node.changeBorderColor:selected")
    .css({
        'border-color': '#d67614'
    })
    .selector("edge.changeLineColor")
    .css({
        'line-color': 'data(lineColor)',
        'source-arrow-color': 'data(lineColor)',
        'target-arrow-color': 'data(lineColor)'
    })
    .selector("edge.changeLineColor:selected")
    .css({
        'line-color': '#d67614',
        'source-arrow-color': '#d67614',
        'target-arrow-color': '#d67614'
    })
    .selector('edge.changeLineColor.meta')
    .css({
        'line-color': '#C4C4C4',
        'source-arrow-color': '#C4C4C4',
        'target-arrow-color': '#C4C4C4'
    })
    .selector("edge.changeLineColor.meta:selected")
    .css({
        'line-color': '#d67614',
        'source-arrow-color': '#d67614',
        'target-arrow-color': '#d67614'
    })
    .selector(".sbgn")
    .css({
        'compound-padding': 20,
        'dynamic-label-size': 'regular',
        'fit-labels-to-nodes': 'true',
        'incremental-layout-after-expand-collapse': 'true'
    }); // end of sbgnStyleSheet

//get the sbgn style rules
getSBGNStyleRules();



