import * as events from '../framework/model/events.js';
import { container, ctx } from './container.js';
import Label from './label.js';
const { topic: _, broadcast: fireEvent, } = events;
export default class Button {
    constructor(name, text, geometry, path) {
        this.id = 0;
        this.activeView = true;
        this.index = -1;
        this.zOrder = 0;
        this.name = '';
        this.enabled = true;
        this.hovered = false;
        this.selected = false;
        this.text = "";
        this.name = name;
        this.zOrder = 0;
        this.geometry = geometry;
        this.color = container.textColor;
        this.textColor = container.color;
        this.enabled = true;
        this.textLabel = new Label(-1, this.name + 'Label', text, {
            left: geometry.left + 68,
            top: geometry.top + 30,
            width: geometry.width - 25,
            height: 40
        }, 'blue', true);
        this.path = path;
        this.render();
        events.when(_.UpdateButton + this.name, (data) => {
            this.enabled = data.enabled;
            this.color = data.color;
            this.text = data.text;
            this.render();
        });
    }
    touched(broadcast, _x, _y) {
        if (this.enabled) {
            if (broadcast) {
                fireEvent(_.ButtonTouched + this.name, {});
            }
        }
    }
    update() {
        this.render();
    }
    render() {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = (this.hovered) ? 'orange' : 'black';
        ctx.stroke(this.path);
        ctx.restore();
        ctx.fillStyle = this.color;
        ctx.fill(this.path);
        ctx.fillStyle = container.color;
        ctx.restore();
        this.textLabel.fillColor = this.color;
        this.textLabel.fontColor = this.textColor;
        this.textLabel.text = this.text;
        this.textLabel.render();
    }
}
