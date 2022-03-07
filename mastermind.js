/*=====================================================================

MASTERMIND GAME

A game where you have to guess the combination of colored pins. You
have 12 tries to guess the combination, otherwise you lose.

- Combinations are made from 6 pins (two or more of the same color is
  allowed, but spaces cannot be left empty).
- Pins are of 8 different colors.

-----------------------------------------------------------------------

Data definitions

color is one of:
- "white"
- "pink"
- "red"
- "orange"
- "yellow"
- "green"
- "blue"
- "black"
Interp. the color of a game pin.

listOfPins is an array of length 5:
Interp. array of 5 colors where index of array represents position
of pin.

hint is one of:
- "color"
- "color_pos"
- "absent"
Interp.
- color = correctly guessed pin color
- color_pos = guessed both pin color and position
- absent = pin is not present in combination
To win, you must have "color_pos" for all 6 pins.

guess is Integer[1, 12]
Interp. the number of tries used to guess the pin combination.

=====================================================================*/

// Constants
const GAMEBOARD = document.getElementById("gameBoard");
const HINTBOARD = document.getElementById("hintBoard");
const ACTIVECOLUMN = document.getElementById("activeColumn");
const WINMODAL = document.getElementById("myModal");
const WINTEXT = document.getElementById("winText");
const TRYAGAIN = document.getElementById("tryAgain");

// Function variable declarations
let main, generateCombo, assignColor;
let pinSelection, addPin, getListOfPins, showSubmit;
let submitGuess, verifyGuess, addHintPins, changeActiveColumn;
let showAnswer, openModal, refreshPage;

let color = "white";
let guess = 1;
let winningListOfPins;

main = () => {
    /* Out: world state is either "YOU WON" or "YOU LOST" */
    WINMODAL.style.display = "none";
    winningListOfPins = generateCombo();
    console.log(winningListOfPins);
    GAMEBOARD.addEventListener("click", pinSelection);
    HINTBOARD.addEventListener("click", submitGuess);
}

generateCombo = () => {
    /* 
    Out: listOfPins
    Generate a list of 6 pins of random color and position.
    */
    let listOfPins = [];
    let i;
    for(i=0; i<5; i++) {
        nb = Math.floor(Math.random() * 7);
        c = assignColor(nb);
        listOfPins.push(c)
    }
    return listOfPins;
}

assignColor = (x) => {
    /*
    In: x = Integer[0, 7]
    Out: color
    Return a color based on the value of input x.
    */
    if (x===0) return "white";
    if (x===1) return "pink";
    if (x===2) return "red";
    if (x===3) return "orange";
    if (x===4) return "yellow";
    if (x===5) return "green";
    if (x===6) return "blue";
    if (x===7) return "black";
}

pinSelection = (e) => {
    /*
    In: event
    Out: world state
    Add pins on game board. If current guess if fully completed,
    show a submit button.
    */
    let target = e.target;
    let targetClass = target.getAttribute("class");

    if (target.tagName !== "circle") {
        return;
    } else if (target.getAttribute("class") === "pinPalette") {
        color = target.getAttribute("fill");
    } else if (targetClass !== `g${guess}`) {
        return;
    } else {
        addPin(target, color);
        let listOfPins = getListOfPins();
        showSubmit(listOfPins);
    }
}

addPin = (el, c) => {
    /*
    In:
    - DOM svg element
    - color
    Out: world state
    Modifies the element's fill attribute to the input color.
    */
    el.setAttribute("fill", c);
}

getListOfPins = () => {
    /*
    Out: listOfPins
    Produce a list of pins for the current guess.
    */
    let svgs = document.getElementsByClassName(`g${guess}`);
    let svg;
    let listOfPins = [];

    for (svg of svgs) {
        listOfPins.push(svg.getAttribute("fill"));
    }
    return listOfPins;
}

