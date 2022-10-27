const Commands = require("./commands");

module.exports = {
    Functions: {
        command: function (args) {
            return args.join(' ')
                .trim()
        },

        print: function(args) {
            args.unshift("say");

            return args.join(' ')
                .replace(/"([^"]+)"/g, '$1')
                .trim();
        }
    },

    ParseCommand: function (line) {
        let param = line.split(' ');
        let cmd = param[0];
        let args = param.slice(1, param.length);

        const handler = this.Functions[cmd];

        if (!handler) {
            throw new Error("invalid function " + cmd);
        }

        return handler(args);
    },

    IsLineEmpty: function (line) {
        // does this have anything other than space/tab/newline etc

        let valid = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`1234567890-=~!@#$%^&*()[]\\{}|;':\",./<>?";

        for (let char of line) {
            if (valid.indexOf(char) != -1) {
                return false;
            }
        }

        return true;
    },

    Transpile: function (code) {
        let cmds = [];

        let lines = code.split('\n')
            .filter(line => !this.IsLineEmpty(line));

        for (let line of lines) {
            let command = this.ParseCommand(line);
            
            cmds.push(command);
        }

        return Commands.GenerateMultipleCommands(cmds);
    }
};