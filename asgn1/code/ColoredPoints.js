// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
// Vertex shader
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }
`;

// Fragment shader
const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

let gl, a_Position, u_FragColor, u_Size;
let shapesList = [];
let selectedColor = [1.0, 0.0, 0.0, 1.0]; // initial: red
let selectedSize = 10.0;
let selectedSegments = 10;
let brushMode = 'point';             // Current mode: 'point' or 'triangle'
let triangleClickBuffer = [];        // Stores last 3 clicks for triangle drawing



class Point {
  constructor(position, color, size) {
    this.position = position;
    this.color = color;
    this.size = size;
  }

  render() {
    const vertices = new Float32Array([
      this.position[0], this.position[1],
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, ...this.color);
    gl.uniform1f(u_Size, this.size);
    gl.drawArrays(gl.POINTS, 0, 1);

    // Optional: gl.deleteBuffer(vertexBuffer);
  }

}

class Triangle {
  constructor(p1, p2, p3, color) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.color = color;
  }

  static createFromCenter(center, size, color) {
    const [cx, cy] = center;
    const r = size / 200; // scale to WebGL clip space

    const p1 = [cx, cy + r];
    const p2 = [cx - r, cy - r];
    const p3 = [cx + r, cy - r];

    return new Triangle(p1, p2, p3, color);
  }

  render() {
    const vertices = new Float32Array([
      this.p1[0], this.p1[1],
      this.p2[0], this.p2[1],
      this.p3[0], this.p3[1],
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, ...this.color);
    gl.drawArrays(gl.TRIANGLES, 0, 3);


    //gl.deleteBuffer(vertexBuffer);
  }
}

class Circle {
  constructor(vertices, color) {
    this.vertices = vertices;
    this.color = color;
  }

  static createFromCenter(center, size, segments, color) {
    const [cx, cy] = center;
    const r = size / 200;
    const vertices = [];

    // center vertex
    vertices.push(cx, cy);

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      vertices.push(x, y);
    }

    return new Circle(new Float32Array(vertices), color);
  }

  render() {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.uniform4f(u_FragColor, ...this.color);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length / 2);
  }
}



function setupWebGL() {
  const canvas = document.getElementById('webgl');
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('WebGL not supported');
    return false;
  }
  gl.clearColor(0, 0, 0, 1);
  return canvas;
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to init shaders');
    return false;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  return true;
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  for (let shape of shapesList) {
    shape.render();
  }
}

function handleClick(ev, canvas) {
  const [x, y] = convertCoordinates(ev, canvas);

  if (brushMode === 'point') {
    shapesList.push(new Point([x, y], [...selectedColor], selectedSize));
  } else if (brushMode === 'triangle') {
    shapesList.push(Triangle.createFromCenter([x, y], selectedSize, [...selectedColor]));
  } else if (brushMode === 'circle') {
    shapesList.push(Circle.createFromCenter([x, y], selectedSize, selectedSegments, [...selectedColor]));
  }

  renderAllShapes();
}



function convertCoordinates(ev, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) - canvas.width / 2) / (canvas.width / 2);
  const y = (canvas.height / 2 - (ev.clientY - rect.top)) / (canvas.height / 2);
  return [x, y];
}

function getColorByQuadrant(x, y) {
  if (x >= 0 && y >= 0) return [1, 0, 0, 1]; // red
  if (x < 0 && y < 0) return [0, 1, 0, 1];   // green
  return [1, 1, 1, 1];                      // white
}

function updateSelectedColor() {
  const r = document.getElementById('redSlider').value / 100;
  const g = document.getElementById('greenSlider').value / 100;
  const b = document.getElementById('blueSlider').value / 100;

  const alphaSlider = document.getElementById('alphaSlider');
  const a = alphaSlider ? alphaSlider.value / 100 : 1.0;

  selectedColor = [r, g, b, a];
}

function updateSelectedSize() {
  selectedSize = parseFloat(document.getElementById('sizeSlider').value);
}

function drawHouse() {
  // Clear existing drawing
  shapesList = [];

  // House base (brown square = two triangles)
  shapesList.push(new Triangle([-0.3, -0.3], [-0.3, 0.1], [0.3, -0.3], [0.55, 0.27, 0.07, 1])); // bottom left
  shapesList.push(new Triangle([0.3, -0.3], [-0.3, 0.1], [0.3, 0.1], [0.55, 0.27, 0.07, 1]));   // top right

  // Roof (red triangle)
  shapesList.push(new Triangle([-0.4, 0.1], [0.4, 0.1], [0.0, 0.5], [1, 0, 0, 1]));

  // Door (black rectangle = two triangles)
  shapesList.push(new Triangle([-0.05, -0.3], [-0.05, -0.05], [0.05, -0.3], [0, 0, 0, 1]));
  shapesList.push(new Triangle([0.05, -0.3], [-0.05, -0.05], [0.05, -0.05], [0, 0, 0, 1]));

  // Optional window (blue square = two triangles)
  shapesList.push(new Triangle([-0.25, -0.05], [-0.25, 0.05], [-0.15, -0.05], [0.2, 0.5, 1, 1]));
  shapesList.push(new Triangle([-0.15, -0.05], [-0.25, 0.05], [-0.15, 0.05], [0.2, 0.5, 1, 1]));

  renderAllShapes();
}


function main() {
  const canvas = setupWebGL();
  if (!canvas) return;

  if (!connectVariablesToGLSL()) return;

  canvas.onmousedown = (ev) => handleClick(ev, canvas);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


  // Set up slider listeners
  document.getElementById('redSlider').addEventListener('input', updateSelectedColor);
  document.getElementById('greenSlider').addEventListener('input', updateSelectedColor);
  document.getElementById('blueSlider').addEventListener('input', updateSelectedColor);
  const alphaSlider = document.getElementById('alphaSlider');
  if (alphaSlider) {
    alphaSlider.addEventListener('input', updateSelectedColor);
  }
  updateSelectedColor(); // initialize once


  document.getElementById('sizeSlider').addEventListener('input', updateSelectedSize);
  updateSelectedSize();

  document.getElementById('clearButton').addEventListener('click', () => {
    shapesList = [];
    renderAllShapes();
  });

  document.getElementById('pointModeBtn').addEventListener('click', () => {
    brushMode = 'point';
    triangleClickBuffer = [];
  });
  
  document.getElementById('triangleModeBtn').addEventListener('click', () => {
    brushMode = 'triangle';
    triangleClickBuffer = [];
  });

  document.getElementById('circleModeBtn').addEventListener('click', () => {
    brushMode = 'circle';
  });


  document.getElementById('segmentSlider').addEventListener('input', () => {
    selectedSegments = parseInt(document.getElementById('segmentSlider').value);
  });
  selectedSegments = parseInt(document.getElementById('segmentSlider').value);

  document.getElementById('houseButton').addEventListener('click', drawHouse);


  canvas.onmousemove = (ev) => {
    if (ev.buttons === 1) {
      handleClick(ev, canvas);
    }
  };

}
