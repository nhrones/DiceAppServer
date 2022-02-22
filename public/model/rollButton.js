import { onSignalRecieved, message, sendSignal } from '../framework/comms/signaling.js';
import { ON, Event, Fire } from '../framework/model/events.js';
import * as dice from './dice.js';
const kind = 'rollbutton';
export const state = { text: '', color: '', enabled: true };
export const init = () => {
    ON(`${Event.ButtonTouched}${kind}`, () => {
        dice.roll(null);
        sendSignal(message.UpdateRoll, dice.toString());
        updateRollState();
    });
    onSignalRecieved(message.UpdateRoll, (diceArray) => {
        dice.roll(JSON.parse(diceArray));
        updateRollState();
    });
};
const updateRollState = () => {
    switch (dice.rollCount) {
        case 1:
            state.text = 'Roll Again';
            break;
        case 2:
            state.text = 'Last Roll';
            break;
        case 3:
            state.enabled = false;
            state.text = 'Select Score';
            break;
        default:
            state.text = 'Roll Dice';
            dice.setRollCount(0);
    }
    update();
};
export const update = () => {
    Fire(Event.UpdateButton + kind, state);
};
