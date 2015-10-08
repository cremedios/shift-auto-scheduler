/**
 * Algorithm to distribute people in shifts.
 *
 */

var ShiftType = {
    Shift: "Shift",
    Activity: "Activity",
    Football: "Football"
};



function Distribuir(config) {
    InitializeObjects(config);
    SortShifts(config);
    FirstDistribution(config);

    //console.log("Satisy Minimum");
    //Try to satisfy minimum
    var unsatisfiedDay = IsMininumSatisfied(config);
    var iterations = 0;
    while (unsatisfiedDay && iterations++ < 10) {
        ReorganizeDay(config, unsatisfiedDay);
        unsatisfiedDay = IsMininumSatisfied(config);
    }
    if (unsatisfiedDay)
        Logger.log("Weird, we hit " + iterations + " but didn't satisfy requirements!");

    //console.log("");
    //console.log("Satisfy Average");
    //Try to satisfy average
    unsatisfiedDay = IsAverageSatisfied(config);
    var iterations = 0;
    while (unsatisfiedDay && iterations++ < 50) {
        ReorganizeDay(config, unsatisfiedDay, true);
        unsatisfiedDay = IsAverageSatisfied(config);
    }
    if (unsatisfiedDay)
        Logger.log("Weird, we needed " + iterations + " to satisfy a normalized distribution!");

}

function InitializeObjects(config) {
    config.Overview = checkTotalMaxDays(config);
    config.AveragePeople = Math.ceil(config.Overview.TotalDays / config.Shifts.length);

    for (var i = 0; i < config.People.length; i++) {
        config.People[i].EnlistedDays = 0;

    }
}

function Intersects(config, shift) {
    var result = [];
    for (var i = 0; i < config.People.length; i++) {
        if (config.People[i].EnlistedDays >= config.People[i].MaxDays)
            continue;
        for (var j = 0; j < config.People[i].Days.length; j++) {
            if (config.People[i].Days[j].Day == shift.Day && config.People[i].Days[j].Location == shift.Location &&
                !PersonAlreadyPlacedThatDay(config.Shifts, config.People[i], shift.Day)) {

                result.push(config.People[i]);
            }
        }
    }

    return result;
}

function PersonAlreadyPlacedThatDay(Shifts, person, saidaDay) {
    for (var i = 0; i < Shifts.length; i++) {
        if (Shifts[i].Day == saidaDay && IndexOfPerson(Shifts[i].People, person.Name) >= 0)
            return true;
    }
    return false;
}

function FirstDistribution(config) {
    DistributeForType(config, ShiftType.Activity);
    DistributeForType(config, ShiftType.Football);
    DistributeForType(config, ShiftType.Shift);
}

function DistributeForType(config, saidaType) {
    for (var i = 0; i < config.Shifts.length; i++) {
        var shift = config.Shifts[i];
        if (shift.Type != saidaType) continue;
        var selectionsForTheDay = Intersects(config, shift);

        for (j in selectionsForTheDay)
            selectionsForTheDay[j].EnlistedDays++;

        shift.People = selectionsForTheDay;
    }
}

function IsMininumSatisfied(config) {
    for (var i = 0; i < config.Shifts.length; i++) {
        var shift = config.Shifts[i];
        if (!shift.ImpossibleToSatisfyMinimum && shift.People.length < config.MinimumPeople)
            return shift;
    }
    return null;
}

//At football we are only interested in having the minimum of people, freeing them to the other days
function IsAverageSatisfied(config) {
    for (var i = 0; i < config.Shifts.length; i++) {
        var shift = config.Shifts[i];
        if (!shift.ImpossibleToSatisfyAverage && shift.Type != ShiftType.Football && shift.People.length < config.AveragePeople)
            return shift;
    }
    return null;
}

function IndexOfPerson(people, name) {
    for (var i = 0; people && i < people.length; i++) {

        if (people[i].Name === name)
            return i;
    }
    return -1;
}

function isPersonAvailable(person, day) {
    for (var i = 0; i < person.Days.length; i++) {
        if (person.Days[i].Day == day.Day && person.Days[i].Location == day.Location)
            return true;
    }
    return false;
}

function SortShifts(config) {
    config.Shifts = config.Shifts.sort(function (a, b) {
        return a.Day - b.Day;
    });
}

function ReorganizeDay(config, dayToSatisfy, satisfyAverage) {
    for (var i = 0; i < config.Shifts.length; i++) {//for each day
        var shift = config.Shifts[i];
        if (shift == dayToSatisfy) continue;

        if (shift.People && shift.People.length <= config.MinimumPeople)//we can't take people from this day
            continue;

        if (satisfyAverage && shift.People.length <= config.AveragePeople && shift.Type != ShiftType.Football)
            continue;

        if (satisfyAverage && shift.Type == ShiftType.Activity)
            continue;//dwe should maximize the number of people in the Activities

        for (var j = 0; j < shift.People.length; j++) {//for each person
            var person = shift.People[j];
            if (isPersonAvailable(person, dayToSatisfy) && //person is available that day
                !PersonAlreadyPlacedThatDay(config.Shifts, person, dayToSatisfy.Day)) {//and is not acheduled for that day
                if (person.Requires) {//wants to be together with a partner - pretty couples... 
                    if (findPerson(dayToSatisfy.People, person.Requires)) { //and that partner isn't there
                        var requiredPersonIndex = IndexOfPerson(shift.People, person.Requires);
                        if (requiredPersonIndex >= 0 &&//but is on the day from where we are going to move the first person
                            shift.People.length - 1 > config.MinimumPeople &&//maybe we can't take two people from this day
                            shift.People[requiredPersonIndex].Days.indexOf(dayToSatisfy) >= 0) {//the second person is available for the missing day
                            //console.log("Moved(R):" + shift.People[requiredPersonIndex].Name + " from " + shift.Location + "(" + shift.Day + ", " + shift.People.length + ") to " + dayToSatisfy.Location + "(" + dayToSatisfy.Day + ", " + dayToSatisfy.People.length + ")");
                            dayToSatisfy.push(shift.People[requiredPersonIndex]);
                            shift.People.splice(requiredPersonIndex, 1);
                        }
                        else
                            break;
                    }

                }
                //console.log("Moved:" + shift.People[j].Name + " from " + shift.Location + "(" + shift.Day + ", " + shift.People.length + ") to " + dayToSatisfy.Location + "(" + dayToSatisfy.Day + ", " + dayToSatisfy.People.length + ")");
                dayToSatisfy.People.push(shift.People[j]);
                shift.People.splice(j, 1);

                return;
            }
        }
    }
    if (satisfyAverage)
        dayToSatisfy.ImpossibleToSatisfyAverage = true;
    else
        dayToSatisfy.ImpossibleToSatisfyMinimum = true;
}
