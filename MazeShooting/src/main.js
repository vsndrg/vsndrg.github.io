// Main module
import { Anim } from "./anim/animation.js";
// import { Render } from "./anim/rnd/render.js";

export let anim = new Anim();

export function main() {
  anim = new Anim();
  Promise.all([
    anim.render.shaderDefault.vertText,
    anim.render.shaderDefault.fragText,
  ]).then((res) => {
    const vs = res[0];
    const fs = res[1];

    anim.render.shaderDefault.add(vs, fs);
    anim.render.resInit();

    const draw = () => {
      anim.draw();
      window.requestAnimationFrame(draw);
    };
    draw();
  });
}
