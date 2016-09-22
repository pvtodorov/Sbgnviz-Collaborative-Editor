/**
 * Created by cbio on 10/5/15.
 */


function loadXMLDoc(filename) {

    //funda  xhttp.open("GET", filename, false);


    //Funda: added to make asynchronous
    var handleStateChange = function () {
        switch (xhttp.readyState) {
            case 0 : // UNINITIALIZED
            case 1 : // LOADING
            case 2 : // LOADED
            case 3 : // INTERACTIVE
                break;
            case 4 : // COMPLETED
                return xhttp.responseXML;
                break;
            default: alert("error");

        }
    };

    var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    }
    else {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.onreadystatechange=handleStateChange;

    xhttp.open("GET",filename,true);


    xhttp.send();


};
function dynamicResize()
{

    var win = $(this); //this = window

    var windowWidth = win.width() - 80; //80px padding on the left
    var windowHeight = win.height()  - 10; //10px padding at the bottom

    var canvasWidth = 1000;
    var canvasHeight = 680;

    //if (windowWidth > canvasWidth) {
    $("#sbgn-network-container").width(windowWidth * 0.7 );

    var inspectorCoef = 0.31;

    $("#inspector-tab-area").width(windowWidth * inspectorCoef);

    // $("#sbgn-inspector").width(windowWidth * 0.28);
    $(".nav-menu").width(windowWidth * 0.7);
    $(".navbar").width(windowWidth * 0.7);
    $("#sbgn-toolbar").width(windowWidth * 0.7);
    // $("#chat-area").width(windowWidth * 0.28);
    // $("#command-history-area").width(windowWidth * 0.28);

//    }

    //    if (windowHeight > canvasHeight) {
    if($("#sbgn-toolbar").width() < (444))
        $("#sbgn-network-container").css('top', '190px');
    else if($("#sbgn-toolbar").width() < (888))
        $("#sbgn-network-container").css('top', '140px');
    else
        $("#sbgn-network-container").css('top', '95px');


    $("#sbgn-network-container").height(windowHeight * 0.9);

    $("#inspector-tab-area").height(windowHeight);
    // $("#sbgn-inspector").height(windowHeight * 0.20);
    // $("#command-history-area").height(windowHeight * 0.21);
    // $("#chat-area").height(windowHeight * 0.53);
    //  }
}

$(window).on('resize', dynamicResize);


