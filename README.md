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

### Install dependencies on Debian/Ubuntu

Install node.js, mongodb and redis servers first.

Node:

```
curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash -
sudo apt-get install -y nodejs
```
```

Mongo:
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com/ --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```
If mongo does not work:
```
sudo apt-get install upstart-sysv
```

### Install dependencies on Mac

```
brew install node
brew install tcl-tk
brew install redis
brew install mongodb
brew install nodejs
```

### Clone from github and install node modules
```
git clone https://github.com/fdurupinar/Sbgnviz-Collaborative-Editor/tree/collaborativeChise
cd Sbgnviz-Collaborative-Editor Chise Version
npm install

### Install cytoscape extensions
cd public
npm install
npm run build-bundle-js
cd ..

```
Running the server
------------------
```
node server
```
In order to open a client enter `http://localhost:3000` in the address bar of your browser.

Computer Agent API
------------------

Computer agents are connected to the node.js http server via websockets
(socket.io.js). An agent is initialized with a *name (string)* and a
unique *ID (string).*

**Constructor**: Agent (string name, string id)

### Public Attributes:

- **agentId**: (string) A unique id
- **agentName**: (string) Agent name
- **colorCode**: A specific color to identify the agent operations. It
should be a string in hsla format as: “hsla(*H*, *S*, *L*%, 1)”, where
*H (integer)*, *S (float)* and *L (float)* are hue, saturation and
lightness values.
- **selectedNode**: The node object on which the agent is performing
operations. It has attributes such as position
{x:< posX >,y:< posY >}, width, height, borderWidth,
borderHeight, backgroundColor, sbgnLabel, sbgnStatesAndInfos =
{clazz:< className >, state =
{value:< stateValue >,variable:< stateVariable >}}.
- **selectedEdge**: The edge object on which the agent is performing
operations. It has attributes such as cardinality, lineColor and width.
- **opHistory**: History of operations as an array of strings in the
format: “*UserName* (*date*): *Command*”.
- **chatHistory**: Chat history as an array of messages.
- **userList**: List of connected user ids.

### Private Attributes:

- **room**: The document id that identifies the shared model. It is the
string after http:<ip>:3000/ in the server address.
- **socket**: The web socket between the server and agent
- **pageDoc**: The document that the shared model is stored.

### Methods:

 **Name**                | **Function**                                                                                                                     |      **Parameters**              |       **Returns**                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------- |
