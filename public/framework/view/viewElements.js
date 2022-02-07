import { Event, Fire } from '../model/events.js';
import { container } from '../../view/container.js';
export const nodes = new Set();
export const activeNodes = new Set();
export const add = (view) => {
    nodes.add(view);
    if (!("undefined" === typeof (view["hovered"]))) {
        activeNodes.add(view);
    }
    Fire(Event.ViewWasAdded, {
        type: view.constructor.name,
        index: view.index,
        name: view.name
    });
};
const resetState = () => {
    for (const element of activeNodes) {
        element.hovered = false;
        element.selected = false;
    }
    render();
};
const render = () => {
    container.clearCanvas();
    for (const element of activeNodes) {
        element.update();
    }
};
