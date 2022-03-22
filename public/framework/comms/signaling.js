import { initPeers, Emoji, callee, registerPeer } from './peers.js';
import * as webRTC from './webRTC.js';
const DEBUG = true;
const host = window.location.hostname;
const SignalServerURL = 'https://rtc-signal-server.deno.dev';
export const serviceURL = (host === '127.0.0.1' || host === 'localhost')
    ? 'http://localhost:8000'
    : SignalServerURL;
console.log('serviceURL', serviceURL);
const subscriptions = new Map();
export let sse;
export const initialize = (name, id, emoji = Emoji[0]) => {
    if (sse) {
        return;
    }
    initPeers(id, name);
    window.addEventListener('beforeunload', () => {
        if (sse.readyState === SSE.OPEN) {
            const sigMsg = JSON.stringify({
                from: callee.id,
                event: 'close',
                data: callee.id + ' window was closed!',
                id: 0
            });
            fetch(serviceURL, {
                method: "POST",
                body: sigMsg
            });
        }
    });
    sse = new EventSource(serviceURL + '/listen/' + id);
    sse.onopen = () => {
        if (DEBUG)
            console.log('Sse.onOpen! >>>  webRTC.start()');
        webRTC.initialize();
    };
    sse.onerror = (err) => {
        if (DEBUG)
            console.error('sse.error!', err);
        dispatch('ShowPopup', `Seats Full! Please close tab!`);
    };
    sse.onmessage = (msg) => {
        if (DEBUG)
            console.log('<<<<  signaler got  <<<<  ', msg.data);
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
        registerPeer(data.id, callee.name);
        dispatch('SetID', { id: data.id, name: callee.name });
        webRTC.start();
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
export const signal = (msg) => {
    if (sse.readyState === SSE.OPEN) {
        const sigMsg = JSON.stringify({ from: callee.id, event: msg.event, data: msg.data });
        if (DEBUG)
            console.log('>>>>  sig-server  >>>> :', sigMsg);
        fetch(serviceURL, {
            method: "POST",
            body: sigMsg
        });
    }
    else {
        if (DEBUG) {
            console.error('No place to send the message:', msg.event);
        }
    }
};
export const SSE = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSED: 2
};
