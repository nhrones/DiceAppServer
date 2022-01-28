import { DiceGame, game } from './model/diceGame.js';
import { Container, container } from './view/container.js';
import * as socket from './framework/model/socket.js';
import * as Players from './model/players.js';
const proto = (window.location.protocol === 'http:') ? 'ws://' : 'wss://';
export const serverURL = `${proto}${window.location.host}:8000`;
socket.initialize('wss://rtc-signal-server.deno.dev');
socket.when(socket.topic.SetID, (data) => {
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
    game.resetGame();
});
socket.when(socket.topic.GameFull, () => {
    const msg = `Sorry, This game is already full!
This tab/window will automatically close!`;
    console.log(msg);
    alert(msg);
    self.opener = self;
    self.close();
});
self.addEventListener('DOMContentLoaded', () => {
    navigator.serviceWorker.register('./public/sw.js').then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (err) => {
        console.log('ServiceWorker registration failed: ', err);
    });
    Container.init(document.getElementById('canvas'), 'snow');
    DiceGame.init();
    container.hydrateUI();
});
