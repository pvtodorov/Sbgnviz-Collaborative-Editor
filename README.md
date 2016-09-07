<html>

<head>
<meta http-equiv=Content-Type content="text/html; charset=macintosh">
<meta name=Generator content="Microsoft Word 15 (filtered)">
<style>
<!--
 /* Font Definitions */
@font-face
	{font-family:Arial;
	panose-1:2 11 6 4 2 2 2 2 2 4;}
@font-face
	{font-family:"Cambria Math";
	panose-1:0 0 0 0 0 0 0 0 0 0;}
 /* Style Definitions */
p.MsoNormal, li.MsoNormal, div.MsoNormal
	{margin:0in;
	margin-bottom:.0001pt;
	line-height:115%;
	font-size:11.0pt;
	font-family:Arial;
	color:black;}
h1
	{margin-top:20.0pt;
	margin-right:0in;
	margin-bottom:6.0pt;
	margin-left:0in;
	line-height:115%;
	font-size:20.0pt;
	font-family:Arial;
	color:black;
	font-weight:normal;}
h2
	{margin-top:.25in;
	margin-right:0in;
	margin-bottom:6.0pt;
	margin-left:0in;
	line-height:115%;
	font-size:16.0pt;
	font-family:Arial;
	color:black;
	font-weight:normal;}
h3
	{margin-top:16.0pt;
	margin-right:0in;
	margin-bottom:4.0pt;
	margin-left:0in;
	line-height:115%;
	font-size:14.0pt;
	font-family:Arial;
	color:#434343;
	font-weight:normal;}
h4
	{margin-top:14.0pt;
	margin-right:0in;
	margin-bottom:4.0pt;
	margin-left:0in;
	line-height:115%;
	font-size:12.0pt;
	font-family:Arial;
	color:#666666;
	font-weight:normal;}
h5
	{margin-top:12.0pt;
	margin-right:0in;
	margin-bottom:4.0pt;
	margin-left:0in;
	line-height:115%;
	font-size:11.0pt;
	font-family:Arial;
	color:#666666;
	font-weight:normal;}
h6
	{margin-top:12.0pt;
	margin-right:0in;
	margin-bottom:4.0pt;
	margin-left:0in;
	line-height:115%;
	font-size:11.0pt;
	font-family:Arial;
	color:#666666;
	font-weight:normal;
	font-style:italic;}
p.MsoTitle, li.MsoTitle, div.MsoTitle
	{margin-top:0in;
	margin-right:0in;
	margin-bottom:3.0pt;
	margin-left:0in;
	line-height:115%;
	font-size:26.0pt;
	font-family:Arial;
	color:black;}
