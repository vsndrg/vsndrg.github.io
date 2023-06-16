// Primitives handle module
import { mat4, vec3, vec2, vec4 } from "../mth/mat4.js";
import { mul2 } from "../mth/mat4.js";
import { vertex, toArray } from "./vertex.js";

// Primitive class
export class prim {
    constructor(gl, type, vertexArray, indexArray, shdProgram) {
        if (vertexArray != null) {
            // Generate and bind vertex buffer
            this.vBuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuf);
            // Generate and bind vertex array
            this.vA = gl.createVertexArray();
            gl.bindVertexArray(this.vA);

            // Upload data
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(vertexArray),
                gl.STATIC_DRAW
            );
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 4 * 12, 0);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 12, 4 * 3);
            gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 4 * 12, 4 * 5);
            gl.vertexAttribPointer(3, 4, gl.FLOAT, false, 4 * 12, 4 * 8);
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.enableVertexAttribArray(2);
            gl.enableVertexAttribArray(3);
            gl.bindVertexArray(null);
        }
        if (indexArray != null) {
            // Generate and bind index buffer
            this.iBuf = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuf);

            // Upload data
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Int32Array(indexArray),
                gl.STATIC_DRAW
            );
            this.numOfElements = indexArray.length;
        } else if (vertexArray != null && indexArray != null) {
            this.numOfElements = vertexArray.length;
        } else this.numOfElements = 0;
        this.transMatrix = mat4();
        if (type != null) {
            this.type = type;
        }
        this.program = shdProgram;
        this.gl = gl;
    }

    // Primitive drawing function
    draw(worldMatrix, viewProjMatrix, beginTime) {
        if (worldMatrix == undefined) worldMatrix = mat4();
        const w = mul2(this.transMatrix, worldMatrix);
        const winv = mat4(w).inverse().transpose();
        const wvp = mat4(w).mul(viewProjMatrix);

        this.gl.useProgram(this.program);

        let loc;
        // Pass data on shader using uniform
        // if ((loc = gl.getUniformLocation(program, "Time")) != -1) {
        //     gl.uniform1f(loc /*timeFromStart / 1000.0*/); /// TODO: Timer!!!
        // }
        if ((loc = this.gl.getUniformLocation(this.program, "MatrW")) != -1)
            this.gl.uniformMatrix4fv(loc, false, new Float32Array(w.toArray()));
        if ((loc = this.gl.getUniformLocation(this.program, "MatrWInv")) != -1)
            this.gl.uniformMatrix4fv(
                loc,
                false,
                new Float32Array(winv.toArray())
            );
        if ((loc = this.gl.getUniformLocation(this.program, "MatrWVP")) != -1)
            this.gl.uniformMatrix4fv(
                loc,
                false,
                new Float32Array(wvp.toArray())
            );
        // Pass time
        const timeFromStart = Date.now() - beginTime;
        if ((loc = this.gl.getUniformLocation(this.program, "Time")) != -1)
            this.gl.uniform1f(loc, timeFromStart / 1000.0);

        this.gl.bindVertexArray(this.vA);
        if (this.iBuf != undefined) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuf);
            this.gl.drawElements(
                this.type,
                this.numOfElements,
                this.gl.UNSIGNED_INT,
                0
            );
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        } else this.gl.drawArrays(this.type, 0, this.numOfElements);

        this.gl.bindVertexArray(null);
        this.gl.useProgram(null);
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
            this.gl,
            this.gl.TRIANGLES,
            toArray(vertexArray),
            indexArray,
            this.program
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
                        (radiusInner + radiusOuther * Math.cos(alpha)) *
                            Math.sin(phi),
                        radiusOuther * Math.sin(alpha),
                        (radiusInner + radiusOuther * Math.cos(alpha)) *
                            Math.cos(phi)
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
            this.gl,
            this.gl.TRIANGLES,
            toArray(vertexArray),
            indexArray,
            this.program
        );
    }
}
