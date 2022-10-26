const Commands = require("./commands");
const Transpiler = require("./transpiler");

const fs = require("fs");

// big overhead, however executes instantly (after command blocks build)
Commands.isChained = true;

// main function
(() => {
    let arr = [];

    for (let i = 0; i < 100; i++) {
        arr.push(`say hi${i}`);
    }

    let cmd = Commands.GenerateMultipleCommands(arr);

    // write to file, console.log output is dead
    console.log(`charcount: ${cmd.length}`);
    fs.writeFileSync("command.txt", cmd);
})();