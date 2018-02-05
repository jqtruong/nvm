precision mediump float;

attribute vec2 a_position;
attribute vec4 a_color;

uniform mat4 u_model_matrix;
uniform mat4 u_view_matrix;
uniform mat4 u_projection_matrix;

varying vec4 v_color;

void main(void) {
  gl_Position = u_projection_matrix * u_model_matrix * vec4(a_position, 0.0, 1.0);
  v_color = vec4(1.0, 1.0, 0, 1.0);
}
