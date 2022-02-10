import { Event, Fire } from './events.js';
import * as webRTC from './webRTC.js';
import { DEBUG } from '../../types.js';
const subscriptions = new Map();
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
    socket.addEventListener('message', (message) => {
        console.info('socket recieved message.data: ', message.data);
        const payload = JSON.parse(message.data);
        if (Array.isArray(payload)) {
            console.info('socket recieved topic: ', payload[0]);
            dispatch(payload[0], payload[1]);
        }
        else {
            dispatch(payload.topic, payload.data);
        }
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
    const msg = JSON.stringify([topic, data]);
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
export var message;
(function (message) {
    message["RegisterPlayer"] = "RegisterPlayer";
    message["RemovePlayer"] = "RemovePlayer";
    message["ResetGame"] = "ResetGame";
    message["ResetTurn"] = "ResetTurn";
    message["ShowPopup"] = "ShowPopup";
    message["UpdateRoll"] = "UpdateRoll";
    message["UpdateScore"] = "UpdateScore";
    message["UpdateDie"] = "UpdateDie";
    message["UpdatePlayers"] = "UpdatePlayers";
    message["SetID"] = "SetID";
    message["GameFull"] = "GameFull";
    message["Bye"] = "bye";
    message["RtcOffer"] = "RtcOffer";
    message["RtcAnswer"] = "RtcAnswer";
    message["IceCandidate"] = "candidate";
    message["ConnectOffer"] = "connectOffer";
})(message || (message = {}));
