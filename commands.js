module.exports = {
    GenerationModes: {
        Default: 0,
        Minecart: 1,
        Chained: 2
    },

    JSONtoNBT: function (json) {
        // https://stackoverflow.com/questions/11233498/json-stringify-without-quotes-on-properties
        // thank you stackoverflow friend

        return JSON.stringify(json)
            .replace(/"([^"]+)":/g, '$1:')
            .replace(/"(\\"|[\w0-9]*)*?"/gim, '$1'); // saves ~800 chars on 100 command list
    },

    MakeFallingBlockCommandJSON: function (cmd, passenger = null) {
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

        if (this.GenerationMode == this.GenerationModes.Default && !cmd.ignoreChain) {
            json.BlockState = {
                Name: "chain_command_block",
                Properties: {
                    facing: "up"
                }
            };
        }

        return json;
    },

    MakeFallingBlockJSON(tile, passengers = null) {
        let json = {
            id: "falling_block",
            BlockState: {
                Name: tile
            }
        };

        if (passengers != null) {
            json.Passengers = passengers;
        }

        return json;
    },

    MakeArmorStandPassengersJSON: function (passengers) {
        let json = {
            id: "armor_stand",
            Health: 0,
            Passengers: passengers
        };

        return json;
    },

    MakeMinecartJSON: function (cmd) {
        let json = {
            id: "command_block_minecart",
            Command: cmd
        };

        return json;
    },

    CombineCommands: function (cmds, doClearCommand = true) {
        if (doClearCommand && this.GenerationMode != this.GenerationModes.Minecart) {
            let limit = cmds.length + 1; // including start block

            // the 2 chained commands we add
            cmds.push(`fill ~ ~${this.GenerationMode == this.GenerationModes.Chained ? 2 : ""} ~ ~ ~${-limit} ~ air`);
        }

        if (this.GenerationMode == this.GenerationMode.Chained) {
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

        if (this.GenerationMode == this.GenerationModes.Minecart) {

            let passengers = [];

            passengers.push(this.MakeFallingBlockJSON("activator_rail"));

            for (let i = 0; i < cmds.length; i++) {
                passengers.push(this.MakeMinecartJSON(cmds[i]));
            }

            if (doClearCommand) {
                passengers.push(this.MakeMinecartJSON("kill @e[type=command_block_minecart,distance=..1]"));
                // this leaves behind the redstone + activator rail block
            }
            
            let j = this.MakeFallingBlockJSON("redstone_block", [this.MakeArmorStandPassengersJSON(passengers)]);

            return j;
        }
        else {
            // first-in first-out, we must go back->front when generating

            let j = this.MakeFallingBlockCommandJSON(cmds[cmds.length - 1]);

            for (let i = cmds.length - 2; i >= 0; i--) {
                j = this.MakeArmorStandPassengersJSON([j]);
                j = this.MakeFallingBlockCommandJSON(cmds[i], j);
            }

            return j;
        }
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

module.exports.GenerationMode = module.exports.GenerationModes.Default;