import { Event, Fire } from './framework/model/events.js';
import { DiceGame } from './model/diceGame.js';
import { Container, container } from './view/container.js';
import * as signaler from './framework/comms/signaling.js';
let name = prompt("What's your name?", "Bill") || 'Nick';
let t = Date.now().toString();
export let myID = name + '-' + t.substring(t.length - 3);
signaler.initialize(name, myID);
signaler.onEvent('ShowPopup', (msg) => {
    console.info('************** ShowPopup-msg', msg);
    Fire(Event.ShowPopup, msg);
});
signaler.onEvent('UpdateUI', (content) => {
    console.info('UpdateUI: ', content);
});
self.addEventListener('DOMContentLoaded', () => {
    Container.init(document.getElementById('canvas'), 'snow');
    DiceGame.init();
    container.hydrateUI();
});
