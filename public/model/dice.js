import * as events from '../framework/model/events.js';
import { thisPlayer } from '../model/players.js';
import * as PlaySound from '../framework/model/sounds.js';
import * as evaluator from './diceEvaluator.js';
import { game } from './diceGame.js';
import * as socket from '../framework/model/socket.js';
const { topic: _, broadcast: fireEvent, } = events;
export let rollCount = 0;
export let isFiveOfaKind = false;
export let fiveOfaKindCount = 0;
export let fiveOfaKindBonusAllowed = false;
export let fiveOfaKindWasSacrificed = false;
export const die = [
    { value: 0, frozen: false },
    { value: 0, frozen: false },
    { value: 0, frozen: false },
    { value: 0, frozen: false },
    { value: 0, frozen: false }
];
export let sum = 0;
export const setRollCount = (val) => {
    rollCount = val;
};
export const setIsFiveOfaKind = (val) => {
    isFiveOfaKind = val;
};
export const setfiveOfaKindBonusAllowed = (val) => {
    fiveOfaKindBonusAllowed = val;
};
export const setfiveOfaKindWasSacrificed = (val) => {
    fiveOfaKindWasSacrificed = val;
};
export const setfiveOfaKindCount = (val) => {
    fiveOfaKindCount = val;
};
export const init = () => {
    events.when(_.DieTouched, (data) => {
        const { index } = data;
        const thisDie = die[index];
        if (thisDie.value > 0) {
            thisDie.frozen = !thisDie.frozen;
            updateView(index, thisDie.value, thisDie.frozen);
            PlaySound.Select();
            socket.broadcast({ topic: socket.topic.UpdateDie, data: { dieNumber: index, AppID: thisPlayer.id } });
        }
    });
    socket.when(socket.topic.UpdateDie, (data) => {
        const d = die[data.dieNumber];
        if (d.value > 0) {
            d.frozen = !d.frozen;
            updateView(data.dieNumber, d.value, d.frozen);
        }
    });
};
export const resetTurn = () => {
    die.forEach((thisDie, index) => {
        thisDie.frozen = false;
        thisDie.value = 0;
        updateView(index, 0, false);
    });
    rollCount = 0;
    sum = 0;
};
export const resetGame = () => {
    resetTurn();
    isFiveOfaKind = false;
    fiveOfaKindCount = 0;
    fiveOfaKindBonusAllowed = false;
    fiveOfaKindWasSacrificed = false;
};
export const roll = (dieValues) => {
    PlaySound.Roll();
    sum = 0;
    die.forEach((thisDie, index) => {
        if (dieValues === null) {
            if (!thisDie.frozen) {
                thisDie.value = Math.floor(Math.random() * 6) + 1;
                updateView(index, thisDie.value, thisDie.frozen);
            }
        }
        else {
            if (!thisDie.frozen) {
                thisDie.value = dieValues[index];
                updateView(index, thisDie.value, thisDie.frozen);
            }
        }
        sum += thisDie.value;
    });
    rollCount += 1;
    evaluator.evaluateDieValues();
    game.evaluatePossibleScores();
};
const updateView = (index, value, frozen) => {
    fireEvent(_.UpdateDie + index, { value: value, frozen: frozen });
};
export const toString = () => {
    let str = '[';
    die.forEach((thisDie, index) => {
        str += thisDie.value;
        if (index < 4) {
            str += ',';
        }
    });
    return str + ']';
};
