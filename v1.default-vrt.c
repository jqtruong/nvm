precision mediump float;

attribute vec3 a_position;
attribute vec4 a_color;

uniform mat4 u_model_matrix;
uniform mat4 u_view_matrix;
uniform mat4 u_projection_matrix;

varying vec4 v_color;

void main(void) {
  gl_Position = u_matrix_model * vec4(a_position, 1.0);
  v_color = a_color;
}
