import { onSocketRecieved, socketSend } from './socket.js';
import { DEBUG } from '../../types.js';
import { dispatch } from './socket.js';
export let peerConnection;
export let dataChannel;
export const initialize = () => {
    onSocketRecieved('RtcOffer', async (offer) => {
        if (peerConnection) {
            if (DEBUG)
                console.error('existing peerconnection');
            return;
        }
        createPeerConnection(false);
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        socketSend('RtcAnswer', { type: 'answer', sdp: answer.sdp });
        await peerConnection.setLocalDescription(answer);
    });
    onSocketRecieved('RtcAnswer', async (answer) => {
        if (!peerConnection) {
            if (DEBUG)
                console.error('no peerconnection');
            return;
        }
        await peerConnection.setRemoteDescription(answer);
    });
    onSocketRecieved('candidate', async (candidate) => {
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
    onSocketRecieved('bye', () => {
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
    });
    onSocketRecieved('connectOffer', (_data) => {
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
    socketSend('connectOffer', {});
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
        socketSend('candidate', init);
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
        const { topic, data } = JSON.parse(event.data);
        dispatch(topic, data);
    });
}
function checkDataChannelState() {
    if (dataChannel.readyState === 'open') {
        updateUI({ content: `Player1 is now connected to Player2`, clearContent: true });
    }
    else if (dataChannel.readyState === 'closed') {
        updateUI({
            content: `Player2 was disconnected! 
Waiting for new offer on: ${location.origin}`, clearContent: true
        });
        reset();
    }
}
export async function makeConnection() {
    createPeerConnection(true);
    const offer = await peerConnection.createOffer();
    socketSend('RtcOffer', { type: 'offer', sdp: offer.sdp });
    await peerConnection.setLocalDescription(offer);
}
updateUI({ content: `Player1 is waiting for a connection from: ${location.origin}` });
function updateUI(msg) {
    console.log(msg.content);
}