p.MsoSubtitle, li.MsoSubtitle, div.MsoSubtitle
	{margin-top:0in;
	margin-right:0in;
	margin-bottom:16.0pt;
	margin-left:0in;
	line-height:115%;
	font-size:15.0pt;
	font-family:Arial;
	color:#666666;}
.MsoChpDefault
	{font-size:11.0pt;
	font-family:Arial;
	color:black;}
.MsoPapDefault
	{line-height:115%;}
 /* Page Definitions */
@page WordSection1
	{size:8.5in 11.0in;
	margin:1.0in 1.0in 1.0in 1.0in;}
div.WordSection1
	{page:WordSection1;}
 /* List Definitions */
ol
	{margin-bottom:0in;}
ul
	{margin-bottom:0in;}
-->
</style>

</head>

<body bgcolor=white lang=EN-US>

<div class=WordSection1>

<h1><a name="_1wgjhs3i3ced"></a>SBGNViz Collaborative Editor User Guide</h1>

<p class=MsoNormal style='text-align:justify'>The editor allows human curators
and computer agents to work on the same pathway model, and communicate through
text and images. On the server side, we have an application server that keeps
the model, handles communication across clients, and performs operational
transformation. Model visualization and editing are handled on the client side.
The editor visualizes information about cellular processes and pathways in SBGN
(Systems Biology Graphical Notation) format. It allows for automatic graph
layout, editing and highlighting facilities. </p>

<p class=MsoNormal>&nbsp;</p>

<h2><a name="_2up5xl2gx913"></a>Installation</h2>

<p class=MsoNormal>Install node.js, mongodb and redis servers first.</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='color:#222222;background:white'>Node</span><span
style='font-size:9.5pt;line-height:115%;color:#222222;background:white'>:</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;curl -sL </span><a
href="https://deb.nodesource.com/setup_0.12"><span style='font-size:9.5pt;
line-height:115%;color:#1155CC;background:white'>https://deb.nodesource.com/setup_0.12</span></a><span
style='font-size:9.5pt;line-height:115%;color:#222222;background:white'> | sudo
-E bash -</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;sudo apt-get install -y nodejs</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='color:#222222;background:white'>Redis</span><span
style='font-size:9.5pt;line-height:115%;color:#222222;background:white'>:</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;sudo apt-get update</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;sudo apt-get install build-essential</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;sudo apt-get install tcl8.5</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>wget </span><a
href="http://download.redis.io/releases/redis-stable.tar.gz"><span
style='font-size:9.5pt;line-height:115%;color:#1155CC;background:white'>http://download.redis.io/releases/redis-stable.tar.gz</span></a></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;tar xzf redis-stable.tar.gz</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;cd redis-stable</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;make</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='color:#222222;background:white'>Mongo</span><span
style='font-size:9.5pt;line-height:115%;color:#222222;background:white'>:</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;sudo apt-key adv --keyserver hkp://</span><a
href="http://keyserver.ubuntu.com/"><span style='font-size:9.5pt;line-height:
115%;color:#1155CC;background:white'>keyserver.ubuntu.com:80</span></a><span
style='font-size:9.5pt;line-height:115%;color:#222222;background:white'> --recv
EA312927</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;echo &quot;deb </span><a
href="http://repo.mongodb.org/apt/ubuntu"><span style='font-size:9.5pt;
line-height:115%;color:#1155CC;background:white'>http://repo.mongodb.org/apt/ubuntu</span></a><span
style='font-size:9.5pt;line-height:115%;color:#222222;background:white'>
trusty/mongodb-org/3.2 multiverse&quot; | sudo tee
/etc/apt/sources.list.d/mongodb-org-3.2.list</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;sudo apt-get update</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;sudo apt-get install -y mongodb-org</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='color:#222222;background:white'>If mongo does
not work:</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;sudo apt-get install upstart-sysv</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>Get project from github:</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;git clone </span><a
href="https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git"><span
style='font-size:9.5pt;line-height:115%;color:#1155CC;background:white'>https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor.git</span></a></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;cd Sbgnviz-Collaborative-Editor</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;sudo rm -rf node_modules</span></p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;npm install</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='color:#222222;background:white'>Run server:</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><span style='font-size:9.5pt;line-height:115%;color:#222222;
background:white'>&gt;node server</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>In order to open a client:</p>

<p class=MsoNormal>Enter “http://localhost:3000” to the address bar of your
browser. <a name="_lzkutpoc5320"></a></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>&nbsp;</p>

<h3><a name="_ttz39lsxwuvx"></a>Computer Agent API</h3>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>Computer agents are connected to the node.js http server via
websockets (socket.io.js). An agent is initialized with a <i>name (string) </i>&nbsp;and
a unique <i>ID (string).</i></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><b>Constructor</b>: Agent (string name, string id)</p>

<p class=MsoNormal>&nbsp;</p>

<h4><a name="_1eu245k1egzd"></a>Public Attributes:</h4>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><b>agentId</b>: (string) A unique id</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><b>agentName</b>: (string) Agent name</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><b>colorCode</b>: A specific color to identify the agent
operations. It should be a string in hsla format as: “hsla(<i>H</i>, <i>S</i>, <i>L</i>%,
1)”, where <i>H (integer)</i>, <i>S (float)</i> and <i>L (float)</i> are hue,
saturation and lightness values.</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><b>selectedNode</b>: The node object on which the agent is
performing operations. It has attributes such as position
={x:&lt;posX&gt;,y:&lt;posY&gt;}, width, height, borderWidth, borderHeight,
backgroundColor, sbgnLabel, sbgnStatesAndInfos = {clazz:&lt;className&gt;,
state = {value:&lt;stateValue&gt;,variable:&lt;stateVariable&gt;}}.</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><b>selectedEdge</b>: The edge object on which the agent is
performing operations. It has attributes such as cardinality, lineColor and
width.</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><b>opHistory</b>: History of operations as an array of
strings in the format: “<i>UserName</i> (<i>date</i>):<i> Command</i>”.</p>

<p class=MsoNormal><b>chatHistory</b>: Chat history as an array of messages.</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><b>userList</b>: List of connected user ids.</p>

<p class=MsoNormal>&nbsp;</p>

<h4><a name="_nt4u4u3mhl90"></a>Private Attributes:</h4>

<p class=MsoNormal><b>room</b>: The document id that identifies the shared
model. It is the string after http:&lt;ip&gt;:3000/ in the server address.</p>

<p class=MsoNormal><b>socket</b>: The web socket between the server and agent</p>

<p class=MsoNormal><b>pageDoc</b>: The document that the shared model is
stored.</p>

<p class=MsoNormal>&nbsp;</p>

<h4><a name="_l0c8z5l51rt3"></a>Methods:</h4>

<p class=MsoNormal>&nbsp;</p>

<table class=a border=1 cellspacing=0 cellpadding=0 width=468 style='border-collapse:
 collapse;border:none'>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><b><span style='font-size:10.0pt'>Name</span></b></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border:solid black 1.0pt;
  border-left:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><b><span style='font-size:10.0pt'>Function</span></b></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border:solid black 1.0pt;
  border-left:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><b><span style='font-size:10.0pt'>Parameters</span></b></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border:solid black 1.0pt;
  border-left:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><b><span style='font-size:10.0pt'>Returns</span></b></p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>connectToServer</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>Connects
  the server and returns socket.io socket</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>url,
  callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>socket</span></p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>loadModel</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Gets the
  model for the current room</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>loadOperationHistory</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Gets
  history of operations from the node.js server and assigns them to opHistory</span></p>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>loadUserList</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Gets user
  list from the node.js server and assigns them to userList</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>loadChatHistory</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Gets
  history of chat messages from the node.js server and assigns them to
  chatHistory</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>getNodeList</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal>&nbsp;</p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>The node
  list in the shared model as an object of node ids</span></p>
  </td>
 </tr>
 <tr style='height:139.0pt'>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt;height:139.0pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>getLayoutProperties</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:139.0pt'>
  <p class=MsoNormal>&nbsp;</p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:139.0pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:139.0pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Layout
  properties of the shared model as an object with attributes as: </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>{</span><span
  style='font-size:9.0pt;line-height:115%'>name: &lt;layout name&gt;,</span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>&nbsp;nodeRepulsion:
  &lt;node repulsion value&gt; ,</span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>&nbsp;nodeOverlap:&lt;node
  overlap percentage&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>idealEdgeLength:&lt;ideal
  edge length value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>edgeElasticity:&lt;edge
  elasticity value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>nestingFactor:&lt;nesting
  factor value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>gravity:&lt;gravity
  value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>numIter:&lt;number
  of iterations&gt;,</span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>tile:&lt;boolean
  value to tile disconnected&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>animate:&lt;boolean
  value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>randomize:&lt;boolean
  value&gt;} </span></p>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
 </tr>
 <tr style='height:44.0pt'>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt;height:44.0pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>changeName</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:44.0pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Sends
  request to the server to change agent's name</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:44.0pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>newName</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:44.0pt'>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>getNodeRequest</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Requests
  the node with &lt;id&gt; from the server</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>id,
  callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>Node
  with id</span></p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>getEdgeRequest</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Requests
  the edge with &lt;id&gt; from the server</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>id,
  callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>Edge
  with id</span></p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>sendMessage</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Sends chat
  message &lt;comments&gt; as a string to &lt;targetArr&gt; as an array of
  targeted user ids [{id: &lt;id1&gt;},..., {id: &lt;idn&gt;}]</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>comment,
  targetArr, callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
 </tr>
 <tr>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>listen</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Socket
  listener for server requests. Can get “operation”, “message”, “userList” or
  “imageFile” from the server.</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:9.0pt'>callback</span></p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt'>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
 </tr>
 <tr style='height:62.0pt'>
  <td width=110 valign=top style='width:110.25pt;border:solid black 1.0pt;
  border-top:none;padding:4.3pt 4.3pt 4.3pt 4.3pt;height:62.0pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>sendRequest</span></p>
  </td>
  <td width=117 valign=top style='width:117.0pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:62.0pt'>
  <p class=MsoNormal><span style='font-size:9.0pt;line-height:115%'>Sends an
  operation request to the node.js server.&nbsp; Model update operations are
  done using this method.</span></p>
  </td>
  <td width=115 valign=top style='width:114.75pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:62.0pt'>
  <p class=MsoNormal style='line-height:normal'><a href="#_nhfdym5d0wpf"><span
  style='font-size:9.0pt;color:#1155CC'>reqName, param</span></a></p>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
  <td width=126 valign=top style='width:1.75in;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:4.3pt 4.3pt 4.3pt 4.3pt;height:62.0pt'>
  <p class=MsoNormal style='line-height:normal'>&nbsp;</p>
  </td>
 </tr>
</table>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>&nbsp;</p>

<h5><a name="_nhfdym5d0wpf"></a>sendRequest:</h5>

<p class=MsoNormal style='margin-left:.5in'>&nbsp;</p>

<table class=a0 border=1 cellspacing=0 cellpadding=0 width=461
 style='margin-left:-.75pt;border-collapse:collapse;border:none'>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal style='line-height:normal'><b><span style='font-size:9.0pt'>reqName</span></b></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border:solid black 1.0pt;
  border-left:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal style='line-height:normal'><b><span style='font-size:9.0pt'>param</span></b></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:10.0pt'>“agentAddImageRequest”</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>{img:
  &lt;image file&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>filePath:
  &lt;path of image file&gt; } </span></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>&quot;agentSetLayoutProperties&quot;</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>{name:
  &lt;layout name&gt;,</span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>&nbsp;nodeRepulsion:
  &lt;node repulsion value&gt; ,</span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>&nbsp;nodeOverlap:&lt;node
  overlap percentage&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>idealEdgeLength:&lt;ideal
  edge length value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>edgeElasticity:&lt;edge
  elasticity value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>nestingFactor:&lt;nesting
  factor value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>gravity:&lt;gravity
  value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>numIter:&lt;number
  of iterations&gt;,</span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>tile:&lt;boolean
  value to tile disconnected&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>animate:&lt;boolean
  value&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>randomize:&lt;boolean
  value&gt;} </span></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:10.0pt'>“agentRunLayoutRequest”</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:10.0pt'>-</span></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:10.0pt'>“agentAddNodeRequest”</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:10.0pt'>{x:
  &lt;position x&gt;, </span></p>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:10.0pt'>y:
  &lt;position y&gt;, </span></p>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:10.0pt'>sbgnclass:
  &lt;sbgn class&gt;}</span></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>“agentAddEdgeRequest”</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>{source:
  &lt;source node id&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>target:
  &lt;target node id&gt;, </span></p>
  <p class=MsoNormal style='line-height:normal'><span style='font-size:10.0pt'>sbgnclass:
  &lt;sbgn class&gt;}</span></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>“agentChangeNodeAttributeRequest”</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>{id:
  &lt;node id&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>attStr:
  &lt;node attribute name in the model&gt;</span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>attVal:&lt;node
  attribute value&gt;}</span></p>
  <p class=MsoNormal>&nbsp;</p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>attStr
  takes the following values: “sbgnclass”, “highlightColor”, “backgroundColor”,
  “sbgnlabel”, “borderColor”, “borderWidth”, “isMultimer”, “isCloneMarker”,
  “parent”, “children”, “width”, “height”, “sbgnbboxW”, “sbgnbboxH”,
  “sbgnStatesAndInfos” </span></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>“agentChangeEdgeAttributeRequest”</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>{id:
  &lt;node id&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>attStr:
  &lt;edge attribute name in the model&gt;</span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>attVal:&lt;edge
  attribute value&gt;}</span></p>
  <p class=MsoNormal>&nbsp;</p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>attStr
  takes the following values: “lineColor”, “highlightColor”, “width”,
  “cardinality”&nbsp; </span></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>“agentMoveNodeRequest”</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>{id:
  &lt;node id&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>pos:
  {x:&lt;new position x&gt;, y: &lt; new position y&gt;}}</span></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>“agentAddCompoundRequest”</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>{type:
  &lt;compound type as “complex” or “compartment”&gt;, </span></p>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>selectedNodeArr:
  &lt;array of node ids&gt;}</span></p>
  </td>
 </tr>
 <tr>
  <td width=177 valign=top style='width:177.0pt;border:solid black 1.0pt;
  border-top:none;padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>“agentMergeGraphRequest”</span></p>
  </td>
  <td width=284 valign=top style='width:284.25pt;border-top:none;border-left:
  none;border-bottom:solid black 1.0pt;border-right:solid black 1.0pt;
  padding:5.0pt 5.0pt 5.0pt 5.0pt'>
  <p class=MsoNormal><span style='font-size:10.0pt;line-height:115%'>{param:
  &lt;graph to be added in sbgn format&gt;}</span></p>
  </td>
 </tr>
