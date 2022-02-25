import { DiceGame, game } from './model/diceGame.js';
import { Container, container } from './view/container.js';
import * as socket from './framework/comms/signaling.js';
import * as Players from './model/players.js';
import { gameState } from './gameState.js';
import { DEBUG } from './types.js';
const { onSignalRecieved, registerPlayer, message } = socket;
const proto = (window.location.protocol === 'http:') ? 'ws://' : 'wss://';
const serverURL = `${proto}${window.location.host}:8000`;
const thisHost = window.location.host;
if (thisHost === 'localhost' || thisHost === '127.0.0.1') {
    socket.initialize(serverURL);
}
else {
    socket.initialize('wss://rtc-signal-server.deno.dev');
}
onSignalRecieved(message.SetID, (data) => {
    const name = 'Player' + data.seat;
    gameState.connect(data.id, name, data.table, data.seat);
    console.log('Game state:', gameState.toString());
    Players.thisPlayer.id = data.id;
    Players.thisPlayer.playerName = name;
    Players.setThisPlayer(Players.thisPlayer);
    Players.setCurrentPlayer(Players.thisPlayer);
    registerPlayer(data.id, name, data.table, data.seat);
    Players.addPlayer(data.id, name);
    if (game) {
        game.resetGame();
    }
});
onSignalRecieved(message.GameFull, () => {
    const msg = `Sorry! This game is full!
Please close the tab/window! 
Try again in a minute or two!`;
    if (DEBUG)
        console.log(msg);
    alert(msg);
    self.opener = self;
    self.close();
});
self.addEventListener('DOMContentLoaded', () => {
    Container.init(document.getElementById('canvas'), 'snow');
    DiceGame.init();
    container.hydrateUI();
});
