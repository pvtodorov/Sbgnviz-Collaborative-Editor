<div class="WordSection1">

# <a name="_1wgjhs3i3ced"></a>SBGNViz Collaborative Editor User Guide

The editor allows human curators and computer agents to work on the same pathway model, and communicate through text and images. On the server side, we have an application server that keeps the model, handles communication across clients, and performs operational transformation. Model visualization and editing are handled on the client side. The editor visualizes information about cellular processes and pathways in SBGN (Systems Biology Graphical Notation) format. It allows for automatic graph layout, editing and highlighting facilities.

## <a name="_2up5xl2gx913"></a>Installation

Install node.js, mongodb and redis servers first.

<span style="color:#222222;background:white">Node</span><span style="font-size:9.5pt;line-height:115%;color:#222222;background:white">:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>curl -sL</span> [<span style="font-size:9.5pt;
line-height:115%;color:#1155CC;background:white">https://deb.nodesource.com/setup_0.12</span>](https://deb.nodesource.com/setup_0.12) <span style="font-size:9.5pt;line-height:115%;color:#222222;background:white">| sudo -E bash -</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>sudo apt-get install -y nodejs</span>

<span style="color:#222222;background:white">Redis</span><span style="font-size:9.5pt;line-height:115%;color:#222222;background:white">:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>sudo apt-get update</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>sudo apt-get install build-essential</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>sudo apt-get install tcl8.5</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">wget</span> [<span style="font-size:9.5pt;line-height:115%;color:#1155CC;background:white">http://download.redis.io/releases/redis-stable.tar.gz</span>](http://download.redis.io/releases/redis-stable.tar.gz)

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>tar xzf redis-stable.tar.gz</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>cd redis-stable</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>make</span>

<span style="color:#222222;background:white">Mongo</span><span style="font-size:9.5pt;line-height:115%;color:#222222;background:white">:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>sudo apt-key adv --keyserver hkp://</span>[<span style="font-size:9.5pt;line-height:
115%;color:#1155CC;background:white">keyserver.ubuntu.com:80</span>](http://keyserver.ubuntu.com/) <span style="font-size:9.5pt;line-height:115%;color:#222222;background:white">--recv EA312927</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>echo "deb</span> [<span style="font-size:9.5pt;
line-height:115%;color:#1155CC;background:white">http://repo.mongodb.org/apt/ubuntu</span>](http://repo.mongodb.org/apt/ubuntu) <span style="font-size:9.5pt;line-height:115%;color:#222222;background:white">trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>sudo apt-get update</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>sudo apt-get install -y mongodb-org</span>

<span style="color:#222222;background:white">If mongo does not work:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>sudo apt-get install upstart-sysv</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">Get project from github:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>git clone</span> [<span style="font-size:9.5pt;line-height:115%;color:#1155CC;background:white">https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git</span>](https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git)

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>cd Sbgnviz-Collaborative-Editor</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>sudo rm -rf node_modules</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>npm install</span>

<span style="color:#222222;background:white">Run server:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white">>node server</span>

In order to open a client:

Enter “http://localhost:3000” to the address bar of your browser.<a name="_lzkutpoc5320"></a>

### <a name="_ttz39lsxwuvx"></a>Computer Agent API

Computer agents are connected to the node.js http server via websockets (socket.io.js). An agent is initialized with a _name (string)_  and a unique _ID (string)._

**Constructor**: Agent (string name, string id)

#### <a name="_1eu245k1egzd"></a>Public Attributes:

**agentId**: (string) A unique id

**agentName**: (string) Agent name

**colorCode**: A specific color to identify the agent operations. It should be a string in hsla format as: “hsla(_H_, _S_, _L_%, 1)”, where _H (integer)_, _S (float)_ and _L (float)_ are hue, saturation and lightness values.

**selectedNode**: The node object on which the agent is performing operations. It has attributes such as position ={x:<posX>,y:<posY>}, width, height, borderWidth, borderHeight, backgroundColor, sbgnLabel, sbgnStatesAndInfos = {clazz:<className>, state = {value:<stateValue>,variable:<stateVariable>}}.

**selectedEdge**: The edge object on which the agent is performing operations. It has attributes such as cardinality, lineColor and width.

**opHistory**: History of operations as an array of strings in the format: “_UserName_ (_date_): _Command_”.

**chatHistory**: Chat history as an array of messages.

**userList**: List of connected user ids.

#### <a name="_nt4u4u3mhl90"></a>Private Attributes:

**room**: The document id that identifies the shared model. It is the string after http:<ip>:3000/ in the server address.

**socket**: The web socket between the server and agent

**pageDoc**: The document that the shared model is stored.

#### <a name="_l0c8z5l51rt3"></a>Methods:

<table class="a" border="1" cellspacing="0" cellpadding="0" width="468" style="border-collapse:
 collapse;border:none">

<tbody>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

**<span style="font-size:10.0pt">Name</span>**

</td>

<td width="117" valign="top" style="width:117.0pt;border:solid black 1.0pt;
  border-left:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

**<span style="font-size:10.0pt">Function</span>**

</td>

<td width="115" valign="top" style="width:114.75pt;border:solid black 1.0pt;
  border-left:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

**<span style="font-size:10.0pt">Parameters</span>**

</td>

<td width="126" valign="top" style="width:1.75in;border:solid black 1.0pt;
  border-left:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

**<span style="font-size:10.0pt">Returns</span>**

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">connectToServer</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">Connects the server and returns socket.io socket</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">url, callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">socket</span>

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">loadModel</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Gets the model for the current room</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">loadOperationHistory</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Gets history of operations from the node.js server and assigns them to opHistory</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">callback</span>

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">loadUserList</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Gets user list from the node.js server and assigns them to userList</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">loadChatHistory</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Gets history of chat messages from the node.js server and assigns them to chatHistory</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">getNodeList</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">The node list in the shared model as an object of node ids</span>

</td>

</tr>

<tr style="height:139.0pt">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt;height:139.0pt">

<span style="font-size:9.0pt;line-height:115%">getLayoutProperties</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:139.0pt">

<span style="font-size:9.0pt">callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:139.0pt">

<span style="font-size:9.0pt;line-height:115%">Layout properties of the shared model as an object with attributes as:</span>

<span style="font-size:10.0pt;line-height:115%">{</span><span style="font-size:9.0pt;line-height:115%">name: <layout name>,</span>

<span style="font-size:9.0pt;line-height:115%"> nodeRepulsion: <node repulsion value> ,</span>

<span style="font-size:9.0pt;line-height:115%"> nodeOverlap:<node overlap percentage>,</span>

<span style="font-size:9.0pt;line-height:115%">idealEdgeLength:<ideal edge length value>,</span>

<span style="font-size:9.0pt;line-height:115%">edgeElasticity:<edge elasticity value>,</span>

<span style="font-size:9.0pt;line-height:115%">nestingFactor:<nesting factor value>,</span>

<span style="font-size:9.0pt;line-height:115%">gravity:<gravity value>,</span>

<span style="font-size:9.0pt;line-height:115%">numIter:<number of iterations>,</span>

<span style="font-size:9.0pt;line-height:115%">tile:<boolean value to tile disconnected>,</span>

<span style="font-size:9.0pt;line-height:115%">animate:<boolean value>,</span>

<span style="font-size:9.0pt;line-height:115%">randomize:<boolean value>}</span>

</td>

</tr>

<tr style="height:44.0pt">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt;height:44.0pt">

<span style="font-size:9.0pt;line-height:115%">changeName</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:44.0pt">

<span style="font-size:9.0pt;line-height:115%">Sends request to the server to change agent's name</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:44.0pt">

<span style="font-size:9.0pt">newName</span>

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">getNodeRequest</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Requests the node with <id> from the server</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">id, callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">Node with id</span>

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">getEdgeRequest</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Requests the edge with <id> from the server</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">id, callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">Edge with id</span>

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">sendMessage</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Sends chat message <comments> as a string to <targetArr> as an array of targeted user ids [{id: <id1>},..., {id: <idn>}]</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">comment, targetArr, callback</span>

</td>

</tr>

<tr>

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">listen</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Socket listener for server requests. Can get “operation”, “message”, “userList” or “imageFile” from the server.</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

</tr>

<tr style="height:62.0pt">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt;height:62.0pt">

<span style="font-size:9.0pt;line-height:115%">sendRequest</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:62.0pt">

<span style="font-size:9.0pt;line-height:115%">Sends an operation request to the node.js server.  Model update operations are done using this method.</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:62.0pt">

[<span style="font-size:9.0pt;color:#1155CC">reqName, param</span>](#_nhfdym5d0wpf)

</td>

</tr>

</tbody>

</table>

##### <a name="_nhfdym5d0wpf"></a>sendRequest:

<table class="a0" border="1" cellspacing="0" cellpadding="0" width="461" style="margin-left:-.75pt;border-collapse:collapse;border:none">

<tbody>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

**<span style="font-size:9.0pt">reqName</span>**

</td>

<td width="284" valign="top" style="width:284.25pt;border:solid black 1.0pt;
  border-left:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

**<span style="font-size:9.0pt">param</span>**

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">“agentAddImageRequest”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{img: <image file>,</span>

<span style="font-size:10.0pt;line-height:115%">filePath: <path of image file> }</span>

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">"agentSetLayoutProperties"</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{name: <layout name>,</span>

<span style="font-size:10.0pt;line-height:115%"> nodeRepulsion: <node repulsion value> ,</span>

<span style="font-size:10.0pt;line-height:115%"> nodeOverlap:<node overlap percentage>,</span>

<span style="font-size:10.0pt;line-height:115%">idealEdgeLength:<ideal edge length value>,</span>

<span style="font-size:10.0pt;line-height:115%">edgeElasticity:<edge elasticity value>,</span>

<span style="font-size:10.0pt;line-height:115%">nestingFactor:<nesting factor value>,</span>

<span style="font-size:10.0pt;line-height:115%">gravity:<gravity value>,</span>

<span style="font-size:10.0pt;line-height:115%">numIter:<number of iterations>,</span>

<span style="font-size:10.0pt;line-height:115%">tile:<boolean value to tile disconnected>,</span>

<span style="font-size:10.0pt;line-height:115%">animate:<boolean value>,</span>

<span style="font-size:10.0pt;line-height:115%">randomize:<boolean value>}</span>

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">“agentRunLayoutRequest”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">-</span>

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">“agentAddNodeRequest”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">{x: <position x>,</span>

<span style="font-size:10.0pt">y: <position y>,</span>

<span style="font-size:10.0pt">sbgnclass: <sbgn class>}</span>

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“agentAddEdgeRequest”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{source: <source node id>,</span>

<span style="font-size:10.0pt;line-height:115%">target: <target node id>,</span>

<span style="font-size:10.0pt">sbgnclass: <sbgn class>}</span>

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“agentChangeNodeAttributeRequest”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{id: <node id>,</span>

<span style="font-size:10.0pt;line-height:115%">attStr: <node attribute name in the model></span>

<span style="font-size:10.0pt;line-height:115%">attVal:<node attribute value>}</span>

