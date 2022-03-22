import { serviceURL } from './signaling.js';
export let callee = {
    id: 'callee',
    name: 'callee',
    alias: 'Player-1',
    role: 'callee',
    emoji: ''
};
export let caller = {
    id: 'caller',
    name: 'caller',
    alias: 'Player-2',
    role: 'caller',
    emoji: ''
};
export function setCaller(peer) {
    caller = peer;
    console.info('setCaller: ', caller);
}
export function initPeers(id, name, emoji = Emoji[0]) {
    callee = { id: id, name: name, alias: 'Player-1', role: 'callee', emoji: emoji };
    caller = { id: 'caller', name: 'caller', alias: 'Player-2', role: 'caller', emoji: Emoji[1] };
}
export const registerPeer = (id, name) => {
    const msg = JSON.stringify({
        from: id,
        event: 'RegisterPeer',
        data: callee
    });
    fetch(serviceURL, { method: "POST", body: msg });
};
export function swapPeers(newName, newEmoji) {
    caller.name = newName;
    this.callee.emoji = caller.emoji;
    this.caller.emoji = newEmoji;
}
export const Emoji = ['🐸', '🐼', '🐭', '🐯', '🐶', '👀', '👓'];
