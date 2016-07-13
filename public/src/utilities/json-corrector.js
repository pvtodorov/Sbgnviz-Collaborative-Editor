/** The sbgn-corrector module make the json model consistent by merging together glyphs which have the same labels, state variables and unit of information. Its implementation is below.
 **/

//Author: David Servillo.

//Date of creation: 07/06/2016

//Date of the last change: 07/07/2016

module.exports = {

    //Unit (meaning merge) glyphs which need to be united.
    unification: function(jsonObj) {
        var jsonCopy = JSON.parse(JSON.stringify(jsonObj));
        var i;

        this.removeBbox(jsonCopy, 0);  //Remove the position information in the json copy.

        this.removeId(jsonCopy, 0);  //Remove the ids in the json copy.

        for(i=0; i<jsonCopy.nodes.length; i++) {
            var match = 0;
            var j = 0;
            while(!match && j<i) {

                //The glyph has a label and a copy of it has been found
                if(JSON.stringify(jsonCopy.nodes[i].data) == JSON.stringify(jsonCopy.nodes[j].data) && (typeof jsonCopy.nodes[i].data.sbgnlabel != "undefined")) {
                    jsonString = JSON.stringify(jsonObj);
                    jsonString = jsonString.replace(new RegExp(jsonObj.nodes[i].data.id, "g"), jsonObj.nodes[j].data.id);  //Only the first id of the two is kept in the whole json.
                    jsonObj = JSON.parse(jsonString);
                    match = 1;
                }
                j = j+1;
            }
        }
        return jsonObj;
    },

    removeBbox: function(jsn, n) {
        delete jsn.nodes[n].data.sbgnbbox;

        var j;
        if('sbgnstatesandinfos' in jsn.nodes[n].data) {
            for(j=0; j < jsn.nodes[n].data.sbgnstatesandinfos.length; j++)
                delete jsn.nodes[n].data.sbgnstatesandinfos[j].bbox;
        }

        if(n+1 < jsn.nodes.length)
            this.removeBbox(jsn, n+1);
    },

    removeId: function(jsn, n) {
        delete jsn.nodes[n].data.id;

        var j;
        if('sbgnstatesandinfos' in jsn.nodes[n].data) {
            for(j=0; j < jsn.nodes[n].data.sbgnstatesandinfos.length; j++)
                delete jsn.nodes[n].data.sbgnstatesandinfos[j].id;
        }

        if(n+1 < jsn.nodes.length)
            this.removeId(jsn, n+1);
    }
}