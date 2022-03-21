import { dispatch, onEvent, signal } from './signaling.js';
import { LogLevel, info, debug } from '../../constants.js';
export let peerConnection;
export let dataChannel;
export let RTCopen = false;
export const initialize = () => {
    onEvent('RtcOffer', async (offer) => {
        if (peerConnection) {
            if (LogLevel >= info)
                console.error('existing peerconnection');
            return;
        }
        createPeerConnection(false);
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        signal({ event: 'RtcAnswer', data: { type: 'answer', sdp: answer.sdp } });
        await peerConnection.setLocalDescription(answer);
    });
    onEvent('RtcAnswer', async (answer) => {
        if (!peerConnection) {
            if (LogLevel >= debug)
                console.error('no peerconnection');
            return;
        }
        await peerConnection.setRemoteDescription(answer);
    });
    onEvent('candidate', async (candidate) => {
        if (!peerConnection) {
            if (LogLevel >= debug)
                console.error('no peerconnection');
            return;
        }
        if (!candidate.candidate) {
            await peerConnection.addIceCandidate(null);
        }
        else {
            await peerConnection.addIceCandidate(candidate);
        }
    });
    onEvent('Bye', () => {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
    });
    onEvent('invitation', (_data) => {
        if (peerConnection) {
            if (LogLevel >= debug)
                console.log(`Already connected, ignoring this 'invitation'!`);
            return;
        }
        if (LogLevel >= debug)
            console.log(`A peer has sent me a 'invitation'!  I'll make a  WebRTC-connection!`);
        makeConnection();
    });
    dispatch('UpdateUI', `Waiting for a connection from: ${location.origin}`);
};
export const start = () => {
    signal({ event: 'invitation', data: {} });
};
function reset(msg) {
    dataChannel = null;
    peerConnection = null;
    start();
    dispatch('ShowPopup', msg);
}
function createPeerConnection(isOfferor) {
    if (LogLevel >= debug)
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
        if (LogLevel >= debug)
            console.log('Offeror -> creating dataChannel!');
        dataChannel = peerConnection.createDataChannel('chat');
        setupDataChannel();
    }
    else {
        peerConnection.ondatachannel = (event) => {
            if (LogLevel >= debug)
                console.log('peerConnection.ondatachannel -> creating dataChannel!');
            dataChannel = event.channel;
            setupDataChannel();
        };
    }
}
function setupDataChannel() {
    checkDataChannelState();
    dataChannel.onopen = checkDataChannelState;
    dataChannel.onclose = checkDataChannelState;
    dataChannel.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        const { event, data } = msg;
        if (LogLevel >= debug)
            console.info('<<<<  DataChannel got  <<<<  ', event);
        dispatch(event, data);
    };
}
function checkDataChannelState() {
    if (dataChannel.readyState === ReadyState.open) {
        if (RTCopen === false) {
            RTCopen = true;
            dispatch('UpdateUI', `Peer1 is now connected to Peer2`);
        }
    }
    else if (dataChannel.readyState === ReadyState.closed) {
        if (RTCopen === true) {
            RTCopen = false;
            dispatch('PeerDisconnected', 'Peer has disconnected!');
            reset('Peer has disconnected!');
        }
    }
}
export async function makeConnection() {
    createPeerConnection(true);
    const offer = await peerConnection.createOffer();
    signal({ event: 'RtcOffer', data: { type: 'offer', sdp: offer.sdp } });
    await peerConnection.setLocalDescription(offer);
}
export const sendSignal = (msg) => {
    if (dataChannel && dataChannel.readyState === 'open') {
        const jsonMsg = JSON.stringify(msg);
        if (LogLevel >= debug)
            console.info('>>>>  DataChannel  >>>> :', jsonMsg);
        dataChannel.send(jsonMsg);
    }
    else {
        if (LogLevel >= debug)
            console.log('No place to send the message:', msg.event);
    }
};
export const ReadyState = {
    closed: 'closed',
    closing: 'closing',
    connecting: 'connecting',
    open: 'open',
};