$(document).ready(function () {
    scrollToBottom('command-history-area');
    scrollToBottom('messages');
    scrollToBottom('receivedImages');


    dynamicResize();
    $('#command-history-area').live('contentchanged', function(){
        scrollToBottom('command-history-area');
    });

    $('#messages').live('contentchanged', function(){
        /* 
           FIXME This is triggered before the DOM is actually updated. Hack
           around it by delaying for 100ms. This is of course not reliable but
           will be good enough for demos.
        */
        setTimeout(function () {
            scrollToBottom('messages');
        }, 100);



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
    if (e.ctrlKey) {
        window.ctrlKeyDown = true;
        // if (e.which === 90) {
        //   notificationActionsManager.undo();
        //refreshUndoRedoButtonsStatus();
//    $(document.activeElement).attr("value");
    }
    // else if (e.which === 89) {
    //  notificationActionsManager.redo();
    //  refreshUndoRedoButtonsStatus();
    //  }
    //}
});

$(document).keyup(function (e) {
    window.ctrlKeyDown = null;
//  $("#sbgn-network-container").removeClass("target-cursor");
    disableDragAndDropMode();
});



var getNodesData = function () {
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
    return nodesData;
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
            at: 'bottom right',
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
}



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




//funda: changed #555 to #555555
var sbgnStyleSheet = cytoscape.stylesheet()
    .selector("node")
    .css({
        'border-width': 1.5,
        'border-color': '#555',
        'background-color': '#f6f6f6',
        'font-size': 11,
//          'shape': 'data(sbgnclass)',
        'background-opacity': 0.5,
        'text-opacity': 1,
        'opacity': 1
    })
    .selector("node[?sbgnclonemarker][sbgnclass='perturbing agent']")
    .css({
        'background-image': 'sampleapp-images/clone_bg.png',
        'background-position-x': '50%',
        'background-position-y': '100%',
        'background-width': '100%',
        'background-height': '25%',
        'background-fit': 'none',
        'background-image-opacity': function (ele) {
            if(!ele.data('sbgnclonemarker')){
                return 0;
            }
            return ele._private.style['background-opacity'].value;
        }
    })
    .selector("node[sbgnclass][sbgnclass!='complex'][sbgnclass!='process'][sbgnclass!='association'][sbgnclass!='dissociation'][sbgnclass!='compartment'][sbgnclass!='source and sink']")
    .css({
//          'content': 'data(sbgnlabel)',
        'content': function (ele) {
            return getElementContent(ele);
        },
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': function (ele) {
            return getLabelTextSize(ele);
        }
    })
    .selector("node[sbgnclass]")
    .css({
        'shape': function (ele) {
            return getCyShape(ele);
        }
    })
    .selector("node[sbgnclass='perturbing agent']")
    .css({
        'shape-polygon-points': '-1, -1,   -0.5, 0,  -1, 1,   1, 1,   0.5, 0, 1, -1'
    })
    .selector("node[sbgnclass='association']")
    .css({
        'background-color': '#6B6B6B'
    })
    .selector("node[sbgnclass='tag']")
    .css({
        'shape-polygon-points': '-1, -1,   0.25, -1,   1, 0,    0.25, 1,    -1, 1'
    })
    .selector("node[sbgnclass='complex']")
    .css({
        'background-color': '#F4F3EE',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': function (ele) {
            return getLabelTextSize(ele);
        },
        'width': function(ele){
            if(ele.children() == null || ele.children().length == 0){
                return '36';
            }
            return ele.data('width');
        },
        'height': function(ele){
            if(ele.children() == null || ele.children().length == 0){
                return '36';
            }
            return ele.data('height');
        },
        'content': function(ele){
            return getElementContent(ele);
        }
    })
    .selector("node[sbgnclass='compartment']")
    .css({
        'border-width': 3.75,
        'background-opacity': 0,
        'background-color': '#FFFFFF',
        'content': function(ele){
            return getElementContent(ele);
        },
        'width': function(ele){
            if(ele.children() == null || ele.children().length == 0){
                return '36';
            }
            return ele.data('width');
        },
        'height': function(ele){
            if(ele.children() == null || ele.children().length == 0){
                return '36';
            }
            return ele.data('height');
        },
        'text-valign': 'bottom',
        'text-halign': 'center',
        'font-size': function (ele) {
            return getLabelTextSize(ele);
        }
    })
    .selector("node[sbgnclass][sbgnclass!='complex'][sbgnclass!='compartment'][sbgnclass!='submap']")
    .css({
        'width': 'data(sbgnbbox.w)',
        'height': 'data(sbgnbbox.h)'
    })
    .selector("node:selected")
    .css({
        'border-color': '#d67614',
        'target-arrow-color': '#000',
        'text-outline-color': '#000'})
    .selector("node:active")
    .css({
        'background-opacity': 0.7, 'overlay-color': '#d67614',
        'overlay-padding': '14'
    })
    .selector("edge")
    .css({
        'curve-style': 'bezier',
        'line-color': '#555',
        'target-arrow-fill': 'hollow',
        'source-arrow-fill': 'hollow',
        'width': 1.5,
        'target-arrow-color': '#555',
        'source-arrow-color': '#555',
//          'target-arrow-shape': 'data(sbgnclass)'
    })
    .selector("edge[sbgnclass]")
    .css({
        'target-arrow-shape': function (ele) {
            return getCyArrowShape(ele);
        },
        'source-arrow-shape': 'none'
    })
    .selector("edge[sbgnclass='inhibition']")
    .css({
        'target-arrow-fill': 'filled'
    })
    .selector("edge[sbgnclass='consumption']")
    .css({
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
    .selector("node.changeBackgroundOpacity")
    .css({
        'background-opacity': 'data(backgroundOpacity)'
    })
    .selector("node.changeLabelTextSize")
    .css({
        'font-size': function (ele) {
            return getLabelTextSize(ele);
        }
    })
    .selector("node.changeContent")
    .css({
        'content': function (ele) {
            return getElementContent(ele);
        }
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
    }).selector("node.changeClonedStatus")
    .css({
        'background-image-opacity': function (ele) {
            if(!ele.data('sbgnclonemarker')){
                return 0;
            }
            return ele._private.style['background-opacity'].value;
        }
    });
// end of sbgnStyleSheet

//get the sbgn style rules
//funda getSBGNStyleRules();



var stringAfterValueCheck = function (value) {
    return value ? value : '';
};