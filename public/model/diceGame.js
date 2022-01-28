import * as socket from '../framework/model/socket.js';
import * as events from '../framework/model/events.js';
import * as Players from '../model/players.js';
import * as PlaySound from '../framework/model/sounds.js';
import * as dice from './dice.js';
import * as Possible from './possible.js';
import ScoreElement from './scoreElement.js';
import * as rollButton from './rollButton.js';
const { topic: _, broadcast: fireEvent, } = events;
const snowColor = 'snow';
const grayColor = 'gray';
export let game;
export class DiceGame {
    constructor() {
        Players.init(this, snowColor);
        this.players = Players.players;
        this.scoreItems = [];
        this.leftBonus = 0;
        this.fiveOkindBonus = 0;
        this.leftTotal = 0;
        this.rightTotal = 0;
        dice.init();
        rollButton.init();
        socket.when(socket.topic.ResetTurn, (_data) => {
            if (!this.isGameComplete()) {
                this.resetTurn();
            }
        });
        socket.when(socket.topic.ResetGame, (data) => {
            this.resetGame();
        });
        events.when(_.PopupResetGame, () => {
            socket.broadcast({ topic: socket.topic.ResetGame, data: {} });
            this.resetGame();
        });
        events.when(_.ScoreElementResetTurn, () => {
            if (this.isGameComplete()) {
                this.clearPossibleScores();
                this.setLeftScores();
                this.setRightScores();
                this.showFinalScore(this.getWinner());
            }
            else {
                this.resetTurn();
            }
        });
        events.when(_.ViewWasAdded, (view) => {
            if (view.type === 'ScoreButton') {
                this.scoreItems.push(new ScoreElement(view.index, view.name));
            }
        });
    }
    static init() {
        if (!DiceGame._instance) {
            DiceGame._instance = new DiceGame();
            game = DiceGame._instance;
        }
    }
    getWinner() {
        if (this.players.size === 1) {
            return this.getPlayer(0);
        }
        let thisWinner = this.getPlayer(0);
        let highscore = 0;
        for (const player of this.players) {
            if (player.score > highscore) {
                highscore = player.score;
                thisWinner = player;
            }
        }
        return thisWinner;
    }
    clearPossibleScores() {
        for (const scoreItem of this.scoreItems) {
            scoreItem.clearPossible();
        }
    }
    evaluatePossibleScores() {
        for (const scoreItem of this.scoreItems) {
            scoreItem.setPossible();
        }
    }
    resetTurn() {
        Players.setCurrentPlayer(Players.getNextPlayer(Players.currentPlayer));
        PlaySound.enabled(Players.currentPlayer.id === Players.thisPlayer.id);
        rollButton.state.color = Players.currentPlayer.color;
        rollButton.state.enabled = true;
        rollButton.state.text = 'Roll Dice';
        rollButton.update();
        dice.resetTurn();
        this.clearPossibleScores();
        this.setLeftScores();
        this.setRightScores();
    }
    resetGame() {
        document.title = Players.thisPlayer.playerName;
        fireEvent(_.HidePopup, {});
        Players.setCurrentPlayer(this.getPlayer(0));
        dice.resetGame();
        for (const scoreItem of this.scoreItems) {
            scoreItem.reset();
        }
        Players.resetScoreLabels();
        this.leftBonus = 0;
        this.fiveOkindBonus = 0;
        this.leftTotal = 0;
        this.rightTotal = 0;
        fireEvent(_.UpdateLabel + 'leftscore', { state: 0, color: 'gray', textColor: snowColor, text: '^ total = 0' });
        Players.resetPlayers();
        rollButton.state.color = 'brown';
        rollButton.state.text = 'Roll Dice';
        rollButton.state.enabled = true;
        rollButton.update();
    }
    showFinalScore(winner) {
        let winMsg;
        if (winner.id !== Players.thisPlayer.id) {
            PlaySound.Nooo();
            winMsg = winner.playerName + ' wins!';
        }
        else {
            PlaySound.Woohoo();
            winMsg = 'You won!';
        }
        rollButton.state.color = 'black';
        rollButton.state.text = winMsg;
        rollButton.update();
        fireEvent(_.UpdateLabel + 'infolabel', { state: 0, color: 'snow', textColor: 'black', text: winMsg + ' ' + winner.score });
        fireEvent(_.ShowPopup, { message: winMsg + ' ' + winner.score });
        socket.broadcast({ topic: socket.topic.ShowPopup,
            data: { message: winner.playerName + ' wins!' + ' ' + winner.score } });
    }
    isGameComplete() {
        let result = true;
        for (const scoreItem of this.scoreItems) {
            if (!scoreItem.owned) {
                result = false;
            }
        }
        return result;
    }
    setLeftScores() {
        this.leftTotal = 0;
        for (const player of this.players) {
            player.score = 0;
        }
        let val;
        for (let i = 0; i < 6; i++) {
            val = this.scoreItems[i].finalValue;
            if (val > 0) {
                this.leftTotal += val;
                const owner = this.scoreItems[i].owner;
                if (owner) {
                    Players.addScore(owner, val);
                    if (this.scoreItems[i].hasFiveOfaKind && (dice.fiveOfaKindCount > 1)) {
                        Players.addScore(owner, 100);
                    }
                }
            }
        }
        if (this.leftTotal > 62) {
            let bonusWinner = this.getPlayer(0);
            let highleft = 0;
            for (const player of this.players) {
                if (player.score > highleft) {
                    highleft = player.score;
                    bonusWinner = player;
                }
            }
            Players.addScore(bonusWinner, 35);
            fireEvent(_.UpdateLabel + 'leftscore', {
                state: 0,
                color: bonusWinner.color,
                textColor: snowColor,
                text: `^ total = ${this.leftTotal.toString()} + 35`
            });
        }
        else {
            fireEvent(_.UpdateLabel + 'leftscore', {
                state: 0,
                color: grayColor,
                textColor: snowColor,
                text: '^ total = ' + this.leftTotal.toString()
            });
        }
        if (this.leftTotal === 0) {
            fireEvent(_.UpdateLabel + 'leftscore', {
                state: 0,
                color: grayColor,
                textColor: snowColor,
                text: '^ total = 0'
            });
        }
    }
    setRightScores() {
        let val;
        const len = this.scoreItems.length;
        for (let i = 6; i < len; i++) {
            val = this.scoreItems[i].finalValue;
            if (val > 0) {
                const owner = this.scoreItems[i].owner;
                if (owner) {
                    Players.addScore(owner, val);
                    if (this.scoreItems[i].hasFiveOfaKind
                        && (dice.fiveOfaKindCount > 1)
                        && (i !== Possible.FiveOfaKindIndex)) {
                        Players.addScore(owner, 100);
                    }
                }
            }
        }
    }
    getPlayer(index) {
        for (const player of this.players) {
            if (player.idx === index) {
                return player;
            }
        }
        return [...this.players][index];
    }
}
