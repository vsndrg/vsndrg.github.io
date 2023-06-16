#version 300 es
precision highp float;
out vec4 o_color;

in vec2 color;
in vec2 tpos;

uniform float Time;

vec2 mul(vec2 z1, vec2 z2) {
    return vec2(z1.x * z2.x - z1.y * z1.y, z1.x * z2.y + z1.y * z2.x);
}

float Jul(vec2 z, vec2 z0) {
    for(int i = 0; i < 256; i++) {
        if(dot(z, z) > 4.0)
            return float(i);
        z = mul(z, z) + z0;
    }
    return 256.0;
}

void main() {
    float n = 0.0;
    float x0 = -2.0, x1 = 2.0, y0 = -2.0, y1 = 2.0;
    vec2 z;

    z = vec2(x0 + gl_FragCoord.x * (x1 - x0) / 1080.0, y0 + gl_FragCoord.y * (y1 - y0) / 1080.0);
    n = Jul(z, vec2(0.35 + 0.0 * sin(Time), 0.38 + 0.8 * sin(Time))) / 256.0;

    o_color = vec4(n, n / 8.0, n * 8.0, 1);
}