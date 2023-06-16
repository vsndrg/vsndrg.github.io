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

function mouseHandle(canvas, wheel, mouseCoord) {
    let scale = 0;
    let distLRBT = {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
    };

    scale += wheel;
    console.log("Heil! " + scale);

    // Count offset
    distLRBT.l = (mouseCoord.x / canvas.clientWidth) * 2 - 1;
    distLRBT.r =
        ((canvas.clientWidth - mouseCoord.x) / canvas.clientWidth) * 2 - 1;
    distLRBT.b = (mouseCoord.y / canvas.clientHeight) * 2 - 1;
    distLRBT.t =
        ((canvas.clientHeight - mouseCoord.y) / canvas.clientHeight) * 2 - 1;
    console.log(
        "l: " +
            distLRBT.l +
            "r: " +
            distLRBT.r +
            "b: " +
            distLRBT.b +
            "t: " +
            distLRBT.t
    );
    return { scale, distLRBT };
}

export function initGL(canvasId) {
    const canvas = document.getElementById(canvasId);
    const gl = canvas.getContext("webgl2");

    gl.clearColor(0.3, 0.47, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vs = fetchShader("./vert.glsl");
    const fs0 = fetchShader("./frag_jul.glsl");
    const fs1 = fetchShader("./frag_mandl.glsl");

    Promise.all([vs, fs0, fs1]).then((res) => {
        const vs = res[0];
        const fs = canvasId === "glCanvas" ? res[1] : res[2];

        const vertexSh = loadShader(gl, gl.VERTEX_SHADER, vs);
        const fragmentSh = loadShader(gl, gl.FRAGMENT_SHADER, fs);

        const program = gl.createProgram();
        gl.attachShader(program, vertexSh);
        gl.attachShader(program, fragmentSh);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Error link program!");
        }

        const posLoc = gl.getAttribLocation(program, "in_pos");

        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        const x = 1;
        const pos = [-x, x, 0, -x, -x, 0, x, x, 0, x, -x, 0];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(posLoc);
        gl.useProgram(program);

        const beginTime = Date.now();
        // let mouseWheel = 0
        // if (canvasId === "glCanvas1") {
        //     canvas.addEventListener("wheel", (event) => {
        //         mouseWheel += event.deltaY;
        //         alert("Heil! " + mouseWheel);
        //     });
        // }
        const uniformLocTime = gl.getUniformLocation(program, "Time");
        const uniformLocScale = gl.getUniformLocation(program, "Scale");
        const uniformLocCoord = gl.getUniformLocation(program, "Coord");
        const uniformLocDist = gl.getUniformLocation(program, "DistLRBT");
        // const uniformLocIsMW = gl.getUniformLocation(program, "IsMW");

        // let isMouseWheel = false;
        let mouseCoord = {
            x: 0,
            y: 0,
        };
        canvas.addEventListener("mousemove", (event) => {
            mouseCoord.x = event.clientX;
            mouseCoord.y = event.clientY;
            console.log(mouseCoord.x + "; " + mouseCoord.x);
        });
        let mouseWheel = 0;
        canvas.addEventListener("wheel", (event) => {
            mouseWheel -= event.deltaY;
            console.log("Heil! " + mouseWheel);
        });
        // let x0x1y0y1 = {
        //     x: 0,
        //     y: 0,
        //     z: 0,
        //     w: 0,
        // };

        const draw = () => {
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(posLoc);
            gl.useProgram(program);

            let scaleDist = {
                scale: 0,
                distLRBT: {
                    l: 0,
                    r: 0,
                    b: 0,
                    t: 0,
                },
            };
            // if (canvasId === "glCanvas1") {
            //     canvas.addEventListener("wheel", (e) => {
            //         let scale = 0;
            //         let distLRBT = {
            //             l: 0,
            //             r: 0,
            //             b: 0,
            //             t: 0,
            //         };

            //         scale += wheel;
            //         console.log("Heil! " + scale);

            //         // Count offset
            //         distLRBT.l = (mouseCoord.x / canvas.clientWidth) * 2 - 1;
            //         distLRBT.r =
            //             ((canvas.clientWidth - mouseCoord.x) /
            //                 canvas.clientWidth) *
            //                 2 -
            //             1;
            //         distLRBT.b = (mouseCoord.y / canvas.clientHeight) * 2 - 1;
            //         distLRBT.t =
            //             ((canvas.clientHeight - mouseCoord.y) /
            //                 canvas.clientHeight) *
            //                 2 -
            //             1;
            //         console.log(
            //             "l: " +
            //                 distLRBT.l +
            //                 "r: " +
            //                 distLRBT.r +
            //                 "b: " +
            //                 distLRBT.b +
            //                 "t: " +
            //                 distLRBT.t
            //         );
            //     });
            // }

            // scaleDist.scale = Math.pow(10.0, scaleDist.scale * 0.001);
            // x0x1y0y1.x = -2.0 / scale + distLRBT.l * (mouseWheel != 0);
            // x0x1y0y1.y = 2.0 / scale - distLRBT.r * (mouseWheel != 0);
            // x0x1y0y1.z = -2.0 / scale + distLRBT.t * (mouseWheel != 0);
            // x0x1y0y1.w = 2.0 / scale - distLRBT.b * (mouseWheel != 0);

            const timeFromStart = Date.now() - beginTime;
            gl.uniform1f(uniformLocTime, timeFromStart / 1000.0);
            // isMouseWheel = false;
            // if (canvasId === "glCanvas1") {
            //     canvas.addEventListener("wheel", (event) => {
            //         isMouseWheel = true;
            //         console.log("MW!");
            //     });
            // }
            // gl.uniform1f(uniformLocIsMW, isMouseWheel);
            // gl.uniform1f(uniformLocScale, scaleDist.scale);
            gl.uniform2f(uniformLocCoord, mouseCoord.x, mouseCoord.y);
            // gl.uniform4f(
            //     uniformLocDist,
            //     scaleDist.distLRBT.l,
            //     scaleDist.distLRBT.r,
            //     scaleDist.distLRBT.b,
            //     scaleDist.distLRBT.t
            // );
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            window.requestAnimationFrame(draw);
        };

        draw();
    });
}
