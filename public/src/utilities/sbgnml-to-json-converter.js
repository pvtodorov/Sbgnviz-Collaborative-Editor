// function loadXMLDoc(filename) {
//
//     //funda  xhttp.open("GET", filename, false);
//
//
//     //Funda: added to make asynchronous
//     var handleStateChange = function () {
//         switch (xhttp.readyState) {
//             case 0 : // UNINITIALIZED
//             case 1 : // LOADING
//             case 2 : // LOADED
//             case 3 : // INTERACTIVE
//                 break;
//             case 4 : // COMPLETED
//                 return xhttp.responseXML;
//                 break;
//             default: alert("error");
//
//         }
//     };
//
//     var xhttp;
//     if (window.XMLHttpRequest) {
//         xhttp = new XMLHttpRequest();
//     }
//     else {
//         xhttp = new ActiveXObject("Microsoft.XMLHTTP");
//     }
//     xhttp.onreadystatechange=handleStateChange;
//
//     xhttp.open("GET",filename,true);
//
//
//     xhttp.send();
//
//
// };

///////////////////
//FUNDA WARNING
// Cheerio is used instead of jquery
////////////
var sbgnElementUtilities = require('./sbgn-element-utilities.js');


//funda
String.prototype.replaceAll = function(search, replacement) {

    var target = this;
    return target.split(search).join(replacement);
};



