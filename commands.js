module.exports = {
    isChained: false,

    JSONtoNBT: function (json) {
        // https://stackoverflow.com/questions/11233498/json-stringify-without-quotes-on-properties
        // thank you stackoverflow friend

        return JSON.stringify(json)
            .replace(/"([^"]+)":/g, '$1:')
            .replace(/"(\\"|[\w0-9]*)*?"/gim, '$1'); // saves ~800 chars on 100 command list
    },

    // works
    MakeFallingBlockCommand: function (cmd, passenger = null) {
        let json = {
            id: "falling_block",
            Time: 1,
            BlockState: {
                Name: "command_block"
            },
            TileEntityData: {
                auto: 1,
                Command: cmd.command ?? cmd
            }
        };

        if (passenger != null) {
            json.Passengers = [passenger];
        }

        if (this.isChained && !cmd.ignoreChain) {
            json.BlockState = {
                Name: "chain_command_block",
                Properties: {
                    facing: "up"
                }
            };
        }

        return json;
    },

    // works
    MakeArmorStandWithPassenger: function (passengerJson) {
        let json = {
            id: "armor_stand",
            Health: 0,
            Passengers: [passengerJson]
        };

        return json;
    },

    CombineCommands: function (cmds, doClearCommand = true) {
        // first-in first-out, we must go back->front when generating

        if (doClearCommand) {
            let limit = cmds.length + 1; // including start block

            // the 2 chained commands we add
            cmds.push(`fill ~ ~${this.isChained ? 2 : ""} ~ ~ ~${-limit} ~ air`);
        }
        else {
            if (cmds.length == 1) {
                // only one command, no need to do anything

                return j;
            }
        }

        if (this.isChained) {
            // remove starting command block, then set another one (correct direction + starts chain)
            cmds.push({
                command: `setblock ~ ~${-cmds.length - 1} ~ air replace`,
                ignoreChain: true
            });
            cmds.push({
                command: `summon falling_block ~ ~${-cmds.length} ~ {BlockState:{Name:command_block,Properties:{facing:up}},TileEntityData:{auto:1}}`,
                ignoreChain: true
            });
        }

        let j = this.MakeFallingBlockCommand(cmds[cmds.length - 1]);

        for (let i = cmds.length - 2; i >= 0; i--) {
            j = this.MakeArmorStandWithPassenger(j);
            j = this.MakeFallingBlockCommand(cmds[i], j);
        }

        return j;
    },

    GenerateMultipleCommands: function (cmds, tryClearCommand = true) {
        let strNbt = this.JSONtoNBT(this.CombineCommands(cmds, tryClearCommand));

        let cmd = `summon falling_block ~ ~2 ~ ${strNbt}`;

        if (cmd.length > 32500) {
            console.warn("command length > max (32500), will not paste in correctly!");

            // see if it will be under the limit without some stuff...
            let tempCmd = this.JSONtoNBT(this.CombineCommands(cmds, false));

            if (tempCmd.length <= 32500) {
                cmd = tempCmd;

                console.warn("command blocks will not be cleared!");
            }

        }

        return cmd;
    }
};