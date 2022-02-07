import { Event, Fire } from './events.js';
import * as webRTC from './webRTC.js';
import { DEBUG } from '../../types.js';
const subscriptions = new Map();
export let socket = null;
export const initialize = (serverURL) => {
    if (socket) {
        return;
    }
    window.onbeforeunload = () => {
        if (socket) {
            socket.onclose = function () { };
            socket.close();
        }
    };
    socket = new WebSocket(serverURL);
    socket.onopen = () => {
        if (DEBUG)
            console.log('signalling.socket.opened!');
        webRTC.initialize();
        webRTC.start();
    };
    socket.onclose = (ev) => {
        const { code, reason, wasClean } = ev;
        if (DEBUG) {
            console.log(`Peer was closed! code: ${code}, reason: ${reason} wasClean? ${wasClean}`);
        }
    };
    socket.addEventListener('error', (err) => {
        if (DEBUG)
            console.error('Socket.error!', err);
        Fire(Event.ShowPopup, { message: `Game Full! Please close tab!` });
    });
    if (DEBUG)
        console.log(`connected to: ${serverURL}`);
    socket.addEventListener('message', (message) => {
        const { topic, data } = JSON.parse(message.data);
        dispatch(topic, data);
    });
};
export const registerPlayer = (id, name) => {
    sendSignal(message.RegisterPlayer, { id: id, name: name });
};
export const dispatch = (topic, data) => {
    if (subscriptions.has(topic)) {
        const subs = subscriptions.get(topic);
        if (subs) {
            for (const callback of subs) {
                callback(data != undefined ? data : {});
            }
        }
    }
};
export const onSignalRecieved = (topic, listener) => {
    if (!subscriptions.has(topic)) {
        subscriptions.set(topic, []);
    }
    const callbacks = subscriptions.get(topic);
    callbacks.push(listener);
};
export const sendSignal = (topic, data) => {
    const msg = JSON.stringify({ topic: topic, data: data });
    if (webRTC.dataChannel && webRTC.dataChannel.readyState === 'open') {
        console.log('broadcast on DataChannel:', msg);
        webRTC.dataChannel.send(msg);
    }
    else if (socket) {
        console.log('broadcast on WebSocket:', msg);
        socket.send(msg);
    }
    else {
        console.error('No place to send:', msg);
    }
};
export const message = {
    RegisterPlayer: 'RegisterPlayer',
    RemovePlayer: 'RemovePlayer',
    ResetGame: 'ResetGame',
    ResetTurn: 'ResetTurn',
    ShowPopup: 'ShowPopup',
    UpdateRoll: 'UpdateRoll',
    UpdateScore: 'UpdateScore',
    UpdateDie: 'UpdateDie',
    UpdatePlayers: 'UpdatePlayers',
    SetID: "SetID",
    GameFull: "GameFull",
    Bye: 'bye',
    RtcOffer: 'RtcOffer',
    RtcAnswer: 'RtcAnswer',
    IceCandidate: 'candidate',
    ConnectOffer: 'connectOffer'
};
