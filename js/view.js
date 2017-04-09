/*
Display meta information
*/
function update_meta_view(meta) {
    if (meta.punctualPercent != undefined) {
        bar.animate(Math.ceil(meta.punctualPercent * 100) / 100.0); //get ceiling of 0.0x decimal. eg: 0.732 -> 0.74
    }
    var employee_full_name = $("#employee-name").text()
    var employee_first_name = employee_full_name.split(" ", 2)[0];
    var punctualPercent = Math.ceil(meta.punctualPercent * 100).toString()
    var savedOrOver = (meta.timeSaved < 0) ? "Total overtime" : "Time saved"

    var abs_time = Math.abs(meta.timeSaved)
    var time;
    var time_units;
    if (abs_time > 60) {
        time = (Math.floor(abs_time / 6) / 10) //Round to 1 decimal place
        units = (time > 1) ? "hrs" : "hr"
    } else {
        time = abs_time
        units = (time > 1) ? "mins" : "min"
    }
    var meta_overview = "For clock ins and outs within 30 minutes of his roster, <br>" +
        employee_first_name + " is punctual <span>" +
        punctualPercent + "%</span> of the time. <br>" + savedOrOver +
        ": <span>" + time.toString() + " " + units + "</span>."

    $("#meta-overview").html(meta_overview);
    $("#arrived-late").html("<p>Arrived Late</p><p><span>" + meta.arrivedLate.toString() + "</span></p>");
    $("#punctual").html("<p>Punctual</p><p><span class='on-time'>" + meta.punctual.toString() + "</span></p>");
    $("#left-early").html("<p>Left Early</p><p><span>" + meta.leftEarly.toString() + "</span></p>");
}

/*
Turns the information located in shifts into a data table in html
*/
function display_data(shifts) {
    init_table_html = '<table id="punctual-table" class="table " cellspacing="0" width="100%">' +
        '<thead> <tr>' +
        '<th class="col-1">Day</th>' +
        '<th class="col-2">Rostered Start</th>' +
        '<th class="col-3">Actual Start</th>' +
        '<th class="col-4">Rostered Finish</th>' +
        '<th class="col-5">Actual Finish</th>' +
        '</tr> </thead> <tbody> </tbody>'
    $("#punctual-table-wrapper").html(init_table_html)
    var html;
    for (var i = 0; i < shifts.length; i++) {

        html = "<tr>" +
            "<td>" + shifts[i].day + "</td>" +
            "<td>" + shifts[i].start + "</td>" +
            "<td>" + status_to_html(shifts[i].actualStart) + "</td>" +
            "<td>" + shifts[i].finish + "</td>" +
            "<td>" + status_to_html(shifts[i].actualFinish) + "</td>" + "</tr>"
        $("#punctual-table tbody").append(html)
    }
    //Format and initialize datatable
    $('#punctual-table').DataTable({
        "dom": '<"top">rt<"bottom"lip><"clear">',
        "fnDrawCallback": function (oSettings) {
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

/*
Highlights the status text and adds a tooltip for showing the user the clock in/out time
*/
function status_to_html(actual) {
    html_start = '<span data-toggle="tooltip" data-placement="top" title="' + actual.time + '">'
    html_end = '</span>'
    if (actual.status == "on time") {
        var on_time = ' <span class="on-time">' + actual.status + '</span>';
        return html_start + on_time + html_end
    } else if (actual.status == "no time clocked") {
        return '<span>' + actual.status + html_end;
    } else {
        time_diff = ' <span class="not-on-time">' + actual.diff + '</span>';
        return html_start + actual.status + time_diff + html_end;
    }
}
/*
Initializes the calendar date range picker to the start date and end date params
*/
function init_daterange(init_start_date,init_end_date) {
    var financial_year = moment().month("July").startOf('month')
    var start_of_current_financial_year = moment().isAfter(financial_year) ? financial_year : financial_year.subtract(1, 'year')
    $('#daterange').daterangepicker({
        "ranges": {
            'This Pay Period': [moment().startOf('week'), moment().endOf('week')],
            'Last Pay Period': [moment().subtract(7, 'days').startOf('week'), moment().subtract(7, 'days').endOf('week')],
            'Last Pay Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
            'This Financial Year': [start_of_current_financial_year, moment()],
            'Last Financial Year': [start_of_current_financial_year.subtract(1, 'year'), start_of_current_financial_year],
        },
        "alwaysShowCalendars": true,
        "startDate": init_start_date.format('MM/DD/YYYY'),
        "endDate": init_end_date.format('MM/DD/YYYY'),
        "opens": "left"
    }, function (start, end, label) {
        update_daterange_button_text(start, end, label)
        window.update_punctuality(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'))
        console.log("New date range selected: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ")");
    });
}
/*
This function determines the text that goes inside the daterangepickers button
*/
function update_daterange_button_text(start, end, label) {
    if (label == null) {
        $('#daterange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    } else if (label == "Custom Range") {
        $('#daterange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    } else {
        $('#daterange span').html(label);
    }
    return;
}

/*
Called when there is no shift/roster data to display
*/
function display_no_data() {
    $("#meta-info").show()
    $("#meta-overview").html("There is no data to display in the selected dates.");
}

/*
Called when the get requests for shift and roster data fails.
*/
function display_error_connecting() {
    $("#meta-info").show()
    $("#meta-overview").html("There was an error connecting to the server.");
}

/*
Reset all html to its original state
*/
function reset_all() {
    bar.animate(0);
    $("#meta-overview").html("");
    $("#punctual-table-wrapper").html("")
    $("#arrived-late").html("")
    $("#punctual").html("")
    $("#left-early").html("")
}

/*
Hide all data displaying elements
*/
function hide_all() {
    $('#punctual-table-wrapper').collapse("hide")
    $("#meta-info").hide()
    $("#progress_bar").hide()
    $("#arrived-late").hide()
    $("#punctual").hide()
    $("#left-early").hide()
}

/*
Show all data displaying elements 
*/
function show_all() {
    $("#meta-info").show()
    $("#progress_bar").show()
    $("#arrived-late").show()
    $("#punctual").show()
    $("#left-early").show()
    $("#punctual-table-wrapper").show()
    $('#punctual-table-wrapper').collapse("show")
}