showSubmit = (listOfPins) => {
    /*
    In: listOfPins
    Out: world state
    If listOfPins contains no empty pins ("grey" pins), then show
    a submit button.
    */
    if (listOfPins.includes("grey")) {
        return;
    } else {
        let button = document.getElementById(`b${guess}`);
        button.style.visibility = "visible";
    }
}

submitGuess = (e) => {
    /*
    In: event
    Out: world state
    When submit button is clicked, either:
    - continue to next guess;
    - YOU WON; or
    - YOU LOST.
    */
    let target = e.target;
    if (target.tagName !== "BUTTON") {
        return;
    } else {
        let listOfPins = getListOfPins();
        listOfHints = verifyGuess(listOfPins);
        showAnswer(listOfHints);
    }
}

verifyGuess = (listOfPins) => {
    /*
    In: listOfPins
    Out: listOfHints
    Produces a list of hints from a submitted list of pins by
    comparing color and position of input pins to winningListOfPins.
    */
    let item, index;
    let i = 0;
    let cloneList = winningListOfPins.slice();
    let listOfHints = [];
    let listOfColorPos = [];

    for (item of listOfPins) {
        if (item === winningListOfPins[i]) {
            listOfHints.push("color_pos");
            listOfColorPos.push(item);
            // Remove that item from copy of winning list to avoid
            // counting it again in next loop.
            index = cloneList.indexOf(item);
            cloneList.splice(index, 1);
        }
        i++;
    }
    // Remove color_pos items from listOfPins to avoid
    // counting it again in next loop.
    for (item of listOfColorPos) {
        index = listOfPins.indexOf(item);
        listOfPins.splice(index, 1);
    }

    for (item of listOfPins) {
        if (cloneList.includes(item)) {
            listOfHints.push("color");
            // Remove that item from copy of winning list to avoid
            // counting it twice.
            let index = cloneList.indexOf(item);
            cloneList.splice(index, 1);
        } else {
            listOfHints.push("absent");
        }
    }
    return listOfHints;
}

showAnswer = (listOfHints) => {
    /*
    In: listOfHints
    Out: world state
    Produces either:
    - continue to next guess;
    - YOU WON; or
    - YOU LOST.
    */
    if (listOfHints.includes("absent") || listOfHints.includes("color")) {
        // If not guessed combination at try 12, you lose
        if (guess === 12) {
            openModal("YOU LOST!");
            return;
        }

        // Prepare for next try
        let button = document.getElementById(`b${guess}`);
        button.style.visibility = "hidden";

        addHintPins(listOfHints);
        changeActiveColumn();

        color = "white";
        guess++;
    } else {
        openModal("YOU WON!");
    }
}

addHintPins = (listOfHints) => {
    /*
    In: listOfHints
    Out: world state
    Add hint pins (small black or white pins) to hint board
    for each correct color or color and position guesses.
    */
    let hintHoles = document.getElementsByClassName(`h${guess}`);
    let hintPin;

    for (hintPin of hintHoles) {
        if (listOfHints.includes("color_pos")) {
            addPin(hintPin, "black");
            let index = listOfHints.indexOf("color_pos");
            listOfHints.splice(index, 1);
        } else if (listOfHints.includes("color")) {
            addPin(hintPin, "white");
            let index = listOfHints.indexOf("color");
            listOfHints.splice(index, 1);
        }
    }
}

changeActiveColumn = () => {
    /*
    Out: world state
    Changes the active column on the game board to the next guess.
    */
    let col = document.createElement("col");
    ACTIVECOLUMN.prepend(col);
    col.span = "1";
    col.style.backgroundColor = "rgb(150, 150, 150)";
}

openModal = (mess) => {
    /*
    In: message is either:
    - YOU WON; or
    - YOU LOST.
    Out: world state
    Opens a modal displaying win/lose message 
    if user wins of loses game.
    */
    WINMODAL.style.display = "block";
    WINTEXT.innerHTML = mess;
    TRYAGAIN.addEventListener("click", refreshPage);
}

refreshPage = () => {
    /*
    Out: world state
    Refresh page to start new game if user clicks on button
    in modal.
    */
    window.location.reload();
}

main();