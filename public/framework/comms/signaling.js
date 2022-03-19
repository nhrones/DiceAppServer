import { Event, Fire } from '../model/events.js';
import * as webRTC from './webRTC.js';
import { LogLevel, debug, error, SignalServerURL } from '../../constants.js';
export let thisID = '';
export let thisName = '';
const host = window.location.hostname;
const serviceURL = (host === '127.0.0.1' || host === 'localhost')
    ? 'http://localhost:8000'
    : SignalServerURL;
console.log('serviceURL', serviceURL);
const subscriptions = new Map();
export let sse;
export const initialize = (nam, id) => {
    if (sse) {
        return;
    }
    thisName = nam;
    window.addEventListener('beforeunload', () => {
        if (sse.readyState === SSE.OPEN) {
            const sigMsg = JSON.stringify({
                from: thisID,
                event: 'close',
                data: thisID + ' window was closed!',
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
        if (LogLevel >= debug)
            console.log('Sse.onOpen! >>>  webRTC.start()');
        webRTC.initialize();
    };
    sse.onerror = (err) => {
        if (LogLevel >= debug)
            console.error('sse.error!', err);
        Fire(Event.ShowPopup, { message: `Game Full! Please close tab!` });
    };
    sse.onmessage = (msg) => {
        if (LogLevel >= debug)
            console.log('<<<<  signaler got  <<<<  ', msg.data);
        const msgObject = JSON.parse(msg.data);
        if (LogLevel >= debug)
            console.info('      parsed data = ', msgObject);
        const event = msgObject.event;
        if (LogLevel >= debug)
            console.info('               event: ', event);
        dispatch(event, msgObject.data);
    };
    sse.addEventListener('SetID', (ev) => {
        const msgObject = JSON.parse(ev.data);
        const { data } = msgObject;
        thisID = data.id;
        console.log('signaler::on.SetID - data type = ' + (typeof data) + ' id ' + thisID);
        dispatch('SetID', { id: thisID, name: thisName });
        registerPeer(thisID, thisName);
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
export const registerPeer = (id, name) => {
    const regObj = {
        from: id,
        event: 'RegisterPeer',
        data: { id: id, name: name }
    };
    const msg = JSON.stringify(regObj);
    fetch(serviceURL, {
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
export const signal = (msg) => {
    if (sse.readyState === SSE.OPEN) {
        const sigMsg = JSON.stringify({ from: thisID, event: msg.event, data: msg.data });
        if (LogLevel >= debug)
            console.log('>>>>  sig-server  >>>> :', sigMsg);
        fetch(serviceURL, {
            method: "POST",
            body: sigMsg
        });
    }
    else {
        if (LogLevel >= error) {
            console.error('No place to send the message:', msg.event);
        }
    }
};
export const SSE = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSED: 2
};
