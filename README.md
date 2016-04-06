
<html>

</head>
<body lang="en-US" dir="ltr">
<h1><a name="h.1wgjhs3i3ced"></a>SBGNViz Collaborative Editor User
Guide</h1>
<p>The editor allows human curators and computer agents to work on
the same pathway model, and communicate through text and images. On
the server side, we have an application server that keeps the model,
handles communication across clients, and performs operational
transformation. Model visualization and editing are handled on the
client side. The editor visualizes information about cellular
processes and pathways in SBGN (Systems Biology Graphical Notation)
format. It allows for automatic graph layout, editing and
highlighting facilities. 
</p>
<h2 class="western"><a name="h.2up5xl2gx913"></a>Installation</h2>
<p>Install node.js, mongodb and redis servers first.</p>
<p>Node:</p>
<p>&gt;curl -sL <a href="https://www.google.com/url?q=https://deb.nodesource.com/setup_0.12&amp;sa=D&amp;ust=1456966704465000&amp;usg=AFQjCNGGRmt27os-aQCnnpnjDmM-dK8UTA">https://deb.nodesource.com/setup_0.12</a>&nbsp;|
sudo -E bash -</p>
<p>&gt;sudo apt-get install -y nodejs</p>
<p>Redis:</p>
<p>&gt;sudo apt-get update</p>
<p>&gt;sudo apt-get install build-essential</p>
<p>&gt;sudo apt-get install tcl8.5</p>
<p>&gt;wget <a href="https://www.google.com/url?q=http://download.redis.io/releases/redis-stable.tar.gz&amp;sa=D&amp;ust=1456966704468000&amp;usg=AFQjCNGwsqVTEvOoDXFJXUPfOp5HAjVP5w">http://download.redis.io/releases/redis-stable.tar.gz</a></p>
<p>&gt;tar xzf redis-stable.tar.gz</p>
<p>&gt;cd redis-stable</p>
<p>&gt;make</p>
<p>Mongo:</p>
<p>&gt;sudo apt-key adv --keyserver
hkp://<a href="https://www.google.com/url?q=http://keyserver.ubuntu.com/&amp;sa=D&amp;ust=1456966704470000&amp;usg=AFQjCNGvhIICtXNVxHKClfjeGof6XYMC4A">keyserver.ubuntu.com:80</a>&nbsp;--recv
EA312927</p>
<p>&gt;echo &quot;deb
<a href="https://www.google.com/url?q=http://repo.mongodb.org/apt/ubuntu&amp;sa=D&amp;ust=1456966704471000&amp;usg=AFQjCNEKWJoH8yIBAFiMQ-MCWVrWwM09GA">http://repo.mongodb.org/apt/ubuntu</a>&nbsp;trusty/mongodb-org/3.2
multiverse&quot; | sudo tee
/etc/apt/sources.list.d/mongodb-org-3.2.list</p>
<p>&gt;sudo apt-get update</p>
<p>&gt;sudo apt-get install -y mongodb-org</p>
<p>If mongo does not work:</p>
<p>&gt;sudo apt-get install upstart-sysv</p>
<p>Get project from github:</p>
<p>&gt;git clone
<a href="https://www.google.com/url?q=https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git&amp;sa=D&amp;ust=1456966704473000&amp;usg=AFQjCNEHA0UHM1vmyy5RgBaDtjAfIfIBDg">https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git</a></p>
<p>&gt;cd Sbgnviz-Collaborative-Editor</p>
<p>&gt;sudo rm -rf node_modules</p>
<p>&gt;npm install</p>
<p>Run server:</p>
<p>&gt;node server</p>
<p>In order to open a client:</p>
<p>Enter “http://localhost:3000” to the address bar of your
browser. 
</p>
<h2 class="western"><a name="h.lzkutpoc5320"></a>System Framework</h2>
<p style="margin-bottom: 0in"><span style="display: inline-block; border: 1px solid #000000; padding: 0.02in"><img src= "images/image01.png" name="Image1" align="bottom" width="455" height="359" border="0"/>
</span></p>
<h2 class="western"><a name="h.55d0en95yatx"></a>Framework Details</h2>
<p style="margin-bottom: 0in"><span style="display: inline-block; border: 1px solid #000000; padding: 0.02in"><img src="images/image00.png" name="Image2" align="bottom" width="624" height="405" border="0"/>
</span>&nbsp;</p>
<h3 class="western"><a name="h.ttz39lsxwuvx"></a>Computer Agent API</h3>
<p>Computer agents are connected to the node.js http server via
websockets (socket.io.js). An agent is initialized with a name
(string) &nbsp;and a unique ID (string).</p>
<p>Constructor: Agent (string name, string id)</p>
<h4 class="western"><a name="h.1eu245k1egzd"></a>Public Attributes:</h4>
<p>agentId: (string) A unique id</p>
<p>agentName: (string) Agent name</p>
<p>colorCode: A specific color in hex format to identify the agent operations.</p>
<p>selectedNode: The node object on which the agent is performing
operations. It has attributes such as position ={x:&lt;posX&gt;,y:&lt;posY&gt;},
width, height, borderWidth, borderHeight, backgroundColor, sbgnLabel,
sbgnStatesAndInfos = {clazz:&lt;className&gt;, state =
{value:&lt;stateValue&gt;,variable:&lt;stateVariable&gt;}}.</p>
<p>&nbsp;</p>
<p>selectedEdge: The edge object on which the agent is performing
operations. It has attributes such as cardinality, lineColor and
width.</p>
<p>opHistory: History of operations as an array of strings in the
format: “UserName&nbsp;(date):&nbsp;Command”.</p>
<p>chatHistory: Chat history as an array of messages.</p>
<p>userList: List of connected user ids.</p>
<h4 class="western"><a name="h.nt4u4u3mhl90"></a>Private Attributes:</h4>
<p>room: The document id that identifies the shared model. It is the
string after http:&lt;ip&gt;:3000/ in the server address.</p>
<p>socket: The web socket between the server and agent</p>
<p>pageDoc: The document that the shared model is stored.</p>
<h4 class="western"><a name="h.l0c8z5l51rt3"></a>Methods:</h4><a name="t.a479165b3048e3a8701c4538bb9274ab90443c88"></a><a name="t.0"></a>
<table cellpadding="2" cellspacing="2">
	<tr>
		<td style="border: none; padding: 0in">
			<p>Name</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Function</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Parameters</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Returns</p>
		</td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>connectToServer</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Connects the server and returns socket.io socket</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>url, callback</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>socket</p>
		</td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>loadModel</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Gets the model for the current room</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>callback</p>
		</td>
		<td style="border: none; padding: 0in"></td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>loadOperationHistory</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Gets history of operations from the node.js server and assigns
			them to opHistory</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>callback</p>
		</td>
		<td style="border: none; padding: 0in"></td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>loadUserList</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Gets user list from the node.js server and assigns them to
			userList</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>callback</p>
		</td>
		<td style="border: none; padding: 0in"></td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>loadChatHistory</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Gets history of chat messages from the node.js server and
			assigns them to chatHistory</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>callback</p>
		</td>
		<td style="border: none; padding: 0in"></td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>getNodeList</p>
		</td>
		<td style="border: none; padding: 0in"></td>
		<td style="border: none; padding: 0in">
			<p>callback</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>The node list in the shared model as an object of node ids</p>
		</td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>getLayoutProperties</p>
		</td>
		<td style="border: none; padding: 0in"></td>
		<td style="border: none; padding: 0in">
			<p>callback</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Layout properties of the shared model as an object with
			attributes as: 
			</p>
			<p>{name: &lt;layout name&gt;,</p>
			<p>&nbsp;nodeRepulsion: &lt;node repulsion value&gt; ,</p>
			<p>&nbsp;nodeOverlap:&lt;node overlap percentage&gt;, 
			</p>
			<p>idealEdgeLength:&lt;ideal edge length value&gt;, 
			</p>
			<p>edgeElasticity:&lt;edge elasticity value&gt;, 
			</p>
			<p>nestingFactor:&lt;nesting factor value&gt;, 
			</p>
			<p>gravity:&lt;gravity value&gt;, 
			</p>
			<p>numIter:&lt;number of iterations&gt;,</p>
			<p>tile:&lt;boolean value to tile disconnected&gt;, 
			</p>
			<p>animate:&lt;boolean value&gt;, 
			</p>
			<p>randomize:&lt;boolean value&gt;} 
			</p>
		</td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>changeName</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Sends request to the server to change agent's name</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>newName</p>
		</td>
		<td style="border: none; padding: 0in"></td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>getNodeRequest</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Requests the node with &lt;id&gt; from the server</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>id, callback</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Node with id</p>
		</td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>getEdgeRequest</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Requests the edge with &lt;id&gt; from the server</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>id, callback</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Edge with id</p>
		</td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>sendMessage</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Sends chat message &lt;comments&gt; as a string to &lt;targetArr&gt;
			as an array of targeted user ids [{id: &lt;id1&gt;},..., {id:
			&lt;idn&gt;}]</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>comment, targetArr, callback</p>
		</td>
		<td style="border: none; padding: 0in"></td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>listen</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Socket listener for server requests. Can get “operation”,
			“message”, “userList” or “imageFile” from the server.</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>callback</p>
		</td>
		<td style="border: none; padding: 0in"></td>
	</tr>
	<tr>
		<td style="border: none; padding: 0in">
			<p>sendRequest</p>
		</td>
		<td style="border: none; padding: 0in">
			<p>Sends an operation request to the node.js server. &nbsp;Model
			update operations are done using this method.</p>
		</td>
		<td style="border: none; padding: 0in">
			<p><a href="#h.nhfdym5d0wpf">reqName, param</a></p>
		</td>
		<td style="border: none; padding: 0in"></td>
	</tr>
