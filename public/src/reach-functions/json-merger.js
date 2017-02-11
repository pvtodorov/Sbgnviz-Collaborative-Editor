/** The json-merger module merges two SBGN models into one. Such a process requires the consistency of the node ids. Its implementation is below.
**/

//Author: David Servillo

//Date of the last  change: 07/08/2016

module.exports = {

    //Merge two SBGN models.
    merge: function(json1, json2) {
        var jsonCopy1 = JSON.parse(JSON.stringify(json1));
        var jsonCopy2 = JSON.parse(JSON.stringify(json2));

        this.removeBbox(jsonCopy1, 0);  //Remove the position information in the json copy.
        this.removeBbox(jsonCopy2, 0);  //Remove the position information in the json copy.

        this.removeNodeId(jsonCopy1, 0);  //Remove the ids in the json copy.
        this.removeNodeId(jsonCopy2, 0);  //Remove the ids in the json copy.

        var jsonCopy1Str = "";
        var jsonCopy2Str = "";
        var i;
        for(i=0; i<jsonCopy1.nodes.length; i++)
            jsonCopy1Str = jsonCopy1Str + "|" + JSON.stringify(jsonCopy1.nodes[i]).split("").sort().join("");

        jsonCopy1Str = jsonCopy1Str.replace("|", "");
        for(i=0; i<jsonCopy2.nodes.length; i++)
            jsonCopy2Str = jsonCopy2Str + "|" + JSON.stringify(jsonCopy2.nodes[i]).split("").sort().join("");

        jsonCopy2Str = jsonCopy2Str.replace("|", "");
        var smalljson = json1;
        var smallStr = jsonCopy1Str;
        var bigjson = json2;
        var bigStr = jsonCopy2Str;
        if(jsonCopy1.nodes.length > jsonCopy2.nodes.length) {
            smalljson = json2;
            smallStr = jsonCopy2Str;
            bigjson = json1;
            bigjStr = jsonCopy1Str;
        }

        var smallsplit = smallStr.split("|");
        var bigsplit = bigStr.split("|");
        var smallstr = JSON.stringify(smalljson);
        var identifiers = [];
        var index = null;
        for(i=0; i<smallsplit.length; i++) {
            index = bigsplit.indexOf(smallsplit[i]);
            if(index != -1) {
                smallstr = smallstr.replace(new RegExp('"'+smalljson.nodes[i].data.id+'"', "g"), '"'+bigjson.nodes[index].data.id+'"');
                smallstr = smallstr.replace(new RegExp("-"+smalljson.nodes[i].data.id+'"', "g"), '-'+bigjson.nodes[index].data.id+'"');
                smallstr = smallstr.replace(new RegExp('"'+smalljson.nodes[i].data.id+"-", "g"), '"'+bigjson.nodes[index].data.id+'-');
            }
        }

        var smallstr2 = smallstr;
        i = 0;
        while(i<smalljson.nodes.length) {
            if(smalljson.nodes[i].data.sbgnlabel === undefined || smalljson.nodes[i].data.sbgnlabel == "null")
                smallstr2 = smallstr2.replace(new RegExp('"'+smalljson.nodes[i].data.id+'"', "g"), "null");

            i = i+1;
        }

        var bigstr = JSON.stringify(bigjson);
        i = 0;
        while(i<bigjson.nodes.length) {
            if(bigjson.nodes[i].data.sbgnlabel === undefined || bigjson.nodes[i].data.sbgnlabel == "null")
                bigstr = bigstr.replace(new RegExp('"'+bigjson.nodes[i].data.id+'"', "g"), "null");

            i = i+1;
        }

        jsonCopy1 = JSON.parse(smallstr2);
        jsonCopy2 = JSON.parse(bigstr);
        this.removeEdgeId(jsonCopy1, 0);
        this.removeEdgeId(jsonCopy2, 0);
        jsonCopy1Str = "";
        jsonCopy2Str = "";
        for(i=0; i<jsonCopy1.edges.length; i++)
            jsonCopy1Str = jsonCopy1Str + "|" + JSON.stringify(jsonCopy1.edges[i]).split("").sort().join("");

        jsonCopy1Str = jsonCopy1Str.replace("|", "");
        for(i=0; i<jsonCopy2.edges.length; i++)
            jsonCopy2Str = jsonCopy2Str + "|" + JSON.stringify(jsonCopy2.edges[i]).split("").sort().join("");

        jsonCopy2Str = jsonCopy2Str.replace("|", "");
        smallsplit = jsonCopy1Str.split("|");
        bigsplit = jsonCopy2Str.split("|");
        var sharedEdges = 1;
        i = 0;
        while(sharedEdges && i<smallsplit.length) {
            index = bigsplit.indexOf(smallsplit[i]);
            if(index == -1)
                sharedEdges = 0;

            i = i+1;
        }

        smalljson = JSON.parse(smallstr);

        if(sharedEdges) {
            i = 0;
            while(i<smalljson.nodes.length) {
                if(smalljson.nodes[i].data.sbgnlabel === undefined || smalljson.nodes[i].data.sbgnlabel == "null")
                    delete smalljson.nodes[i];
                i = i-1;
            }

            i = i+1;
        }

        else
            bigjson.edges = bigjson.edges.concat(smalljson.edges);

        bigjson.nodes = bigjson.nodes.concat(smalljson.nodes);

        return bigjson;
    },

    removeBbox: function(jsn, n) {

        delete jsn.nodes[n].data.bbox;

        var j;
        if('sbgnstatesandinfos' in jsn.nodes[n].data) {
            for(j=0; j < jsn.nodes[n].data.sbgnstatesandinfos.length; j++)
                delete jsn.nodes[n].data.sbgnstatesandinfos[j].bbox;
        }

        if(n+1 < jsn.nodes.length)
            this.removeBbox(jsn, n+1);
    },

    removeNodeId: function(jsn, n) {
        delete jsn.nodes[n].data.id;

        var j;
        if('sbgnstatesandinfos' in jsn.nodes[n].data) {
            for(j=0; j < jsn.nodes[n].data.sbgnstatesandinfos.length; j++)
                delete jsn.nodes[n].data.sbgnstatesandinfos[j].id;
        }

        if(n+1 < jsn.nodes.length)
            this.removeNodeId(jsn, n+1);
    },

    removeEdgeId: function(jsn, n) {
        delete jsn.edges[n].data.id;

        if(n+1 < jsn.edges.length)
            this.removeEdgeId(jsn, n+1);
    }
};