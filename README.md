SBGNViz Collaborative Editor User Guide
=======================================

The editor allows human curators and computer agents to work on the same
pathway model, and communicate through text and images. On the server
side, we have an application server that keeps the model, handles
communication across clients, and performs operational transformation.
Model visualization and editing are handled on the client side. The
editor visualizes information about cellular processes and pathways in
SBGN (Systems Biology Graphical Notation) format. It allows for
automatic graph layout, editing and highlighting facilities.

Installation
------------

Install node.js, mongodb and redis servers first.

Node:

\>curl -sL
[https://deb.nodesource.com/setup\_0.12](https://www.google.com/url?q=https://deb.nodesource.com/setup_0.12&sa=D&ust=1456966704465000&usg=AFQjCNGGRmt27os-aQCnnpnjDmM-dK8UTA) |
sudo -E bash -

\>sudo apt-get install -y nodejs

Redis:

\>sudo apt-get update

\>sudo apt-get install build-essential

\>sudo apt-get install tcl8.5

\>wget
[http://download.redis.io/releases/redis-stable.tar.gz](https://www.google.com/url?q=http://download.redis.io/releases/redis-stable.tar.gz&sa=D&ust=1456966704468000&usg=AFQjCNGwsqVTEvOoDXFJXUPfOp5HAjVP5w)

\>tar xzf redis-stable.tar.gz

\>cd redis-stable

\>make

Mongo:

\>sudo apt-key adv --keyserver
hkp://[keyserver.ubuntu.com:80](https://www.google.com/url?q=http://keyserver.ubuntu.com/&sa=D&ust=1456966704470000&usg=AFQjCNGvhIICtXNVxHKClfjeGof6XYMC4A) --recv
EA312927

\>echo "deb
[http://repo.mongodb.org/apt/ubuntu](https://www.google.com/url?q=http://repo.mongodb.org/apt/ubuntu&sa=D&ust=1456966704471000&usg=AFQjCNEKWJoH8yIBAFiMQ-MCWVrWwM09GA) trusty/mongodb-org/3.2
multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list

\>sudo apt-get update

\>sudo apt-get install -y mongodb-org

If mongo does not work:

\>sudo apt-get install upstart-sysv

Get project from github:

\>git clone
[https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git](https://www.google.com/url?q=https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git&sa=D&ust=1456966704473000&usg=AFQjCNEHA0UHM1vmyy5RgBaDtjAfIfIBDg)

\>cd Sbgnviz-Collaborative-Editor

\>sudo rm -rf node\_modules

\>npm install

Run server:

\>node server

In order to open a client:

Enter “http://localhost:3000” to the address bar of your browser.

System Framework
----------------

![](images/image01.png)

Framework Details
-----------------

![](images/image00.png) 

### Computer Agent API

Computer agents are connected to the node.js http server via websockets
(socket.io.js). An agent is initialized with a name (string)  and a
unique ID (string).

Constructor: Agent (string name, string id)

#### Public Attributes:

agentId: (string) A unique id

agentName: (string) Agent name

colorCode: A specific color to identify the agent operations. It should
be a string in hsla format as: “hsla(H, S, L%, 1)”, where H (integer), S
(float) and L (float) are hue, saturation and lightness values.

selectedNode: The node object on which the agent is performing
operations. It has attributes such as position ={x:\<posX\>,y:\<posY\>},
width, height, borderWidth, borderHeight, backgroundColor, sbgnLabel,
sbgnStatesAndInfos = {clazz:\<className\>, state =
{value:\<stateValue\>,variable:\<stateVariable\>}}.

 

selectedEdge: The edge object on which the agent is performing
operations. It has attributes such as cardinality, lineColor and width.

opHistory: History of operations as an array of strings in the format:
“UserName (date): Command”.

chatHistory: Chat history as an array of messages.

userList: List of connected user ids.

#### Private Attributes:

room: The document id that identifies the shared model. It is the string
after http:\<ip\>:3000/ in the server address.

socket: The web socket between the server and agent

pageDoc: The document that the shared model is stored.

#### Methods:

+--------------------+--------------------+--------------------+--------------------+
| Name               | Function           | Parameters         | Returns            |
+--------------------+--------------------+--------------------+--------------------+
| connectToServer    | Connects the       | url, callback      | socket             |
|                    | server and returns |                    |                    |
|                    | socket.io socket   |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| loadModel          | Gets the model for | callback           |                    |
|                    | the current room   |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| loadOperationHisto | Gets history of    | callback           |                    |
| ry                 | operations from    |                    |                    |
|                    | the node.js server |                    |                    |
|                    | and assigns them   |                    |                    |
|                    | to opHistory       |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| loadUserList       | Gets user list     | callback           |                    |
|                    | from the node.js   |                    |                    |
|                    | server and assigns |                    |                    |
|                    | them to userList   |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| loadChatHistory    | Gets history of    | callback           |                    |
|                    | chat messages from |                    |                    |
|                    | the node.js server |                    |                    |
|                    | and assigns them   |                    |                    |
|                    | to chatHistory     |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| getNodeList        |                    | callback           | The node list in   |
|                    |                    |                    | the shared model   |
|                    |                    |                    | as an object of    |
|                    |                    |                    | node ids           |
+--------------------+--------------------+--------------------+--------------------+
| getLayoutPropertie |                    | callback           | Layout properties  |
| s                  |                    |                    | of the shared      |
|                    |                    |                    | model as an object |
|                    |                    |                    | with attributes    |
|                    |                    |                    | as:                |
|                    |                    |                    |                    |
|                    |                    |                    | {name: \<layout    |
|                    |                    |                    | name\>,            |
|                    |                    |                    |                    |
|                    |                    |                    |  nodeRepulsion:    |
|                    |                    |                    | \<node repulsion   |
|                    |                    |                    | value\> ,          |
|                    |                    |                    |                    |
|                    |                    |                    |  nodeOverlap:\<nod |
|                    |                    |                    | e                  |
|                    |                    |                    | overlap            |
|                    |                    |                    | percentage\>,      |
|                    |                    |                    |                    |
|                    |                    |                    | idealEdgeLength:\< |
|                    |                    |                    | ideal              |
|                    |                    |                    | edge length        |
|                    |                    |                    | value\>,           |
|                    |                    |                    |                    |
|                    |                    |                    | edgeElasticity:\<e |
|                    |                    |                    | dge                |
|                    |                    |                    | elasticity         |
|                    |                    |                    | value\>,           |
|                    |                    |                    |                    |
|                    |                    |                    | nestingFactor:\<ne |
|                    |                    |                    | sting              |
|                    |                    |                    | factor value\>,    |
|                    |                    |                    |                    |
|                    |                    |                    | gravity:\<gravity  |
|                    |                    |                    | value\>,           |
|                    |                    |                    |                    |
|                    |                    |                    | numIter:\<number   |
|                    |                    |                    | of iterations\>,   |
|                    |                    |                    |                    |
|                    |                    |                    | tile:\<boolean     |
|                    |                    |                    | value to tile      |
|                    |                    |                    | disconnected\>,    |
|                    |                    |                    |                    |
|                    |                    |                    | animate:\<boolean  |
|                    |                    |                    | value\>,           |
|                    |                    |                    |                    |
|                    |                    |                    | randomize:\<boolea |
|                    |                    |                    | n                  |
|                    |                    |                    | value\>}           |
+--------------------+--------------------+--------------------+--------------------+
| changeName         | Sends request to   | newName            |                    |
|                    | the server to      |                    |                    |
|                    | change agent's     |                    |                    |
|                    | name               |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| getNodeRequest     | Requests the node  | id, callback       | Node with id       |
|                    | with \<id\> from   |                    |                    |
|                    | the server         |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| getEdgeRequest     | Requests the edge  | id, callback       | Edge with id       |
|                    | with \<id\> from   |                    |                    |
|                    | the server         |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| sendMessage        | Sends chat message | comment,           |                    |
|                    | \<comments\> as a  | targetArr,         |                    |
|                    | string to          | callback           |                    |
|                    | \<targetArr\> as   |                    |                    |
|                    | an array of        |                    |                    |
|                    | targeted user ids  |                    |                    |
|                    | [{id:              |                    |                    |
|                    | \<id1\>},..., {id: |                    |                    |
|                    | \<idn\>}]          |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| listen             | Socket listener    | callback           |                    |
|                    | for server         |                    |                    |
|                    | requests. Can get  |                    |                    |
|                    | “operation”,       |                    |                    |
|                    | “message”,         |                    |                    |
|                    | “userList” or      |                    |                    |
|                    | “imageFile” from   |                    |                    |
|                    | the server.        |                    |                    |
+--------------------+--------------------+--------------------+--------------------+
| sendRequest        | Sends an operation | [reqName,          |                    |
|                    | request to the     | param](#h.nhfdym5d |                    |
|                    | node.js server.    | 0wpf)              |                    |
|                    |  Model update      |                    |                    |
|                    | operations are     |                    |                    |
|                    | done using this    |                    |                    |
|                    | method.            |                    |                    |
+--------------------+--------------------+--------------------+--------------------+

##### sendRequest: {#h.nhfdym5d0wpf .c16 .c20}

+--------------------------------------+--------------------------------------+
| reqName                              | param                                |
+--------------------------------------+--------------------------------------+
| “agentAddImageRequest”               | {img: \<image file\>,                |
|                                      |                                      |
|                                      | filePath: \<path of image file\> }   |
+--------------------------------------+--------------------------------------+
| "agentSetLayoutProperties"           | {name: \<layout name\>,              |
|                                      |                                      |
|                                      |  nodeRepulsion: \<node repulsion     |
|                                      | value\> ,                            |
|                                      |                                      |
|                                      |  nodeOverlap:\<node overlap          |
|                                      | percentage\>,                        |
|                                      |                                      |
|                                      | idealEdgeLength:\<ideal edge length  |
|                                      | value\>,                             |
|                                      |                                      |
|                                      | edgeElasticity:\<edge elasticity     |
|                                      | value\>,                             |
|                                      |                                      |
|                                      | nestingFactor:\<nesting factor       |
|                                      | value\>,                             |
|                                      |                                      |
|                                      | gravity:\<gravity value\>,           |
|                                      |                                      |
|                                      | numIter:\<number of iterations\>,    |
|                                      |                                      |
|                                      | tile:\<boolean value to tile         |
|                                      | disconnected\>,                      |
|                                      |                                      |
|                                      | animate:\<boolean value\>,           |
|                                      |                                      |
|                                      | randomize:\<boolean value\>}         |
+--------------------------------------+--------------------------------------+
| “agentRunLayoutRequest”              | -                                    |
+--------------------------------------+--------------------------------------+
| “agentAddNodeRequest”                | {x: \<position x\>,                  |
|                                      |                                      |
|                                      | y: \<position y\>,                   |
|                                      |                                      |
|                                      | sbgnclass: \<sbgn class\>}           |
+--------------------------------------+--------------------------------------+
| “agentAddEdgeRequest”                | {source: \<source node id\>,         |
|                                      |                                      |
|                                      | target: \<target node id\>,          |
|                                      |                                      |
|                                      | sbgnclass: \<sbgn class\>}           |
+--------------------------------------+--------------------------------------+
| “agentChangeNodeAttributeRequest”    | {id: \<node id\>,                    |
|                                      |                                      |
|                                      | attStr: \<node attribute name in the |
|                                      | model\>                              |
|                                      |                                      |
|                                      | attVal:\<node attribute value\>}     |
|                                      |                                      |
|                                      | attStr takes the following values:   |
|                                      | “sbgnclass”, “highlightColor”,       |
|                                      | “backgroundColor”, “sbgnlabel”,      |
|                                      | “borderColor”, “borderWidth”,        |
|                                      | “isMultimer”, “isCloneMarker”,       |
|                                      | “parent”, “children”, “width”,       |
|                                      | “height”, “sbgnbboxW”, “sbgnbboxH”,  |
|                                      | “sbgnStatesAndInfos”                 |
+--------------------------------------+--------------------------------------+
| “agentChangeEdgeAttributeRequest”    | {id: \<node id\>,                    |
|                                      |                                      |
|                                      | attStr: \<edge attribute name in the |
|                                      | model\>                              |
|                                      |                                      |
|                                      | attVal:\<edge attribute value\>}     |
|                                      |                                      |
|                                      | attStr takes the following values:   |
|                                      | “lineColor”, “highlightColor”,       |
|                                      | “width”, “cardinality”               |
+--------------------------------------+--------------------------------------+
| “agentMoveNodeRequest”               | {id: \<node id\>,                    |
|                                      |                                      |
|                                      | pos: {x:\<new position x\>, y: \<    |
|                                      | new position y\>}}                   |
+--------------------------------------+--------------------------------------+
| “agentAddCompoundRequest”            | {type: \<compound type as “complex”  |
|                                      | or “compartment”\>,                  |
|                                      |                                      |
|                                      | selectedNodeArr: \<array of node     |
|                                      | ids\>}                               |
+--------------------------------------+--------------------------------------+

In order to set up and run an agent:

agent = new Agent(agentName, agentId);

var socket = agent.connectToServer(serverIp, function(){

//callback operations

});

socket.on('connect', function(){

   agent.loadModel(function() {

       agent.loadOperationHistory(function(){

           agent.loadChatHistory(function(){                  

//callback operations             

});

           });

       });

   agent.listen(function(){

       socket.on('operation', function(data){

          //callback operations

       });

       socket.on('message', function(data){

           //callback operations

       });

       socket.on('userList', function(data){

           //callback operations

       });

       socket.on('imageFile', function(data){

           //callback operations

       });

   });

});

