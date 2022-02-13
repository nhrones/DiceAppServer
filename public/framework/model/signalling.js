import { Event, Fire } from './events.js';
import * as webRTC from './webRTC.js';
import { DEBUG } from '../../types.js';
const subscriptions = new Map();
const transactions = [];
export let socket = null;
export const initialize = (serverURL) => {
    if (DEBUG)
        console.log('initializing socket at: ', serverURL);
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
    socket.addEventListener('message', (msg) => {
        if (DEBUG)
            console.info('socket recieved message.data: ', msg.data);
        const payload = JSON.parse(msg.data);
        const topic = payload[0];
        if (DEBUG)
            console.info('socket recieved topic: ', message[topic]);
        dispatch(topic, payload[1]);
    });
};
export const registerPlayer = (id, name) => {
    sendSignal(message.RegisterPlayer, [id, name]);
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
    const msg = JSON.stringify([topic, data]);
    if (webRTC.dataChannel && webRTC.dataChannel.readyState === 'open') {
        if (DEBUG)
            console.log('broadcast on DataChannel:', msg);
        webRTC.dataChannel.send(msg);
    }
    else if (socket) {
        if (DEBUG)
            console.log('broadcast on WebSocket:', msg);
        socket.send(msg);
    }
    else {
        if (DEBUG)
            console.error('No place to send:', msg);
    }
};
export var message;
(function (message) {
    message[message["RegisterPlayer"] = 0] = "RegisterPlayer";
    message[message["RemovePlayer"] = 1] = "RemovePlayer";
    message[message["ResetGame"] = 2] = "ResetGame";
    message[message["ResetTurn"] = 3] = "ResetTurn";
    message[message["ShowPopup"] = 4] = "ShowPopup";
    message[message["UpdateRoll"] = 5] = "UpdateRoll";
    message[message["UpdateScore"] = 6] = "UpdateScore";
    message[message["UpdateDie"] = 7] = "UpdateDie";
    message[message["UpdatePlayers"] = 8] = "UpdatePlayers";
    message[message["SetID"] = 9] = "SetID";
    message[message["GameFull"] = 10] = "GameFull";
    message[message["Bye"] = 11] = "Bye";
    message[message["RtcOffer"] = 12] = "RtcOffer";
    message[message["RtcAnswer"] = 13] = "RtcAnswer";
    message[message["candidate"] = 14] = "candidate";
    message[message["invitation"] = 15] = "invitation";
})(message || (message = {}));
