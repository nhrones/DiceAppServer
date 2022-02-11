import { DiceGame, game } from './model/diceGame.js';
import { Container, container } from './view/container.js';
import * as socket from './framework/model/signalling.js';
import * as Players from './model/players.js';
const { message } = socket;
const proto = (window.location.protocol === 'http:') ? 'ws://' : 'wss://';
export const serverURL = `${proto}${window.location.host}:8000`;
socket.initialize(serverURL);
socket.onSignalRecieved(message.SetID, (data) => {
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
    socket.registerPlayer(data.id, name);
    Players.addPlayer(data.id, name);
    if (game) {
        game.resetGame();
    }
});
socket.onSignalRecieved(message.GameFull, () => {
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