|  connectToServer        | Connects the server and returns socket.io socket     |     url, callback           | socket                              |
|  disconnect        | Disconnects from server    |      callback         |
|  loadModel              | Gets the model for the current room        |     callback  | |                                                                              |
|  loadOperationHistory   | Gets history of operations from the node.js server and assigns them to opHistory  |     callback ||
|  getUserList           | returns userList                                                              |     |                                                                               |
|  loadChatHistory        | Gets history of chat messages from the node.js server and assigns them to chatHistory    |  callback    |       |
|  getNodeList            |                                                                                                                                  |      callback                    |   The node list in the shared model as an object of node ids                  |
|  getLayoutProperties    |                                                                                                                                  |     callback                     |  Layout properties of the shared model as an object with attributes as:       |
|                         |                                                                                                                                  |                                  |   {name: < layout name >,                                                       |
|                         |                                                                                                                                  |                                  |   nodeRepulsion: < node repulsion value > ,                                     |
|                         |                                                                                                                                  |                                  |   nodeOverlap:< node overlap percentage >,                                      |
|                         |                                                                                                                                  |                                  |   idealEdgeLength:< ideal edge length value >,                                  |
|                         |                                                                                                                                  |                                  |   edgeElasticity:< edge elasticity value >,                                     |
|                         |                                                                                                                                  |                                  |   nestingFactor:< nesting factor value >,                                       |
|                         |                                                                                                                                  |                                  |   gravity:< gravity value >,                                                    |
|                         |                                                                                                                                  |                                  |   numIter:< number of iterations >,                                             |
|                         |                                                                                                                                  |                                  |     tile:< boolean value to tile disconnected >,                                |
|                         |                                                                                                                                  |                                  |   animate:< boolean value >,                                                    |
|                         |                                                                                                                                  |                                  |   randomize:< boolean value >}                                                  |
|  getGeneralProperties    |                                                                                                                                  |     callback                     | General properties of the shared model as an object |
|  getGridProperties    |                                                                                                                                  |     callback                     |  |Grid properties of the shared model as an object|
|  changeName             | Sends request to the server to change agent's name                                                                               |       newName                    |                                                                               |
|  getNodeRequest         | Requests the node with < id > from the server                                                                                      |     id, callback                 |  Node with id                                                                 |
|  getEdgeRequest         | Requests the edge with < id > from the server                                                                                      |      id, callback                |   Edge with id                                                                |
|  agentMessage            | Sends chat message < comments > as a string to < targets > as an array of targeted user ids \[{id: < id1 >},..., {id: < idn >}\]       |    comment, targets, callback  |                                                                               |
|  listen                 | Socket listener for server requests. Can get “operation”, “message”, “userList” or “imageFile” from the server.                  |   callback                       |                                                                               |
|  sendRequest            | Sends an operation request to the node.js server. Model update operations are done using this method.                            |  [*reqName, param*](#sendrequest)|                                                                               |


#### sendRequest:


 **reqName**                          |  **param**                                                                         |
| ----------------------------------- | ---------------------------------------------------- |
| “agentAddImageRequest”              | {img: < image file >,                         |
|                                     | filePath: < path of image file > }             |
| "agentSetLayoutPropertiesRequest"   | {name: < layout name >,                       |
|                                     | nodeRepulsion: < node repulsion value > ,        |
|                                     | nodeOverlap:< node overlap percentage >,          |
|                                     | idealEdgeLength:< ideal edge length value >,      |
|                                     | edgeElasticity:< edge elasticity value >,    |
|                                     | nestingFactor:< nesting factor value >,      |
|                                     | gravity:< gravity value >,   |
|                                     | numIter:< number of iterations >,|
|                                     | tile:< boolean value to tile disconnected >,|
|                                     | animate:< boolean value >,    |
|                                     | randomize:< boolean value >}  |
|"agentSetGeneralPropertiesRequest"  |  |
|"agentSetGridPropertiesRequest"  |  |
|  “agentRunLayoutRequest”            | -                           |
|  “agentAddNodeRequest”              | {x: < position x >,           |
|                                     | y: < position y >,         |
|                                     | class: < sbgn class >}   |
|  “agentAddEdgeRequest”              | {source: < source node id >,  |
|                                     | target: < target node id >,   |
|                                     | class: < sbgn class >}    |
|"agentSearchByLabelRequest"          | {label: < label to be highlighted>}   |
|"agentDeleteElesRequest"             | {type: <"smart" or "simple" < elementIds: <element ids to delete simply>} |
|"agentUpdateVisibilityStatusRequest"       | {val:<"hide" or "show" or "showAll">,  elementIds:<array of element ids or null for showAll>|
|"agentUpdateHighlightStatusRequest"       | {val:<"neighbors" or "processes" or "remove">,  elementIds:<array of element ids or null for remove>|
|"agentUpdateExpandCollapseStatusRequest"       | {val:<"expand" or "collapse">,  elementIds:<array of element ids>|
| “agentChangeNodeAttributeRequest”  | {id: < node id >,             |
|                                     | attStr: < node attribute name in the model >             |
|                                     | attVal:< node attribute value >}                          |
|                                     | attStr takes the following values: “data”, “data.bbox”, “data.bbox.w”, “data.bbox.h”, “data.class”, “data.cloneMarker”, "data.font-family", "data.font-size", "data.font-weight", "data.font-style", "data.statesandinfos", "data.label", "data.labelsize", "data.parent", "data.ports", "data.border-width", "data.background-color", "data.background-opacity", "highlightColor, expandCollapseStatus", "highlightStatus", "visibilityStatus"   |
|  “agentChangeEdgeAttributeRequest”  | {id: < node id >,                                   |
|                                     | attStr: < edge attribute name in the model >        |
|                                     | attVal:< edge attribute value >}                     |
|                                     | attStr takes the following values: “data.source”, “data.target”, “data.portsource”, “data.porttarget”, “data.class”,   “data.line-color”,  “data.width”, “data.cardinality”,“highlightColor”, "visibilityStatus", "highlightStatus" , "bendPoints"   |
|  “agentMoveNodeRequest”             | {id: < node id >,   pos: {x:< new position x >, y: <  new position y >}}                   |
|  “agentAlignRequest”               | {nodeIds: < node ids to align >, horizontal:<"top", "bottom", "center", "none">, vertical:<"top", "bottom", "center", "none"> , alignTo:<node id to align nodes with nodeIds>     |
|  “agentAddCompoundRequest”          | {type: < compound type as “complex” or “compartment” >,              |
|                                     | selectedNodeArr: < array of node ids >}                              |
|		"agentActiveRoomsRequest"					| -																																			|
|   "agentUndoRequest"          |   |
|   "agentRedoRequest"          |   |


In order to set up and run an agent:

```javascript
agent = new Agent(agentName, agentId);
    var socket = agent.connectToServer(serverIp, function(){
        //callback operations


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

        socket.on('processToIntegrate', function(data){
            //callback operations
        });
    });

});
```
An example web-based agent can be found in: `Sbgnviz-Collaborative-Editor/agent-interaction/computerAgent.html`

Command History:

JSON array as:
```
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
        class: //node or edge sbgnclass
        source: //edge source
        target: //edge target
        }
    ]
    date: //date of the command
    }
]
```

History Manager
---------------

Each command is stored in the model as a part of command history.
Command structure is as follows:

- opName: set | add | delete | init
- opTarget: node | edge | node group | edge group
- opAttr: id| position | sbgnclass | sbgnlabel | width | height |
backgroundColor | borderColor | borderWidth | parent | isCloneMarker |
isMultimer | sbgnStatesAndInfos| source| target |lineColor | lineWidth|
sbgncardinality
- elId: id of the node or edge | id array of the node or edge group
- elType: "node" or "edge"
- param:
- prevParam:

### JSON Model Structure

-   users
    -   name
-   page
    -   list
    -   room
    -   doc
        -   userIds
        -   history
        -   undoIndex
        -   Images
        -   Context
            -   name
            -   relevance
            -   confidence
        -   cy //sbgn-related
            -   layoutProperties
            -   nodes
                -   \[nodeId\]
                    -   addedLater //to sync. node addition
                    -   visibilityStatus
                    -   highlightStatus
                    -   expandCollapseStatus
                    -   highlightColor
                    -   position
                    -   data
                        -   id
                        -   class
                        -   label
                        -   bbox
                            -   w
                            -   h
                        -   border-color
                        -   border-width
                        -   background-color
                        -   background-opacity
                        -   font-color
                        -   font-weight
                        -   font-style
                        -   font-size
                        -   cloneMarker
                        -   parent
                        -   ports
                        -   statesAndInfos

            -   edges
                -   \[edgeId\]
                    -   id
                    -   addedLater //to sync. edge addition
                    -   highlightStatus
                    -   visibilityStatus
                    -   expandCollapseStatus
                    -   highlightColor
                    -   bendPoints
                    -   data
                        -   class
                        -   source
                        -   target
                        -   portsource
                        -   porttarget
                        -   line-color
                        -   width
                        -   bendPointPositions
                        -   cardinality
        -   py // pysb-related
        -   //biopax-related

