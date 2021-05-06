precision highp float;
attribute vec4 aPosition;

varying vec4 v_positionWithOffset;

void main() {
  gl_Position = aPosition;
  gl_PointSize = 10.0;
  v_positionWithOffset = aPosition;
}
