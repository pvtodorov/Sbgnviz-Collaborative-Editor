<div>

<span></span>

<span></span>

<span></span>

## <span></span>

</div>

# <span>SBGNViz Collaborative Editor User Guide</span>

<span>The editor allows human curators and computer agents to work on the same pathway model, and communicate through text and images. On the server side, we have an application server that keeps the model, handles communication across clients, and performs operational transformation. Model visualization and editing are handled on the client side. The editor visualizes information about cellular processes and pathways in SBGN (Systems Biology Graphical Notation) format. It allows for automatic graph layout, editing and highlighting facilities.</span>

<span></span>

## <span>Installation</span>

<span>Install node.js, mongodb and redis servers first.</span>

<span></span>

<span class="c14">Node</span><span class="c6">:</span>

<span class="c6"></span>

<span class="c6">>curl -sL</span> <span class="c39">[https://deb.nodesource.com/setup_0.12](https://www.google.com/url?q=https://deb.nodesource.com/setup_0.12&sa=D&ust=1473277272610000&usg=AFQjCNHvK51-MOEyt5XJM5ju9Xm8q9_1iA)</span><span class="c6"> | sudo -E bash -</span>

<span class="c6">>sudo apt-get install -y nodejs</span>

<span class="c6"></span>

<span class="c14">Redis</span><span class="c6">:</span>

<span class="c6"></span>

<span class="c6">>sudo apt-get update</span>

<span class="c6">>sudo apt-get install build-essential</span>

<span class="c6">>sudo apt-get install tcl8.5</span>

<span class="c6">wget</span> <span class="c39">[http://download.redis.io/releases/redis-stable.tar.gz](https://www.google.com/url?q=http://download.redis.io/releases/redis-stable.tar.gz&sa=D&ust=1473277272614000&usg=AFQjCNHuP87lkYspiCPdB4JXOsdpmw_AVw)</span>

<span class="c6">>tar xzf redis-stable.tar.gz</span>

<span class="c6">>cd redis-stable</span>

<span class="c6">>make</span>

<span class="c6"></span>

<span class="c14">Mongo</span><span class="c6">:</span>

<span class="c6"></span>

<span class="c6">>sudo apt-key adv --keyserver hkp://</span><span class="c39">[keyserver.ubuntu.com:80](https://www.google.com/url?q=http://keyserver.ubuntu.com/&sa=D&ust=1473277272617000&usg=AFQjCNG3IFqlx2U7rG-24mbGlfK_UGeYgg)</span><span class="c6"> --recv EA312927</span>

<span class="c6">>echo "deb</span> <span class="c39">[http://repo.mongodb.org/apt/ubuntu](https://www.google.com/url?q=http://repo.mongodb.org/apt/ubuntu&sa=D&ust=1473277272618000&usg=AFQjCNFgAwwqIdTGH6HUbgTZzuBYRFzS3A)</span><span class="c6"> trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list</span>

<span class="c6">>sudo apt-get update</span>

<span class="c6">>sudo apt-get install -y mongodb-org</span>

<span class="c14"></span>

<span class="c14">If mongo does not work:</span>

<span class="c6"></span>

<span class="c6">>sudo apt-get install upstart-sysv</span>

<span class="c6"></span>

<span class="c6"></span>

<span class="c6">Get project from github:</span>

<span class="c6"></span>

<span class="c6">>git clone</span> <span class="c39">[https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git](https://www.google.com/url?q=https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git&sa=D&ust=1473277272622000&usg=AFQjCNGnICkgfq6MDFNKA6YIsB_cSDmTKw)</span>

<span class="c6">>cd Sbgnviz-Collaborative-Editor</span>

<span class="c6">>sudo rm -rf node_modules</span>

<span class="c6">>npm install</span>

<span class="c6"></span>

<span class="c6"></span>

<span class="c14">Run server:</span>

<span class="c6"></span>

<span class="c6">>node server</span>

<span></span>

<span>In order to open a client:</span>

<span>Enter “http://localhost:3000” to the address bar of your browser.</span>

## <span>System Framework</span>

<span></span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 455.50px; height: 359.87px;">![](images/image00.png)</span>

<span></span>

<span></span>

<span></span>

<span></span>

<span></span>

<span></span>

<span></span>

<span></span>

## <span>Framework Details</span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 624.00px; height: 379.10px;">![](images/image02.png)</span><span> </span>

<span></span>

<span></span>

<span></span>

<span></span>

### <span>Computer Agent API</span>

<span></span>

<span>Computer agents are connected to the node.js http server via websockets (socket.io.js). An agent is initialized with a</span> <span class="c29">name (string)</span> <span> and a unique</span> <span class="c29">ID (string).</span>

<span></span>

<span class="c26">Constructor</span><span>: Agent (string name, string id)</span>

<span></span>

#### <span>Public Attributes:</span>

<span></span>

<span class="c26">agentId</span><span>: (string) A unique id</span>

<span></span>

<span class="c26">agentName</span><span>: (string) Agent name</span>

<span></span>

<span class="c26">colorCode</span><span>: A specific color to identify the agent operations. It should be a string in hsla format as: “hsla(</span><span class="c29">H</span><span>,</span> <span class="c29">S</span><span>,</span> <span class="c29">L</span><span>%, 1)”, where</span> <span class="c29">H (integer)</span><span>,</span> <span class="c29">S (float)</span><span> and</span> <span class="c29">L (float)</span><span> are hue, saturation and lightness values.</span>

<span></span>

<span class="c26">selectedNode</span><span>: The node object on which the agent is performing operations. It has attributes such as position ={x:<posX>,y:<posY>}, width, height, borderWidth, borderHeight, backgroundColor, sbgnLabel, sbgnStatesAndInfos = {clazz:<className>, state = {value:<stateValue>,variable:<stateVariable>}}.</span>

<span> </span>

<span class="c26">selectedEdge</span><span>: The edge object on which the agent is performing operations. It has attributes such as cardinality, lineColor and width.</span>

<span></span>

<span class="c26">opHistory</span><span>: History of operations as an array of strings in the format: “</span><span class="c29">UserName</span><span> (</span><span class="c29">date</span><span>):</span><span class="c29"> Command</span><span>”.</span>

<span class="c26">chatHistory</span><span>: Chat history as an array of messages.</span>

<span class="c26"></span>

<span class="c26">userList</span><span>: List of connected user ids.</span>

<span></span>

#### <span>Private Attributes:</span>

<span class="c26">room</span><span>: The document id that identifies the shared model. It is the string after http:<ip>:3000/ in the server address.</span>

<span class="c26">socket</span><span>: The web socket between the server and agent</span>

<span class="c26">pageDoc</span><span>: The document that the shared model is stored.</span>

<span></span>

#### <span>Methods:</span>

<span></span>

<a id="t.a479165b3048e3a8701c4538bb9274ab90443c88"></a><a id="t.0"></a>

<table class="c49">

<tbody>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c20">Name</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c20">Function</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c20">Parameters</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c20">Returns</span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">connectToServer</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Connects the server and returns socket.io socket</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">url, callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5">socket</span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">loadModel</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Gets the model for the current room</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">loadOperationHistory</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Gets history of operations from the node.js server and assigns them to opHistory</span>

<span class="c7 c5"></span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">loadUserList</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Gets user list from the node.js server and assigns them to userList</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">loadChatHistory</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Gets history of chat messages from the node.js server and assigns them to chatHistory</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">getNodeList</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5">The node list in the shared model as an object of node ids</span>

</td>

</tr>

<tr class="c42">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">getLayoutProperties</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5">Layout properties of the shared model as an object with attributes as:</span>

<span class="c45">{</span><span class="c7 c5">name: <layout name>,</span>

<span class="c7 c5"> nodeRepulsion: <node repulsion value> ,</span>

<span class="c7 c5"> nodeOverlap:<node overlap percentage>,</span>

<span class="c7 c5">idealEdgeLength:<ideal edge length value>,</span>

<span class="c7 c5">edgeElasticity:<edge elasticity value>,</span>

<span class="c7 c5">nestingFactor:<nesting factor value>,</span>

<span class="c7 c5">gravity:<gravity value>,</span>

<span class="c7 c5">numIter:<number of iterations>,</span>

<span class="c7 c5">tile:<boolean value to tile disconnected>,</span>

<span class="c7 c5">animate:<boolean value>,</span>

<span class="c7 c5">randomize:<boolean value>}</span>

<span class="c7 c5"></span>

</td>

</tr>

<tr class="c32">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">changeName</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Sends request to the server to change agent's name</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">newName</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">getNodeRequest</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Requests the node with <id> from the server</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">id, callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5">Node with id</span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">getEdgeRequest</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Requests the edge with <id> from the server</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">id, callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5">Edge with id</span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">sendMessage</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Sends chat message <comments> as a string to <targetArr> as an array of targeted user ids [{id: <id1>},..., {id: <idn>}]</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c7 c5">comment, targetArr, callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

</tr>

<tr class="c3">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">listen</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Socket listener for server requests. Can get “operation”, “message”, “userList” or “imageFile” from the server.</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c5 c7">callback</span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

</tr>

<tr class="c41">

<td class="c13" colspan="1" rowspan="1">

<span class="c7 c5">sendRequest</span>

</td>

<td class="c8" colspan="1" rowspan="1">

<span class="c7 c5">Sends an operation request to the node.js server.  Model update operations are done using this method.</span>

</td>

<td class="c22" colspan="1" rowspan="1">

<span class="c5 c50">[reqName, param](#h.nhfdym5d0wpf)</span>

<span class="c7 c5"></span>

</td>

<td class="c38" colspan="1" rowspan="1">

<span class="c7 c5"></span>

</td>

</tr>

</tbody>

</table>

<span></span>

<span></span>

##### <span>sendRequest:</span>

<span></span>

<a id="t.c74557f80130c58c27f4c34ed1492ff11475d857"></a><a id="t.1"></a>

<table class="c21">

<tbody>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c5 c26 c40">reqName</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c40 c5 c26">param</span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">“agentAddImageRequest”</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">{img: <image file>,</span>

<span class="c4">filePath: <path of image file> }</span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">"agentSetLayoutProperties"</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">{name: <layout name>,</span>

<span class="c4"> nodeRepulsion: <node repulsion value> ,</span>

<span class="c4"> nodeOverlap:<node overlap percentage>,</span>

<span class="c4">idealEdgeLength:<ideal edge length value>,</span>

<span class="c4">edgeElasticity:<edge elasticity value>,</span>

<span class="c4">nestingFactor:<nesting factor value>,</span>

<span class="c4">gravity:<gravity value>,</span>

<span class="c4">numIter:<number of iterations>,</span>

<span class="c4">tile:<boolean value to tile disconnected>,</span>

<span class="c4">animate:<boolean value>,</span>

<span class="c4">randomize:<boolean value>}</span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">“agentRunLayoutRequest”</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">-</span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">“agentAddNodeRequest”</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">{x: <position x>,</span>

<span class="c4">y: <position y>,</span>

<span class="c4">sbgnclass: <sbgn class>}</span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">“agentAddEdgeRequest”</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">{source: <source node id>,</span>

<span class="c4">target: <target node id>,</span>

<span class="c4">sbgnclass: <sbgn class>}</span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">“agentChangeNodeAttributeRequest”</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">{id: <node id>,</span>

<span class="c4">attStr: <node attribute name in the model></span>

<span class="c4">attVal:<node attribute value>}</span>

<span class="c4"></span>

<span class="c4">attStr takes the following values: “sbgnclass”, “highlightColor”, “backgroundColor”, “sbgnlabel”, “borderColor”, “borderWidth”, “isMultimer”, “isCloneMarker”, “parent”, “children”, “width”, “height”, “sbgnbboxW”, “sbgnbboxH”, “sbgnStatesAndInfos”</span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">“agentChangeEdgeAttributeRequest”</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">{id: <node id>,</span>

<span class="c4">attStr: <edge attribute name in the model></span>

<span class="c4">attVal:<edge attribute value>}</span>

<span class="c4"></span>

<span class="c4">attStr takes the following values: “lineColor”, “highlightColor”, “width”, “cardinality”  </span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">“agentMoveNodeRequest”</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">{id: <node id>,</span>

<span class="c4">pos: {x:<new position x>, y: < new position y>}}</span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">“agentAddCompoundRequest”</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">{type: <compound type as “complex” or “compartment”>,</span>

<span class="c4">selectedNodeArr: <array of node ids>}</span>

</td>

</tr>

<tr class="c3">

<td class="c23" colspan="1" rowspan="1">

<span class="c4">“agentMergeGraphRequest”</span>

</td>

<td class="c31" colspan="1" rowspan="1">

<span class="c4">{param: <graph to be added in sbgn format>}</span>

</td>

</tr>

</tbody>

</table>

<span></span>

<span class="c0 c16"></span>

<span class="c16 c0"></span>

<span>In order to set up and run an agent:</span>

<span></span>

<span class="c0 c27 c26">agent</span> <span class="c0">=</span> <span class="c0 c33 c26">new</span> <span class="c0 c29">Agent</span><span class="c0">(</span><span class="c0 c37">agentName</span><span class="c0">,</span> <span class="c0 c37">agentId</span><span class="c0">);</span>

<span class="c0 c33 c26">var</span> <span class="c0 c37">socket</span> <span class="c0">=</span> <span class="c0 c27 c26">agent</span><span class="c0">.</span><span class="c0 c19">connectToServer</span><span class="c0">(</span><span class="c0 c37">serverIp</span><span class="c0">,</span> <span class="c0 c33 c26">function</span><span class="c0">(){</span>

<span class="c16 c0">//callback operations</span>

<span class="c0">});</span>

<span class="c0 c37">socket</span><span class="c0">.</span><span class="c0 c19">on</span><span class="c0">(</span><span class="c0 c44 c26">'connect'</span><span class="c0">,</span> <span class="c0 c33 c26">function</span><span class="c0">(){</span>

<span class="c0">   </span><span class="c0 c27 c26">agent</span><span class="c0">.</span><span class="c0 c19">loadModel</span><span class="c0">(</span><span class="c0 c33 c26">function</span><span class="c0">() {</span>

<span class="c0">       </span><span class="c0 c27 c26">agent</span><span class="c0">.</span><span class="c0 c19">loadOperationHistory</span><span class="c0">(</span><span class="c0 c33 c26">function</span><span class="c0">(){</span>

<span class="c0">           </span><span class="c0 c27 c26">agent</span><span class="c0">.</span><span class="c0 c19">loadChatHistory</span><span class="c0">(</span><span class="c0 c33 c26">function</span><span class="c0">(){                  </span>

<span class="c16 c0">//callback operations</span><span class="c0">             </span>

<span class="c0">});</span>

<span class="c0">           });</span>

<span class="c0">       });</span>

<span class="c0">   </span><span class="c0 c26 c27">agent</span><span class="c0">.</span><span class="c0 c19">listen</span><span class="c0">(</span><span class="c0 c26 c33">function</span><span class="c0">(){</span>

<span class="c0">       </span><span class="c0 c37">socket</span><span class="c0">.</span><span class="c0 c19">on</span><span class="c0">(</span><span class="c0 c26 c44">'operation'</span><span class="c0">,</span> <span class="c0 c33 c26">function</span><span class="c0">(data){</span>

<span class="c0">         </span> <span class="c16 c0">//callback operations</span>

<span class="c0">       });</span>

<span class="c0">       </span><span class="c0 c37">socket</span><span class="c0">.</span><span class="c0 c19">on</span><span class="c0">(</span><span class="c0 c44 c26">'message'</span><span class="c0">,</span> <span class="c0 c33 c26">function</span><span class="c0">(data){</span>

<span class="c0">           </span><span class="c16 c0">//callback operations</span>

<span class="c0">       });</span>

<span class="c0">       </span><span class="c0 c37">socket</span><span class="c0">.</span><span class="c0 c19">on</span><span class="c0">(</span><span class="c0 c44 c26">'userList'</span><span class="c0">,</span> <span class="c0 c33 c26">function</span><span class="c0">(data){</span>

<span class="c0">           </span><span class="c16 c0">//callback operations</span>

<span class="c0">       });</span>

<span class="c0">       </span><span class="c0 c37">socket</span><span class="c0">.</span><span class="c0 c19">on</span><span class="c0">(</span><span class="c0 c44 c26">'imageFile'</span><span class="c0">,</span> <span class="c0 c33 c26">function</span><span class="c0">(data){</span>

<span class="c0">           </span><span class="c16 c0">//callback operations</span>

<span class="c0">       });</span>

<span class="c0">   });</span>

<span class="c0">});</span>

<span></span>

<span>An example web-based agent can be found in:</span>

<span></span>

<span>Sbgnviz-Collaborative-Editor/agent-interaction/computerAgent.html</span>

<span></span>

<span></span>

<span>Command History:</span>

<span>JSON array as:</span>

<span>[</span>

<span>     {</span>

<span>userName: //name of the user who gave the command</span>

<span>name: //name of the command</span>

<span>id: //id of the affected element</span>

<span>param: //operation parameters</span>

<span>         [</span>

<span>              {</span>

<span>                x: //node position x</span>

<span>                y: //node position y</span>

<span>                sbgnclass: //node sbgnclass</span>

<span>                source:  //edge source</span>

<span>                target:  //edge target</span>

<span>                sbgnclass: //edge sbgnclass</span>

<span></span>

<span></span>

<span>              }</span>

<span>]</span>

<span>date: //date of the command</span>

<span>   }</span>

<span>]</span>

## <span>History Manager</span>

<span>Each command is stored in the model as a part of command history. Command structure is as follows:</span>

<span>opName: set | add | delete | init</span>

<span>opTarget: node | edge | node group | edge group</span>

<span>opAttr:  id| position | sbgnclass | sbgnlabel | width | height | backgroundColor |  borderColor | borderWidth | parent | isCloneMarker | isMultimer | sbgnStatesAndInfos| source| target |lineColor | lineWidth| sbgncardinality</span>

<span>elId: id of the node or edge | id array of the node or edge group</span>

<span>elType: “node” or “edge”</span>

<span>param:</span>

<span>prevParam:</span>

<span></span>

<span></span>

### <span>JSON Model Structure</span>

*   <span class="c5">users</span>

*   <span class="c5">name</span>

*   <span class="c5">page</span>

*   <span class="c5">list</span>
*   <span class="c5">room</span>
*   <span class="c5">doc</span>

*   <span class="c5">userIds</span>
*   <span class="c5">history</span>
*   <span class="c5">undoIndex</span>
*   <span class="c5">Images</span>
*   <span class="c5">Context</span>

*   <span class="c5">name</span>
*   <span class="c5">relevance</span>
*   <span class="c5">confidence</span>

*   <span class="c5">c</span><span class="c5">y  //sbgn-related</span>

*   <span class="c5">sampleInd //temporary</span>
*   <span class="c5">layoutProperties</span>
*   <span class="c5">nodes</span>

*   <span class="c5">[nodeId]</span>

*   <span class="c5">id</span>
*   <span class="c5">addedLater //to sync. node addition</span>
*   <span class="c5">sbgnclass</span>
*   <span class="c5">position</span>
*   <span class="c5">highlightColor</span>
*   <span class="c5">sbgnlabel</span>
*   <span class="c5">borderColor</span>
*   <span class="c5">borderWidth</span>
*   <span class="c5">backgroundColor</span>
*   <span class="c5">backgroundOpacity</span>
*   <span class="c5">isMultimer</span>
*   <span class="c5">isCloneMarker</span>
*   <span class="c5">ports</span>
*   <span class="c5">width</span>
*   <span class="c5">height</span>
*   <span class="c5">sbgnStatesAndInfos</span>
*   <span class="c5">expandCollapseStatus</span>
*   <span class="c5">highlightStatus</span>
*   <span class="c5">visibilityStatus</span>

*   <span class="c5">edges</span>

*   <span class="c5">[edgeId]</span>

*   <span class="c5">id</span>
*   <span class="c5">addedLater //to sync. edge addition</span>
*   <span class="c5">sbgnclass</span>
*   <span class="c5">source</span>
*   <span class="c5">target</span>
*   <span class="c5">portsource</span>
*   <span class="c5">porttarget</span>
*   <span class="c5">highlightColor</span>
*   <span class="c5">lineColor</span>
*   <span class="c5">width</span>
*   <span class="c5">bendPointPositions</span>
*   <span class="c5">highlightStatus</span>
*   <span class="c5">visibilityStatus</span>
*   <span class="c5">sbgnCardinality</span>

*   <span class="c5">py // pysb-related</span>
*   <span class="c5">//biopax-related</span>

<span class="c5"></span>

# <span>Framework with Biopax</span>

## <span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 624.00px; height: 485.28px;">![](images/image03.png)</span>

<span></span>

<span></span>

<span></span>

<span></span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 695.50px; height: 549.08px;">![](images/image04.png)</span>

<span></span>

<span></span>

<span></span>

# <span>In development</span>

<span>                                   </span>

<span>We’re trying to set up a pipeline to display an SBGN model on screen right from the plain text written in the chat box. Two possibilities:</span>

*   <span>Fetch a BioPAX model directly from the REACH</span> <span>library</span><span>.</span>

<span>OR:</span>

*   <span>Fetch first the REACH output indexcard</span> <span>JSON</span><span> format then convert it in a BioPAX model.</span>

<span>Then implement:</span>

1.  <span>a naive “merger”, creating an SBGN model right from the indexcard JSON format. The new component appear separate from the other on screen and leave the duplicated entities as is if any.</span>
2.  <span>a more sophisticated one trying to really merge both the old and new components on screen if necessary, and leave the duplicated entities as is if any.</span>
3.  <span>a merger where all the SBGN models appear actually merged together when         possible and the entities are de-duplicated to guarantee the coherence of the resulting model.</span>
4.  <span>a GUI giving the user the opportunity to choose between different possible         models before any validation.</span>

<span></span>

<span></span>

<span></span>

<span></span>

<span></span>

## <span>Data Alignment</span>

<span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 623.50px; height: 583.53px;">![](images/image05.png)</span>

<span></span>

<span></span>

# <span>Context Agent</span>

## <span style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; transform: rotate(0.00rad) translateZ(0px); -webkit-transform: rotate(0.00rad) translateZ(0px); width: 624.00px; height: 485.28px;">![](images/image01.png)</span>

<span class="c26"></span>

<span class="c26"></span>