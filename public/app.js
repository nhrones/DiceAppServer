import { DiceGame } from './model/diceGame.js';
import { Container, container } from './view/container.js';
import * as signaler from './framework/comms/signaling.js';
import { LogLevel, debug } from './constants.js';
let name = prompt("What's your name?", "Bill") || 'Nick';
let t = Date.now().toString();
export let myID = name + '-' + t.substring(t.length - 3);
signaler.initialize(name, myID);
signaler.onEvent('GameFull', () => {
    const msg = `Sorry! This game is full!
Please close the tab/window! 
Try again in a minute or two!`;
    if (LogLevel >= debug)
        console.log(msg);
    alert(msg);
    self.opener = self;
    self.close();
});
signaler.onEvent('UpdateUI', (content) => {
    console.info('UpdateUI: ', content);
});
self.addEventListener('DOMContentLoaded', () => {
    Container.init(document.getElementById('canvas'), 'snow');
    DiceGame.init();
    container.hydrateUI();
});
