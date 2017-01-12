$.getJSON("http://localhost:8000", function(data, status, xhr) {
  document.write(data);
});

function createFilter(intersectionRule) {
  return '<div class="center stage"><b>Filter:</b> Type=' + intersectionRule.edgeType + '</div>';
}

function hasEdgeType(intersectionRules) {
  for (var i = 0; i < intersectionRules.length; ++i) {
    if (intersectionRules[i].hasOwnProperty(EDGE_TYPE)) {
      return true;
    }
  }
  return false;
}

var OUTGOING = 'Outgoing';
var INCOMING = 'Incoming';
var ETYPE = 'Transfer';
var EDGE_TYPE = 'edgeType';

var DATA = {
  variableOrdering: ['a', 'c', 'd', 'b'],
  sink: 'In-memory',
  stages: [
    [{graphVersion: 'Current', variable: 'a', direction: OUTGOING, edgeType: ETYPE}],
    [{graphVersion: 'Current', variable: 'a', direction: INCOMING},
     {graphVersion: 'Current', variable: 'c', direction: OUTGOING}],
    [{graphVersion: 'Current', variable: 'a', direction: INCOMING, edgeType: ETYPE},
     {graphVersion: 'Current', variable: 'c', direction: OUTGOING},
     {graphVersion: 'Current', variable: 'b', direction: OUTGOING, edgeType: ETYPE}]
  ]
};

var ordering = '<h3 class="center">GJ Variable Ordering: ' + DATA.variableOrdering.join(', ') + '</h3><br />';
$('#ordering').append(ordering);

var stages = DATA.stages;
var stageContainers = [];
var filter;
var stage1Container = '<div id="stage1" class="center stage"><b>Scan:</b> <i>' + stages[0][0].variable + '</i> - ' + stages[0][0].direction + ', '
stage1Container += 'GraphVersion=' + stages[0][0].graphVersion + '<br />';
stageContainers.push(stage1Container);
if (stages[0][0].hasOwnProperty(EDGE_TYPE)) {
  stageContainers.push(createFilter(stages[0][0]));
}

for (var i = 1; i < stages.length; ++i) {
  var intersectionRules = stages[i];
  var stageContainer = '<div class="center stage">';
  if (hasEdgeType(intersectionRules)) {
    stageContainer += '<h3>Filter-And-Intersection</h3>';
  } else {
    stageContainer += '<h3>Intersection</h3>';
  }

  for (var j = 0; j < intersectionRules.length; ++j) {
    stageContainer += '<div class="center stage innerStage"><i>' + intersectionRules[j].variable + '</i> - ';
    stageContainer += intersectionRules[j].direction + ', GraphVersion=' + intersectionRules[j].graphVersion + '<br />';
    if (intersectionRules[j].hasOwnProperty(EDGE_TYPE)) {
      stageContainer += '<b>Filter:</b> Type=' + intersectionRules[j].edgeType;
    }
    stageContainer += '</div>';
  }

  stageContainer += '</div>';
  stageContainers.push(stageContainer);
}

var sink = '<div class="center stage"><b>Sink:</b> ' + DATA.sink + '</div>';
$('#stages').append(sink);
var arrow = '<div class="center arrow"></div>';
var arrowWithOutput = '<div class="center arrow"><div class="output">Output: <i>(';
var outputString = DATA.variableOrdering.join(', ') + ', ';
for (i = stageContainers.length - 1; i >= 0; --i) {
  var finalOutput = arrowWithOutput + outputString.substring(0, outputString.length - 2) + ')</i></div></div>';
  if (i != 0) {
    $('#stages').append(finalOutput);
  } else {
    $('#stages').append(arrow);
  }
  outputString = outputString.substring(0, outputString.length - 3);
  $('#stages').append(stageContainers[i]);
}