<span style="font-size:10.0pt;line-height:115%">attStr takes the following values: “sbgnclass”, “highlightColor”, “backgroundColor”, “sbgnlabel”, “borderColor”, “borderWidth”, “isMultimer”, “isCloneMarker”, “parent”, “children”, “width”, “height”, “sbgnbboxW”, “sbgnbboxH”, “sbgnStatesAndInfos”</span>

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“agentChangeEdgeAttributeRequest”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{id: <node id>,</span>

<span style="font-size:10.0pt;line-height:115%">attStr: <edge attribute name in the model></span>

<span style="font-size:10.0pt;line-height:115%">attVal:<edge attribute value>}</span>

<span style="font-size:10.0pt;line-height:115%">attStr takes the following values: “lineColor”, “highlightColor”, “width”, “cardinality” </span>

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“agentMoveNodeRequest”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{id: <node id>,</span>

<span style="font-size:10.0pt;line-height:115%">pos: {x:<new position x>, y: < new position y>}}</span>

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“agentAddCompoundRequest”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{type: <compound type as “complex” or “compartment”>,</span>

<span style="font-size:10.0pt;line-height:115%">selectedNodeArr: <array of node ids>}</span>

</td>

</tr>

<tr>

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“agentMergeGraphRequest”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{param: <graph to be added in sbgn format>}</span>

