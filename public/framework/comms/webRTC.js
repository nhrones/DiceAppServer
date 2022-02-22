import { onSignalRecieved, sendSignal } from './signaling.js';
import { DEBUG } from '../../types.js';
import { dispatch } from './signaling.js';
export let peerConnection;
export let dataChannel;
export let RTCopen = false;
export const initialize = () => {
    onSignalRecieved(message.RtcOffer, async (offer) => {
        if (peerConnection) {
            if (DEBUG)
                console.error('existing peerconnection');
            return;
        }
        createPeerConnection(false);
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        sendSignal(message.RtcAnswer, { type: 'answer', sdp: answer.sdp });
        await peerConnection.setLocalDescription(answer);
    });
    onSignalRecieved(message.RtcAnswer, async (answer) => {
        if (!peerConnection) {
            if (DEBUG)
                console.error('no peerconnection');
            return;
        }
        await peerConnection.setRemoteDescription(answer);
    });
    onSignalRecieved(message.candidate, async (candidate) => {
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
    onSignalRecieved(message.Bye, () => {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
    });
    onSignalRecieved(message.invitation, (_data) => {
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
    sendSignal(message.invitation, {});
};
const reset = () => {
    dataChannel = null;
    peerConnection = null;
    start();
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
        sendSignal(message.candidate, init);
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
    dataChannel.addEventListener("message", (event) => {
        const payload = JSON.parse(event.data);
        const topic = payload[0];
        const tName = (topic > 59) ? 'UpdateScore' : message[topic];
        if (DEBUG)
            console.info('DataChannel recieved topic: ', tName);
        dispatch(topic, payload[1]);
    });
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
            updateUI({
                content: `Player2 was disconnected! Waiting for new offer on: ${location.origin}`, clearContent: true
            });
            reset();
        }
    }
}
export async function makeConnection() {
    createPeerConnection(true);
    const offer = await peerConnection.createOffer();
    sendSignal(message.RtcOffer, { type: 'offer', sdp: offer.sdp });
    await peerConnection.setLocalDescription(offer);
}
updateUI({ content: `Player1 is waiting for a connection from: ${location.origin}` });
function updateUI(msg) {
    if (DEBUG)
        console.log(msg.content);
}
export const ReadyState = {
    closed: 'closed',
    closing: 'closing',
    connecting: 'connecting',
    open: 'open',
};
export var message;
(function (message) {
    message[message["Bye"] = 11] = "Bye";
    message[message["RtcOffer"] = 12] = "RtcOffer";
    message[message["RtcAnswer"] = 13] = "RtcAnswer";
    message[message["candidate"] = 14] = "candidate";
    message[message["invitation"] = 15] = "invitation";
})(message || (message = {}));