</table>
<h5 class="western"><a name="h.nhfdym5d0wpf"></a>sendRequest:</h5><a name="t.5ecfa19ea20fe9e9f35d0be094051c36548ef09b"></a><a name="t.1"></a>
<table width="1674" cellpadding="2" cellspacing="0">
	<col width="212">
	<col width="1454">
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>reqName</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>param</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentAddImageRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>{img: &lt;image file&gt;, 
			</p>
			<p>filePath: &lt;path of image file&gt; } 
			</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>&quot;agentSetLayoutProperties&quot;</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>param: {name: &lt;layout name&gt;,</p>
			<p>&nbsp;nodeRepulsion: &lt;node repulsion value&gt; ,</p>
			<p>&nbsp;nodeOverlap:&lt;node overlap percentage&gt;, 
			</p>
			<p>idealEdgeLength:&lt;ideal edge length value&gt;, 
			</p>
			<p>edgeElasticity:&lt;edge elasticity value&gt;, 
			</p>
			<p>nestingFactor:&lt;nesting factor value&gt;, 
			</p>
			<p>gravity:&lt;gravity value&gt;, 
			</p>
			<p>numIter:&lt;number of iterations&gt;,</p>
			<p>tile:&lt;boolean value to tile disconnected&gt;, 
			</p>
			<p>animate:&lt;boolean value&gt;, 
			</p>
			<p>randomize:&lt;boolean value&gt;}}</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentRunLayoutRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>{param:null}</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentAddNodeRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>param: {x: &lt;position x&gt;, 
			</p>
			<p>y: &lt;position y&gt;, 
			</p>
			<p>sbgnclass: &lt;sbgn class&gt;}}</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentAddEdgeRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>{id: &lt;source&gt; - &lt;target&gt; - &lt;sbgnclass&gt;,</p>
			<p>param: {source: &lt;source node id&gt;, 
			</p>
			<p>target: &lt;target node id&gt;, 
			</p>
			<p>sbgnclass: &lt;sbgn class&gt;}}</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentChangeNodeAttributeRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>{id: &lt;node id&gt;, 
			</p>
			<p>attStr: &lt;node attribute name in the model&gt;</p>
			<p>attVal:&lt;node attribute value&gt;}</p>
			<p>attStr takes the following values: “sbgnclass”,
			“highlightColor”, “backgroundColor”, “sbgnlabel”,
			“borderColor”, “borderWidth”, “isMultimer”,
			“isCloneMarker”, “parent”, “children”, “width”,
			“height”,
			“sbgnStatesAndInfos” 
			</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentChangeEdgeAttributeRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>{id: &lt;node id&gt;, 
			</p>
			<p>attStr: &lt;edge attribute name in the model&gt;</p>
			<p>attVal:&lt;edge attribute value&gt;}</p>
			<p>attStr takes the following values: “lineColor”,
			“highlightColor”, “width”, “cardinality” &nbsp;</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentMoveNodeRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>{id: &lt;node id&gt;, 
			</p>
			<p>pos: {x:&lt;new position x&gt;, y: &lt; new position y&gt;}}</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentAddCompoundRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>{type: &lt;compound type as “complex” or “compartment”&gt;,
						</p>
			<p>selectedNodeArr: &lt;array of node ids&gt;}</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentLoadFileRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>{param: &lt;file content as text&gt;}</p>
		</td>
	</tr>
	<tr>
		<td width="212" style="border: none; padding: 0in">
			<p>“agentNewFileRequest”</p>
		</td>
		<td width="1454" style="border: none; padding: 0in">
			<p>{param:null}</p>
		</td>
	</tr>
	<tr>
        <td width="212" style="border: none; padding: 0in">
            <p>“agentActiveRoomsRequest”</p>
        </td>
        <td width="1454" style="border: none; padding: 0in">
            <p>{param:null}</p>
        </td>
    </tr>
