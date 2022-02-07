import { ON, Event } from '../framework/model/events.js';
import { LabelState } from '../types.js';
import { container, ctx } from './container.js';
export default class Label {
    constructor(index, name, text, geometry, fillColor, bind) {
        this.id = 0;
        this.activeView = false;
        this.enabled = false;
        this.hovered = false;
        this.selected = false;
        this.path = new Path2D();
        this.index = 0;
        this.zOrder = 0;
        this.strokeColor = "black";
        this.name = name;
        this.index = index;
        this.text = text;
        this.lastText = '';
        this.geometry = geometry;
        this.fillColor = fillColor;
        this.fontColor = container.color;
        this.textLeft = this.geometry.left - (this.geometry.width * 0.5);
        this.textTop = this.geometry.top - (this.geometry.height * 0.7);
        if (bind) {
            ON(Event.UpdateLabel + this.name, (data) => {
                this.fillColor = data.color;
                this.fontColor = data.textColor;
                if (data.state === LabelState.Reset) {
                    this.text = this.lastText;
                }
                else if (data.state === LabelState.HoveredOwned) {
                    this.lastText = this.text;
                    this.text = data.text;
                }
                else if (data.state === LabelState.Hovered) {
                    this.text = data.text;
                }
                else {
                    this.lastText = data.text;
                    this.text = data.text;
                }
                this.render();
            });
        }
    }
    update() {
        this.render();
    }
    render() {
        ctx.fillStyle = this.fillColor;
        ctx.fillRect(this.textLeft, this.textTop, this.geometry.width, this.geometry.height);
        ctx.fillStyle = this.fontColor;
        ctx.strokeStyle = this.fontColor;
        ctx.fillText(this.text, this.geometry.left, this.geometry.top);
        ctx.strokeText(this.text, this.geometry.left, this.geometry.top);
    }
    touched() {
    }
}
