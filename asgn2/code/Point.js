class Point {
  constructor() {
    this.type = "point";
    this.position = [0.0, 0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }

  render() {
    const { position: xy, color: rgba, size } = this;

    gl.disableVertexAttribArray(a_Position);

    // Set attributes
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    gl.uniform4f(u_FragColor, ...rgba);
    gl.uniform1f(u_Size, size);

    // Draw point
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
