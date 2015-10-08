/**
 * Initialization code and print methods
 *
 * @param {number} input Table that contains people and their availability.
 * @return Shifts calculated with constraints and given availability.
 */

var Config = {
    MinimumPeople: 3,
    Shifts: [],
    Football: [],
    Activity: [],
    People: []
};

function Main(event) {
    var url = "https://docs.google.com/spreadsheets/d/1Gjz77nIHGhP8qEAIGMao1NHy2M7CCzO73NAAssmBiug/edit?usp=sharing"; //this link must have write access in the spreadsheet
    Logger.log("Opening: " + url);
    var doc = SpreadsheetApp.openByUrl(url);
    var sheets = doc.getSheets();
    for (var i = 0; i < 3; i++) {//only the first tree sheets matter
        var rangeNotation = 'A2:' + sheets[i].getLastColumn() + sheets[i].getLastRow();
        var range = sheets[i].getRange(rangeNotation);
        var rangeValues = range.getValues();
        getDays(rangeValues, sheets[i].getName(), Config);
        getPeople(rangeValues, sheets[i].getName(), Config);
    }
    var cfg = Config;

    Distribuir(Config);

    var outSheet = initializeSheet(doc);
    PrintByDay(Config, outSheet);
    PrintByPerson(Config, outSheet);
}

function initializeSheet(doc) {

    var outputSheet = doc.getSheetByName("Shifts (DEMO)");
    if (outputSheet != null)
        outputSheet.clear();
    else
        outputSheet = doc.insertSheet("Shifts (DEMO)", doc.getNumSheets());

    return outputSheet;
}


function PrintByPerson(config, sheet) {

    sheet.appendRow(["Days by person [DEMO]"]);
    var rowIndex = sheet.getLastRow();
    var cell = sheet.getRange(rowIndex++, 1, 1, 2).setFontWeight('Bold').merge();
    for (var i = 0; i < config.People.length; i++) {
        var cells = sheet.getRange(i + rowIndex, 1, 1, 2);
        cells.setValues([[config.People[i].Name, config.People[i].EnlistedDays]]);
        if (config.People[i].EnlistedDays == 0)
            cells.setBackground("yellow");
        else if (config.People[i].EnlistedDays > 4)
            cells.setBackground("#FFC7CE");
    }
}

function PrintByDay(config, sheet) {
    sheet.appendRow(["Shifts [DEMO]"]);
    sheet.getRange(1, 1, 1, 2).setFontWeight('Bold').merge();

    var startRow;
    var currentCol = 1;
    for (var i = 0; i < config.Shifts.length ; i++) {
        var shift = config.Shifts[i];

        if (i > 0 && shift.Day != config.Shifts[i - 1].Day)
            currentCol++;


        var fontColor = "black";

        if (i == 0 || shift.Day != config.Shifts[i - 1].Day) {
            startRow = 2;
            var text = shift.Day
            if (shift.Type == ShiftType.Activity)
                text += " ATV";
            sheet.getRange(startRow++, currentCol).setValue(text).setFontWeight('Bold').setBackground("#E5DFEC");
        }
        else
            fontColor = "#31859B";



        sheet.getRange(startRow++, currentCol).setFontColor(fontColor).setFontWeight('Bold').setValue(shift.Location).setBorder(true, true, true, true, null, null);
        for (var j = 0; j < shift.People.length ; j++) {
            var person = shift.People[j];
            sheet.getRange(startRow++, currentCol).setValue(person.Name).setFontColor(fontColor);
        }
    }
    sheet.getRange(1, 1, sheet.getLastRow(), currentCol).setHorizontalAlignment("center");
}