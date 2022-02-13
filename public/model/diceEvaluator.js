import * as dice from './dice.js';
import * as PlaySound from '../framework/model/sounds.js';
const smallLow = 15;
const smallMid = 30;
const smallHigh = 60;
const largeLow = 31;
const largeHigh = 62;
const binaryFaceValue = [0, 1, 2, 4, 8, 16, 32];
let countOfDieFaceValue = [0, 0, 0, 0, 0, 0, 0];
export let sumOfAllDie = 0;
let straightsMask = 0;
export let hasPair = false;
export let hasTwoPair = false;
export let hasTrips = false;
export let hasQuads = false;
export let hasFiveOfaKind = false;
export let hasTripsOrBetter = false;
export let hasFullHouse = false;
export let hasSmallStr = false;
export let hasLargeStr = false;
export const evaluateDieValues = () => {
    countOfDieFaceValue = [0, 0, 0, 0, 0, 0, 0];
    sumOfAllDie = 0;
    const dieSet = dice.die;
    for (let i = 0; i < 5; i++) {
        const val = dieSet[i].value;
        sumOfAllDie += val;
        if (val > 0) {
            countOfDieFaceValue[val] += 1;
        }
    }
    setTheStraightsMask();
    setScoringFlags();
    dice.setIsFiveOfaKind(testForFiveOfaKind());
};
const setScoringFlags = () => {
    hasPair = false;
    hasTwoPair = false;
    hasTrips = false;
    hasQuads = false;
    hasFiveOfaKind = false;
    hasTripsOrBetter = false;
    hasFullHouse = false;
    hasSmallStr = false;
    hasLargeStr = false;
    for (let i = 0; i < 7; i++) {
        if (countOfDieFaceValue[i] === 5) {
            hasFiveOfaKind = true;
            hasTripsOrBetter = true;
        }
        if (countOfDieFaceValue[i] === 4) {
            hasQuads = true;
            hasTripsOrBetter = true;
        }
        if (countOfDieFaceValue[i] === 3) {
            hasTrips = true;
            hasTripsOrBetter = true;
        }
        if (countOfDieFaceValue[i] === 2) {
            if (hasPair) {
                hasTwoPair = true;
            }
            hasPair = true;
        }
    }
    hasFullHouse = (hasTrips && hasPair);
    const mask = straightsMask;
    hasLargeStr = ((mask & largeLow) === largeLow ||
        (mask & largeHigh) === largeHigh);
    hasSmallStr = ((mask & smallLow) === smallLow ||
        (mask & smallMid) === smallMid ||
        (mask & smallHigh) === smallHigh);
};
const testForFiveOfaKind = () => {
    if (hasFiveOfaKind) {
        if (dice.fiveOfaKindWasSacrificed) {
            PlaySound.Dohh();
        }
        else {
            PlaySound.Woohoo();
        }
        return true;
    }
    return false;
};
const setTheStraightsMask = () => {
    const die = dice.die;
    straightsMask = 0;
    for (let thisValue = 1; thisValue <= 6; thisValue++) {
        if (die[0].value === thisValue ||
            die[1].value === thisValue ||
            die[2].value === thisValue ||
            die[3].value === thisValue ||
            die[4].value === thisValue) {
            straightsMask += binaryFaceValue[thisValue];
        }
    }
};
const testForMultiples = (multipleSize, thisManySets) => {
    let count = 0;
    let hits = 0;
    let sum = 0;
    for (let dieValue = 6; dieValue >= 1; dieValue--) {
        count = countOfDieFaceValue[dieValue];
        if (count >= multipleSize) {
            hits += 1;
            sum += (multipleSize * dieValue);
            if (hits === thisManySets) {
                return sum;
            }
        }
    }
    return 0;
};
