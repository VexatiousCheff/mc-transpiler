function JSONtoNBT(json) {
    // https://stackoverflow.com/questions/11233498/json-stringify-without-quotes-on-properties
    // thank you stackoverflow friend

    const str = JSON.stringify(json);

    return str.replace(/"([^"]+)":/g, '$1:');
}

// works
function MakeFallingBlockCommand(cmd, passenger = null) {
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
}

// works
function MakeArmorStandWithPassenger(passengerJson) {
    let json = {
        id: "armor_stand",
        Health: 0,
        Passengers: [passengerJson]
    };

    return json;
}

function CombineCommands(cmds) {
    // first-in first-out, we must go back->front when generating

    let j = MakeFallingBlockCommand(cmds[cmds.length - 1]);

    for (let i = cmds.length - 2; i >= 0; i--) {
        j = MakeArmorStandWithPassenger(j);
        j = MakeFallingBlockCommand(cmds[i], j);
    }

    return j;
}

function GenerateMultipleCommands(cmds) {
    let strNbt = JSONtoNBT(CombineCommands(cmds));

    return "summon falling_block ~ ~2 ~ " + strNbt;
}