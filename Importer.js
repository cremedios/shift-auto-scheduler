function extractDayFromString(value) {
    //var lowerValue = value.toLowerCase();
    //var splitIndex = lowerValue.indexOf("dade") >= 0 ? lowerValue.indexOf(" ") : 0;
    return parseInt(value/*.slice(splitIndex)*/);
}

function getShiftTypeFromString(value) {
    var lowerValue = value.toLowerCase();
    if (lowerValue.indexOf("dom") >= 0) {
        return ShiftType.Football;
    }
    else if (lowerValue.indexOf("dade") >= 0)
        return ShiftType.Activity;
    else
        return ShiftType.Shift;
}

function getIndexOfShift(config, day, location) {
    for (var i = 0; i < config.Shifts.length; i++) {
        if (config.Shifts[i].Location && config.Shifts[i].Day == day)
            return i;
    }
    return -1;
}

function getDays(range, location, config) {
    for (var i = 2; i < range[0].length; i++) {
        var lowerCaseDay = range[0][i].toLowerCase();
        var shift = {
            Day: extractDayFromString(lowerCaseDay),
            Location: location
        };
        if (lowerCaseDay.indexOf("dom") >= 0) {
            shift.Type = shift.Location = "Football";
            if (getIndexOfShift(config, shift.Day, shift.Location) >= 0)//This day has allready been saved
                continue;
        }
        else if (lowerCaseDay.indexOf("dade") >= 0)
            shift.Type = "Activity";
        else
            shift.Type = "Shift";
        config.Shifts.push(shift);
    }
}

function findPerson(People, name) {
    for (i in People) {
        if (People[i].Name == name)
            return People[i];
    }

    return null;
}

function findDay(config, day) {
    for (i in config.Shifts) {
        if (config.Shifts[i].Day == day)
            return config.Shifts[i];
    }

    return null;
}

function getPeople(range, location, config) {
    for (var i = 1; i < range.length; i++) {
        if (range[i][0].length < 3)
            return;

        var person = findPerson(config.People, range[i][0])
        if (!person) {
            person = {
                Name: range[i][0],
                Days: [],
                MaxDays: parseInt(range[i][1]),
            };
        }

        if (!person.MaxDays > 0)
            person.MaxDays = parseInt(range[i][1]);
        if (!person.MaxDays > 0)
            person.MaxDays = -1;

        for (var j = 2; j < range[i].length; j++) {
            if (range[i][j].indexOf("x") >= 0) {
                var tmpDay = {
                    Day: extractDayFromString(range[0][j]),
                    Location: location
                };
                var saidaType = getShiftTypeFromString(range[0][j]);
                if (saidaType == ShiftType.Football)
                    tmpDay.Location = saidaType;

                for (var k in person.Days) {
                    if (person.Days[k].Day == tmpDay.Day && person.Days[k].Location == tmpDay.Location) {
                        tmpDay = null;
                        break;
                    }
                }
                if (tmpDay != null)
                    person.Days.push(tmpDay);
            }
        }

        config.People.push(person);
    }
}

function checkTotalMaxDays(config) {
    var result = {
        Unlimited: [],
        Undefined: [],
        ToDistribute: [],
        TotalDays: 0
    };

    for (var i = 0; i < config.People.length; i++) {
        var maxDays = config.People[i].MaxDays;
        if (maxDays > 0) {
            result.TotalDays += maxDays;
            result.ToDistribute.push(config.People[i].Name);
        }
        else if (maxDays == -1)
            result.Unlimited.push(config.People[i].Name);
        else
            result.Undefined.push(config.People[i].Name);
    }
    return result;
}