import * as events from '../framework/model/events.js';
import * as WS from '../framework/model/socket.js';
const { topic: _, broadcast: fireEvent, } = events;
const MAXPLAYERS = 2;
let game;
let thisColor = 'snow';
export const players = new Set();
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
    WS.when(WS.topic.RegisterPlayer, (data) => {
        console.log(`WS.RegisterPlayer ${data.id}  ${data.name}`);
        addPlayer(data.id, data.name);
        setCurrentPlayer([...players][0]);
        game.resetGame();
        WS.broadcast({ topic: WS.topic.UpdatePlayers, data: Array.from(players.values()) });
    });
    WS.when(WS.topic.UpdatePlayers, (playersArray) => {
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
    WS.when(WS.topic.RemovePlayer, (data) => {
        removePlayer(data.id);
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
    fireEvent(`${_.UpdateLabel}player${index}`, {
        color: thisColor,
        textColor: color, text: text
    });
};
export const addPlayer = (id, playerName) => {
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
    console.info(' added player', Array.from(players.values()));
};
const removePlayer = (id) => {
    const p = getById(id);
    console.info(' removing player', p);
    if (p)
        players.delete(p);
    refreshPlayerColors();
    setThisPlayer([...players][0]);
    console.info(' removed player', Array.from(players.values()));
};
const getById = (id) => {
    for (const player of players) {
        console.log(`player.id: ${player.id} id: ${id}`);
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
    const favicon = document.getElementById("favicon");
    thisPlayer = player;
    document.title = thisPlayer.playerName;
    favicon.href = `./icons/${player.idx}.png`;
};
export let thisPlayer = {
    id: "0",
    idx: 0,
    playerName: 'Nick',
    color: 'brown',
    score: 0,
    lastScore: ''
};
export let currentPlayer = {
    id: "0",
    idx: 0,
    playerName: "Nick",
    color: 'brown',
    score: 0,
    lastScore: ''
};
export const setCurrentPlayer = (player) => {
    console.log(`settingCurrentPlayer: ${player.playerName}`);
    currentPlayer = player;
};
