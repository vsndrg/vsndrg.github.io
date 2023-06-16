import { camera } from "./mth/cam.js";
import { mat4 } from "./mth/mat4.js";
import { prim } from "./rnd/prim.js";
import { getVertexArray, toArray } from "./rnd/vertex.js";

async function fetchShader(shaedrURL) {
    try {
        const response = await fetch(shaedrURL);
        const text = await response.text();

        return text;
    } catch (err) {
        console.error(err);
    }
}

function readFilePromised(filename, encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, encoding, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            "Error load " +
                (type === gl.VERTEX_SHADER ? "vertex" : "fragment") +
                " shader: " +
                gl.getShaderInfoLog(shader)
        );
    }

    return shader;
}

export function initGL() {
    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl2");

    let cam = camera();

    gl.clearColor(0.3, 0.47, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vs = fetchShader("./vert.glsl");
    const fs = fetchShader("./frag.glsl");

    Promise.all([vs, fs]).then((res) => {
        const vs = res[0];
        const fs = res[1];

        const vertexSh = loadShader(gl, gl.VERTEX_SHADER, vs);
        const fragmentSh = loadShader(gl, gl.FRAGMENT_SHADER, fs);

        const program = gl.createProgram();
        gl.attachShader(program, vertexSh);
        gl.attachShader(program, fragmentSh);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Error link program!");
        }

        const cubeVertices = [
            1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1,
            -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1,
            1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1,
            1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1,
        ];
        // const cubeNormals = [
        //     1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        //     -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0,
        //     -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0,
        //     -1, 0, 0, -1, 0, 0, -1,
        // ];
        const cubeIndices = [
            0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14,
            12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
        ];
        let cubeVertexArray = getVertexArray(cubeVertices, null, null, null);

        for (let i = 0; i < cubeIndices.length; i += 3) {
            let p0 = cubeVertexArray[cubeIndices[i]],
                p1 = cubeVertexArray[cubeIndices[i + 1]],
                p2 = cubeVertexArray[cubeIndices[i + 2]];
            let normal = p1.p.sub(p0.p).cross(p2.p.sub(p0.p)).normalize();

            // cubeVertexArray[cubeIndices[i]].n = normal;
            // cubeVertexArray[cubeIndices[i + 1]].n = normal;
            // cubeVertexArray[cubeIndices[i + 2]].n = normal;
            p0.n = normal;
            p1.n = normal;
            p2.n = normal;
            cubeVertexArray[cubeIndices[i]] = p0;
            cubeVertexArray[cubeIndices[i + 1]] = p1;
            cubeVertexArray[cubeIndices[i + 2]] = p2;
        }
        const cubeVertexData = toArray(cubeVertexArray);
        const beginTime = Date.now();
        // Create cube primitive
        const cubePrim = new prim(
            gl,
            gl.TRIANGLES,
            cubeVertexData,
            cubeIndices,
            program
        );
        // Create sphere prmitive
        const spherePrim = new prim(gl, null, null, null, program).createSphere(
            3,
            102,
            102
        );
        // Create torus prmitive
        const torusPrim = new prim(gl, null, null, null, program).createTorus(
            3,
            1,
            102,
            102
        );
        const draw = () => {
            gl.clearColor(0.3, 0.47, 0.8, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            const timeFromStart = (Date.now() - beginTime) / 1000.0;
            torusPrim.draw(
                mat4()
                    .rotateX(timeFromStart * 8)
                    .rotateY(timeFromStart * 100),
                cam.matrVP,
                beginTime
            );
            window.requestAnimationFrame(draw);
        };

        draw();
    });
}
