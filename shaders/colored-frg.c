precision highp float;

uniform vec4 u_color;

void main() {
  gl_FragColor = vec4(u_color.r, u_color.g, u_color.b, u_color.a);
}
