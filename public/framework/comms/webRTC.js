import { callee, caller, setCaller } from './peers.js';
import { dispatch, onEvent, signal } from './signaling.js';
const DEBUG = true;
export let peerConnection;
export let dataChannel;
export let RTCopen = false;
export const initialize = () => {
    onEvent('RtcOffer', async (data) => {
        setCaller(data.from);
        if (peerConnection) {
            if (DEBUG)
                console.error('existing peerconnection');
            return;
        }
        createPeerConnection(false);
        await peerConnection.setRemoteDescription(data.data);
        const answer = await peerConnection.createAnswer();
        signal({ event: 'RtcAnswer', data: { type: 'answer', sdp: answer.sdp } });
        await peerConnection.setLocalDescription(answer);
    });
    onEvent('RtcAnswer', async (answer) => {
        if (!peerConnection) {
            if (DEBUG)
                console.error('no peerconnection');
            return;
        }
        await peerConnection.setRemoteDescription(answer);
    });
    onEvent('candidate', async (candidate) => {
        if (!peerConnection) {
            if (DEBUG)
                console.error('no peerconnection');
            return;
        }
        console.log('handling candidate!');
        if (!candidate.candidate) {
            await peerConnection.addIceCandidate(null);
        }
        else {
            await peerConnection.addIceCandidate(candidate);
        }
    });
    onEvent('close', () => {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
    });
    onEvent('invitation', (data) => {
        if (peerConnection) {
            if (DEBUG)
                console.log(`Already connected, ignoring this 'invitation'!`);
            return;
        }
        setCaller(data);
        if (DEBUG)
            console.log(`A peer named ${data.name} has sent me an 'invitation'!  I'll make a  WebRTC-connection!`);
        makeConnection();
    });
    dispatch('UpdateUI', `⌛  ${callee.name} is waiting for a connection\n from: ${location.origin}`);
};
export const start = () => {
    console.info('inviting from start - callee:', callee);
    signal({ event: 'invitation', data: callee });
};
function reset(msg) {
    dataChannel = null;
    peerConnection = null;
    start();
    dispatch('ShowPopup', msg);
}
function createPeerConnection(isOfferor) {
    if (DEBUG)
        console.log('Starting WebRTC as', isOfferor ? 'Offeror' : 'Offeree');
    peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] }]
    });
    peerConnection.onicecandidate = (event) => {
        const init = {
            candidate: null,
            sdpMid: "",
            sdpMLineIndex: 0
        };
        if (event.candidate) {
            init.candidate = event.candidate.candidate;
            init.sdpMid = event.candidate.sdpMid;
            init.sdpMLineIndex = event.candidate.sdpMLineIndex;
        }
        signal({ event: 'candidate', data: init });
    };
    if (isOfferor) {
        if (DEBUG)
            console.log('Offeror -> creating dataChannel!');
        dataChannel = peerConnection.createDataChannel('chat');
        setupDataChannel();
    }
    else {
        peerConnection.ondatachannel = (event) => {
            if (DEBUG)
                console.log('peerConnection.ondatachannel -> creating dataChannel!');
            dataChannel = event.channel;
            setupDataChannel();
        };
    }
}
function setupDataChannel() {
    dataChannel.onopen = checkDataChannelState;
    dataChannel.onclose = checkDataChannelState;
    dataChannel.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        const { event, data } = msg;
        if (DEBUG)
            console.info('<<<<  DataChannel got  <<<<  ', event);
        dispatch(event, data);
    };
}
function checkDataChannelState() {
    if (dataChannel.readyState === ReadyState.open) {
        if (RTCopen === false) {
            RTCopen = true;
            console.info('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&caller:', caller);
            dispatch('UpdateUI', `${callee.name} is now connected to ${caller.name}`);
        }
    }
    else if (dataChannel.readyState === ReadyState.closed) {
        if (RTCopen === true) {
            RTCopen = false;
            dispatch('PeerDisconnected', `${caller.name} has disconnected!`);
            reset(`${caller.name} has disconnected!`);
        }
    }
}
export async function makeConnection() {
    createPeerConnection(true);
    const offer = await peerConnection.createOffer();
    signal({ event: 'RtcOffer', data: { from: callee, data: { type: 'offer', sdp: offer.sdp } } });
    await peerConnection.setLocalDescription(offer);
}
export const sendSignal = (msg) => {
    if (dataChannel && dataChannel.readyState === 'open') {
        const jsonMsg = JSON.stringify(msg);
        if (DEBUG)
            console.info('>>>>  DataChannel  >>>> :', jsonMsg);
        dataChannel.send(jsonMsg);
    }
    else {
        if (DEBUG)
            console.log('No place to send the message:', msg.event);
    }
};
export const ReadyState = {
    closed: 'closed',
    closing: 'closing',
    connecting: 'connecting',
    open: 'open',
};
