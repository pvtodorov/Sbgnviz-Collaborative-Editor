/** The sbgnml-merger module merges two SBGN models into one. Such a process requires the consistency of the node ids. Its implementation is below.
**/

//Author: David Servillo

//Date of the last  change: 07/21/2016

module.exports = {

	//Merge two SBGN models.
	merge: function(json1, json2) {
		var jsonCopy1Str = JSON.stringify(json1);
		var i;
		for(i=0; i<json1.nodes.length; i++) {  //Redefines the identifiers of the first graph
			jsonCopy1Str = jsonCopy1Str.replace(new RegExp('"glyph'+(i+1)+'"', "g"), '');
			jsonCopy1Str = jsonCopy1Str.replace(new RegExp('"'+json1.nodes[i].data.id+'"', "g"), '"glyph'+(i+1)+'"');
			jsonCopy1Str = jsonCopy1Str.replace(new RegExp(':,"', "g"), ':"'+json1.nodes[i].data.id+'","');
			jsonCopy1Str = jsonCopy1Str.replace(new RegExp(':}', "g"), ':"'+json1.nodes[i].data.id+'"}');

			jsonCopy1Str = jsonCopy1Str.replace(new RegExp('"glyph'+(i+1)+'-', "g"), '"-');
			jsonCopy1Str = jsonCopy1Str.replace(new RegExp('"'+json1.nodes[i].data.id+'-', "g"), '"glyph'+(i+1)+'-');
			jsonCopy1Str = jsonCopy1Str.replace(new RegExp(':"-', "g"), ':"'+json1.nodes[i].data.id+'-');

			jsonCopy1Str = jsonCopy1Str.replace(new RegExp('-glyph'+(i+1)+'"', "g"), '-');
			jsonCopy1Str = jsonCopy1Str.replace(new RegExp('-'+json1.nodes[i].data.id+'"', "g"), '-glyph'+(i+1)+'"');
			jsonCopy1Str = jsonCopy1Str.replace(new RegExp('-,"', "g"), '-'+json1.nodes[i].data.id+'","');
		}

		var jsonCopy2Str = JSON.stringify(json2);
		for(i=json1.nodes.length; i<json1.nodes.length+json2.nodes.length; i++) {  //Redefines the identifiers of the second graph
			jsonCopy2Str = jsonCopy2Str.replace(new RegExp('"glyph'+(i+1)+'"', "g"), '');
			jsonCopy2Str = jsonCopy2Str.replace(new RegExp('"'+json2.nodes[i-json1.nodes.length].data.id+'"', "g"), '"glyph'+(i+1)+'"');
			jsonCopy2Str = jsonCopy2Str.replace(new RegExp(':,"', "g"), ':"'+json2.nodes[i-json1.nodes.length].data.id+'","');
			jsonCopy2Str = jsonCopy2Str.replace(new RegExp(':}', "g"), ':"'+json2.nodes[i-json1.nodes.length].data.id+'"}');

			jsonCopy2Str = jsonCopy2Str.replace(new RegExp('"glyph'+(i+1)+'-', "g"), '"-');
			jsonCopy2Str = jsonCopy2Str.replace(new RegExp('"'+json2.nodes[i-json1.nodes.length].data.id+'-', "g"), '"glyph'+(i+1)+'-');
			jsonCopy2Str = jsonCopy2Str.replace(new RegExp(':"-', "g"), ':"'+json2.nodes[i-json1.nodes.length].data.id+'-');

			jsonCopy2Str = jsonCopy2Str.replace(new RegExp('-glyph'+(i+1)+'"', "g"), '-');
			jsonCopy2Str = jsonCopy2Str.replace(new RegExp('-'+json2.nodes[i-json1.nodes.length].data.id+'"', "g"), '-glyph'+(i+1)+'"');
			jsonCopy2Str = jsonCopy2Str.replace(new RegExp('-,"', "g"), '-'+json2.nodes[i-json1.nodes.length].data.id+'","');
		}
		var maxGlyphId = i;

		json1 = JSON.parse(jsonCopy1Str);
		json2 = JSON.parse(jsonCopy2Str);

		var jsonCopy1 = JSON.parse(jsonCopy1Str);
		var jsonCopy2 = JSON.parse(jsonCopy2Str);

		if(jsonCopy1.nodes.length) {
			//Remove the coordinates and the ids in the json copy
			//This helps to compare two "data" attributes
			this.removeBbox(jsonCopy1, 0);
			this.removeNodeId(jsonCopy1, 0);
		}

		if(jsonCopy2.nodes.length) {
			//Remove the coordinates and the ids in the json copy
			//This helps to compare two "data" attributes
			this.removeBbox(jsonCopy2, 0);
			this.removeNodeId(jsonCopy2, 0);
		}

		jsonCopy1Str = "";
		jsonCopy2Str = "";

		//Re-order the characters from the string version of the "data" attribute in the first json object
		//This helps to compare two "data" attributes
		for(i=0; i<jsonCopy1.nodes.length; i++)
			jsonCopy1Str = jsonCopy1Str + "|" + JSON.stringify(jsonCopy1.nodes[i]).split("").sort().join("");

		//Re-order the characters from the string version of the "data" attribute in the second json object
		//This helps to compare two "data" attributes
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
		var index = -1;

		//Compare the glyphs (the "data" attribute) between the two json and equalize the identifiers
		//when the two nodes are the same
		for(i=0; i<smallsplit.length; i++) {
			index = bigsplit.indexOf(smallsplit[i]);
			if(smallsplit[i] != "" && index != -1) {
				smallstr = smallstr.replace(new RegExp('"'+smalljson.nodes[i].data.id+'"', "g"), '"'+bigjson.nodes[index].data.id+'"');
				smallstr = smallstr.replace(new RegExp("-"+smalljson.nodes[i].data.id+'"', "g"), '-'+bigjson.nodes[index].data.id+'"');
				smallstr = smallstr.replace(new RegExp('"'+smalljson.nodes[i].data.id+"-", "g"), '"'+bigjson.nodes[index].data.id+'-');
			}
		}
	
		var smallstr2 = smallstr;
		var smalljson = JSON.parse(smallstr);
		i = 0;
		//Set the identifiers to null when the glyph is a description glyph ("source and sink", "association, etc")
		//in the smallest json object
		while(i<smalljson.nodes.length) {
			if(smalljson.nodes[i].data.sbgnlabel === undefined || smalljson.nodes[i].data.sbgnlabel == "null") {
				smallstr2 = smallstr2.replace(new RegExp('"'+smalljson.nodes[i].data.id+'"', "g"), '"null"');
				smallstr2 = smallstr2.replace(new RegExp('"'+smalljson.nodes[i].data.id+'-', "g"), '"null-');
				smallstr2 = smallstr2.replace(new RegExp('-'+smalljson.nodes[i].data.id+'"', "g"), '-null"');
			}

			i = i+1;
		}

		var bigstr = JSON.stringify(bigjson);
		i = 0;
		//Set the identifiers to null when the glyph is a description glyph ("source and sink", "association, etc")
		//in the biggest json object
		while(i<bigjson.nodes.length) {
			if(bigjson.nodes[i].data.sbgnlabel === undefined || bigjson.nodes[i].data.sbgnlabel == "null") {
				bigstr = bigstr.replace(new RegExp('"'+bigjson.nodes[i].data.id+'"', "g"), '"null"');
				bigstr = bigstr.replace(new RegExp('"'+bigjson.nodes[i].data.id+'-', "g"), '"null-');
				bigstr = bigstr.replace(new RegExp('-'+bigjson.nodes[i].data.id+'"', "g"), '-null"');
			}

			i = i+1;
		}

		jsonCopy1 = JSON.parse(smallstr2);
		jsonCopy2 = JSON.parse(bigstr);

		if(jsonCopy1.nodes.length)
			//Remove the ids in the first json copy
			//This helps to compare two "data" attributes
			this.removeEdgeId(jsonCopy1, 0);

		if(jsonCopy2.nodes.length)
			//Remove the ids in the second json copy
			//This helps to compare two "data" attributes
			this.removeEdgeId(jsonCopy2, 0);

		jsonCopy1Str = "";
		for(i=0; i<jsonCopy1.edges.length; i++)
			//Re-order the characters from the string version of the "data" attribute in the first json object
			//This helps to compare two "data" attributes
			jsonCopy1Str = jsonCopy1Str + "|" + JSON.stringify(jsonCopy1.edges[i]).split("").sort().join("");

		jsonCopy1Str = jsonCopy1Str.replace("|", "");
		jsonCopy2Str = "";
		for(i=0; i<jsonCopy2.edges.length; i++)
			//Re-order the characters from the string version of the "data" attribute in the second json object
			//This helps to compare two "data" attributes
			jsonCopy2Str = jsonCopy2Str + "|" + JSON.stringify(jsonCopy2.edges[i]).split("").sort().join("");

		jsonCopy2Str = jsonCopy2Str.replace("|", "");
		smallsplit = jsonCopy1Str.split("|");
		bigsplit = jsonCopy2Str.split("|");
		var sharedEdges = 1;  //The two graphs share all the same edges
		i = 0;
		while(sharedEdges && i<smallsplit.length) {
			index = bigsplit.indexOf(smallsplit[i]);
			if(index == -1)
				sharedEdges = 0;  //The two graphs does not share all the same edges

			i = i+1;
		}

		//The two graphs does not share all the same edges
		//At least one edge in a graph is not present in the other
		if(!sharedEdges) {
			smalljson = JSON.parse(smallstr);
			for(i=maxGlyphId; i<maxGlyphId+smalljson.nodes.length;  i++) {
				if(smalljson.nodes[i-maxGlyphId].data.sbgnlabel === undefined || smalljson.nodes[i-maxGlyphId].data.sbgnlabel == "null") {  //It is a process description glyph
					//The process description glyphs can not be merged and their identifiers are reset
					smallstr = smallstr.replace(new RegExp('"'+smalljson.nodes[i-maxGlyphId].data.id+'"', "g"), '"glyph'+(i+1)+'"');
					smallstr = smallstr.replace(new RegExp("-"+smalljson.nodes[i-maxGlyphId].data.id+'"', "g"), '-glyph'+(i+1)+'"');
					smallstr = smallstr.replace(new RegExp('"'+smalljson.nodes[i-maxGlyphId].data.id+"-", "g"), '"glyph'+(i+1)+'-');
				}
			}
			smalljson = JSON.parse(smallstr);
			bigjson.nodes = bigjson.nodes.concat(smalljson.nodes);
			bigjson.edges = bigjson.edges.concat(smalljson.edges);
			var i = 0;
			var j;
			var allNodes = bigjson.nodes.length;
			while(i<allNodes) {
				j=i+1;
				while(j<allNodes) {
					if(bigjson.nodes[j].data.id == bigjson.nodes[i].data.id) {
						bigjson.nodes.splice(j, 1);	 //Elimination of the duplicate glyphs
						allNodes = bigjson.nodes.length;
						j=j-1;
					}
					j=j+1;
				}
				i=i+1;
			}
		}
	
		return bigjson;
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
