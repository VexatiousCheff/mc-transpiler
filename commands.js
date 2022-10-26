module.exports = {
    JSONtoNBT: function(json) {
        // https://stackoverflow.com/questions/11233498/json-stringify-without-quotes-on-properties
        // thank you stackoverflow friend

        const str = JSON.stringify(json);

        return str.replace(/"([^"]+)":/g, '$1:');
    },

    // works
    MakeFallingBlockCommand: function(cmd, passenger = null) {
        let json = {
            id: "falling_block",
            Time: 1,
            BlockState: {
                Name: "command_block"
            },
            TileEntityData: {
                auto: 1,
                Command: cmd
            }
        };

        if (passenger != null) {
            json.Passengers = [passenger];
        }

        return json;
    },

    // works
    MakeArmorStandWithPassenger: function(passengerJson) {
        let json = {
            id: "armor_stand",
            Health: 0,
            Passengers: [passengerJson]
        };

        return json;
    },

    CombineCommands: function(cmds) {
        // first-in first-out, we must go back->front when generating

        let j = this.MakeFallingBlockCommand(cmds[cmds.length - 1]);

        for (let i = cmds.length - 2; i >= 0; i--) {
            j = this.MakeArmorStandWithPassenger(j);
            j = this.MakeFallingBlockCommand(cmds[i], j);
        }

        return j;
    },

    GenerateMultipleCommands: function(cmds) {
        let strNbt = this.JSONtoNBT(this.CombineCommands(cmds));

        return "summon falling_block ~ ~2 ~ " + strNbt;
    }
};