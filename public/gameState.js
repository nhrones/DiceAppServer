export const emptyString = '';
class GameState {
    constructor() {
        this.seat1 = { id: emptyString, table: 0, name: 'Player1' };
        this.seat2 = { id: emptyString, table: 0, name: 'Player2' };
    }
    gameIsFull() {
        return (this.seat1.id !== emptyString && this.seat2.id !== emptyString);
    }
    connect(id, name, table, seat) {
        if (this.seat1.id.length === 0) {
            this.seat1.id = id;
            this.seat1.name = name;
        }
        else if (this.seat2.id.length === 0) {
            this.seat2.id = id;
            this.seat2.name = name;
        }
        else {
            alert('oppps! Game was full!');
        }
    }
    disconnect(id, name, table, seat) {
        if (this.seat1.id === id) {
            this.seat1.id = emptyString;
            this.seat1.name = emptyString;
        }
        else if (this.seat2.id === id) {
            this.seat2.id = emptyString;
            this.seat2.name = emptyString;
        }
        else {
            alert('oppps! ID not found when disconnect was called!');
        }
    }
    toString() {
        return `Seat1: ${JSON.stringify(this.seat1)} Seat2: ${JSON.stringify(this.seat2)}`;
    }
}
export const gameState = new GameState();
