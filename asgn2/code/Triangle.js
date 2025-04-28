class Triangle {
  constructor(exactVertices = null) {
    this.type = "triangle";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.exactTri = exactVertices;
  }

  render() {
    const { position: xy, color: rgba, size } = this;
    const delta = size / 200.0;

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], xy[2]);
    gl.uniform4f(u_FragColor, ...rgba);
    gl.uniform1f(u_Size, size);

    // Use exact triangle or default
    if (this.exactTri) {
      drawTriangle(this.exactTri);
    } else {
      drawTriangle([xy[0], xy[1], xy[0] + delta, xy[1], xy[0], xy[1] + delta]);
    }
  }
}

// Helper to draw 2D triangle
function drawTriangle(vertices) {
  const n = 3;
  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create buffer object");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Helper to draw 3D triangle
function drawTriangle3D(vertices) {
  const n = 3;
  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create buffer object");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
