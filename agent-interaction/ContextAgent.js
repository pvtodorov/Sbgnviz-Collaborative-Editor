/**
 * Created by durupina on 5/13/16.
 */

ContextAgent.prototype =new Agent();

//ContextAgent.prototype.constructor = ContextAgent;

function ContextAgent(name, id){

    this.agentName = name;
    this.agentId = id;

}


ContextAgent.prototype.analyzeCommand = function(cmd){

        if(cmd.opName == "query"){


            var node = this.pageDoc.cy.nodes[cmd.elId];
            this.socket.emit("PCQuery", "source="+node.sbgnlabel + "&format=sbgn&kind=pathsbetween");


        }

}