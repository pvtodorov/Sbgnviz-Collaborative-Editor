<div class="WordSection1">

# <a name="_1wgjhs3i3ced"></a><span class="SpellE">SBGNViz</span> Collaborative Editor User Guide

The editor allows human curators and computer agents to work on the same pathway model, and communicate through text and images. On the server side, we have an application server that keeps the model, handles communication across clients, and performs operational transformation. Model visualization and editing are handled on the client side. The editor visualizes information about cellular processes and pathways in SBGN (Systems Biology Graphical Notation) format. It allows for automatic graph layout, editing and highlighting facilities.

## <a name="_2up5xl2gx913"></a>Installation

Install node.js, <span class="SpellE">mongodb</span> and <span class="SpellE">redis</span> servers first.

<span style="color:#222222;background:white;mso-highlight:
white">Node</span><span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">>curl -<span class="SpellE">sL</span></span> [<span style="font-size:9.5pt;
line-height:115%;color:#1155CC;background:white;mso-highlight:white">https://deb.nodesource.com/setup_0.12</span>](https://deb.nodesource.com/setup_0.12) <span style="font-size:9.5pt;line-height:115%;color:#222222;background:white;
mso-highlight:white">| <span class="SpellE">sudo</span> -E bash -</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">sudo</span> apt-get install -y <span class="SpellE">nodejs</span></span>

<span class="SpellE"><span style="color:#222222;background:
white;mso-highlight:white">Redis</span></span><span style="font-size:9.5pt;
line-height:115%;color:#222222;background:white;mso-highlight:white">:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">sudo</span> apt-get update</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">sudo</span> apt-get install build-essential</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">sudo</span> apt-get install tcl8.5</span>

<span class="SpellE"><span style="font-size:9.5pt;line-height:
115%;color:#222222;background:white;mso-highlight:white">wget</span></span> <span style="font-size:9.5pt;line-height:115%;color:#222222;background:white;
mso-highlight:white"></span> [<span style="font-size:9.5pt;line-height:115%;color:#1155CC;background:white;
mso-highlight:white">http://download.redis.io/releases/redis-stable.tar.gz</span>](http://download.redis.io/releases/redis-stable.tar.gz)

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">>tar <span class="SpellE">xzf</span> redis-stable.tar.gz</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">>cd <span class="SpellE">redis</span>-stable</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">>make</span>

<span style="color:#222222;background:white;mso-highlight:
white">Mongo</span><span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">sudo</span> apt-key <span class="SpellE">adv</span> --<span class="SpellE">keyserver</span> hkp://</span>[<span style="font-size:
9.5pt;line-height:115%;color:#1155CC;background:white;mso-highlight:white">keyserver.ubuntu.com:80</span>](http://keyserver.ubuntu.com/) <span style="font-size:9.5pt;line-height:115%;color:#222222;background:white;
mso-highlight:white">--<span class="SpellE">recv</span> EA312927</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">>echo "deb</span> [<span style="font-size:9.5pt;
line-height:115%;color:#1155CC;background:white;mso-highlight:white">http://repo.mongodb.org/apt/ubuntu</span>](http://repo.mongodb.org/apt/ubuntu) <span style="font-size:9.5pt;line-height:115%;color:#222222;background:white;
mso-highlight:white">trusty/<span class="SpellE">mongodb</span>-org/3.2 multiverse" | <span class="SpellE">sudo</span> tee /<span class="SpellE">etc</span>/apt/<span class="SpellE">sources.list.d</span>/mongodb-org-3.2.list</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">sudo</span> apt-get update</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">sudo</span> apt-get install -y <span class="SpellE">mongodb</span>-org</span>

<span style="color:#222222;background:white;mso-highlight:
white">If mongo does not work:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">sudo</span> apt-get install upstart-<span class="SpellE">sysv</span></span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">Get project from <span class="SpellE">github</span>:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">git</span> clone</span> [<span style="font-size:9.5pt;line-height:115%;color:#1155CC;background:white;
mso-highlight:white">https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git</span>](https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git)

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">>cd <span class="SpellE">Sbgnviz</span>-Collaborative-Editor</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">sudo</span> <span class="SpellE">rm</span> -<span class="SpellE">rf</span> <span class="SpellE">node_modules</span></span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">><span class="SpellE">npm</span> install</span>

<span style="color:#222222;background:white;mso-highlight:
white">Run server:</span>

<span style="font-size:9.5pt;line-height:115%;color:#222222;
background:white;mso-highlight:white">>node server</span>

In order to open a client:

Enter “http://localhost:3000” to the address bar of your browser.<a name="_lzkutpoc5320"></a>

### <a name="_ttz39lsxwuvx"></a>Computer Agent API

Computer agents are connected to the node.js http server via <span class="SpellE">websockets</span> (socket.io.js). An agent is initialized with a _name (<span class="GramE">string) <span style="font-style:normal"><span style="mso-spacerun:yes"> </span>and</span></span>_ a unique _ID (string)._

**Constructor**: Agent (string name, string id)

#### <a name="_1eu245k1egzd"></a>Public Attributes:

<span class="SpellE">**agentId**</span>: (string) A unique id

<span class="SpellE">**agentName**</span>: (string) Agent name

<span class="SpellE">**colorCode**</span>: A specific color to identify the agent operations. It should be a string in <span class="SpellE">hsla</span> format as: “<span class="SpellE"><span class="GramE">hsla</span></span><span class="GramE">(</span>_H_, _S_, _L_%, 1)”, where _H (integer)_, _S (float)_ and _L (float)_ are hue, saturation and lightness values.

<span class="SpellE">**selectedNode**</span>: The node object on which the agent is performing operations. It has attributes such as position ={x:<<span class="SpellE">posX</span><span class="GramE">>,y</span>:<<span class="SpellE">posY</span>>}, width, height, <span class="SpellE">borderWidth</span>, <span class="SpellE">borderHeight</span>, <span class="SpellE">backgroundColor</span>, <span class="SpellE">sbgnLabel</span>, <span class="SpellE">sbgnStatesAndInfos</span> = {<span class="SpellE">clazz</span>:<<span class="SpellE">className</span>>, state = {value:<<span class="SpellE">stateValue</span>>,variable:<<span class="SpellE">stateVariable</span>>}}.

<span style="mso-spacerun:yes"> </span>

<span class="SpellE">**selectedEdge**</span>: The edge object on which the agent is performing operations. It has attributes such as cardinality, <span class="SpellE">lineColor</span> and width.

<span class="SpellE">**opHistory**</span>: History of operations as an array of strings in the format: “<span class="SpellE">_UserName_</span> (_date_): _Command_”.

<span class="SpellE">**chatHistory**</span>: Chat history as an array of messages.

<span class="SpellE">**userList**</span>: List of connected user ids.

#### <a name="_nt4u4u3mhl90"></a>Private Attributes:

**room**: The document id that identifies the shared model. It is the string after http:<<span class="SpellE">ip</span>>:3000/ in the server address.

**socket**: The web socket between the server and agent

<span class="SpellE">**pageDoc**</span>: The document that the shared model is stored.

#### <a name="_l0c8z5l51rt3"></a>Methods:

<table class="a" border="1" cellspacing="0" cellpadding="0" width="468" style="border-collapse:
 collapse;mso-table-layout-alt:fixed;border:none;mso-border-alt:solid black 1.0pt;
 mso-yfti-tbllook:1536;mso-padding-alt:0in 5.4pt 0in 5.4pt;mso-border-insideh:
 1.0pt solid black;mso-border-insidev:1.0pt solid black">

<tbody>

<tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

**<span style="font-size:10.0pt">Name</span>**

</td>

<td width="117" valign="top" style="width:117.0pt;border:solid black 1.0pt;
  border-left:none;mso-border-left-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

**<span style="font-size:10.0pt">Function</span>**

</td>

<td width="115" valign="top" style="width:114.75pt;border:solid black 1.0pt;
  border-left:none;mso-border-left-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

**<span style="font-size:10.0pt">Parameters</span>**

</td>

<td width="126" valign="top" style="width:1.75in;border:solid black 1.0pt;
  border-left:none;mso-border-left-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

**<span style="font-size:10.0pt">Returns</span>**

</td>

</tr>

<tr style="mso-yfti-irow:1">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">connectToServer</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">Connects the server and returns socket.io socket</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt">url</span></span><span style="font-size:9.0pt">, callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">socket</span>

</td>

</tr>

<tr style="mso-yfti-irow:2">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">loadModel</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Gets the model for the current room</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

</tr>

<tr style="mso-yfti-irow:3">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">loadOperationHistory</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Gets history of operations from the node.js server and assigns them to <span class="SpellE">opHistory</span></span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">callback</span>

</td>

</tr>

<tr style="mso-yfti-irow:4">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">loadUserList</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Gets user list from the node.js server and assigns them to <span class="SpellE">userList</span></span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

</tr>

<tr style="mso-yfti-irow:5">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">loadChatHistory</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Gets history of chat messages from the node.js server and assigns them to <span class="SpellE">chatHistory</span></span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

</tr>

<tr style="mso-yfti-irow:6">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">getNodeList</span></span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">The node list in the shared model as an object of node ids</span>

</td>

</tr>

<tr style="mso-yfti-irow:7;height:139.0pt">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt;
  height:139.0pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">getLayoutProperties</span></span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:139.0pt">

<span style="font-size:9.0pt">callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:139.0pt">

<span style="font-size:9.0pt;line-height:115%">Layout properties of the shared model as an object with attributes as:</span>

<span style="font-size:10.0pt;line-height:115%">{</span><span style="font-size:9.0pt;line-height:115%">name: <layout name>,</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-spacerun:yes"> </span><span class="SpellE">nodeRepulsion</span>: <node repulsion value<span class="GramE">> ,</span></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-spacerun:yes"> </span><span class="SpellE">nodeOverlap</span>:<node overlap percentage>,</span>

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">idealEdgeLength</span></span><span style="font-size:9.0pt;
  line-height:115%">:<ideal edge length value>,</span>

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">edgeElasticity</span></span><span style="font-size:9.0pt;
  line-height:115%">:<edge elasticity value>,</span>

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">nestingFactor</span></span><span style="font-size:9.0pt;
  line-height:115%">:<nesting factor value>,</span>

<span style="font-size:9.0pt;line-height:115%">gravity:<gravity value>,</span>

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">numIter</span></span><span style="font-size:9.0pt;
  line-height:115%">:<number of iterations>,</span>

<span style="font-size:9.0pt;line-height:115%">tile:<<span class="SpellE">boolean</span> value to tile disconnected>,</span>

<span style="font-size:9.0pt;line-height:115%">animate:<<span class="SpellE">boolean</span> value>,</span>

<span style="font-size:9.0pt;line-height:115%">randomize:<<span class="SpellE">boolean</span> value>}</span>

</td>

</tr>

<tr style="mso-yfti-irow:8;height:44.0pt">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt;
  height:44.0pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">changeName</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:44.0pt">

<span style="font-size:9.0pt;line-height:115%">Sends request to the server to change agent's name</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:44.0pt">

<span class="SpellE"><span style="font-size:9.0pt">newName</span></span>

</td>

</tr>

<tr style="mso-yfti-irow:9">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">getNodeRequest</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Requests the node with <id> from the server</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">id, callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">Node with id</span>

</td>

</tr>

<tr style="mso-yfti-irow:10">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">getEdgeRequest</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Requests the edge with <id> from the server</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">id, callback</span>

</td>

<td width="126" valign="top" style="width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">Edge with id</span>

</td>

</tr>

<tr style="mso-yfti-irow:11">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">sendMessage</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Sends chat message <comments> as a string to <<span class="SpellE">targetArr</span>> as an array of targeted user ids [{id: <id1>},..., {id: <<span class="SpellE">idn</span>>}]</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">comment, <span class="SpellE">targetArr</span>, callback</span>

</td>

</tr>

<tr style="mso-yfti-irow:12">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">listen</span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt;line-height:115%">Socket listener for server requests. Can get “operation”, “message”, “<span class="SpellE">userList</span>” or “<span class="SpellE">imageFile</span>” from the server.</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt">

<span style="font-size:9.0pt">callback</span>

</td>

</tr>

<tr style="mso-yfti-irow:13;mso-yfti-lastrow:yes;height:62.0pt">

<td width="110" valign="top" style="width:110.25pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:4.3pt 4.3pt 4.3pt 4.3pt;
  height:62.0pt">

<span class="SpellE"><span style="font-size:9.0pt;
  line-height:115%">sendRequest</span></span>

</td>

<td width="117" valign="top" style="width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:62.0pt">

<span style="font-size:9.0pt;line-height:115%">Sends an operation request to the node.js server.<span style="mso-spacerun:yes"> </span> Model update operations are done using this method.</span>

</td>

<td width="115" valign="top" style="width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:62.0pt">

[<span class="SpellE"><span style="font-size:9.0pt;
  color:#1155CC">reqName</span></span><span style="font-size:9.0pt;color:#1155CC">, <span class="SpellE">param</span></span>](#_nhfdym5d0wpf)

</td>

</tr>

</tbody>

</table>

##### <a name="_nhfdym5d0wpf"></a><span class="SpellE">sendRequest</span>:

<table class="a0" border="1" cellspacing="0" cellpadding="0" width="461" style="margin-left:-.75pt;border-collapse:collapse;mso-table-layout-alt:fixed;
 border:none;mso-border-alt:solid black 1.0pt;mso-yfti-tbllook:1536;mso-padding-alt:
 0in 5.4pt 0in 5.4pt;mso-border-insideh:1.0pt solid black;mso-border-insidev:
 1.0pt solid black">

<tbody>

<tr style="mso-yfti-irow:0;mso-yfti-firstrow:yes">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span class="SpellE">**<span style="font-size:
  9.0pt">reqName</span>**</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border:solid black 1.0pt;
  border-left:none;mso-border-left-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span class="SpellE">**<span style="font-size:
  9.0pt">param</span>**</span>

</td>

</tr>

<tr style="mso-yfti-irow:1">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">“<span class="SpellE">agentAddImageRequest</span>”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{<span class="SpellE">img</span>: <image file>,</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">filePath</span></span><span style="font-size:10.0pt;
  line-height:115%">: <path of image file> }</span>

</td>

</tr>

<tr style="mso-yfti-irow:2">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">"<span class="SpellE">agentSetLayoutProperties</span>"</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{name: <layout name>,</span>

<span style="font-size:10.0pt;line-height:115%"><span style="mso-spacerun:yes"> </span><span class="SpellE">nodeRepulsion</span>: <node repulsion value<span class="GramE">> ,</span></span>

<span style="font-size:10.0pt;line-height:115%"><span style="mso-spacerun:yes"> </span><span class="SpellE">nodeOverlap</span>:<node overlap percentage>,</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">idealEdgeLength</span></span><span style="font-size:10.0pt;
  line-height:115%">:<ideal edge length value>,</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">edgeElasticity</span></span><span style="font-size:10.0pt;
  line-height:115%">:<edge elasticity value>,</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">nestingFactor</span></span><span style="font-size:10.0pt;
  line-height:115%">:<nesting factor value>,</span>

<span style="font-size:10.0pt;line-height:115%">gravity:<gravity value>,</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">numIter</span></span><span style="font-size:10.0pt;
  line-height:115%">:<number of iterations>,</span>

<span style="font-size:10.0pt;line-height:115%">tile:<<span class="SpellE">boolean</span> value to tile disconnected>,</span>

<span style="font-size:10.0pt;line-height:115%">animate:<<span class="SpellE">boolean</span> value>,</span>

<span style="font-size:10.0pt;line-height:115%">randomize:<<span class="SpellE">boolean</span> value>}</span>

</td>

</tr>

<tr style="mso-yfti-irow:3">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">“<span class="SpellE">agentRunLayoutRequest</span>”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">-</span>

</td>

</tr>

<tr style="mso-yfti-irow:4">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">“<span class="SpellE">agentAddNodeRequest</span>”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt">{x: <position x>,</span>

<span style="font-size:10.0pt">y: <position y>,</span>

<span class="SpellE"><span style="font-size:10.0pt">sbgnclass</span></span><span style="font-size:10.0pt">: <<span class="SpellE">sbgn</span> class>}</span>

</td>

</tr>

<tr style="mso-yfti-irow:5">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“<span class="SpellE">agentAddEdgeRequest</span>”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{source: <source node id>,</span>

<span style="font-size:10.0pt;line-height:115%">target: <target node id>,</span>

<span class="SpellE"><span style="font-size:10.0pt">sbgnclass</span></span><span style="font-size:10.0pt">: <<span class="SpellE">sbgn</span> class>}</span>

</td>

</tr>

<tr style="mso-yfti-irow:6">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“<span class="SpellE">agentChangeNodeAttributeRequest</span>”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{id: <node id>,</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">attStr</span></span><span style="font-size:10.0pt;
  line-height:115%">: <node attribute name in the model></span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">attVal</span></span><span style="font-size:10.0pt;
  line-height:115%">:<node attribute value>}</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">attStr</span></span> <span style="font-size:10.0pt;
  line-height:115%">takes the following values: “<span class="SpellE">sbgnclass</span>”, “<span class="SpellE">highlightColor</span>”, “<span class="SpellE">backgroundColor</span>”, “<span class="SpellE">sbgnlabel</span>”, “<span class="SpellE">borderColor</span>”, “<span class="SpellE">borderWidth</span>”, “<span class="SpellE">isMultimer</span>”, “<span class="SpellE">isCloneMarker</span>”, “parent”, “children”, “width”, “height”, “<span class="SpellE">sbgnbboxW</span>”, “<span class="SpellE">sbgnbboxH</span>”, “<span class="SpellE">sbgnStatesAndInfos</span>”</span>

</td>

</tr>

<tr style="mso-yfti-irow:7">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“<span class="SpellE">agentChangeEdgeAttributeRequest</span>”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{id: <node id>,</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">attStr</span></span><span style="font-size:10.0pt;
  line-height:115%">: <edge attribute name in the model></span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">attVal</span></span><span style="font-size:10.0pt;
  line-height:115%">:<edge attribute value>}</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">attStr</span></span> <span style="font-size:10.0pt;
  line-height:115%">takes the following values: “<span class="SpellE">lineColor</span>”, “<span class="SpellE">highlightColor</span>”, “width”, “cardinality”<span style="mso-spacerun:yes"> </span></span>

</td>

</tr>

<tr style="mso-yfti-irow:8">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“<span class="SpellE">agentMoveNodeRequest</span>”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{id: <node id>,</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">pos</span></span><span style="font-size:10.0pt;line-height:
  115%">: {x:<new position x>, y: < new position y>}}</span>

</td>

</tr>

<tr style="mso-yfti-irow:9">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“<span class="SpellE">agentAddCompoundRequest</span>”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{type: <compound type as “complex” or “compartment”>,</span>

<span class="SpellE"><span style="font-size:10.0pt;
  line-height:115%">selectedNodeArr</span></span><span style="font-size:10.0pt;
  line-height:115%">: <array of node ids>}</span>

</td>

</tr>

<tr style="mso-yfti-irow:10;mso-yfti-lastrow:yes">

<td width="177" valign="top" style="width:177.0pt;border:solid black 1.0pt;
  border-top:none;mso-border-top-alt:solid black 1.0pt;padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">“<span class="SpellE">agentMergeGraphRequest</span>”</span>

</td>

<td width="284" valign="top" style="width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  mso-border-top-alt:solid black 1.0pt;mso-border-left-alt:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt">

<span style="font-size:10.0pt;line-height:115%">{<span class="SpellE">param</span>: <graph to be added in <span class="SpellE">sbgn</span> format>}</span>

</td>

</tr>

</tbody>

</table>

In order to set up and run an agent:

**_<span style="font-size:9.0pt;line-height:115%;color:#660E7A;background:
white;mso-highlight:white">agent</span> _**<span style="font-size:9.0pt;
line-height:115%;background:white;mso-highlight:white">= **<span style="color:navy">new</span> **<span class="GramE">_Agent_(</span><span class="SpellE"><span style="color:#458383">agentName</span></span>, <span class="SpellE"><span style="color:#458383">agentId</span></span>);</span>

<span class="SpellE">**<span style="font-size:9.0pt;line-height:115%;color:navy;background:white;mso-highlight:
white">var</span>**</span>** <span style="font-size:9.0pt;line-height:115%;color:navy;background:white;mso-highlight:
white"></span> **<span style="font-size:9.0pt;line-height:115%;color:#458383;
background:white;mso-highlight:white">socket</span> <span style="font-size:
9.0pt;line-height:115%;background:white;mso-highlight:white">= <span class="SpellE"><span class="GramE">**_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">connectToServer</span></span></span>(<span class="SpellE"><span style="color:#458383">serverIp</span></span>, **<span style="color:navy">function</span>**(){</span>

_<span style="font-size:9.0pt;line-height:115%;color:gray;background:white;mso-highlight:
white">//callback operations</span>_

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white">});</span>

<span class="SpellE"><span class="GramE"><span style="font-size:
9.0pt;line-height:115%;color:#458383;background:white;mso-highlight:white">socket</span><span style="font-size:9.0pt;line-height:115%;background:white;mso-highlight:white">.<span style="color:#7A7A43">on</span></span></span></span><span style="font-size:
9.0pt;line-height:115%;background:white;mso-highlight:white">(**<span style="color:green">'connect'</span>**, **<span style="color:navy">function</span>**(){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">  </span> <span class="SpellE"><span class="GramE">**_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">loadModel</span></span></span>(**<span style="color:navy">function</span>**() {</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> <span class="SpellE"><span class="GramE">**_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">loadOperationHistory</span></span></span>(**<span style="color:navy">function</span>**(){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">          </span> <span class="SpellE"><span class="GramE">**_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">loadChatHistory</span></span></span>(**<span style="color:navy">function</span>**(){<span style="mso-spacerun:yes">                  </span></span>

_<span style="font-size:9.0pt;line-height:115%;color:gray;background:white;mso-highlight:
white">//callback operations</span>_<span style="font-size:9.0pt;line-height:
115%;background:white;mso-highlight:white"><span style="mso-spacerun:yes">             </span></span>

<span style="font-size:9.0pt;
line-height:115%;background:white;mso-highlight:white">});</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">          </span> });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">  </span> <span class="SpellE"><span class="GramE">**_<span style="color:#660E7A">agent</span>_**.<span style="color:#7A7A43">listen</span></span></span>(**<span style="color:navy">function</span>**(){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> <span class="SpellE"><span class="GramE"><span style="color:#458383">socket</span>.<span style="color:#7A7A43">on</span></span></span>(**<span style="color:green">'operation'</span>**, **<span style="color:navy">function</span>**(data){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">         </span> _<span style="color:gray">//callback operations</span>_</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> <span class="SpellE"><span class="GramE"><span style="color:#458383">socket</span>.<span style="color:#7A7A43">on</span></span></span>(**<span style="color:green">'message'</span>**, **<span style="color:navy">function</span>**(data){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">          </span> _<span style="color:gray">//callback operations</span>_</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> <span class="SpellE"><span class="GramE"><span style="color:#458383">socket</span>.<span style="color:#7A7A43">on</span></span></span>(**<span style="color:green">'<span class="SpellE">userList</span>'</span>**, **<span style="color:navy">function</span>**(data){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">          </span> _<span style="color:gray">//callback operations</span>_</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> <span class="SpellE"><span class="GramE"><span style="color:#458383">socket</span>.<span style="color:#7A7A43">on</span></span></span>(**<span style="color:green">'<span class="SpellE">imageFile</span>'</span>**, **<span style="color:navy">function</span>**(data){</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">          </span> _<span style="color:gray">//callback operations</span>_</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">      </span> });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white"><span style="mso-spacerun:yes">  </span> });</span>

<span style="font-size:9.0pt;line-height:115%;background:
white;mso-highlight:white">});</span>

An example web-based agent can be found in:

<span class="SpellE">Sbgnviz</span>-Collaborative-Editor/agent-interaction/computerAgent.html

Command History:

JSON array as:

[

<span style="mso-spacerun:yes">    </span> {

<span class="SpellE">userName</span>: //name of the user who gave the command

name: //name of the command

id: //id of the affected element

<span class="SpellE">param</span>: //operation parameters

<span style="mso-spacerun:yes"> </span><span style="mso-tab-count:1">          </span> [

<span style="mso-spacerun:yes"> </span><span style="mso-spacerun:yes"> </span> <span style="mso-tab-count:1">        </span> <span style="mso-spacerun:yes">   </span>{

<span style="mso-tab-count:2">                       </span> x: //node position x

<span style="mso-tab-count:2">                       </span> y: //node position y

<span style="mso-tab-count:2">                       </span> <span class="SpellE">sbgnclass</span>: //node <span class="SpellE">sbgnclass</span>

<span style="mso-tab-count:2">                       </span> source:<span style="mso-spacerun:yes"> </span> //edge source

<span style="mso-tab-count:2">                       </span> target:<span style="mso-spacerun:yes"> </span> //edge target

<span style="mso-tab-count:2">                       </span> <span class="SpellE">sbgnclass</span>: //edge <span class="SpellE">sbgnclass</span>

<span style="mso-spacerun:yes">  </span> <span style="mso-tab-count:1">        </span> <span style="mso-spacerun:yes">   </span>}

]

date: //date of the command

<span style="mso-spacerun:yes">  </span> }

]

## <a name="_3g1tmtehb2nc"></a>History Manager

Each command is stored in the model as a part of command history. Command structure is as follows:

<span class="SpellE">opName</span>: set | add | delete | <span class="SpellE">init</span>

<span class="SpellE">opTarget</span>: node | edge | node group | edge group

<span class="SpellE">opAttr</span>:<span style="mso-spacerun:yes"> </span> id| position | <span class="SpellE">sbgnclass</span> | <span class="SpellE">sbgnlabel</span> | width | height | <span class="SpellE">backgroundColor</span> <span class="GramE">|<span style="mso-spacerun:yes"> </span> <span class="SpellE">borderColor</span></span> | <span class="SpellE">borderWidth</span> | parent | <span class="SpellE">isCloneMarker</span> | <span class="SpellE">isMultimer</span> | <span class="SpellE">sbgnStatesAndInfos</span>| source| target |<span class="SpellE">lineColor</span> | <span class="SpellE">lineWidth</span>| <span class="SpellE">sbgncardinality</span>

<span class="SpellE">elId</span>: id of the node or edge | id array of the node or edge group

<span class="SpellE">elType</span>: “node” or “edge”

<span class="SpellE">param</span>:

<span class="SpellE">prevParam</span>:

### <a name="_cx5b1mdp3uj5"></a>JSON Model Structure

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">users</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">name</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">page</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">list</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">room</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">doc</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">userIds</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">history</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">undoIndex</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">Images</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">Context</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">name</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">relevance</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">confidence</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="GramE"><span style="font-size:9.0pt;line-height:115%">cy<span style="mso-spacerun:yes"> </span> /</span></span><span style="font-size:
9.0pt;line-height:115%">/<span class="SpellE">sbgn</span>-related</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">sampleInd</span></span> <span style="font-size:9.0pt;line-height:115%">//temporary</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">layoutProperties</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">nodes</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">[<span class="SpellE">nodeId</span>]</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">id</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">addedLater</span></span> <span style="font-size:9.0pt;line-height:115%">//to sync. node addition</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">sbgnclass</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">position</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">highlightColor</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">sbgnlabel</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">borderColor</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">borderWidth</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">backgroundColor</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">backgroundOpacity</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">isMultimer</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">isCloneMarker</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">ports</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">width</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">height</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">sbgnStatesAndInfos</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">expandCollapseStatus</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">highlightStatus</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">visibilityStatus</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">edges</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">[<span class="SpellE">edgeId</span>]</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">id</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">addedLater</span></span> <span style="font-size:9.0pt;line-height:115%">//to sync. edge addition</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">sbgnclass</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">source</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">target</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">portsource</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">porttarget</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">highlightColor</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">lineColor</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">width</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">bendPointPositions</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">highlightStatus</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">visibilityStatus</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">sbgnCardinality</span></span><span style="font-size:9.0pt;line-height:115%"></span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span class="SpellE"><span style="font-size:9.0pt;line-height:115%">py</span></span> <span style="font-size:9.0pt;line-height:115%">// <span class="SpellE">pysb</span>-related</span>

<span style="font-size:9.0pt;line-height:115%"><span style="mso-list:Ignore">_<span style="font:7.0pt &quot;Times New Roman&quot;">      </span> </span></span><span style="font-size:9.0pt;line-height:115%">//<span class="SpellE">biopax</span>-related</span>

## <a name="_obz6bh2z35gg"></a><a name="_6kwbiqf32gph"></a><a name="_w8hd3o33ow8k"></a>

</div>