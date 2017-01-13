$.getJSON("http://localhost:8000", function(data, status, xhr) {
  document.write(data);
});

var NEW_GRAPH = 'New';
var CURRENT_GRAPH = 'Current';
var DELTA_GRAPH = 'Delta';
var OUTGOING = 'Outgoing';
var INCOMING = 'Incoming';
var ETYPE = 'transfer';
var EDGE_TYPE = 'edgeType';

function createFilter(intersectionRule) {
  return 
}

function hasEdgeType(intersectionRules) {
  for (var i = 0; i < intersectionRules.length; ++i) {
    if (intersectionRules[i].hasOwnProperty(EDGE_TYPE)) {
      return true;
    }
  }
  return false;
}

function getGraphVersionBox(graphVersion) {
  result = '<div class="graphVersionBox '
  if (graphVersion === NEW_GRAPH) {
    result += 'newGraph">N';
  } else if (graphVersion === CURRENT_GRAPH) {
    result += 'currentGraph">C';
  } else if (graphVersion === DELTA_GRAPH) {
    result += 'deltaGraph">&Delta;';
  } else {
    console.log("UNEXPECTED GRAPH VERSION");
    return '';
  }
  result += '</div>';
  return result;
}

function getDirectionSymbol(direction) {
  if (direction === OUTGOING) {
    return '------>';
  } else if (direction === INCOMING) {
    return '<------';
  } else {
    console.log("UNEXPECTED GRAPH VERSION");
    return '';
  }
}

var DATA_SET = [
{
  name: 'Q',
  variableOrdering: ['a1', 'a2', 'a3'],
  sink: 'InMemorySink',
  stages: [
    [{graphVersion: CURRENT_GRAPH, variable: 'a1', direction: OUTGOING, edgeType: ETYPE}],
    [{graphVersion: CURRENT_GRAPH, variable: 'a1', direction: INCOMING, edgeType: ETYPE},
     {graphVersion: CURRENT_GRAPH, variable: 'a2', direction: OUTGOING, edgeType: ETYPE}]
  ]
}];

var stageSet = '';
if (DATA_SET.length === 1) {
  stageSet += '<div class="row">';
  stageSet += '<div class="col s12">';
  stageSet += '<div id="name1"></div>';
  stageSet += '<div id="ordering1"></div>';
  stageSet += '<div id="stages1"></div>';
  stageSet += '</div></div>';

  $("#stageSet").append(stageSet);
} else {
  stageSet += '<div class="row">';
  for (var i = 0; i < DATA_SET.length; ++i) {
  }
}

var DATA = DATA_SET[0];

var name = '<h3 class="center">' + DATA.name + '</h3>';
$('#name1').append(name);
var ordering = '<h3 class="center">GJ Variable Ordering: ' + DATA.variableOrdering.join(', ') + '</h3><br />';
$('#ordering1').append(ordering);

var stages = DATA.stages;
var stageContainers = [];
var filter;
var stage1Container = '<div id="stage1" class="center stage"><b>Scan:</b> <i>' + stages[0][0].variable + '</i> : ';
stage1Container += getGraphVersionBox(stages[0][0].graphVersion);
stage1Container += getDirectionSymbol(stages[0][0].direction) + '</div>';
stageContainers.push(stage1Container);
if (stages[0][0].hasOwnProperty(EDGE_TYPE)) {
  var stage1Filter = '<div class="center stage"><h3 style="margin-bottom: 0px">Filter</h3><b>&sigma;:</b> type=' + stages[0][0].edgeType + '</div>';
  stageContainers.push(stage1Filter);
}

for (i = 1; i < stages.length; ++i) {
  var intersectionRules = stages[i];
  var stageContainer = '<div class="center stage">';
  if (hasEdgeType(intersectionRules)) {
    stageContainer += '<h3>Intersection-And-Filter</h3>';
  } else {
    stageContainer += '<h3>Intersection</h3>';
  }

  for (var j = 0; j < intersectionRules.length; ++j) {
    if (j != 0) {
      stageContainer += '<div>&cap;</div>';
    }
    stageContainer += '<div class="center stage innerStage"><i>' + intersectionRules[j].variable + '</i> : ';
    stageContainer += getGraphVersionBox(intersectionRules[j].graphVersion);
    stageContainer += getDirectionSymbol(intersectionRules[j].direction) + '<br />';
    if (intersectionRules[j].hasOwnProperty(EDGE_TYPE)) {
      stageContainer += '<b>&sigma;:</b> type=' + intersectionRules[j].edgeType;
    }
    stageContainer += '</div>';
  }

  stageContainer += '</div>';
  stageContainers.push(stageContainer);
}

var sink = '<div class="center stage"><b>Sink:</b> ' + DATA.sink + '</div>';
$('#stages1').append(sink);
var arrow = '<div class="center arrow"></div>';
var arrowWithOutput = '<div class="center arrow"><div class="output">Output: <i>(';
var orderingArrayCopy = DATA.variableOrdering.slice();
for (i = stageContainers.length - 1; i >= 0; --i) {
  var finalOutput = arrowWithOutput + orderingArrayCopy.join(', ') + ')</i></div></div>';
  if (i != 0) {
    $('#stages1').append(finalOutput);
  } else {
    $('#stages1').append(arrow);
  }
  orderingArrayCopy.pop();
  $('#stages1').append(stageContainers[i]);
}
