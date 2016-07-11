/** The sbgnml-merger module merges two SBGN models into one. Such a process requires the consistency of the node ids. Its implementation is below.
**/

//Author: David Servillo

//Date of the last  change: 07/08/2016

module.exports = {

	//Merge two SBGN models.
	merge: function(json1, json2) {

		//The new id names have the form "glyphN" where N is an integer.
		//The N count starts from 1.
		//In the case where such an id name already exist in the SBGNs: get the biggest N found
		//and starts the count from N+1;
		var maxGlyphNb=0;
		var i;
		for(i=0; i<json1.nodes.length; i++) {
			var glyphId=json1.nodes[i].data.id
			if(/^(glyph[0-9]+)$/.test(glyphId) && parseInt(glyphId.substring(5))>maxGlyphNb)
				maxGlyphNb=parseInt(glyphId.substring(5));
		}

		for(i=0; i<json2.nodes.length; i++) {
			var glyphId=json2.nodes[i].data.id
			if(/^(glyph[0-9]+)$/.test(glyphId) && parseInt(glyphId.substring(5))>maxGlyphNb)
				maxGlyphNb=parseInt(glyphId.substring(5));
		}

		var json2Str = JSON.stringify(json2);
		//Id names are replaced only in one of the two SBGNs.
		for(i=0; i<json2.nodes.length; i++) {
			json2Str=json2Str.replace(new RegExp("'"+json2.nodes[i].data.id+"'", "g"), "'glyph"+(maxGlyphNb+i+1)+"'");
			json2Str=json2Str.replace(new RegExp("-"+json2.nodes[i].data.id+"'", "g"), "-glyph"+(maxGlyphNb+i+1)+"'");
			json2Str=json2Str.replace(new RegExp("'"+json2.nodes[i].data.id+"-", "g"), "'glyph"+(maxGlyphNb+i+1)+"-");
		}

		json2 = JSON.parse(json2Str);
		//Do the merge.
		json1.nodes = json1.nodes.concat(json2.nodes);
		json1.edges = json1.edges.concat(json2.edges);
		
		return json1;
	}
};
