/*
Turns a list of shifts and rosters into meaningful data
*/
function process_shift_info(shifts, rosters) {
    var shifts_info = {};
    shifts_info.shifts = [];
    var meta = init_meta()
    for (var i = 0; i < shifts.length; i++) {
        var shift_info = {};
        splice_out_unpaired_shifts(rosters, shifts, i)
        shift_info.day = moment(rosters[i].date, 'YYYY/MM/DD').format('MMMM Do YYYY')
        shift_info.start = moment(rosters[i].start, 'YYYY/MM/DD hh:mm:ssZZ').format('hh:mma');
        shift_info.finish = moment(rosters[i].finish, 'YYYY/MM/DD hh:mm:ssZZ').format('hh:mma');
        shift_info.actualStart = get_punctual_info(shifts[i].start, rosters[i].start, "arrived");
        shift_info.actualFinish = get_punctual_info(shifts[i].finish, rosters[i].finish, "left");
        update_meta_information(shift_info, meta)
        shifts_info.shifts.push(shift_info);
    }
    meta.punctualPercent = meta.punctual / (shifts_info.shifts.length * 2)
    shifts_info.meta = meta;
    return shifts_info
}

function init_meta() {
    meta = {};
    meta.arrivedLate = 0
    meta.arrivedEarly = 0
    meta.leftEarly = 0
    meta.leftLate = 0
    meta.didNotClock = 0
    meta.punctual = 0
    meta.timeSaved = 0
    return meta
}
/*
Removes shifts that dont have a corresponding roster, and vice versa
*/
function splice_out_unpaired_shifts(rosters, shifts, i) {
    while (!moment(rosters[i].date).isSame(shifts[i].date)) {
        //If a shift occurs without a corresponding roster, delete it
        while (moment(rosters[i].date).isAfter(shifts[i].date)) {
            shifts.splice(i, 1);
        }
        //If a roster occurs without a corresponding shift, delete it
        while (moment(rosters[i].date).isBefore(shifts[i].date)) {
            rosters.splice(i, 1);
        }
    }
}
/*
Updates the meta information with the new information gathered from 'get_punctual_info()'

SIDE EFFECT: This function occasionally changes the status value of shift_info.actualStart & shift_info.actualFinish
Pre Conditions: Meta has been initialised by init_meta.
                shift_info has been processed by get_punctual_info()
*/
function update_meta_information(shift_info, meta) {
    //Clock in
    if (shift_info.actualStart.status == "arrived late") {
        meta.arrivedLate++;
        meta.timeSaved += shift_info.actualStart.diffInt;
    } else if (shift_info.actualStart.status == "arrived early") {
        meta.timeSaved -= shift_info.actualStart.diffInt;
        if (shift_info.actualStart.diffInt < 30) {
            //forgive being 0-30 minutes early for shift
            meta.punctual++;
            shift_info.actualStart.status = "on time"
        } else {
            meta.arrivedEarly++;
        }
    } else if (shift_info.actualStart.status == "no time clocked") {
        meta.didNotClock++;
    } else {
        meta.punctual++;
    }

    //Clock out
    if (shift_info.actualFinish.status == "left late") {
        meta.punctual++;
        meta.timeSaved -= shift_info.actualFinish.diffInt;
        if (shift_info.actualFinish.diffInt < 30) {
            //don't worry about leaving 0-30 min late
            shift_info.actualFinish.status = "on time"
        }
    } else if (shift_info.actualFinish.status == "left early") {
        meta.leftEarly++;
        meta.timeSaved += shift_info.actualFinish.diffInt;
    } else if (shift_info.actualFinish.status == "no time clocked") {
        meta.didNotClock++;
        meta.punctual++;
    } else {
        meta.punctual++;
    }
    return meta
}
/*
Gets a roster start/end time and a shift start/end time and returns human readable
information about the event

PreCon: Actual and Expected are string dates of the form YYYY/MM/DD hh:mm:ssZZ.
        Prefix is a string (eg. "arrived", "left").
*/
function get_punctual_info(actual, expected, prefix) {
    punctual_info = {};
    punctual_info.time = moment(actual, 'YYYY/MM/DD hh:mm:ssZZ').format('hh:mma');

    if (actual == null) {
        punctual_info.status = "no time clocked";
        punctual_info.diff = null;
        punctual_info.diffInt = null;
        return punctual_info
    }

    var difference = moment(actual).diff(moment(expected), 'minutes', true);
    if (difference < 0) {
        punctual_info.status = prefix + " early";
    } else if (difference > 0) {
        punctual_info.status = prefix + " late";
    } else {
        punctual_info.status = "on time";
    }
    difference = Math.ceil(Math.abs(difference));
    var plural = (difference == 1) ? " minute" : " minutes";
    punctual_info.diffInt = difference
    punctual_info.diff = difference.toString() + plural
    return punctual_info;
}