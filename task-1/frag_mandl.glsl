#version 300 es
precision highp float;
out vec4 o_color;

in vec2 color;
in vec2 tpos;

uniform float Scale;
uniform vec2 Coord;
uniform vec4 DistLRBT;

vec2 mul(vec2 z1, vec2 z2) {
    return vec2(z1.x * z2.x - z1.y * z1.y, z1.x * z2.y + z1.y * z2.x);
}

float Mandl(vec2 z, vec2 z0) {
    for(int i = 0; i < 256; i++) {
        if(dot(z, z) > 4.0)
            return float(i);
        z = mul(z, z) + z0;
    }
    return 256.0;
}

void main(void) {
    float n = 0.0;
    // float x = 2.0 / pow(10.0, Scale * 0.0005);
    float x = 1.5;
    float x0 = -x/* - DistLRBT.x * 2.0*/, x1 = x/* + DistLRBT.y * 2.0*/, y0 = -x/* - DistLRBT.w * 2.0*/, y1 = x/* + DistLRBT.z * 2.0*/;
    vec2 z;

    z = vec2(x0 + gl_FragCoord.x * (x1 - x0) / 1080.0 - 1920.0 / 2.0 / 1080.0, y0 + gl_FragCoord.y * (y1 - y0) / 1080.0);
    n = Mandl(z, z) / 255.0;

    o_color = vec4(n, n * 4.0, n / 8.0, 1);
}