</td>

</tr>

</tbody>

</table>

In order to set up and run an agent:

**_<span style="font-size:9.0pt;line-height:115%;
color:#660E7A;background:white">agent</span> _**<span style="font-size:
9.0pt;line-height:115%;background:white">= **<span style="color:navy">new</span> **_Agent_(<span style="color:#458383">agentName</span>, <span style="color:#458383">agentId</span>);</span>

**<span style="font-size:9.0pt;line-height:115%;color:navy;
background:white">var</span> **<span style="font-size:9.0pt;line-height:115%;
color:#458383;background:white">socket</span> <span style="font-size:9.0pt;
line-height:115%;background:white">= **_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">connectToServer</span>(<span style="color:#458383">serverIp</span>, **<span style="color:navy">function</span>**(){</span>

_<span style="font-size:9.0pt;
line-height:115%;color:gray;background:white">//callback operations</span>_

<span style="font-size:9.0pt;line-height:115%;background:
white">});</span>

<span style="font-size:9.0pt;line-height:115%;color:#458383;
background:white">socket</span><span style="font-size:9.0pt;line-height:115%;
background:white">.<span style="color:#7A7A43">on</span>(**<span style="color:green">'connect'</span>**, **<span style="color:navy">function</span>**(){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">   **_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">loadModel</span>(**<span style="color:navy">function</span>**() {</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       **_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">loadOperationHistory</span>(**<span style="color:navy">function</span>**(){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">           **_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">loadChatHistory</span>(**<span style="color:navy">function</span>**(){                  </span>

_<span style="font-size:9.0pt;
line-height:115%;color:gray;background:white">//callback operations</span>_<span style="font-size:9.0pt;line-height:115%;background:white">             </span>

<span style="font-size:9.0pt;
line-height:115%;background:white">});</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">           });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">   **_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">listen</span>(**<span style="color:navy">function</span>**(){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       <span style="color:#458383">socket</span>.<span style="color:#7A7A43">on</span>(**<span style="color:green">'operation'</span>**, **<span style="color:navy">function</span>**(data){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">          _<span style="color:gray">//callback operations</span>_</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       <span style="color:#458383">socket</span>.<span style="color:#7A7A43">on</span>(**<span style="color:green">'message'</span>**, **<span style="color:navy">function</span>**(data){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">           _<span style="color:gray">//callback operations</span>_</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       <span style="color:#458383">socket</span>.<span style="color:#7A7A43">on</span>(**<span style="color:green">'userList'</span>**, **<span style="color:navy">function</span>**(data){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">           _<span style="color:gray">//callback operations</span>_</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       <span style="color:#458383">socket</span>.<span style="color:#7A7A43">on</span>(**<span style="color:green">'imageFile'</span>**, **<span style="color:navy">function</span>**(data){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">           _<span style="color:gray">//callback operations</span>_</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">       });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">   });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white">});</span>

An example web-based agent can be found in:

Sbgnviz-Collaborative-Editor/agent-interaction/computerAgent.html

Command History:

JSON array as:

[

     {

userName: //name of the user who gave the command

name: //name of the command

id: //id of the affected element

param: //operation parameters

            [

               {

                        x: //node position x

                        y: //node position y

                        sbgnclass: //node sbgnclass

                        source:  //edge source

                        target:  //edge target

                        sbgnclass: //edge sbgnclass

               }

]

date: //date of the command

   }

]

## <a name="_3g1tmtehb2nc"></a>History Manager

Each command is stored in the model as a part of command history. Command structure is as follows:

opName: set | add | delete | init

opTarget: node | edge | node group | edge group

opAttr:  id| position | sbgnclass | sbgnlabel | width | height | backgroundColor |  borderColor | borderWidth | parent | isCloneMarker | isMultimer | sbgnStatesAndInfos| source| target |lineColor | lineWidth| sbgncardinality

elId: id of the node or edge | id array of the node or edge group

elType: “node” or “edge”

param:

prevParam:

### <a name="_cx5b1mdp3uj5"></a>JSON Model Structure

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">users</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">name</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">page</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">list</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">room</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">doc</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">userIds</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">history</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">undoIndex</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">Images</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">Context</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">name</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">relevance</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">confidence</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">cy  //sbgn-related</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">sampleInd //temporary</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">layoutProperties</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">nodes</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">[nodeId]</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">id</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">addedLater //to sync. node addition</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">sbgnclass</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">position</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">highlightColor</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">sbgnlabel</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">borderColor</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">borderWidth</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">backgroundColor</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">backgroundOpacity</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">isMultimer</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">isCloneMarker</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">ports</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">width</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">height</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">sbgnStatesAndInfos</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">expandCollapseStatus</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">highlightStatus</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">visibilityStatus</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">edges</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">[edgeId]</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">id</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">addedLater //to sync. edge addition</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">sbgnclass</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">source</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">target</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">portsource</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">porttarget</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">highlightColor</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">lineColor</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">width</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">bendPointPositions</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">highlightStatus</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">visibilityStatus</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">sbgnCardinality</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">py // pysb-related</span>

<span style="font-size:9.0pt;line-height:115%">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span><span style="font-size:9.0pt;line-height:115%">//biopax-related</span>

## <a name="_obz6bh2z35gg"></a><a name="_6kwbiqf32gph"></a><a name="_w8hd3o33ow8k"></a> 

</div>
