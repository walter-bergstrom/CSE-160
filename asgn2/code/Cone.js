class Cone {
  constructor(segments = 8) {
    this.type = "cone";
    this.position = [0.0, 0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 10.0;
    this.segments = segments;
    this.matrix = new Matrix4();
  }

  render() {
    const { position: xyz, color: rgba, size } = this;
    let colorMult = 1.0;
    const delta = size / 200.0;
    const angleStep = 360.0 / this.segments;

    gl.uniform4f(u_FragColor, ...rgba);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    for (let angle = 0; angle < 360; angle += angleStep) {
      const angle1 = angle * Math.PI / 180;
      const angle2 = (angle + angleStep) * Math.PI / 180;

      const p1 = [xyz[0] + Math.cos(angle1) * delta, xyz[1] + Math.sin(angle1) * delta, xyz[2]];
      const p2 = [xyz[0] + Math.cos(angle2) * delta, xyz[1] + Math.sin(angle2) * delta, xyz[2]];

      // Draw base
      gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
      drawTriangle3D([xyz[0], xyz[1], xyz[2], p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]]);

      // Draw side
      gl.uniform4f(u_FragColor, rgba[0]*colorMult, rgba[1]*colorMult, rgba[2]*colorMult, rgba[3]);
      drawTriangle3D([xyz[0], xyz[1], xyz[2]+0.5, p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]]);

      colorMult -= 0.05;
    }
  }
}
