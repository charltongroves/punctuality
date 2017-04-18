$(document).ready(function () {
    hide_all()
    var init_start_date = moment("06/08/2013", 'DD/MM/YYYY')
    var init_end_date = moment("29/08/2014", 'DD/MM/YYYY')
    var financial_year = moment().month("July").startOf('month')
    var start_of_current_financial_year = moment().isAfter(financial_year) ? financial_year.format('DD/MM/YYYY') : financial_year.subtract(1, 'year').format('DD/MM/YYYY')

    /*
    Initialize date range picker
    */
    $('#daterange').daterangepicker({
        "ranges": {
            'This Pay Period': [moment().startOf('week'), moment().endOf('week')],
            'Last Pay Period': [moment().subtract(7, 'days').startOf('week'), moment().subtract(7, 'days').endOf('week')],
            'Last Pay Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
            'This Financial Year': [moment(start_of_current_financial_year, 'DD/MM/YYYY'), moment()],
            'Last Financial Year': [moment(start_of_current_financial_year, 'DD/MM/YYYY').subtract(1, 'year'), moment(start_of_current_financial_year, 'DD/MM/YYYY')],
            'All Time': [moment('01/01/2012', 'DD/MM/YYYY'), moment()],
        },
        "alwaysShowCalendars": true,
        "startDate": init_start_date.format('MM/DD/YYYY'),
        "endDate": init_end_date.format('MM/DD/YYYY'),
        "opens": "left"
    }, function (start, end, label) {
        update_daterange_button_text(start, end, label)
        update_punctuality(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'))
        console.log("New date range selected: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ")");
    });

    var root = "http://localhost:4567/"
    var shifts_get_request;
    var rosters_get_request;
    var shifts_global;
    var rosters_global;
    var processed_shifts_global;
    $.fn.dataTable.moment('MMMM Do YYYY');
    update_daterange_button_text(init_start_date, init_end_date, null)
    update_punctuality(init_start_date.format('YYYY-MM-DD'), init_end_date.format('YYYY-MM-DD'))
    $('.nav-tabs a[href="#overview"]').click(function () {
        $(this).tab('show');
        animate_overview(processed_shifts_global);
    });
    $('.nav-tabs a[href="#breakdown"]').click(function () {
        $(this).tab('show');
        update_breakdown(processed_shifts_global)
    });
    /*
    PreCondition: startDate and endDate are of the form "YYYY-MM-DD"
    */
    function update_punctuality(start, end) {
        clear_error_message();
        if (processed_shifts_global == undefined) show_loading();
        get_shifts(start, end);
        get_rosters(start, end);
        $.when(shifts_get_request, rosters_get_request).always(function () {
            hide_loading();
            if (shifts_get_request.statusText == "error" || rosters_get_request.statusText == "error" ||
                shifts_global == undefined || rosters_global == undefined ||
                shifts_global == null || rosters_global == null) {
                processed_shifts_global = undefined;
                reset_all()
                hide_all()
                display_error_connecting(); // view.js
                return;
            }
            var shifts_info = process_shift_info(shifts_global, rosters_global); // logic.js
            reset_all()
            if (shifts_info.shifts.length > 0) {
                processed_shifts_global = shifts_info;
                update_meta_view(shifts_info.meta); // view.js
                animate_punctual_day_graph(shifts_info.breakdown_info.punctual_day)
                display_data(shifts_info.shifts) // view.js
                show_all()
            } else {
                processed_shifts_global = undefined;
                hide_all()
                display_no_data(); // view.js
            }
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