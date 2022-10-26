// import and store exports as global functions
const Commands = require("./commands");

// main function
(() => {
    console.log(Commands.GenerateMultipleCommands(["say hi", "say hi2"]));
})();