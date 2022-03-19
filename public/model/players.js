import { onEvent, signal } from '../framework/comms/signaling.js';
import { Event, Fire, when } from '../framework/model/events.js';
import { LogLevel, debug } from '../constants.js';
const MAXPLAYERS = 2;
let game;
let thisColor = 'snow';
export const players = new Set();
export const getCount = () => {
    return players.size;
};
export const init = (thisgame, color) => {
    game = thisgame;
    thisColor = color;
    players.clear();
    thisPlayer = {
        id: "",
        idx: 0,
        playerName: '',
        color: 'brown',
        score: 0,
        lastScore: ''
    };
    when(Event.PeerDisconnected, () => {
        removePlayer([...players][1].id);
    });
    onEvent('SetID', (data) => {
        const { id, name } = data;
        console.log("players::onEvent('SetID') - id: " + id + " name: " + name);
        addPlayer(id, name);
        thisPlayer.id = id;
        thisPlayer.playerName = name;
        setCurrentPlayer(thisPlayer);
        if (game) {
            game.resetGame();
        }
    });
    onEvent('RegisterPeer', (player) => {
        console.log('playerid: ', player.id);
        const { id, name } = player;
        if (LogLevel >= debug)
            console.log(`Players.RegisterPeer ${id}  ${name}`);
        addPlayer(id, name);
        setCurrentPlayer([...players][0]);
        game.resetGame();
        signal({ event: 'UpdatePlayers', data: Array.from(players.values()) });
    });
    onEvent('UpdatePlayers', (playersArray) => {
        players.clear();
        resetScoreLabels();
        playersArray.forEach((newPlayer, index) => {
            players.add({
                id: newPlayer.id,
                idx: index,
                playerName: newPlayer.playerName,
                color: newPlayer.color,
                score: 0,
                lastScore: ""
            });
            if (thisPlayer.id === newPlayer.id) {
                setThisPlayer(newPlayer);
            }
            updatePlayer(newPlayer.idx, newPlayer.color, newPlayer.playerName);
        });
        setCurrentPlayer([...players][0]);
        game.resetGame();
    });
    onEvent('RemovePlayer', (id) => {
        removePlayer(id);
        game.resetGame();
    });
};
export const resetScoreLabels = () => {
    for (let i = 0; i < MAXPLAYERS; i++) {
        updatePlayer(i, thisColor, '');
    }
};
export const resetPlayers = () => {
    for (const player of players) {
        player.score = 0;
        updatePlayer(player.idx, player.color, player.playerName);
    }
};
export const addScore = (player, value) => {
    player.score += value;
    const text = (player.score === 0) ? player.playerName : `${player.playerName} = ${player.score}`;
    updatePlayer(player.idx, player.color, text);
};
const updatePlayer = (index, color, text) => {
    Fire(`${Event.UpdateLabel}player${index}`, {
        color: thisColor,
        textColor: color, text: text
    });
};
export const addPlayer = (id, playerName) => {
    if (LogLevel >= debug)
        console.log('add player ', id + '  ' + playerName);
    if (playerName === 'Player') {
        const num = players.size + 1;
        playerName = 'Player' + num;
    }
    if (thisPlayer.id === "") {
        thisPlayer.id = id;
        thisPlayer.playerName = playerName;
        players.add(thisPlayer);
    }
    else {
        if (LogLevel >= debug)
            console.log(`Players adding, id:${id} name: ${playerName}`);
        players.add({
            id: id,
            idx: players.size,
            playerName: playerName,
            color: playerColors[players.size],
            score: 0,
            lastScore: ''
        });
    }
    if (LogLevel >= debug)
        console.info(' added player', Array.from(players.values()));
};
export const removePlayer = (id) => {
    const p = getById(id);
    if (p === null)
        return;
    if (LogLevel >= debug)
        console.info(' removing player', p);
    players.delete(p);
    refreshPlayerColors();
    setThisPlayer([...players][0]);
    setCurrentPlayer([...players][0]);
};
const getById = (id) => {
    for (const player of players) {
        if (player.id === id) {
            return player;
        }
    }
    return null;
};
export const getNextPlayer = (player) => {
    let next = player.idx + 1;
    if (next === players.size) {
        next = 0;
    }
    return [...players][next];
};
const refreshPlayerColors = () => {
    let i = 0;
    for (const player of players) {
        player.idx = i;
        player.color = playerColors[i];
        i++;
    }
};
const playerColors = ["Brown", "Green", "RoyalBlue", "Red"];
export const setThisPlayer = (player) => {
    if (LogLevel >= debug)
        console.log(`Step-4 - Players.setThisPlayer: ${player.playerName}`);
    const favicon = document.getElementById("favicon");
    thisPlayer = player;
    document.title = thisPlayer.playerName;
    favicon.href = `./icons/${player.idx}.png`;
};
export let thisPlayer = {
    id: "0",
    idx: 0,
    playerName: 'Player1',
    color: 'brown',
    score: 0,
    lastScore: ''
};
export let currentPlayer = {
    id: "0",
    idx: 0,
    playerName: "Player1",
    color: 'brown',
    score: 0,
    lastScore: ''
};
export const setCurrentPlayer = (player) => {
    if (LogLevel >= debug)
        console.log(`Step-5 - Players.settingCurrentPlayer: ${player.playerName}`);
    currentPlayer = player;
};
