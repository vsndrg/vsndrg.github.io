// Primitives handle module
import { mat4, vec3, vec2, vec4 } from "../../mth/mth.js";
import { anim } from "../../main.js";
import { vertex, toArray, autoNormals } from "./vertex.js";
import { rnd, mtl } from "./res/resource.js";

// Primitive class
class _prim {
  constructor(type, vertexArray, indexArray, mtlNo) {
    if (vertexArray != null) {
      // Generate and bind vertex buffer
      this.vBuf = rnd.gl.createBuffer();
      rnd.gl.bindBuffer(rnd.gl.ARRAY_BUFFER, this.vBuf);
      // Generate and bind vertex array
      this.vA = rnd.gl.createVertexArray();
      rnd.gl.bindVertexArray(this.vA);

      // Upload data
      rnd.gl.bufferData(
        rnd.gl.ARRAY_BUFFER,
        new Float32Array(vertexArray),
        rnd.gl.STATIC_DRAW
      );
      rnd.gl.vertexAttribPointer(0, 3, rnd.gl.FLOAT, false, 4 * 12, 0);
      rnd.gl.vertexAttribPointer(1, 2, rnd.gl.FLOAT, false, 4 * 12, 4 * 3);
      rnd.gl.vertexAttribPointer(2, 3, rnd.gl.FLOAT, false, 4 * 12, 4 * 5);
      rnd.gl.vertexAttribPointer(3, 4, rnd.gl.FLOAT, false, 4 * 12, 4 * 8);
      rnd.gl.enableVertexAttribArray(0);
      rnd.gl.enableVertexAttribArray(1);
      rnd.gl.enableVertexAttribArray(2);
      rnd.gl.enableVertexAttribArray(3);
      rnd.gl.bindVertexArray(null);
    }
    if (indexArray != null) {
      // Generate and bind index buffer
      this.iBuf = rnd.gl.createBuffer();
      rnd.gl.bindBuffer(rnd.gl.ELEMENT_ARRAY_BUFFER, this.iBuf);

      // Upload data
      rnd.gl.bufferData(
        rnd.gl.ELEMENT_ARRAY_BUFFER,
        new Int32Array(indexArray),
        rnd.gl.STATIC_DRAW
      );
      this.numOfElements = indexArray.length;
    } else if (indexArray == null && vertexArray != null) {
      this.numOfElements = vertexArray.length;
    } else this.numOfElements = 0;
    this.transMatrix = mat4();
    if (type != null) {
      this.mtlNo = mtlNo;
      this.type = type;
    }
  }

  // Primitive drawing function
  draw(worldMatrix) {
    if (worldMatrix == undefined) worldMatrix = mat4();
    const w = mat4().mul2(this.transMatrix, worldMatrix);
    const winv = mat4(w).inverse().transpose();
    const wvp = mat4(w).mul(anim.camera.matrVP);

    const progId = mtl.materials[this.mtlNo].apply(this.mtlNo);

    let loc;
    // Pass matrices
    if ((loc = rnd.gl.getUniformLocation(progId, "MatrW")) != -1)
      rnd.gl.uniformMatrix4fv(loc, false, new Float32Array(w.toArray()));
    if ((loc = rnd.gl.getUniformLocation(progId, "MatrWInv")) != -1)
      rnd.gl.uniformMatrix4fv(loc, false, new Float32Array(winv.toArray()));
    if ((loc = rnd.gl.getUniformLocation(progId, "MatrWVP")) != -1)
      rnd.gl.uniformMatrix4fv(loc, false, new Float32Array(wvp.toArray()));

    // Pass material data
    if ((loc = rnd.gl.getUniformLocation(progId, "Ka")) != -1) {
      let ka = mtl.materials[this.mtlNo].ka;
      rnd.gl.uniform3f(loc, ka.x, ka.y, ka.z);
    }
    if ((loc = rnd.gl.getUniformLocation(progId, "Kd")) != -1) {
      let kd = mtl.materials[this.mtlNo].kd;
      rnd.gl.uniform3f(loc, kd.x, kd.y, kd.z);
    }
    if ((loc = rnd.gl.getUniformLocation(progId, "Ks")) != -1) {
      let ks = mtl.materials[this.mtlNo].ks;
      rnd.gl.uniform3f(loc, ks.x, ks.y, ks.z);
    }
    if ((loc = rnd.gl.getUniformLocation(progId, "Ph")) != -1)
      rnd.gl.uniform1f(loc, mtl.materials[this.mtlNo].ph);

    // Pass time
    if ((loc = rnd.gl.getUniformLocation(progId, "Time")) != -1)
      rnd.gl.uniform1f(loc, anim.timer.globalTime);

    rnd.gl.bindVertexArray(this.vA);
    if (this.iBuf != undefined) {
      rnd.gl.bindBuffer(rnd.gl.ELEMENT_ARRAY_BUFFER, this.iBuf);
      rnd.gl.drawElements(
        this.type,
        this.numOfElements,
        rnd.gl.UNSIGNED_INT,
        0
      );
      rnd.gl.bindBuffer(rnd.gl.ELEMENT_ARRAY_BUFFER, null);
    } else rnd.gl.drawArrays(this.type, 0, this.numOfElements);

    rnd.gl.bindVertexArray(null);
  }

