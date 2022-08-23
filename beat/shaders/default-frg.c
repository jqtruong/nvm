precision highp float;

uniform float u_alpha;
varying vec4 v_positionWithOffset;

void main() {
  vec3 color = vec3(vec2(v_positionWithOffset.r,
                         v_positionWithOffset.g) * .5  + .5,
                    (v_positionWithOffset.g/v_positionWithOffset.r) * .5 + .5);
  gl_FragColor = vec4(color, color.b/color.g);
}
