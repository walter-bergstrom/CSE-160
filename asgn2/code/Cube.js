class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.matrix = new Matrix4();
  }

  render() {
    gl.uniform4f(u_FragColor, ...this.color);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front
    drawTriangle3D([0, 0, 0, 1, 1, 0, 1, 0, 0]);
    drawTriangle3D([0, 0, 0, 0, 1, 0, 1, 1, 0]);

    // Top
    gl.uniform4f(u_FragColor, this.color[0]*0.9, this.color[1]*0.9, this.color[2]*0.9, this.color[3]);
    drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);
    drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);

    // Bottom
    gl.uniform4f(u_FragColor, this.color[0]*0.7, this.color[1]*0.7, this.color[2]*0.7, this.color[3]);
    drawTriangle3D([0, 0, 0, 1, 0, 0, 1, 0, 1]);
    drawTriangle3D([0, 0, 0, 0, 0, 1, 1, 0, 1]);

    // Left
    gl.uniform4f(u_FragColor, this.color[0]*0.8, this.color[1]*0.8, this.color[2]*0.8, this.color[3]);
    drawTriangle3D([0, 0, 0, 0, 1, 0, 0, 1, 1]);
    drawTriangle3D([0, 0, 0, 0, 0, 1, 0, 1, 1]);

    // Right
    drawTriangle3D([1, 0, 0, 1, 1, 0, 1, 1, 1]);
    drawTriangle3D([1, 0, 0, 1, 0, 1, 1, 1, 1]);

    // Back
    gl.uniform4f(u_FragColor, this.color[0]*0.7, this.color[1]*0.7, this.color[2]*0.7, this.color[3]);
    drawTriangle3D([0, 0, 1, 1, 0, 1, 1, 1, 1]);
    drawTriangle3D([0, 0, 1, 0, 1, 1, 1, 1, 1]);
  }
}