  // Sphere creation function
  createSphere(radius, width, height) {
    let vertexArray = [],
      indexArray = [];

    // Create vertex array for sphere
    for (
      let i = 0, k = 0, theta = 0;
      i < height;
      i++, theta += Math.PI / (height - 1)
    )
      for (
        let j = 0, phi = 0;
        j < width;
        j++, phi += (2 * Math.PI) / (width - 1)
      ) {
        vertexArray[k++] = vertex(
          vec3(
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(theta),
            radius * Math.sin(theta) * Math.cos(phi)
          ),
          vec2(0),
          vec3(
            Math.sin(theta) * Math.sin(phi),
            Math.cos(theta),
            Math.sin(theta) * Math.cos(phi)
          ),
          vec4(1, 1, 0, 1)
        );
      }

    // Create index array for sphere
    for (let k = 0, ind = 0, i = 0; i < height - 1; i++, ind++)
      for (let j = 0; j < width - 1; j++, ind++) {
        indexArray[k++] = ind;
        indexArray[k++] = ind + 1;
        indexArray[k++] = ind + width;

        indexArray[k++] = ind + width + 1;
        indexArray[k++] = ind + 1;
        indexArray[k++] = ind + width;
      }

    // Create new sphere primitive
    return new prim(
      rnd.gl.TRIANGLES,
      toArray(vertexArray),
      indexArray,
      this.mtlNo
    );
  }

  // Torus creation function
  createTorus(radiusInner, radiusOuther, width, height) {
    let vertexArray = [],
      indexArray = [];

    // Create vertex array for torus
    for (
      let i = 0, k = 0, alpha = 0;
      i < height;
      i++, alpha += (2 * Math.PI) / (height - 1)
    )
      for (
        let j = 0, phi = 0;
        j < width;
        j++, phi += (2 * Math.PI) / (width - 1)
      ) {
        vertexArray[k++] = vertex(
          vec3(
            (radiusInner + radiusOuther * Math.cos(alpha)) * Math.sin(phi),
            radiusOuther * Math.sin(alpha),
            (radiusInner + radiusOuther * Math.cos(alpha)) * Math.cos(phi)
          ),
          vec2(0),
          vec3(
            Math.cos(alpha) * Math.sin(phi),
            Math.sin(alpha),
            Math.cos(alpha) * Math.cos(phi)
          ),
          vec4(1, 1, 0, 1)
        );
      }

    // Create index array for torus
    for (let i = 0, k = 0, ind = 0; i < height - 1; ind++, i++)
      for (let j = 0; j < width - 1; j++, ind++) {
        indexArray[k++] = ind;
        indexArray[k++] = ind + 1;
        indexArray[k++] = ind + width;

        indexArray[k++] = ind + width + 1;
        indexArray[k++] = ind + 1;
        indexArray[k++] = ind + width;
      }

    // Create new torus primitive
    return new prim(
      rnd.gl.TRIANGLES,
      toArray(vertexArray),
      indexArray,
      this.mtlNo
    );
  }
}

export function prim(...args) {
  return new _prim(...args);
}
