const Commands = require("./commands");
const Transpiler = require("./transpiler");

const fs = require("fs");

// WAY smaller and fast (freezes for a moment though), leaves stuff behind
Commands.GenerationMode = Commands.GenerationModes.Minecart;

// main function
(() => {
    const input = fs.readFileSync("./input.txt", "utf-8");

    const output = Transpiler.Transpile(input);

    fs.writeFileSync("./command.txt", output);
})();