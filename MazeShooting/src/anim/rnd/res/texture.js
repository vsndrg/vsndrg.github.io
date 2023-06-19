// Textures implementation file
import * as rnd from "../render.js";

class _texture {
  constructor(fileName) {
    this.id = rnd.gl.createTexture();
    rnd.gl.bindTexture(rnd.gl.TEXTURE_2D, this.id);
    rnd.gl.texImage2D(
      rnd.gl.TEXTURE_2D,
      0,
      rnd.gl.RGBA,
      1,
      1,
      0,
      rnd.gl.RGBA,
      rnd.gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 0])
    );

    const img = new Image();
    img.src = fileName;
    img.onload = () => {
      rnd.gl.texImage2D(
        rnd.gl.TEXTURE_2D,
        0,
        rnd.gl.RGBA,
        rnd.gl.RGBA,
        rnd.gl.UNSIGNED_BYTE,
        img
      );
      rnd.gl.generateMipmap(rnd.gl.TEXTURE_2D);
      rnd.gl.texParameteri(
        rnd.gl.TEXTURE_2D,
        rnd.gl.TEXTURE_WRAP_S,
        rnd.gl.REPEAT
      );
      rnd.gl.texParameteri(
        rnd.gl.TEXTURE_2D,
        rnd.gl.TEXTURE_WRAP_T,
        rnd.gl.REPEAT
      );
      rnd.gl.texParameteri(
        rnd.gl.TEXTURE_2D,
        rnd.gl.TEXTURE_MIN_FILTER,
        rnd.gl.LINEAR_MIPMAP_LINEAR
      );
      rnd.gl.texParameteri(
        rnd.gl.TEXTURE_2D,
        rnd.gl.TEXTURE_MAG_FILTER,
        rnd.gl.LINEAR
      );
    };
  }
  apply(shd, texUnit) {
    if (shd == undefined || shd.id == undefined || shd.id == null) return;

    let loc = rnd.gl.getUniformLocation(shd.id, "Texture0");
    rnd.gl.activeTexture(rnd.gl.TEXTURE0 + texUnit);
    rnd.gl.bindTexture(this.type, this.id);
    rnd.gl.uniform1i(loc, texUnit);
  }
}

export function texture(...args) {
  return new _texture(...args);
}
