import { ReadyState } from './RTClib.js';
import { dispatch, onEvent, sendSSEmessage } from './signaling.js';
import { DEBUG } from '../../constants.js';
import { Event, Fire } from '../model/events.js';
import { players, removePlayer } from '../../model/players.js';
export let peerConnection;
export let dataChannel;
export let RTCopen = false;
export const initialize = () => {
    onEvent('RtcOffer', async (offer) => {
        console.info('offer: ', offer);
        if (peerConnection) {
            if (DEBUG)
                console.error('existing peerconnection');
            return;
        }
        createPeerConnection(false);
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        sendSSEmessage({ event: 'RtcAnswer', data: { type: 'answer', sdp: answer.sdp } });
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
            if (DEBUG)
                console.log(`Already connected with Player2, ignoring 'connectOffer'!`);
            return;
        }
        if (DEBUG)
            console.log(`player2 has sent me a 'connectOffer'!  I'm making the RTC-connection!`);
        makeConnection();
    });
};
export const start = () => {
    sendSSEmessage({ event: 'invitation', data: {} });
};
const reset = (msg) => {
    dataChannel = null;
    peerConnection = null;
    start();
    removePlayer([...players][1].id);
    Fire(Event.ShowPopup, { message: msg });
};
function createPeerConnection(isOfferer) {
    if (DEBUG)
        console.log('Starting WebRTC as', isOfferer ? 'Offerer' : 'Offeree');
    peerConnection = new RTCPeerConnection({
        iceServers: [{
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302"
                ]
            }]
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
        sendSSEmessage({ event: 'candidate', data: init });
    };
    if (isOfferer) {
        if (DEBUG)
            console.log('Offerer -> creating dataChannel!');
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
    checkDataChannelState();
    dataChannel.onopen = checkDataChannelState;
    dataChannel.onclose = checkDataChannelState;
    dataChannel.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        const { event, data } = msg;
        if (DEBUG)
            console.info('DataChannel recieved event: ', event);
        dispatch(event, data);
    };
}
function checkDataChannelState() {
    if (dataChannel.readyState === ReadyState.open) {
        if (RTCopen === false) {
            RTCopen = true;
            updateUI({ content: `Player1 is now connected to Player2`, clearContent: true });
        }
    }
    else if (dataChannel.readyState === ReadyState.closed) {
        if (RTCopen === true) {
            RTCopen = false;
            reset('Player2 has disconnected!');
        }
    }
}
export async function makeConnection() {
    createPeerConnection(true);
    const offer = await peerConnection.createOffer();
    sendSSEmessage({ event: 'RtcOffer', data: { type: 'offer', sdp: offer.sdp } });
    await peerConnection.setLocalDescription(offer);
}
updateUI({ content: `Player1 is waiting for a connection from: ${location.origin}` });
function updateUI(msg) {
    if (DEBUG)
        console.log(msg.content);
}
export const sendSignal = (msg) => {
    if (dataChannel && dataChannel.readyState === 'open') {
        const jsonMsg = JSON.stringify(msg);
        if (DEBUG)
            console.info('Sending to DataChannel >> :', jsonMsg);
        dataChannel.send(jsonMsg);
    }
    else {
        console.error('No place to send the message:', msg.event);
    }
};