</table>
<p>In order to set up and run an agent:</p>
<p>agent = new Agent(agentName, agentId);</p>
<p>var socket = agent.connectToServer(serverIp, function(){</p>
<p>//callback operations</p>
<p>});</p>
<p>socket.on('connect', function(){</p>
<p>&nbsp; &nbsp;agent.loadModel(function() {</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;agent.loadOperationHistory(function(){</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
&nbsp;agent.loadChatHistory(function(){ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
&nbsp; &nbsp; &nbsp; &nbsp; 
</p>
<p>//callback operations&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
</p>
<p>});</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;});</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;});</p>
<p>&nbsp; &nbsp;agent.listen(function(){</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;socket.on('operation', function(data){</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; //callback operations</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;});</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;socket.on('message', function(data){</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;//callback operations</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;});</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;socket.on('userList', function(data){</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;//callback operations</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;});</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;socket.on('imageFile', function(data){</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;//callback operations</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;});</p>
<p>&nbsp; &nbsp;});</p>
<p>});</p>

<p>Command History:</p>
<p>JSON array as:</p>
<p>[</p>
<p>&nbsp;{</p>
<p>&nbsp; &nbsp;userName: //name of the user who gave the command</p>
<p>&nbsp; &nbsp;date: //date and time of the command</p>
<p>&nbsp; &nbsp;opName: //name of the operation</p>
<p>&nbsp; &nbsp;elId: //id of the affected element</p>
<p>&nbsp; &nbsp;param: //operation parameters</p>
<p>&nbsp; &nbsp;[</p>
<p>&nbsp; &nbsp; &nbsp;{</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;x: //node position x</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;y: //node position y</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;sbgnclass: //node sbgnclass</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;source:  //edge source</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;target:  //edge target</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp;sbgnclass: //edge sbgnclass</p>
<p>&nbsp; &nbsp; &nbsp;}</p>
<p>&nbsp; &nbsp;]</p>
<p>&nbsp;}</p>
<p>]</p>

</body>
</html>