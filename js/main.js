$(document).ready(function () {
    var init_start_date = moment("08/06/2013", 'MM/DD/YYYY')
    var init_end_date = moment("08/29/2013", 'MM/DD/YYYY')
    $('#daterange').daterangepicker({
        "ranges": {
            'This Pay Period': [moment().startOf('week'), moment().endOf('week')],
            'Last Pay Period': [moment().subtract(7, 'days').startOf('week'), moment().subtract(7, 'days').endOf('week')],
            'Last Pay Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
            'This Financial Year': [moment().startOf('year'), moment()],
            'Last Financial Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
        },
        "alwaysShowCalendars": true,
        "startDate": init_start_date.format('MM/DD/YYYY'),
        "endDate": init_end_date.format('MM/DD/YYYY'),
        "opens": "left"
    }, function (start, end, label) {
        update_punctuality(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'))
        console.log("New date range selected: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ")");
    });
    $('.media-right i').click(function () {
        $(this).parent().find('input').click();
    });
    var root = "http://localhost:4567/"
    var shifts_get_request;
    var rosters_get_request;
    var shifts_global;
    var rosters_global;
    update_punctuality(init_start_date.format('YYYY-MM-DD'), init_end_date.format('YYYY-MM-DD'))

    /*
    PreCondition: startDate and endDate are of the form "YYYY-MM-DD"
    */
    function update_punctuality(start, end) {
        get_shifts(start, end);
        get_rosters(start, end);
        $.when(shifts_get_request, rosters_get_request).done(function () {
            var shifts_info = process_shift_info(shifts_global, rosters_global);
            update_meta_view(shifts_info.meta);
        });
    }

    function get_shifts(startDate, endDate) {
        var shifts;
        shifts_get_request = $.get((root + "shifts/" + startDate + "/" + endDate), function (data, status) {
            console.log(data)
            console.log(status)
            shifts_global = data;
        });
    }

    function get_rosters(startDate, endDate) {
        var rosters;
        rosters_get_request = $.get((root + "rosters/" + startDate + "/" + endDate), function (data, status) {
            console.log(data)
            console.log(status)
            rosters_global = data;
        });
    }

    function process_shift_info(shifts, rosters) {
        var shifts_info = {};
        shifts_info.shifts = [];
        meta = {};
        meta.arrivedLate = 0
        meta.leftEarly = 0
        meta.didNotClock = 0
        meta.punctual = 0
        meta.timeSaved = 0
        for (var i = 0; i < shifts.length; i++) {
            var shift_info = {};
            //If a shift occurs without a corresponding roster, delete it
            while (moment(rosters[i].date).isAfter(shifts[i].date)) {
                shifts.splice(i, 1);
            }
            shift_info.day = moment(rosters[i].date, 'YYYY/MM/DD').format('MMMM Do YYYY')
            shift_info.start = moment(rosters[i].start, 'YYYY/MM/DD hh:mm:ssZZ').format('hh:mma');
            shift_info.finish = moment(rosters[i].finish, 'YYYY/MM/DD hh:mm:ssZZ').format('hh:mma');

            shift_info.actualStart = get_punctual_info(shifts[i].start, rosters[i].start, "arrived");
            if (shift_info.actualStart.status == "arrived late") {
                meta.arrivedLate++;
                meta.timeSaved += shift_info.actualStart.diffInt;
            } else if (shift_info.actualStart.status == "arrived early") {
                meta.punctual++;
                meta.timeSaved -= shift_info.actualStart.diffInt;
            } else if (shift_info.actualStart.status == "no time clocked") {
                meta.didNotClock++;
            } else {
                meta.punctual++;
            }

            shift_info.actualFinish = get_punctual_info(shifts[i].finish, rosters[i].finish, "left");
            if (shift_info.actualFinish.status == "left late") {
                meta.punctual++;
                meta.timeSaved -= shift_info.actualFinish.diffInt;
            } else if (shift_info.actualFinish.status == "left early") {
                meta.leftEarly++;
                meta.timeSaved += shift_info.actualFinish.diffInt;
            } else if (shift_info.actualFinish.status == "no time clocked") {
                meta.didNotClock++;
            } else {
                meta.punctual++;
            }

            shifts_info.shifts.push(shift_info);
        }
        console.log(shifts_info);
        console.log(meta);
        meta.punctualPercent = meta.punctual / (shifts_info.shifts.length * 2)
        shifts_info.meta = meta;
        return shifts_info
    }

    /*
    PreCon: Actual and Expected are string dates of the form YYYY/MM/DD hh:mm:ssZZ
    */
    function get_punctual_info(actual, expected, prefix) {
        punctual_info = {};
        punctual_info.time = moment(actual, 'YYYY/MM/DD hh:mm:ssZZ').format('hh:mma');

        if (expected == null) {
            punctual_info.status = "no time clocked";
            puntual_info.diff = null;
            punctual_info.diffInt = null;
            return punctual_info
        }

        var difference = moment(actual).diff(moment(expected), 'minutes', true);
        if (difference < 0) {
            punctual_info.status = prefix + " early";
        } else if (difference > 0) {
            punctual_info.status = prefix + " late";
        } else {
            punctual_info.status = prefix + " on time";
        }
        difference = Math.ceil(Math.abs(difference));
        var plural = (difference == 1) ? " minute" : " minutes";
        punctual_info.diffInt = difference
        punctual_info.diff = difference.toString() + plural
        return punctual_info;
    }

    function update_meta_view(meta) {
        bar.animate(Math.ceil(meta.punctualPercent*100)/100.0);//get ceiling of 0.0x decimal. eg: 0.732 -> 0.74
        var employee = $("#employee-name").text()
        var punctualPercent = Math.ceil(meta.punctualPercent * 100).toString()
        var savedOrOver = (meta.timeSaved < 0) ? "Total overtime" : "Time saved"
        var meta_overview = employee + " is punctual <span>" + 
            punctualPercent +"%</span> of the time. <br>" + savedOrOver + 
            ": <span>" + Math.abs(meta.timeSaved).toString() + " mins</span>."

        $( "#meta-overview" ).html(meta_overview);
        $( "#arrived-late" ).html("<p>Arrived Late</p><p><span>" + meta.arrivedLate.toString() + "</span></p>");
        $( "#punctual" ).html("<p>Punctual</p><p><span>" + meta.punctual.toString() + "</span></p>");
        $( "#left-early" ).html("<p>Left Early</p><p><span>" + meta.leftEarly.toString() + "</span></p>");
    }
});