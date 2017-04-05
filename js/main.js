$(document).ready(function () {
    $('#daterange').daterangepicker({
        "ranges": {
            'This Pay Period': [moment().startOf('week'), moment().endOf('week')],
            'Last Pay Period': [moment().subtract(7, 'days').startOf('week'), moment().subtract(7, 'days').endOf('week')],
            'Last Pay Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
            'This Financial Year': [moment().startOf('year'), moment()],
            'Last Financial Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
        },
        "alwaysShowCalendars": true,
        "startDate": "08/06/2013",
        "endDate": "08/29/2013",
        "opens": "left"
    }, function (start, end, label) {
        update_punctuality(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'))
        console.log("New date range selected: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ")");
    });
    $('.media-right i').click(function () {
        $(this).parent().find('input').click();
    });
    var root = "http://localhost:4567/"
    var shifts_get_request = null;
    var rosters_get_request = null;
    var shifts_global = null;
    var rosters_global = null;
    /*
    PreCondition: startDate and endDate are of the form "yyyy-mm-dd"
    */
    function update_punctuality(start, end) {
        get_shifts(start, end);
        get_rosters(start, end);
        $.when(shifts_get_request, rosters_get_request).done(function() {
            shifts_info = process_shift_info(shifts_global, rosters_global);
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
        var shifts_info = [];
        for (var i = 0; i < shifts.length; i++) {
            var shift_info = {};
            shift_info.day = moment(rosters[i].date, 'YYYY/MM/DD').format('MMMM Do YYYY')
            shift_info.start = moment(rosters[i].start, 'YYYY/MM/DD hh:mm:ssZZ').format('hh:mma');
            shift_info.finish = moment(rosters[i].finish, 'YYYY/MM/DD hh:mm:ssZZ').format('hh:mma');
            shift_info.actualStart = get_punctual_info(shifts[i].start, rosters[i].start);
            shift_info.actualStart.status = "arrived " + shift_info.actualStart.status
            shift_info.actualFinish = get_punctual_info(shifts[i].finish, rosters[i].finish);
            shift_info.actualFinish.status = "left " + shift_info.actualFinish.status;
            shifts_info.push(shift_info);
        }
        console.log(shifts_info)
        return shifts_info
    }
    /*
    PreCon: Actual and Expected are string dates of the form YYYY/MM/DD hh:mm:ssZZ
    */
    function get_punctual_info(actual, expected) {
        punctual_info = {};
        punctual_info.time = moment(actual, 'YYYY/MM/DD hh:mm:ssZZ').format('hh:mma');
        var difference = moment(actual, 'YYYY/MM/DD hh:mm:ssZZ').diff(moment(expected, 'YYYY/MM/DD hh:mm:ssZZ'), 'minutes', true);
        if (difference < 0) {
            punctual_info.status = "early";
        } else if (difference > 0) {
            punctual_info.status = "late";
        } else {
            punctual_info.status = "on time";
        }
        difference = Math.ceil(Math.abs(difference));
        var plural = (difference == 1) ? " minute" : " minutes";
        punctual_info.diff = difference.toString() + plural
        return punctual_info;
    }
});