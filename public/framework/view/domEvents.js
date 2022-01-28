import { currentPlayer, thisPlayer } from '../../model/players.js';
import * as events from '../model/events.js';
import { container, ctx } from '../../view/container.js';
import * as viewElements from './viewElements.js';
const { topic: _, broadcast: fireEvent, } = events;
let x = 0;
let y = 0;
let boundingRect = null;
let hit = false;
let node = null;
let hoveredNode = null;
let canvas;
const left = 0;
export function initHandlers() {
    canvas = container.canvas;
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (e.button === left)
            handleClickOrTouch(e.pageX, e.pageY);
    }, false);
    canvas.addEventListener('mousemove', (e) => {
        e.preventDefault();
        if (container.hasVisiblePopup === false) {
            handleMouseMove(e);
        }
    });
}
function handleMouseMove(evt) {
    boundingRect = canvas.getBoundingClientRect();
    x = evt.clientX - boundingRect.x;
    y = evt.clientY - boundingRect.y;
    node = null;
    for (const element of viewElements.activeNodes) {
        if (ctx.isPointInPath(element.path, x, y)) {
            node = element;
        }
    }
    if (node !== null) {
        if (node !== hoveredNode) {
            if (!(node.name === 'player0textInput')) {
                clearHovered();
                node.hovered = true;
                node.update();
                hoveredNode = node;
            }
        }
    }
    else {
        if (hoveredNode !== null) {
            clearHovered();
            hoveredNode = null;
        }
    }
}
function handleClickOrTouch(mX, mY) {
    hit = false;
    console.log(`clicked: currentID: ${currentPlayer.id} thisID: ${thisPlayer.id}`);
    if (currentPlayer.id === thisPlayer.id) {
        x = mX - canvas.offsetLeft;
        y = mY - canvas.offsetTop;
        for (const element of viewElements.activeNodes) {
            if (!hit) {
                if (ctx.isPointInPath(element.path, x, y)) {
                    element.touched(true, x, y);
                    hit = true;
                    if (!(element.name === 'player0textInput')) {
                        fireEvent(_.CancelEdits, {});
                    }
                }
            }
        }
    }
}
function clearHovered() {
    if (hoveredNode !== null) {
        hoveredNode.hovered = false;
        hoveredNode.update();
    }
}
