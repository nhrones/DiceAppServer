import { DiceGame, game } from './model/diceGame.js';
import { Container, container } from './view/container.js';
import * as socket from './framework/model/signalling.js';
import * as Players from './model/players.js';
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
    const name = 'Player';
    const hiddenButton = document.getElementById('hidden-button');
    hiddenButton.hidden = true;
    hiddenButton.addEventListener('click', function () {
        console.log('hiddenButton was clicked');
    }, false);
    hiddenButton.click();
    Players.thisPlayer.id = data.id;
    Players.thisPlayer.playerName = (name === 'Player') ? 'Player1' : name;
    Players.setThisPlayer(Players.thisPlayer);
    Players.setCurrentPlayer(Players.thisPlayer);
    registerPlayer(data.id, name);
    Players.addPlayer(data.id, name);
    if (game) {
        game.resetGame();
    }
});
onSignalRecieved(message.GameFull, () => {
    const msg = `Sorry, This game is already full!
This tab/window will automatically close!`;
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
