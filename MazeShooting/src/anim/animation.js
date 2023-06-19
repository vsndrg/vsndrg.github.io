import { Timer } from "./timer.js";
import { Render } from "./rnd/render.js";
import { camera } from "../mth/camera.js";
import { rnd } from "./rnd/res/resource.js";

export class Anim {
  constructor() {
    this.timer = new Timer();
    this.render = new Render();
    this.camera = camera();
  }
  draw() {
    this.timer.response();
    this.camera.setSize(rnd.canvas.clientWidth, rnd.canvas.clientHeight);
    this.render.render();
  }
}
