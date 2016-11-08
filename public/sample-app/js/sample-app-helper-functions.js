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



$(document).ready(function () {
    scrollToBottom('command-history-area');
    scrollToBottom('messages');
    scrollToBottom('receivedImages');


 //   dynamicResize();
    //TODO
    // $('#command-history-area').live('contentchanged', function(){
    //     scrollToBottom('command-history-area');
    // });
    //
    // $('#messages').live('contentchanged', function(){
    //     /*
    //        FIXME This is triggered before the DOM is actually updated. Hack
    //        around it by delaying for 100ms. This is of course not reliable but
    //        will be good enough for demos.
    //     */
    //     setTimeout(function () {
    //         scrollToBottom('messages');
    //     }, 100);
    //
    //
    //
    // });
    //
    // $('#receivedImages').live('contentchanged', function(){
    //     scrollToBottom('receivedImages');
    //
    // });
    //
    //

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


//Used in inspector-utilities
var FontProperties = Backbone.View.extend({
    defaultFontProperties: {
        fontFamily: "",
        fontSize: "",
        fontWeight: "",
        fontStyle: ""
    },
    currentFontProperties: undefined,
    copyProperties: function () {
        this.currentFontProperties = _.clone(this.defaultFontProperties);
    },
    fontFamilies: ["", "Helvetica", "Arial", "Calibri", "Cambria", "Comic Sans MS", "Consolas", "Corsiva"
        ,"Courier New" ,"Droid Sans", "Droid Serif", "Georgia", "Impact"
        ,"Lato", "Roboto", "Source Sans Pro", "Syncopate", "Times New Roman"
        ,"Trebuchet MS", "Ubuntu", "Verdana"],
    getOptionIdByFontFamily: function(fontfamily) {
        var id = "font-properties-font-family-" + fontfamily;
        return id;
    },
    getFontFamilyByOptionId: function(id) {
        var lastIndex = id.lastIndexOf("-");
        var fontfamily = id.substr(lastIndex + 1);
        return fontfamily;
    },
    getFontFamilyHtml: function(self) {
        if(self == null){
            self = this;
        }

        var fontFamilies = self.fontFamilies;

        var html = "";
        html += "<select id='font-properties-select-font-family' class='input-medium layout-text' name='font-family-select'>";

        var optionsStr = "";

        for ( var i = 0; i < fontFamilies.length; i++ ) {
            var fontFamily = fontFamilies[i];
            var optionId = self.getOptionIdByFontFamily(fontFamily);
            var optionStr = "<option id='" + optionId + "'"
                + " value='" + fontFamily + "' style='" + "font-family: " + fontFamily + "'";

            if (fontFamily === self.currentFontProperties.fontFamily) {
                optionStr += " selected";
            }

            optionStr += "> ";
            optionStr += fontFamily;
            optionStr += " </option>";

            optionsStr += optionStr;
        }

        html += optionsStr;

        html += "</select>";

        return html;
    },
    initialize: function () {
        var self = this;
        self.defaultFontProperties.getFontFamilyHtml = function(){
            return self.getFontFamilyHtml(self);
        };
        self.copyProperties();
        self.template = _.template($("#font-properties-template").html());
        self.template = self.template(self.defaultFontProperties);
    },
    extendProperties: function (eles) {
        var self = this;
        var commonProperties = {};

        var commonFontSize = sbgnElementUtilities.getCommonLabelFontSize(eles);
        var commonFontWeight = sbgnElementUtilities.getCommonLabelFontWeight(eles);
        var commonFontFamily = sbgnElementUtilities.getCommonLabelFontFamily(eles);
        var commonFontStyle = sbgnElementUtilities.getCommonLabelFontStyle(eles);

        if( commonFontSize != null ) {
            commonProperties.fontSize = commonFontSize;
        }

        if( commonFontWeight != null ) {
            commonProperties.fontWeight = commonFontWeight;
        }

        if( commonFontFamily != null ) {
            commonProperties.fontFamily = commonFontFamily;
        }

        if( commonFontStyle != null ) {
            commonProperties.fontStyle = commonFontStyle;
        }

        self.currentFontProperties = $.extend({}, this.defaultFontProperties, commonProperties);
    },
    render: function (eles) {
        var self = this;
        self.extendProperties(eles);
        self.template = _.template($("#font-properties-template").html());
        self.template = self.template(self.currentFontProperties);
        $(self.el).html(self.template);

        dialogUtilities.openDialog(self.el);

        $(document).off("click", "#set-font-properties").on("click", "#set-font-properties", function (evt) {
            var data = {};

            var labelsize = $('#font-properties-font-size').val();
            var fontfamily = $('select[name="font-family-select"] option:selected').val();
            var fontweight = $('select[name="font-weight-select"] option:selected').val();
            var fontstyle = $('select[name="font-style-select"] option:selected').val();

            if ( labelsize != '' ) {
                data.labelsize = parseInt(labelsize);
            }

            if ( fontfamily != '' ) {
                data.fontfamily = fontfamily;
            }

            if ( fontweight != '' ) {
                data.fontweight = fontweight;
            }

            if ( fontstyle != '' ) {
                data.fontstyle = fontstyle;
            }

            var keys = Object.keys(data);

            if(keys.length === 0) {
                return;
            }

            var validAction = false;

            for ( var i = 0; i < eles.length; i++ ) {
                var ele = eles[i];

                keys.forEach(function(key, idx) {
                    if ( data[key] != ele.data(key) ) {
                        validAction = true;
                    }
                });

                if ( validAction ) {
                    break;
                }
            }

            if ( validAction === false ) {
                return;
            }

            var param = {
                eles: eles,
                data: data,
                firstTime: true
            };

            cy.undoRedo().do("changeFontProperties", param);

            self.copyProperties();
//      $(self.el).dialog('close');
        });

        return this;
    }
});


var stringAfterValueCheck = function (value) {
    return value ? value : '';
};