module.exports = function () {

    var cheerio = require('cheerio');
    var $; //funda: for cheerio

    return {

        insertedNodes: {},
        getAllCompartments: function (xmlObject) {
            var compartments = [];

//FUNDA????
            $(xmlObject).find("glyph[class='compartment']").each(function () {
           // $("glyph[class='compartment']").each(function () {
                compartments.push({
                    'x': parseFloat($(this).children('bbox').attr('x')),
                    'y': parseFloat($(this).children('bbox').attr('y')),
                    'w': parseFloat($(this).children('bbox').attr('w')),
                    'h': parseFloat($(this).children('bbox').attr('h')),
                    'id': $(this).attr('id')
                });
            });

       //     });

            compartments.sort(function (c1, c2) {
                if (c1.h * c1.w < c2.h * c2.w)
                    return -1;
                if (c1.h * c1.w > c2.h * c2.w)
                    return 1;
                return 0;
            });

            return compartments;
        },
        isInBoundingBox: function (bbox1, bbox2) {
            if (bbox1.x > bbox2.x &&
                bbox1.y > bbox2.y &&
                bbox1.x + bbox1.w < bbox2.x + bbox2.w &&
                bbox1.y + bbox1.h < bbox2.y + bbox2.h)
                return true;
            return false;
        },
        bboxProp: function (ele) {
            var bbox = new Object();

            bbox.x = $(ele).find('bbox').attr('x');
            bbox.y = $(ele).find('bbox').attr('y');
            bbox.w = $(ele).find('bbox').attr('w');
            bbox.h = $(ele).find('bbox').attr('h');

            //set positions as center
            bbox.x = parseFloat(bbox.x) + parseFloat(bbox.w) / 2;
            bbox.y = parseFloat(bbox.y) + parseFloat(bbox.h) / 2;

            return bbox;
        },
        stateAndInfoBboxProp: function (ele, parentBbox) {
            var xPos = parseFloat(parentBbox.x);
            var yPos = parseFloat(parentBbox.y);

            var bbox = new Object();

            bbox.x = $(ele).find('bbox').attr('x');
            bbox.y = $(ele).find('bbox').attr('y');236
            bbox.w = $(ele).find('bbox').attr('w');
            bbox.h = $(ele).find('bbox').attr('h');

            //set positions as center
            bbox.x = parseFloat(bbox.x) + parseFloat(bbox.w) / 2 - xPos;
            bbox.y = parseFloat(bbox.y) + parseFloat(bbox.h) / 2 - yPos;

            bbox.x = bbox.x / parseFloat(parentBbox.w) * 100;
            bbox.y = bbox.y / parseFloat(parentBbox.h) * 100;

            return bbox;
        },
        stateAndInfoProp: function (ele, parentBbox) {
            var self = this;
            var stateAndInfoArray = new Array();

            $(ele).children('glyph').each(function () {
                var obj = new Object();
                if ($(this).attr('class') === 'unit of information') {
                    obj.id = $(this).attr('id');
                    obj.clazz = $(this).attr('class');
                    obj.label = {'text': $(this).find('label').attr('text')};
                    obj.bbox = self.stateAndInfoBboxProp(this, parentBbox);
                    stateAndInfoArray.push(obj);
                }
                else if ($(this).attr('class') === 'state variable') {
                    obj.id = $(this).attr('id');
                    obj.clazz = $(this).attr('class');
                    obj.state = {
                        'value': $(this).find('state').attr('value'),
                        'variable': $(this).find('state').attr('variable')
                    };
                    obj.bbox = self.stateAndInfoBboxProp(this, parentBbox);
                    stateAndInfoArray.push(obj);
                }
            });

            return stateAndInfoArray;
        },
        addParentInfoToNode: function (ele, nodeObj, parent, compartments) {
            var self = this;
            //there is no complex parent
            if (parent == "") {
                //no compartment reference
                if (typeof $(ele).attr('compartmentRef') === 'undefined') {
                    nodeObj.parent = "";

                    //add compartment according to geometry
                    for (var i = 0; i < compartments.length; i++) {
                        var bbox = {
                            'x': parseFloat($(ele).children('bbox').attr('x')),
                            'y': parseFloat($(ele).children('bbox').attr('y')),
                            'w': parseFloat($(ele).children('bbox').attr('w')),
                            'h': parseFloat($(ele).children('bbox').attr('h')),
                            'id': $(ele).attr('id')
                        }
                        if (self.isInBoundingBox(bbox, compartments[i])) {
                            nodeObj.parent = compartments[i].id;
                            break;
                        }
                    }
                }
                //there is compartment reference
                else {
                    nodeObj.parent = $(ele).attr('compartmentRef');
                }
            }
            //there is complex parent
            else {
                nodeObj.parent = parent;
            }
        },
        addCytoscapeJsNode: function (ele, jsonArray, parent, compartments) {
            var self = this;
            var nodeObj = new Object();
            var sbgnclass = $(ele).attr('class');



            //add id information
            if($(ele).attr('id'))
                nodeObj.id = ($(ele).attr('id')).replaceAll('.', "_"); //funda: to prevent derby path confusion;
            else
                nodeObj.id = null;

            //add node bounding box information
            nodeObj.bbox = self.bboxProp(ele);
            //add class information
            nodeObj.sbgnclass = $(ele).attr('class');
            //add label information
            nodeObj.sbgnlabel = $(ele).children('label').attr('text');
            //add state and info box information
            nodeObj.sbgnstatesandinfos = self.stateAndInfoProp(ele, nodeObj.bbox);
            // add default label size information
            nodeObj.labelsize = sbgnElementUtilities.canHaveSBGNLabel(sbgnclass) ? sbgnElementUtilities.getDefaultLabelSize(sbgnclass) : undefined;
            // add default font family
            nodeObj.fontfamily = sbgnElementUtilities.canHaveSBGNLabel(sbgnclass) ? sbgnElementUtilities.defaultFontProperties.fontfamily : undefined;
            // add default font weight
            nodeObj.fontweight = sbgnElementUtilities.canHaveSBGNLabel(sbgnclass) ? sbgnElementUtilities.defaultFontProperties.fontweight : undefined;
            // add default font style
            nodeObj.fontstyle = sbgnElementUtilities.canHaveSBGNLabel(sbgnclass) ? sbgnElementUtilities.defaultFontProperties.fontstyle : undefined;
            //adding parent information
            self.addParentInfoToNode(ele, nodeObj, parent, compartments);

            //add clone information
            if ($(ele).children('clone').length > 0)
                nodeObj.sbgnclonemarker = true;
            else
                nodeObj.sbgnclonemarker = undefined;

            //add port information
            var ports = [];
            $(ele).find('port').each(function () {
                var id = $(this).attr('id');
                var relativeXPos = parseFloat($(this).attr('x')) - nodeObj.bbox.x;
                var relativeYPos = parseFloat($(this).attr('y')) - nodeObj.bbox.y;

                relativeXPos = relativeXPos / parseFloat(nodeObj.bbox.w) * 100;
                relativeYPos = relativeYPos / parseFloat(nodeObj.bbox.h) * 100;

                ports.push({
                    id: $(this).attr('id'),
                    x: relativeXPos,
                    y: relativeYPos
                });
            });

            nodeObj.ports = ports;

            var cytoscapeJsNode = {data: nodeObj};
            jsonArray.push(cytoscapeJsNode);
        },
        traverseNodes: function (ele, jsonArray, parent, compartments) {

            if (!sbgnElementUtilities.handledElements[$(ele).attr('class')]) {
                return;
            }

            this.insertedNodes[$(ele).attr('id')] = true;
            var self = this;

            //add complex nodes here
            if ($(ele).attr('class') === 'complex' || $(ele).attr('class') === 'submap') {
                self.addCytoscapeJsNode(ele, jsonArray, parent, compartments);

                $(ele).children('glyph').each(function () {
                    if ($(this).attr('class') != 'state variable' &&
                        $(this).attr('class') != 'unit of information') {
                        self.traverseNodes(this, jsonArray, $(ele).attr('id'), compartments);
                    }
                });
            }
            else {
                self.addCytoscapeJsNode(ele, jsonArray, parent, compartments);
            }
        },
        getArcSourceAndTarget: function (arc, xmlObject) {
            //source and target can be inside of a port
            var source = $(arc).attr('source');
            var target = $(arc).attr('target');
            var sourceNodeId, targetNodeId;

           $(xmlObject).find('glyph').each(function () {
         //    $('glyph').each(function () {
                if ($(this).attr('id') == source) {
                    sourceNodeId = source;
                }
                if ($(this).attr('id') == target) {
                    targetNodeId = target;
                }
            });

            if (typeof sourceNodeId === 'undefined') {
               $(xmlObject).find("port").each(function () {
             //    $("port").each(function () {
                    if ($(this).attr('id') == source) {
                        sourceNodeId = $(this).parent().attr('id');
                    }
                });
            }

            if (typeof targetNodeId === 'undefined') {
                $(xmlObject).find("port").each(function () {
                // $("port").each(function () {
                    if ($(this).attr('id') == target) {
                        targetNodeId = $(this).parent().attr('id');
                    }
                });
            }

            return {'source': sourceNodeId, 'target': targetNodeId};
        },
        getArcBendPointPositions: function (ele) {
            var bendPointPositions = [];

//    $(ele).children('start, next, end').each(function () {
            $(ele).children('next').each(function () {
                var posX = $(this).attr('x');
                var posY = $(this).attr('y');

                var pos = {
                    x: posX,
                    y: posY
                };

                bendPointPositions.push(pos);
            });

            return bendPointPositions;
        },
        addCytoscapeJsEdge: function (ele, jsonArray, xmlObject) {
            if (!sbgnElementUtilities.handledElements[$(ele).attr('class')]) {
                return;
            }

            var self = this;
            var edgeObj = new Object();

            var bendPointPositions = self.getArcBendPointPositions(ele);

            if($(ele).attr('id'))
                edgeObj.id = ($(ele).attr('id')).replaceAll('.', "_"); //funda: to prevent derby path confusion
            else
                edgeObj.id = null;

        //funda2    edgeObj.id = $(ele).data('id');

            edgeObj.sbgnclass = $(ele).attr('class');
            edgeObj.bendPointPositions = bendPointPositions;

            if ($(ele).find('glyph').length <= 0) {
                edgeObj.sbgncardinality = 0;
            }
            else {
                $(ele).children('glyph').each(function () {
                    if ($(this).attr('class') == 'cardinality') {
                        edgeObj.sbgncardinality = $(this).find('label').attr('text');
                    }
                });
            }

            var sourceAndTarget = self.getArcSourceAndTarget(ele, xmlObject);

            edgeObj.source = sourceAndTarget.source;
            edgeObj.target = sourceAndTarget.target;

            edgeObj.portsource = $(ele).attr("source");
            edgeObj.porttarget = $(ele).attr("target");


            var cytoscapeJsEdge = {data: edgeObj};


            jsonArray.push(cytoscapeJsEdge);
        },
        convert: function (xmlObject) {
            var self = this;
            var cytoscapeJsNodes = [];
            var cytoscapeJsEdges = [];

            $ = cheerio.load(xmlObject, {
                xmlMode: true
            });


            var compartments = self.getAllCompartments(xmlObject);


           $(xmlObject).find("map").children('glyph').each(function (i, elem) {
           //  $("map").children('glyph').each(function (i, elem) {

                self.traverseNodes(this, cytoscapeJsNodes, "", compartments);
            });

            $(xmlObject).find("map").children('arc').each(function () {
            // $("map").children('arc').each(function () {
                self.addCytoscapeJsEdge(this, cytoscapeJsEdges, xmlObject);
            });


            var cytoscapeJsGraph = new Object();
            cytoscapeJsGraph.nodes = cytoscapeJsNodes;
            cytoscapeJsGraph.edges = cytoscapeJsEdges;

            this.insertedNodes = {};

            return cytoscapeJsGraph;
        }
    }
};
