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

var sbgnElementUtilities = require('./sbgn-element-utilities.js')();


//funda
String.prototype.replaceAll = function(search, replacement) {

    var target = this;
    return target.split(search).join(replacement);
};

module.exports = function () {

    var cheerio = require('cheerio');
    var cheerio$;

    return {


        getAllCompartments: function (xmlObject) {
            var compartments = [];


           // cheerio$(xmlObject).find("glyph[class='compartment']").each(function () {
            cheerio$("glyph[class='compartment']").each(function () {
                compartments.push({
                    'x': parseFloat(cheerio$(this).children('bbox').attr('x')),
                    'y': parseFloat(cheerio$(this).children('bbox').attr('y')),
                    'w': parseFloat(cheerio$(this).children('bbox').attr('w')),
                    'h': parseFloat(cheerio$(this).children('bbox').attr('h')),
                    'id': cheerio$(this).attr('id')
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
            var sbgnbbox = new Object();

            sbgnbbox.x = cheerio$(ele).find('bbox').attr('x');
            sbgnbbox.y = cheerio$(ele).find('bbox').attr('y');
            sbgnbbox.w = cheerio$(ele).find('bbox').attr('w');
            sbgnbbox.h = cheerio$(ele).find('bbox').attr('h');

            //set positions as center
            sbgnbbox.x = parseFloat(sbgnbbox.x) + parseFloat(sbgnbbox.w) / 2;
            sbgnbbox.y = parseFloat(sbgnbbox.y) + parseFloat(sbgnbbox.h) / 2;

            return sbgnbbox;
        },
        stateAndInfoBboxProp: function (ele, parentBbox) {
            var xPos = parseFloat(parentBbox.x);
            var yPos = parseFloat(parentBbox.y);

            var sbgnbbox = new Object();

            sbgnbbox.x = cheerio$(ele).find('bbox').attr('x');
            sbgnbbox.y = cheerio$(ele).find('bbox').attr('y');
            sbgnbbox.w = cheerio$(ele).find('bbox').attr('w');
            sbgnbbox.h = cheerio$(ele).find('bbox').attr('h');

            //set positions as center
            sbgnbbox.x = parseFloat(sbgnbbox.x) + parseFloat(sbgnbbox.w) / 2 - xPos;
            sbgnbbox.y = parseFloat(sbgnbbox.y) + parseFloat(sbgnbbox.h) / 2 - yPos;

            sbgnbbox.x = sbgnbbox.x / parseFloat(parentBbox.w) * 100;
            sbgnbbox.y = sbgnbbox.y / parseFloat(parentBbox.h) * 100;

            return sbgnbbox;
        },
        stateAndInfoProp: function (ele, parentBbox) {
            var self = this;
            var stateAndInfoArray = new Array();

            cheerio$(ele).children('glyph').each(function () {
                var obj = new Object();
                if (cheerio$(this).attr('class') === 'unit of information') {
                    obj.id = cheerio$(this).attr('id');
                    obj.clazz = cheerio$(this).attr('class');
                    obj.label = {'text': cheerio$(this).find('label').attr('text')};
                    obj.bbox = self.stateAndInfoBboxProp(this, parentBbox);
                    stateAndInfoArray.push(obj);
                }
                else if (cheerio$(this).attr('class') === 'state variable') {
                    obj.id = cheerio$(this).attr('id');
                    obj.clazz = cheerio$(this).attr('class');
                    obj.state = {
                        'value': cheerio$(this).find('state').attr('value'),
                        'variable': cheerio$(this).find('state').attr('variable')
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
                if (typeof cheerio$(ele).attr('compartmentRef') === 'undefined') {
                    nodeObj.parent = "";

                    //add compartment according to geometry
                    for (var i = 0; i < compartments.length; i++) {
                        var bbox = {
                            'x': parseFloat(cheerio$(ele).children('bbox').attr('x')),
                            'y': parseFloat(cheerio$(ele).children('bbox').attr('y')),
                            'w': parseFloat(cheerio$(ele).children('bbox').attr('w')),
                            'h': parseFloat(cheerio$(ele).children('bbox').attr('h')),
                            'id': cheerio$(ele).attr('id')
                        }
                        if (self.isInBoundingBox(bbox, compartments[i])) {
                            nodeObj.parent = compartments[i].id;
                            break;
                        }
                    }
                }
                //there is compartment reference
                else {
                    nodeObj.parent = cheerio$(ele).attr('compartmentRef');
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



            //add id information
            if(cheerio$(ele).attr('id'))
                nodeObj.id = (cheerio$(ele).attr('id')).replaceAll('.', "_"); //funda: to prevent derby path confusion;
            else
                nodeObj.id = null;

            //add node bounding box information
            nodeObj.sbgnbbox = self.bboxProp(ele);
            //add class information
            nodeObj.sbgnclass = cheerio$(ele).attr('class');
            //add label information
            nodeObj.sbgnlabel = cheerio$(ele).children('label').attr('text');
            //add state and info box information
            nodeObj.sbgnstatesandinfos = self.stateAndInfoProp(ele, nodeObj.sbgnbbox);
            //adding parent information
            self.addParentInfoToNode(ele, nodeObj, parent, compartments);


            //add clone information
            if (cheerio$(ele).children('clone').length > 0)
                nodeObj.sbgnclonemarker = true;
            else
                nodeObj.sbgnclonemarker = undefined;

            //add port information
            var ports = [];
            cheerio$(ele).find('port').each(function () {
                var id = cheerio$(this).attr('id');
                var relativeXPos = parseFloat(cheerio$(this).attr('x')) - nodeObj.sbgnbbox.x;
                var relativeYPos = parseFloat(cheerio$(this).attr('y')) - nodeObj.sbgnbbox.y;

                ports.push({
                    id: cheerio$(this).attr('id'),
                    x: relativeXPos,
                    y: relativeYPos
                });
            });

            nodeObj.ports = ports;

            var cytoscapeJsNode = {data: nodeObj};
            jsonArray.push(cytoscapeJsNode);
        },
        traverseNodes: function (ele, jsonArray, parent, compartments) {
            if (!sbgnElementUtilities.handledElements[cheerio$(ele).attr('class')]) {
                return;
            }
            var self = this;


            //add complex nodes here
            if (cheerio$(ele).attr('class') === 'complex' || cheerio$(ele).attr('class') === 'submap') {
                self.addCytoscapeJsNode(ele, jsonArray, parent, compartments);

                cheerio$(ele).children('glyph').each(function () {
                    if (cheerio$(this).attr('class') != 'state variable' &&
                        cheerio$(this).attr('class') != 'unit of information') {
                        self.traverseNodes(this, jsonArray, cheerio$(ele).attr('id'), compartments);
                    }
                });
            }
            else {
                self.addCytoscapeJsNode(ele, jsonArray, parent, compartments);
            }
        },
        getArcSourceAndTarget: function (arc, xmlObject) {
            //source and target can be inside of a port
            var source = cheerio$(arc).attr('source');
            var target = cheerio$(arc).attr('target');
            var sourceNodeId, targetNodeId;

         //   cheerio$(xmlObject).find('glyph').each(function () {
            cheerio$('glyph').each(function () {
                if (cheerio$(this).attr('id') == source) {
                    sourceNodeId = source;
                }
                if (cheerio$(this).attr('id') == target) {
                    targetNodeId = target;
                }
            });

            if (typeof sourceNodeId === 'undefined') {
             //   cheerio$(xmlObject).find("port").each(function () {
                cheerio$("port").each(function () {
                    if (cheerio$(this).attr('id') == source) {
                        sourceNodeId = cheerio$(this).parent().attr('id');
                    }
                });
            }

            if (typeof targetNodeId === 'undefined') {
                //cheerio$(xmlObject).find("port").each(function () {
                cheerio$("port").each(function () {
                    if (cheerio$(this).attr('id') == target) {
                        targetNodeId = cheerio$(this).parent().attr('id');
                    }
                });
            }

            return {'source': sourceNodeId, 'target': targetNodeId};
        },
        getArcBendPointPositions: function (ele) {
            var bendPointPositions = [];

//    cheerio$(ele).children('start, next, end').each(function () {
            cheerio$(ele).children('next').each(function () {
                var posX = cheerio$(this).attr('x');
                var posY = cheerio$(this).attr('y');

                var pos = {
                    x: posX,
                    y: posY
                };

                bendPointPositions.push(pos);
            });

            return bendPointPositions;
        },
        addCytoscapeJsEdge: function (ele, jsonArray, xmlObject) {
            if (!sbgnElementUtilities.handledElements[cheerio$(ele).attr('class')]) {
                return;
            }

            var self = this;
            var edgeObj = new Object();

            var bendPointPositions = self.getArcBendPointPositions(ele);

            if(cheerio$(ele).attr('id'))
                edgeObj.id = (cheerio$(ele).attr('id')).replaceAll('.', "_"); //funda: to prevent derby path confusion
            else
                edgeObj.id = null;

        //funda2    edgeObj.id = cheerio$(ele).data('id');

            edgeObj.sbgnclass = cheerio$(ele).attr('class');
            edgeObj.bendPointPositions = bendPointPositions;

            if (cheerio$(ele).find('glyph').length <= 0) {
                edgeObj.sbgncardinality = 0;
            }
            else {
                cheerio$(ele).children('glyph').each(function () {
                    if (cheerio$(this).attr('class') == 'cardinality') {
                        edgeObj.sbgncardinality = cheerio$(this).find('label').attr('text');
                    }
                });
            }

            var sourceAndTarget = self.getArcSourceAndTarget(ele, xmlObject);

            edgeObj.source = sourceAndTarget.source;
            edgeObj.target = sourceAndTarget.target;

            edgeObj.portsource = cheerio$(ele).attr("source");
            edgeObj.porttarget = cheerio$(ele).attr("target");


            var cytoscapeJsEdge = {data: edgeObj};


            jsonArray.push(cytoscapeJsEdge);
        },
        convert: function (xmlObject) {
            var self = this;
            var cytoscapeJsNodes = [];
            var cytoscapeJsEdges = [];

            cheerio$ = cheerio.load(xmlObject, {
                xmlMode: true
            });


            var compartments = self.getAllCompartments(xmlObject);


           // cheerio$(xmlObject).find("map").children('glyph').each(function (i, elem) {
            cheerio$("map").children('glyph').each(function (i, elem) {

                self.traverseNodes(this, cytoscapeJsNodes, "", compartments);
            });

            //cheerio$(xmlObject).find("map").children('arc').each(function () {
            cheerio$("map").children('arc').each(function () {
                self.addCytoscapeJsEdge(this, cytoscapeJsEdges, xmlObject);
            });


            var cytoscapeJsGraph = new Object();
            cytoscapeJsGraph.nodes = cytoscapeJsNodes;
            cytoscapeJsGraph.edges = cytoscapeJsEdges;

            return cytoscapeJsGraph;
        }
    }
};
