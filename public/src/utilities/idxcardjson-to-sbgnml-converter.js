/** The idxcardjson-to-sbgnml-converter module translates an indexcard JSON from the Reach API into an SBGN model. Its implementation is below.
 **/

// Author: David Servillo.

//Date of the last change: 06/28/2016

module.exports = {

    //Do the conversion into SBGN-ML.
    createSbgnml: function(idxcardjsonObj){
        var sbgnmlText = "";
        var i;

        for(i=0; i<idxcardjsonObj.cards.length; i++)
        {
            var modulation;
            var sourceType='source and sink';
            var label='';
            var acetylationSignal = '';
            var glycosylationSignal = '';
            var hydroxylationSignal = '';
            var methylationSignal = '';
            var myristoylationSignal = '';
            var palmytoylationSignal = '';
            var phosphorylationSignal = '';
            var prenylationSignal = '';
            var protonationSignal = '';
            var sulfationSignal = '';
            var ubiquitinationSignal = '';

            //add headers
            sbgnmlText = sbgnmlText + "<?sbgnmlText version='1.0' encoding='UTF-8' standalone='yes'?>\n";
            sbgnmlText = sbgnmlText + "<sbgn sbgnmlTextns='http://sbgn.org/libsbgn/0.2'>\n";
            sbgnmlText = sbgnmlText + "<map language='process description'>\n";

            //Define the nodes.
            sbgnmlText = sbgnmlText + "<glyph id='ele"+i+1+"' class='macromolecule' >\n";
            if('participant_a' in idxcardjsonObj.cards[i].extracted_information) {
                sbgnmlText = sbgnmlText + "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_a.entity_text + "' />\n";
            } else {
                sbgnmlText = sbgnmlText + "<label text='' />\n";
            }
            sbgnmlText = sbgnmlText + "<bbox y='455.91509946399447' x='525.7398209991329' w='120.0' h='60.0' />\n";
            sbgnmlText = sbgnmlText + "<glyph id='ele"+i+6+"' class='unit of information' >\n";
            sbgnmlText = sbgnmlText + "<label text='mt:prot' />\n";
            sbgnmlText = sbgnmlText + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
            sbgnmlText = sbgnmlText + "</glyph>\n";
            sbgnmlText = sbgnmlText + "</glyph>\n";
            sbgnmlText = sbgnmlText + "<glyph id='ele"+i+4+"' class='process' >\n";
            sbgnmlText = sbgnmlText + "<bbox y='611.6965979154193' x='680.0070014963533' w='20.0' h='20.0' />\n";
            sbgnmlText = sbgnmlText + "</glyph>\n";

            //Defines the interaction and modification types: currently.
            if(idxcardjsonObj.cards[i].extracted_information.interaction_type == "increases_activity")
                modulation="stimulation";
            if(idxcardjsonObj.cards[i].extracted_information.interaction_type == "decreases_activity")
                modulation="inhibition";
            if(idxcardjsonObj.cards[i].extracted_information.interaction_type == "adds_modification") {
                var j;
                for(j=0; j<idxcardjsonObj.cards[i].extracted_information.modifications.length; j++) {
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "acetylation") {
                        acetylationSignal = acetylationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        acetylationSignal = acetylationSignal + "<label text='mt:prot' />\n";
                        acetylationSignal = acetylationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        acetylationSignal = acetylationSignal + "</glyph>\n";
                        acetylationSignal = acetylationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        acetylationSignal = acetylationSignal + "<state value='Ac' />\n";
                        acetylationSignal = acetylationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        acetylationSignal = acetylationSignal + "</glyph>\n";
                        acetylationSignal = acetylationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "glycosylation") {
                        glycosylationSignal = glycosylationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        glycosylationSignal = glycosylationSignal + "<label text='mt:prot' />\n";
                        glycosylationSignal = glycosylationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        glycosylationSignal = glycosylationSignal + "</glyph>\n";
                        glycosylationSignal = glycosylationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        glycosylationSignal = glycosylationSignal + "<state value='G' />\n";
                        glycosylationSignal = glycosylationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        glycosylationSignal = glycosylationSignal + "</glyph>\n";
                        glycosylationSignal = glycosylationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "hydroxylation") {
                        hydroxylationSignal = hydroxylationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        hydroxylationSignal = hydroxylationSignal + "<label text='mt:prot' />\n";
                        hydroxylationSignal = hydroxylationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        hydroxylationSignal = hydroxylationSignal + "</glyph>\n";
                        hydroxylationSignal = hydroxylationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        hydroxylationSignal = hydroxylationSignal + "<state value='OH' />\n";
                        hydroxylationSignal = hydroxylationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        hydroxylationSignal = hydroxylationSignal + "</glyph>\n";
                        hydroxylationSignal = hydroxylationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "methylation") {
                        methylationSignal = methylationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        methylationSignal = methylationSignal + "<label text='mt:prot' />\n";
                        methylationSignal = methylationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        methylationSignal = methylationSignal + "</glyph>\n";
                        methylationSignal = methylationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        methylationSignal = methylationSignal + "<state value='Me' />\n";
                        methylationSignal = methylationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        methylationSignal = methylationSignal + "</glyph>\n";
                        methylationSignal = methylationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "myristoylation") {
                        myristoylationSignal = myristoylationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        myristoylationSignal = myristoylationSignal + "<label text='mt:prot' />\n";
                        myristoylationSignal = myristoylationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        myristoylationSignal = myristoylationSignal + "</glyph>\n";
                        myristoylationSignal = myristoylationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        myristoylationSignal = myristoylationSignal + "<state value='My' />\n";
                        myristoylationSignal = myristoylationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        myristoylationSignal = myristoylationSignal + "</glyph>\n";
                        myristoylationSignal = myristoylationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "palmytoylation") {
                        palmytoylationSignal = palmytoylationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        palmytoylationSignal = palmytoylationSignal + "<label text='mt:prot' />\n";
                        palmytoylationSignal = palmytoylationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        palmytoylationSignal = palmytoylationSignal + "</glyph>\n";
                        palmytoylationSignal = palmytoylationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        palmytoylationSignal = palmytoylationSignal + "<state value='Pa' />\n";
                        palmytoylationSignal = palmytoylationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        palmytoylationSignal = palmytoylationSignal + "</glyph>\n";
                        palmytoylationSignal = palmytoylationSignal + "</glyph>\n";
                        palmytolation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "phosphorylation") {
                        phosphorylationSignal = phosphorylationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        phosphorylationSignal = phosphorylationSignal + "<label text='mt:prot' />\n";
                        phosphorylationSignal = phosphorylationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        phosphorylationSignal = phosphorylationSignal + "</glyph>\n";
                        phosphorylationSignal = phosphorylationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        phosphorylationSignal = phosphorylationSignal + "<state value='P' />\n";
                        phosphorylationSignal = phosphorylationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        phosphorylationSignal = phosphorylationSignal + "</glyph>\n";
                        phosphorylationSignal = phosphorylationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "prenylation") {
                        prenylationSignal = prenylationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        prenylationSignal = prenylationSignal + "<label text='mt:prot' />\n";
                        prenylationSignal = prenylationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        prenylationSignal = prenylationSignal + "</glyph>\n";
                        prenylationSignal = prenylationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        prenylationSignal = prenylationSignal + "<state value='Pr' />\n";
                        prenylationSignal = prenylationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        prenylationSignal = prenylationSignal + "</glyph>\n";
                        prenylationSignal = prenylationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "protonation") {
                        protonationSignal = protonationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        protonationSignal = protonationSignal + "<label text='mt:prot' />\n";
                        protonationSignal = protonationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        protonationSignal = protonationSignal + "</glyph>\n";
                        protonationSignal = protonationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        protonationSignal = protonationSignal + "<state value='H' />\n";
                        protonationSignal = protonationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        protonationSignal = protonationSignal + "</glyph>\n";
                        protonationSignal = protonationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "sulfation") {
                        sulfationSignal = sulfationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        sulfationSignal = sulfationSignal + "<label text='mt:prot' />\n";
                        sulfationSignal = sulfationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        sulfationSignal = sulfationSignal + "</glyph>\n";
                        sulfationSignal = sulfationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        sulfationSignal = sulfationSignal + "<state value='S' />\n";
                        sulfationSignal = sulfationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        sulfationSignal = sulfationSignal + "</glyph>\n";
                        sulfationSignal = sulfationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                    if(idxcardjsonObj.cards[i].extracted_information.modifications[j].modification_type == "ubiquitination") {
                        ubiquitinationSignal = ubiquitinationSignal + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
                        ubiquitinationSignal = ubiquitinationSignal + "<label text='mt:prot' />\n";
                        ubiquitinationSignal = ubiquitinationSignal + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
                        ubiquitinationSignal = ubiquitinationSignal + "</glyph>\n";
                        ubiquitinationSignal = ubiquitinationSignal + "<glyph id='ele"+i+5+"' class='state variable'>\n";
                        ubiquitinationSignal = ubiquitinationSignal + "<state value='Ub' />\n";
                        ubiquitinationSignal = ubiquitinationSignal + "<bbox y='55.578839999219895' x='66.26903762083475' w='69.0' h='28.0' />\n";
                        ubiquitinationSignal = ubiquitinationSignal + "</glyph>\n";
                        ubiquitinationSignal = ubiquitinationSignal + "</glyph>\n";
                        modulation = 'stimulation';
                        sourceType = 'macromolecule';
                        label = "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
                    }
                }
            }

            sbgnmlText = sbgnmlText + "<glyph id='ele"+i+2+"' class='macromolecule' >\n";
            sbgnmlText = sbgnmlText + "<label text='" + idxcardjsonObj.cards[i].extracted_information.participant_b.entity_text + "' />\n";
            sbgnmlText = sbgnmlText + "<bbox y='352.15049199906457' x='571.1691314755299' w='120.0' h='60.0' />\n";
            sbgnmlText = sbgnmlText + acetylationSignal;
            sbgnmlText = sbgnmlText + glycosylationSignal;
            sbgnmlText = sbgnmlText + hydroxylationSignal;
            sbgnmlText = sbgnmlText + methylationSignal;
            sbgnmlText = sbgnmlText + myristoylationSignal;
            sbgnmlText = sbgnmlText + palmytoylationSignal;
            sbgnmlText = sbgnmlText + phosphorylationSignal;
            sbgnmlText = sbgnmlText + prenylationSignal;
            sbgnmlText = sbgnmlText + protonationSignal;
            sbgnmlText = sbgnmlText + sulfationSignal;
            sbgnmlText = sbgnmlText + ubiquitinationSignal;
            sbgnmlText = sbgnmlText + "</glyph>\n";
            sbgnmlText = sbgnmlText + "<glyph id='ele"+i+3+"' class='"+sourceType+"' >\n";
            sbgnmlText = sbgnmlText + label;
            sbgnmlText = sbgnmlText + "<bbox y='542.5263358202294' x='561.7873094608708' w='60.0' h='60.0' />\n";
            sbgnmlText = sbgnmlText + "<glyph id='ele"+i+7+"' class='unit of information' >\n";
            sbgnmlText = sbgnmlText + "<label text='mt:prot' />\n";
            sbgnmlText = sbgnmlText + "<bbox y='455.91509946399447' x='525.7398209991329' w='53.0' h='18.0' />\n";
            sbgnmlText = sbgnmlText + "</glyph>\n";
            sbgnmlText = sbgnmlText + "</glyph>\n";

            //Defines the edges.
            sbgnmlText = sbgnmlText + "<arc id='ele"+i+1+"-ele"+i+4+"' target='ele"+i+4+"' source='ele"+i+1+"' class='" + modulation + "' >\n";
            sbgnmlText = sbgnmlText + "<start y='455.91509946399447' x='525.7398209991329'/>\n";
            sbgnmlText = sbgnmlText + "<end y='611.6965979154193' x='680.0070014963533'/>\n";
            sbgnmlText = sbgnmlText + "</arc>\n";
            sbgnmlText = sbgnmlText + "<arc id='ele"+i+4+"-ele"+i+2+"' target='ele"+i+2+"' source='ele"+i+4+"' class='production'>\n";
            sbgnmlText = sbgnmlText + "<start y='611.6965979154193' x='680.0070014963533'/>\n";
            sbgnmlText = sbgnmlText + "<end y='352.15049199906457' x='571.1691314755299'/>\n";
            sbgnmlText = sbgnmlText + "</arc>\n";
            sbgnmlText = sbgnmlText + "<arc id='ele"+i+3+"-ele"+i+4+"' target='ele"+i+4+"' source='ele"+i+3+"' class='consumption'>\n";
            sbgnmlText = sbgnmlText + "<start y='542.5263358202294' x='561.7873094608708'/>\n";
            sbgnmlText = sbgnmlText + "<end y='611.6965979154193' x='680.0070014963533'/>\n";
            sbgnmlText = sbgnmlText + "</arc>\n";

            //add footers
            sbgnmlText = sbgnmlText + "</map>\n";
            sbgnmlText = sbgnmlText + "</sbgn>\n";
        }

        return sbgnmlText;
    }
};