</table>

<p class=MsoNormal style='margin-left:.5in'>&nbsp;</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>In order to set up and run an agent:</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal><b><i><span style='font-size:9.0pt;line-height:115%;
color:#660E7A;background:white'>agent </span></i></b><span style='font-size:
9.0pt;line-height:115%;background:white'>= <b><span style='color:navy'>new </span></b><i>Agent</i>(<span
style='color:#458383'>agentName</span>, <span style='color:#458383'>agentId</span>);</span></p>

<p class=MsoNormal><b><span style='font-size:9.0pt;line-height:115%;color:navy;
background:white'>var </span></b><span style='font-size:9.0pt;line-height:115%;
color:#458383;background:white'>socket </span><span style='font-size:9.0pt;
line-height:115%;background:white'>= <b><i><span style='color:#660E7A'>agent</span></i></b>.<span
style='color:#7A7A43'>connectToServer</span>(<span style='color:#458383'>serverIp</span>,
<b><span style='color:navy'>function</span></b>(){</span></p>

<p class=MsoNormal style='text-indent:.5in'><i><span style='font-size:9.0pt;
line-height:115%;color:gray;background:white'>//callback operations</span></i></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>});</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;color:#458383;
background:white'>socket</span><span style='font-size:9.0pt;line-height:115%;
background:white'>.<span style='color:#7A7A43'>on</span>(<b><span
style='color:green'>'connect'</span></b>, <b><span style='color:navy'>function</span></b>(){</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp; <b><i><span style='color:#660E7A'>agent</span></i></b>.<span
style='color:#7A7A43'>loadModel</span>(<b><span style='color:navy'>function</span></b>()
{</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b><i><span style='color:#660E7A'>agent</span></i></b>.<span
style='color:#7A7A43'>loadOperationHistory</span>(<b><span style='color:navy'>function</span></b>(){</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b><i><span
style='color:#660E7A'>agent</span></i></b>.<span style='color:#7A7A43'>loadChatHistory</span>(<b><span
style='color:navy'>function</span></b>(){&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></p>

<p class=MsoNormal style='text-indent:.5in'><i><span style='font-size:9.0pt;
line-height:115%;color:gray;background:white'>//callback operations</span></i><span
style='font-size:9.0pt;line-height:115%;background:white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></p>

<p class=MsoNormal style='text-indent:.5in'><span style='font-size:9.0pt;
line-height:115%;background:white'>});</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; });</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; });</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp; <b><i><span style='color:#660E7A'>agent</span></i></b>.<span
style='color:#7A7A43'>listen</span>(<b><span style='color:navy'>function</span></b>(){</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style='color:#458383'>socket</span>.<span
style='color:#7A7A43'>on</span>(<b><span style='color:green'>'operation'</span></b>,
<b><span style='color:navy'>function</span></b>(data){</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <i><span
style='color:gray'>//callback operations</span></i></span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; });</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style='color:#458383'>socket</span>.<span
style='color:#7A7A43'>on</span>(<b><span style='color:green'>'message'</span></b>,
<b><span style='color:navy'>function</span></b>(data){</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <i><span
style='color:gray'>//callback operations</span></i></span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; });</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style='color:#458383'>socket</span>.<span
style='color:#7A7A43'>on</span>(<b><span style='color:green'>'userList'</span></b>,
<b><span style='color:navy'>function</span></b>(data){</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <i><span
style='color:gray'>//callback operations</span></i></span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; });</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style='color:#458383'>socket</span>.<span
style='color:#7A7A43'>on</span>(<b><span style='color:green'>'imageFile'</span></b>,
<b><span style='color:navy'>function</span></b>(data){</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <i><span
style='color:gray'>//callback operations</span></i></span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; });</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>&nbsp;&nbsp; });</span></p>

<p class=MsoNormal><span style='font-size:9.0pt;line-height:115%;background:
white'>});</span></p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>An example web-based agent can be found in:</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>Sbgnviz-Collaborative-Editor/agent-interaction/computerAgent.html</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>Command History:</p>

<p class=MsoNormal>JSON array as: </p>

<p class=MsoNormal>[</p>

<p class=MsoNormal>&nbsp;&nbsp;&nbsp;&nbsp; {</p>

<p class=MsoNormal style='margin-left:.5in'>userName: //name of the user who
gave the command</p>

<p class=MsoNormal style='margin-left:.5in'>name: //name of the command</p>

<p class=MsoNormal style='margin-left:.5in'>id: //id of the affected element</p>

<p class=MsoNormal style='margin-left:.5in'>param: //operation parameters</p>

<p class=MsoNormal>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [</p>

<p class=MsoNormal>&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;{</p>

<p class=MsoNormal>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; x:
//node position x</p>

<p class=MsoNormal>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; y:
//node position y</p>

<p class=MsoNormal>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sbgnclass:
//node sbgnclass</p>

<p class=MsoNormal>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; source:&nbsp;
//edge source</p>

<p class=MsoNormal>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; target:&nbsp;
//edge target</p>

<p class=MsoNormal>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sbgnclass:
//edge sbgnclass</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;}
</p>

<p class=MsoNormal style='text-indent:.5in'>]</p>

<p class=MsoNormal style='text-indent:.5in'>date: //date of the command</p>

<p class=MsoNormal>&nbsp;&nbsp; }</p>

<p class=MsoNormal>]</p>

<h2><a name="_3g1tmtehb2nc"></a>History Manager</h2>

<p class=MsoNormal>Each command is stored in the model as a part of command
history. Command structure is as follows:</p>

<p class=MsoNormal>opName: set | add | delete | init</p>

<p class=MsoNormal>opTarget: node | edge | node group | edge group</p>

<p class=MsoNormal>opAttr:&nbsp; id| position | sbgnclass | sbgnlabel | width |
height | backgroundColor |&nbsp; borderColor | borderWidth | parent |
isCloneMarker | isMultimer | sbgnStatesAndInfos| source| target |lineColor |
lineWidth| sbgncardinality</p>

<p class=MsoNormal>elId: id of the node or edge | id array of the node or edge
group</p>

<p class=MsoNormal>elType: “node” or “edge”</p>

<p class=MsoNormal>param:</p>

<p class=MsoNormal>prevParam:</p>

<p class=MsoNormal>&nbsp;</p>

<p class=MsoNormal>&nbsp;</p>

<h3><a name="_cx5b1mdp3uj5"></a>JSON Model Structure</h3>

<p class=MsoNormal style='margin-left:.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>users</span></p>

<p class=MsoNormal style='margin-left:1.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>name</span></p>

<p class=MsoNormal style='margin-left:.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>page</span></p>

<p class=MsoNormal style='margin-left:1.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>list</span></p>

<p class=MsoNormal style='margin-left:1.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>room</span></p>

<p class=MsoNormal style='margin-left:1.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>doc</span></p>

<p class=MsoNormal style='margin-left:1.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>userIds</span></p>

<p class=MsoNormal style='margin-left:1.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>history</span></p>

<p class=MsoNormal style='margin-left:1.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>undoIndex</span></p>

<p class=MsoNormal style='margin-left:1.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>Images</span></p>

<p class=MsoNormal style='margin-left:1.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>Context</span></p>

<p class=MsoNormal style='margin-left:2.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>name</span></p>

<p class=MsoNormal style='margin-left:2.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>relevance</span></p>

<p class=MsoNormal style='margin-left:2.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>confidence</span></p>

<p class=MsoNormal style='margin-left:1.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>cy&nbsp;
//sbgn-related</span></p>

<p class=MsoNormal style='margin-left:2.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>sampleInd
//temporary</span></p>

<p class=MsoNormal style='margin-left:2.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>layoutProperties </span></p>

<p class=MsoNormal style='margin-left:2.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>nodes</span></p>

<p class=MsoNormal style='margin-left:2.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>[nodeId]</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>id</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>addedLater //to
sync. node addition</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>sbgnclass</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>position</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>highlightColor</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>sbgnlabel</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>borderColor</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>borderWidth</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>backgroundColor</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>backgroundOpacity</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>isMultimer</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>isCloneMarker</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>ports</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>width</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>height</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>sbgnStatesAndInfos</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>expandCollapseStatus</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>highlightStatus</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>visibilityStatus</span></p>

<p class=MsoNormal style='margin-left:2.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>edges</span></p>

<p class=MsoNormal style='margin-left:2.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>[edgeId]</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>id</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>addedLater //to
sync. edge addition</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>sbgnclass</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>source</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>target</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>portsource</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>porttarget</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>highlightColor</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>lineColor</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>width</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>bendPointPositions</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>highlightStatus</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>visibilityStatus</span></p>

<p class=MsoNormal style='margin-left:3.0in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>sbgnCardinality</span></p>

<p class=MsoNormal style='margin-left:1.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>py // pysb-related</span></p>

<p class=MsoNormal style='margin-left:1.5in;text-indent:-.25in'><span
style='font-size:9.0pt;line-height:115%'>_<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</span></span><span style='font-size:9.0pt;line-height:115%'>//biopax-related</span></p>

<p class=MsoNormal style='margin-left:1.0in'>&nbsp;</p>

<h2><a name="_obz6bh2z35gg"></a><a name="_6kwbiqf32gph"></a><a
name="_w8hd3o33ow8k"></a>&nbsp;</h2>

<p class=MsoNormal style='line-height:normal'>&nbsp;</p>

<p class=MsoNormal style='line-height:normal'>&nbsp;</p>

</div>

</body>

</html>
