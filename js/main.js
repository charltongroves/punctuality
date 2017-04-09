$(document).ready(function () {
    var init_start_date = moment("06/08/2013", 'DD/MM/YYYY')
    var init_end_date = moment("29/08/2014", 'DD/MM/YYYY')
    var financial_year = moment().month("July").startOf('month')
    var start_of_current_financial_year = moment().isAfter(financial_year) ? financial_year.format('DD/MM/YYYY') : financial_year.subtract(1,'year').format('DD/MM/YYYY')
    $('#daterange').daterangepicker({
        "ranges": {
            'This Pay Period': [moment().startOf('week'), moment().endOf('week')],
            'Last Pay Period': [moment().subtract(7, 'days').startOf('week'), moment().subtract(7, 'days').endOf('week')],
            'Last Pay Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
            'This Financial Year': [moment(start_of_current_financial_year), moment()],
            'Last Financial Year': [moment(start_of_current_financial_year).subtract(1, 'year'), moment(start_of_current_financial_year)],
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
    $.fn.dataTable.moment('MMMM Do YYYY');
    console.log(moment('8 Sep 16 08:00 During lecture'))
    update_punctuality(init_start_date.format('YYYY-MM-DD'), init_end_date.format('YYYY-MM-DD'))

    /*
    PreCondition: startDate and endDate are of the form "YYYY-MM-DD"
    */
    function update_punctuality(start, end) {
        get_shifts(start, end);
        get_rosters(start, end);
        $.when(shifts_get_request, rosters_get_request).done(function () {
            var shifts_info = process_shift_info(shifts_global, rosters_global); // logic.js
            update_meta_view(shifts_info.meta); // view.js
            display_data(shifts_info.shifts) // view.js
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
});