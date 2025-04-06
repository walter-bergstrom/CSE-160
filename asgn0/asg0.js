// DrawRectangle.js
function main() {
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return;
  }

  var ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var x1 = parseFloat(document.getElementById('xInput').value);
  var y1 = parseFloat(document.getElementById('yInput').value);
  var v1 = new Vector3([x1, y1, 0]);
  drawVector(v1, "red");

  var x2 = parseFloat(document.getElementById('x2Input').value);
  var y2 = parseFloat(document.getElementById('y2Input').value);
  var v2 = new Vector3([x2, y2, 0]);
  drawVector(v2, "blue");
}

function drawVector(v, color) {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.strokeStyle = color;
  ctx.beginPath();

  var originX = 200;
  var originY = 200;

  var endX = originX + v.elements[0] * 20;
  var endY = originY - v.elements[1] * 20;

  ctx.moveTo(originX, originY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var x1 = parseFloat(document.getElementById('xInput').value);
  var y1 = parseFloat(document.getElementById('yInput').value);
  var v1 = new Vector3([x1, y1, 0]);
  drawVector(v1, "red");

  var x2 = parseFloat(document.getElementById('x2Input').value);
  var y2 = parseFloat(document.getElementById('y2Input').value);
  var v2 = new Vector3([x2, y2, 0]);
  drawVector(v2, "blue");

  var operation = document.getElementById('operation').value;
  var scalar = parseFloat(document.getElementById('scalar').value);

  if (operation === 'add') {
    var v3 = new Vector3([x1, y1, 0]);
    v3.add(v2);
    drawVector(v3, "green");
  } else if (operation === 'sub') {
    var v3 = new Vector3([x1, y1, 0]);
    v3.sub(v2);
    drawVector(v3, "green");
  } else if (operation === 'mul') {
    var v3 = new Vector3([x1, y1, 0]);
    var v4 = new Vector3([x2, y2, 0]);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (operation === 'div') {
    var v3 = new Vector3([x1, y1, 0]);
    var v4 = new Vector3([x2, y2, 0]);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, "green");
    drawVector(v4, "green");
  }
    else if (operation === 'magnitude') {
    console.log("v1 magnitude: " + v1.magnitude());
    console.log("v2 magnitude: " + v2.magnitude());
  } else if (operation === 'normalize') {
    var v3 = new Vector3([x1, y1, 0]);
    var v4 = new Vector3([x2, y2, 0]);
    v3.normalize();
    v4.normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
  }
    else if (operation === 'angle') {
    var angle = angleBetween(v1, v2);
    console.log("Angle: " + angle);
  }
    else if (operation === 'area') {
    var area = areaTriangle(v1, v2);
    console.log("Area of the triangle: " + area);
  } 
}


function angleBetween(v1, v2) {
  var dotProduct = Vector3.dot(v1, v2);
  var mag1 = v1.magnitude();
  var mag2 = v2.magnitude();
  var cosTheta = dotProduct / (mag1 * mag2);
  var angleRad = Math.acos(cosTheta);
  var angleDeg = angleRad * (180 / Math.PI);
  return angleDeg;
}

function areaTriangle(v1, v2) {
  var cross = Vector3.cross(v1, v2);
  var area = cross.magnitude() / 2;
  return area;
}




