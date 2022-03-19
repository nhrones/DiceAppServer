import { SSE } from './SIGlib.js';
import { Event, Fire } from '../model/events.js';
import * as webRTC from './webRTC.js';
import { DEBUG, SignalServer } from '../../constants.js';
import * as Players from '../../model/players.js';
import { game } from '../../model/diceGame.js';
export let thisID = 'Player1';
const host = window.location.hostname;
const SignalServerURL = (host === '127.0.0.1' || host === 'localhost')
    ? 'http://localhost:8000'
    : SignalServer;
console.log('SignalServerURL', SignalServerURL);
const subscriptions = new Map();
export let sse;
export const initialize = (name, id) => {
    if (sse) {
        return;
    }
    window.addEventListener('beforeunload', () => {
        if (sse.readyState === SSE.OPEN) {
            const sigMsg = JSON.stringify({
                from: thisID,
                event: 'close',
                data: thisID + ' window was closed!',
                id: 0
            });
            fetch(SignalServerURL, {
                method: "POST",
                body: sigMsg
            });
        }
    });
    sse = new EventSource(SignalServerURL + '/listen/' + id);
    sse.onopen = () => {
        if (DEBUG)
            console.log('Sse.onOpen! >>>  webRTC.start()');
        webRTC.initialize();
    };
    sse.onerror = (err) => {
        if (DEBUG)
            console.error('sse.error!', err);
        Fire(Event.ShowPopup, { message: `Game Full! Please close tab!` });
    };
    sse.onmessage = (msg) => {
        if (DEBUG)
            console.log('>>>>>>>  signaler recieved  >>>>>>>>  ', msg.data);
        const msgObject = JSON.parse(msg.data);
        if (DEBUG)
            console.info('      parsed data = ', msgObject);
        const event = msgObject.event;
        if (DEBUG)
            console.info('               event: ', event);
        dispatch(event, msgObject.data);
    };
    sse.addEventListener('SetID', (ev) => {
        const msgObject = JSON.parse(ev.data);
        const { data } = msgObject;
        dispatch(msgObject.event, msgObject.data);
        console.log('on.SetID - data type = ' + (typeof data) + ' id ' + data.id);
        thisID = data.id;
        Players.thisPlayer.id = data.id;
        Players.thisPlayer.playerName = name;
        console.info('Players.thisPlayer:', Players.thisPlayer);
        Players.setThisPlayer(Players.thisPlayer);
        Players.setCurrentPlayer(Players.thisPlayer);
        registerPlayer(data.id, name);
        Players.addPlayer(data.id, name);
        webRTC.start();
        if (game) {
            game.resetGame();
        }
    });
    sse.addEventListener('GameIsFull', (ev) => {
        const msg = `Sorry! This game is full!
    Please close the tab/window! 
    Try again in a minute or two!`;
        if (DEBUG)
            console.log(msg);
        alert(msg);
        self.opener = self;
        self.close();
    });
};
export const getState = (msg) => {
    if (sse.readyState === SSE.CONNECTING)
        console.log(msg + ' - ' + 'SSE-State - connecting');
    if (sse.readyState === SSE.OPEN)
        console.log(msg + ' - ' + 'SSE-State - open');
    if (sse.readyState === SSE.CLOSED)
        console.log(msg + ' - ' + 'SSE-State - closed');
};
export const disconnect = () => {
    sse.close();
    getState('Disconnecting streamedEvents!');
};
export const registerPlayer = (id, name) => {
    const regObj = {
        from: id,
        event: 'RegisterPlayer',
        data: { id: id, name: name }
    };
    const msg = JSON.stringify(regObj);
    fetch(SignalServerURL, {
        method: "POST",
        body: msg
    });
};
export const dispatch = (event, data) => {
    if (subscriptions.has(event)) {
        const subs = subscriptions.get(event);
        if (subs) {
            for (const callback of subs) {
                callback(data != undefined ? data : {});
            }
        }
    }
};
export const onEvent = (event, listener) => {
    if (!subscriptions.has(event)) {
        subscriptions.set(event, []);
    }
    const callbacks = subscriptions.get(event);
    callbacks.push(listener);
};
export const sendSSEmessage = (msg) => {
    if (sse.readyState === SSE.OPEN) {
        const sigMsg = JSON.stringify({ from: thisID, event: msg.event, data: msg.data });
        if (DEBUG)
            console.log('Sending to sig-server >>> :', sigMsg);
        fetch(SignalServerURL, {
            method: "POST",
            body: sigMsg
        });
    }
    else {
        console.error('No place to send the message:', msg.event);
    }
};
