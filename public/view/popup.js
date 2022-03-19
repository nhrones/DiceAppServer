import { container, ctx } from './container.js';
import * as socket from '../framework/comms/signaling.js';
import { sigMessage } from '../framework/comms/SIGlib.js';
import { ON, Event, Fire } from '../framework/model/events.js';
let left = 1;
let top = 1;
export default class Popup {
    constructor(geometry, path) {
        this.id = 0;
        this.index = -1;
        this.activeView = true;
        this.zOrder = 100;
        this.name = "";
        this.enabled = true;
        this.hovered = false;
        this.selected = false;
        this.color = "black";
        this.text = "";
        this.visible = true;
        this.buffer = null;
        this.enabled = true;
        this.color = 'white';
        this.shownPath = path;
        this.hiddenPath = new Path2D();
        this.hiddenPath.rect(1, 1, 1, 1);
        this.geometry = geometry;
        this.path = this.hiddenPath;
        ON(Event.ShowPopup, (data) => {
            this.show(data.message);
        });
        socket.onSignalRecieved(sigMessage.ShowPopup, (data) => {
            this.show(data.message);
        });
        ON(Event.HidePopup, () => {
            this.hide();
        });
    }
    show(msg) {
        this.text = msg;
        left = this.geometry.left;
        top = this.geometry.top;
        this.path = this.shownPath;
        this.visible = true;
        this.saveScreenToBuffer();
        container.hasVisiblePopup = true;
        this.render();
    }
    hide() {
        if (this.visible) {
            left = 1;
            top = 1;
            this.path = this.hiddenPath;
            this.restoreScreenFromBuffer();
            this.visible = false;
            container.hasVisiblePopup = false;
        }
    }
    saveScreenToBuffer() {
        this.buffer = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    restoreScreenFromBuffer() {
        if (this.buffer) {
            return ctx.putImageData(this.buffer, 0, 0);
        }
    }
    touched() {
        this.hide();
        Fire(Event.PopupResetGame, {});
    }
    update() {
        if (this.visible)
            this.render();
    }
    render() {
        ctx.save();
        ctx.shadowColor = '#404040';
        ctx.shadowBlur = 45;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.fillStyle = container.color;
        ctx.fill(this.path);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.lineWidth = 1;
        ctx.strokeStyle = container.textColor;
        ctx.stroke(this.path);
        ctx.strokeText(this.text, left + 150, top + 100);
        ctx.restore();
        this.visible = true;
    }
}
