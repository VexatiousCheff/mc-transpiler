const Commands = require("./commands");
const Transpiler = require("./transpiler");

const fs = require("fs");

// WAY smaller and fast (freezes for a moment though), leaves stuff behind
Commands.GenerationMode = Commands.GenerationModes.Minecart;

// main function
(() => {
    let arr = [];

    for (let i = 0; i < 200; i++) {
        arr.push(`say hi${i}`);
    }

    let cmd = Commands.GenerateMultipleCommands(arr);

    console.log(`charcount: ${cmd.length} (${Math.floor(cmd.length/32500*100)}%)`);
    fs.writeFileSync("command.txt", cmd);
})();