"use strict";

const crypto = require("crypto");
const readline = require('readline');

const args = process.argv.slice(2);

class Hmac {
    constructor(message) {
        this.message = message;
        this.key = crypto.randomBytes(32).toString("hex");
        this.hmac = crypto.createHmac("sha256", this.key);
    }

    getKey() {
        return this.key;
    }

    getHmac() {
        return this.hmac.update(Buffer.from(this.message, 'utf-8')).digest("hex");
    }
}

class Table {
    constructor(arr) {
        this.commands = arr;
    }

    createTable() {
        let table = [];
        const countWandLinRow = Math.floor(this.commands.length / 2);
        let winAndLoseStr = "";

        for (let i = 0; i < countWandLinRow * 2; i++) {
            if (i >= countWandLinRow) {
                winAndLoseStr += "L";
            } else {
                winAndLoseStr += "W";
            }
        }

        for (let i = 0; i < this.commands.length; i++) {
            table[i] = [];
            for (let j = 0; j < this.commands.length; j++) {
                if (i === j) {
                    table[i][j] = "D";
                } else {
                    table[i][j] = 0;
                }
            }
        }

        for (let i = 0; i < this.commands.length; i++) {
            for (let j = 0; j < table[i].length; j++) {
                if (table[i][j] === "D") {
                    let rightNulls = this.commands.length - i - 1;
                    let leftNulls = i;

                    if (leftNulls === 0) {
                        for (let k = 0; k < winAndLoseStr.length; k++) {
                            table[i][k + 1] = winAndLoseStr[k];
                        }
                        break;
                    }

                    if (rightNulls === 0) {
                        for (let k = 0; k < winAndLoseStr.length; k++) {
                            table[i][k] = winAndLoseStr[k];
                        }
                        break;
                    }

                    if (rightNulls !== 0 && leftNulls !== 0) {
                        for (let k = 0; k < rightNulls; k++) {
                            table[i][leftNulls + 1 + k] = winAndLoseStr[k];
                        }
                        for (let k = 0; k < leftNulls; k++) {
                            table[i][k] = winAndLoseStr[rightNulls + k];
                        }
                        break;
                    }
                }
            }
        }

        return table;
    }

    printTable() {
        const table = this.createTable();

        for (let i = 0; i < this.commands.length; i++) {
            table[i].unshift(this.commands[i][0] + "|");
        }

        let dashStr = "";
        for (let i = 0; i < (6 * Math.floor(this.commands.length / 2) + 1); i++) {
            dashStr += "-";
        }

        console.log("\n");
        console.log("    " + this.commands.toString().split(",").join("  "));
        console.log(`    ${dashStr}`);
        for (let i = 0; i < this.commands.length; i++) {
            console.log(table[i].toString().split(",").join("  ") + "\n");
        }
    }
}

class Winner {
    constructor(myMove, compMove, commands) {
        this.myMove = myMove;
        this.compMove = compMove;
        this.commands = commands;
    }

    getWinner() {
        const winner = checkingTheWinner(this.myMove, this.compMove, this.commands);

        if (winner === 1) {
            console.log("Draw!");
        } else if (winner === 2) {
            console.log("You win!");
        } else {
            console.log("Computer win(");
        }

        function checkingTheWinner(myMove, compMove, commands) {
            if (myMove == compMove) {
                return 1;
            } else {
                const myTable = new Table(commands);
                const table = myTable.createTable();
                let myIndex, compIndex;

                for (let i = 0; i < commands.length; i++) {
                    if (commands[i] === myMove) {
                        myIndex = i;
                    }

                    if (commands[i] === compMove) {
                        compIndex = i;
                    }
                }

                if (table[myIndex][compIndex] === "W") {
                    return 2;
                } else { return 3 };
            }
        }
    }
}

checkCommands(args);


function checkCommands(arr) {
    const currectIputStr = "Correct input: «npm start rock scissors paper» or «npm start 1 2 3 4 5»";
    if (arr.length === 0) {
        console.log("\nYou haven't entered anything!\n" + currectIputStr);
    } else if (arr.length < 3) {
        console.log("\nThe number of parameters must be more than 3!\n" + currectIputStr);
    } else if (arr.length % 2 === 0) {
        console.log("\nThe number of parameters must be odd!\n" + currectIputStr);
    } else {
        const identicalCommands = checkIdenticalCommands(arr);

        if (!identicalCommands) {
            createCompMove(arr);
        } else {
            console.log(`\nYou have entered the same parameters: ${identicalCommands.command}\nThe parameters should be different!\n` + currectIputStr);
        }
    }
}


function checkIdenticalCommands(commands) {
    const arr = commands.map(item => item.toLowerCase());
    arr.sort();
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            return {
                command: arr[i],
                value: true
            };
        }
    }
    return false;
}


function createCompMove(commands) {
    const compMoveIndex = Math.floor(Math.random() * commands.length),
        compMoveStr = commands[compMoveIndex];

    const myHmac = new Hmac(compMoveStr);
    console.log("HMAC: " + myHmac.getHmac());

    startGame(compMoveStr, myHmac, commands);
}


function startGame(compMove, hmac, arr) {
    console.log("Available moves:");
    for (let i = 0; i < arr.length; i++) {
        console.log(`${i + 1} - ${arr[i]}`);
    }
    console.log("0 - exit\n? - help");

    const rl = readline.createInterface(process.stdin, process.stdout);

    rl.question("Enter your move: ", function (answer) {

        if (answer != "?" && !(answer % 1 == 0)) {

            rl.close();
            startGame(compMove, hmac, arr);

        } else if (answer > 0 && answer <= arr.length) {

            console.log(`Your move: ${arr[answer - 1]}`);
            console.log(`Computer move: ${compMove}`);

            const winner = new Winner(arr[answer - 1], compMove, arr);
            winner.getWinner();

            console.log(`HMAC key: ${hmac.getKey()}`);

            rl.close();

        } else if (answer == 0) {

            rl.close();

        } else if (answer == "?") {

            const table = new Table(arr);
            table.printTable();
            rl.close();

        } else {

            rl.close();
            startGame(compMove, hmac, arr);

        }
    });
}