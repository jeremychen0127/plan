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

function getColSize(numSets) {
  if (numSets === 1) {
    return 12;
  } else if (numSets === 3) {
    return /*ORIG 3*/'1.5';
  }
  if (numSets <= 4) {
    return 12 / numSets;
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

var DATA_SET1 = [
{
  name: 'dQ1',
  variableOrdering: ['a1', 'a2', 'a3'],
  sink: 'Kafka',
  stages: [
    [{graphVersion: DELTA_GRAPH, variable: 'a1', direction: OUTGOING, edgeType: ETYPE}],
    [{graphVersion: CURRENT_GRAPH, variable: 'a1', direction: INCOMING, edgeType: ETYPE},
     {graphVersion: CURRENT_GRAPH, variable: 'a2', direction: OUTGOING, edgeType: ETYPE}]
  ]
},
{
  name: 'dQ2',
  variableOrdering: ['a2', 'a3', 'a1'],
  sink: 'Kafka',
  stages: [
    [{graphVersion: DELTA_GRAPH, variable: 'a2', direction: OUTGOING, edgeType: ETYPE}],
    [{graphVersion: NEW_GRAPH, variable: 'a2', direction: INCOMING, edgeType: ETYPE},
     {graphVersion: CURRENT_GRAPH, variable: 'a3', direction: OUTGOING, edgeType: ETYPE}]
  ]
},
{
  name: 'dQ3',
  variableOrdering: ['a3', 'a1', 'a2'],
  sink: 'Kafka',
  stages: [
    [{graphVersion: DELTA_GRAPH, variable: 'a3', direction: OUTGOING, edgeType: ETYPE}],
    [{graphVersion: NEW_GRAPH, variable: 'a3', direction: INCOMING, edgeType: ETYPE},
     {graphVersion: NEW_GRAPH, variable: 'a1', direction: OUTGOING, edgeType: ETYPE}]
  ]
}];

var stageSet = '';
stageSet += '<div class="row" id="planContainer"></div>';
$("#stageSet").append(stageSet);

var colSize = getColSize(DATA_SET.length);
for (var k = 0; k < DATA_SET.length; ++k) {
  stageSet = '';
  //ORIG stageSet += '<div class="col s' + colSize + '">';
  stageSet += '<div class="col s' + colSize + (k === 0 && DATA_SET.length > 1 ? ' offset-s3' : '') + '">';
  stageSet += '<div id="name' + k + '"></div>';
  stageSet += '<div id="ordering' + k + '"></div>';
  stageSet += '<div id="stages' + k + '"></div>';
  stageSet += '</div>';
  $("#planContainer").append(stageSet);
  createPlan(DATA_SET[k], k);
}

function createPlan(DATA, id) {
  var name = '<h3 class="center">' + DATA.name + '</h3>';
  $('#name' + id).append(name);
  var ordering = '<h3 class="center">GJ Variable Ordering:<br />' + DATA.variableOrdering.join(', ') + '</h3>';
  $('#ordering' + id).append(ordering);

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
  $('#stages' + id).append(sink);
  var arrow = '<div class="center arrow"></div>';
  // ORIG: var arrowWithOutput = '<div class="center arrow"><div class="output">Output: <i>(';
  var arrowWithOutput = '<div class="center arrow"><div class="output"><i>(';
  var orderingArrayCopy = DATA.variableOrdering.slice();
  for (i = stageContainers.length - 1; i >= 0; --i) {
    var finalOutput = arrowWithOutput + orderingArrayCopy.join(', ') + ')</i></div></div>';
    if (i != 0) {
      $('#stages' + id).append(finalOutput);
    } else {
      $('#stages' + id).append(arrow);
    }
    orderingArrayCopy.pop();
    $('#stages' + id).append(stageContainers[i]);
  }
}
