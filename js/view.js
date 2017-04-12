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

function reset_overview_animations() {
    bar.animate(0);
}

function animate_overview(shifts_info) {
    if (shifts_info == undefined || shifts_info.shifts.length < 1) {
        return //don't animate if there is no data.
    }
    bar.animate(Math.ceil(shifts_info.meta.punctualPercent * 100) / 100.0); //get ceiling of 0.0x decimal. eg: 0.732 -> 0.74
}

function update_breakdown(shifts_info) {
    if (shifts_info == undefined || shifts_info.shifts.length < 1) {
        return
    }
    reset_overview_animations();
    animate_punctual_day_graph(shifts_info.breakdown_info.punctual_day)
}

function animate_punctual_day_graph(punctual_day) {
    function get_percent(day) {
        var total = day.punctual + day.notPunctual
        if (total == 0) {
            day.noData = true;
            return 0
        }
        return Math.ceil((day.punctual / total) * 100)
    }
    var barData = [{
            label: "Monday",
            value: get_percent(punctual_day["Mon"]),
            noData: punctual_day["Mon"].noData
        },
        {
            label: "Tuesday",
            value: get_percent(punctual_day["Tue"]),
            noData: punctual_day["Tue"].noData
        },
        {
            label: "Wednesday",
            value: get_percent(punctual_day["Wed"]),
            noData: punctual_day["Wed"].noData
        },
        {
            label: "Thursday",
            value: get_percent(punctual_day["Thu"]),
            noData: punctual_day["Thu"].noData
        },
        {
            label: "Friday",
            value: get_percent(punctual_day["Fri"]),
            noData: punctual_day["Fri"].noData
        },
        {
            label: "Saturday",
            value: get_percent(punctual_day["Sat"]),
            noData: punctual_day["Sat"].noData
        },
        {
            label: "Sunday",
            value: get_percent(punctual_day["Sun"]),
            noData: punctual_day["Sun"].noData
        }
    ];
    $('#punctual-day-chart').html('<svg class="chart"></svg>');
    $("#breakdown p").text("Punctuality per day of the week")
    create_punctual_day_graph(barData); //graphs.js
}
function show_loading() {
    $("#loading").html('<div class="spinner">' +
  '<div class="double-bounce1"></div>' +
 ' <div class="double-bounce2"></div>'+
'</div>')
}
function hide_loading() {
    $("#loading").html('')
}
/*
Called when there is no shift/roster data to display
*/
function display_no_data() {
    $("#error-message").show()
    $("#error-message").html("There is no data to display in the selected dates.");

}

/*
Called when the get requests for shift and roster data fails.
*/
function display_error_connecting() {
    $("#error-message").show()
    $("#error-message").html("There was an error connecting to the server.");
}

function clear_error_message() {
     $("#error-message").html("");
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
    $("#error-message").html('')
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
    $("#punctual-day-chart").hide()
    $("#breakdown p").hide()
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
    $("#punctual-day-chart").show()
    $("#breakdown p").show()
    $("#punctual-table-wrapper").show()
    $('#punctual-table-wrapper').collapse("show")
}