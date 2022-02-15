export const emptyString = '';
export let id = emptyString;
export let callee = { id: emptyString, name: 'Player1' };
export let caller = { id: emptyString, name: 'Player2' };
export const gameFull = () => callee.id !== emptyString && caller.id !== emptyString;
export const manageState = (action, id, name, role) => {
    if (action === 'connect') {
        if (callee.id === emptyString) {
            callee.id = id;
            callee.name = name;
        }
        else if (caller.id === emptyString) {
            caller.id = id;
            caller.name = name;
        }
    }
    else if (action === 'disconnect') {
        if (callee.id === id) {
            callee.id = emptyString;
        }
        else if (caller.id === id) {
            caller.id = emptyString;
        }
    }
};
export const toString = () => {
    return `Callee: ${callee} Caller: ${caller}`;
};
