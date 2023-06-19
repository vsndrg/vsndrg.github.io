// Shaders implementation file
import * as rnd from "../render.js";

export let shaders = [];
export let shadersSize = 0;

export class _shader {
  constructor(shaderFileNamePrefix) {
    this.name = shaderFileNamePrefix;
    this.vertText = fetchShader(
      "../../../../bin/shaders/" + shaderFileNamePrefix + "/vert.glsl"
    );
    this.fragText = fetchShader(
      "../../../../bin/shaders/" + shaderFileNamePrefix + "/frag.glsl"
    );
  }

  add(vs, fs) {
    const vertexSh = load(rnd.gl.VERTEX_SHADER, vs);
    const fragmentSh = load(rnd.gl.FRAGMENT_SHADER, fs);

    this.program = rnd.gl.createProgram();
    rnd.gl.attachShader(this.program, vertexSh);
    rnd.gl.attachShader(this.program, fragmentSh);
    rnd.gl.linkProgram(this.program);

    if (!rnd.gl.getProgramParameter(this.program, rnd.gl.LINK_STATUS)) {
      alert("Error link program!");
    }

    shaders[shadersSize] = {
      name: 0,
      program: -1,
    };
    shaders[shadersSize].name = this.name;
    shaders[shadersSize].program = this.program;
    return shaders[shadersSize++];
  }
}

export function load(type, source) {
  const shader = rnd.gl.createShader(type);

  rnd.gl.shaderSource(shader, source);
  rnd.gl.compileShader(shader);

  if (!rnd.gl.getShaderParameter(shader, rnd.gl.COMPILE_STATUS)) {
    alert(
      "Error load " +
        (type === rnd.gl.VERTEX_SHADER ? "vertex" : "fragment") +
        " shader: " +
        rnd.gl.getShaderInfoLog(shader)
    );
  }

  return shader;
}

export async function fetchShader(shaderURL) {
  try {
    const response = await fetch(shaderURL);
    const text = await response.text();

    return text;
  } catch (err) {
    console.error(err);
  }
}

// eslint-disable-next-line no-unused-vars
export function shader(...args) {
  // eslint-disable-next-line no-undef
  return new _shader(...args);
}
