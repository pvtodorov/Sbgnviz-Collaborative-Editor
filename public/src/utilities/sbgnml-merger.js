/** The sbgnml-merger module merges two SBGN models into one. Such a process requires the consistency of the node ids. Its implementation is below.
 **/

//Author: David Servillo

//Date of the last  change: 06/27/2016

module.exports = {

    //Merge two SBGN models.
    merge: function(sbgnml1, sbgnml2) {

        //Convert the SBGNs into xml objects.
        var oXML1;
        var oXML2;
        if(window.ActiveXObject) {
            oXML1 = new ActiveXObject("Microsoft.XMLDOM");
            oXML1.loadXML(sbgnml1);
        } else {
            oXML1 = (new DOMParser()).parseFromString(sbgnml1, "text/xml");
        }

        if(window.ActiveXObject) {
            oXML2 = new ActiveXObject("Microsoft.XMLDOM");
            oXML2.loadXML(sbgnml2);
        } else {
            oXML2 = (new DOMParser()).parseFromString(sbgnml2, "text/xml");
        }

        //The new id names have the form "glyphN" where N is an integer.
        //The N count starts from 1.
        //In the case where such an id name already exist in the SBGNs: get the biggest N found
        //and starts the count from N+1;
        var glyphIdPattern='/^glyph[0-9]+$/';
        var maxGlyphNb=0;
        var i;
        for(i=0; i<oXML1.getElementsByTagName("glyph").length; i++) {
            var glyphId=oXML1.getElementsByTagName("glyph")[i].getAttribute("id")
            if(/^(glyph[0-9]+)$/.test(glyphId) && parseInt(glyphId.substring(5))>maxGlyphNb)
                maxGlyphNb=parseInt(glyphId.substring(5));
        }

        for(i=0; i<oXML2.getElementsByTagName("glyph").length; i++) {
            var glyphId=oXML2.getElementsByTagName("glyph")[i].getAttribute("id")
            if(/^(glyph[0-9]+)$/.test(glyphId) && parseInt(glyphId.substring(5))>maxGlyphNb)
                maxGlyphNb=parseInt(glyphId.substring(5));
        }

        //Id names are replaced only in one of the two SBGNs.
        for(i=0; i<oXML2.getElementsByTagName("glyph").length; i++) {
            sbgnml2=sbgnml2.replace(new RegExp("'"+oXML2.getElementsByTagName("glyph")[i].getAttribute("id")+"'", "g"), "'glyph"+(maxGlyphNb+i+1)+"'");
            sbgnml2=sbgnml2.replace(new RegExp("-"+oXML2.getElementsByTagName("glyph")[i].getAttribute("id")+"'", "g"), "-glyph"+(maxGlyphNb+i+1)+"'");
            sbgnml2=sbgnml2.replace(new RegExp("'"+oXML2.getElementsByTagName("glyph")[i].getAttribute("id")+"-", "g"), "'glyph"+(maxGlyphNb+i+1)+"-");
        }

        //Do the merge.
        sbgnml1=sbgnml1+sbgnml2;
        return sbgnml1;
    }
};
