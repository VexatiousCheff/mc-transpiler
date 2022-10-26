const Commands = require("./commands");

// main function
(() => {
    let arr = [];

    for(let i = 0; i < 25; i++) {
        arr.push(`say hi${i}`);
    }

    console.log(Commands.GenerateMultipleCommands(arr));
})();