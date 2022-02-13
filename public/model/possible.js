import * as dice from './dice.js';
import * as evaluator from './diceEvaluator.js';
const ThreeOfaKind = 6;
const FourOfaKind = 7;
const SmallStraight = 8;
const LargeStraight = 9;
const House = 10;
const FiveOfaKind = 11;
const Chance = 12;
export const FiveOfaKindIndex = FiveOfaKind;
export const evaluate = (elementID) => {
    if (elementID < 6) {
        return evaluateNumber(elementID + 1);
    }
    else {
        return evaluateCommon(elementID);
    }
};
const evaluateCommon = (element) => {
    if (element === FiveOfaKind) {
        return (evaluator.hasFiveOfaKind) ? 50 : 0;
    }
    else if (element === SmallStraight) {
        return (evaluator.hasSmallStr) ? 30 : 0;
    }
    else if (element === LargeStraight) {
        return (evaluator.hasLargeStr) ? 40 : 0;
    }
    else if (element === House) {
        return (evaluator.hasFullHouse) ? 25 : 0;
    }
    else if (element === FourOfaKind) {
        return (evaluator.hasQuads || evaluator.hasFiveOfaKind) ?
            evaluator.sumOfAllDie : 0;
    }
    else if (element === ThreeOfaKind) {
        return (evaluator.hasTrips || evaluator.hasQuads || evaluator.hasFiveOfaKind) ?
            evaluator.sumOfAllDie : 0;
    }
    else if (element === Chance) {
        return evaluator.sumOfAllDie;
    }
    else {
        return 0;
    }
};
const evaluateNumber = (target) => {
    let hits = 0;
    for (let i = 0; i < 5; i++) {
        const val = (dice.die[i]).value;
        if (val === target) {
            hits += 1;
        }
    }
    return target * hits;
};
