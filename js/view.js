function update_meta_view(meta) {
    bar.animate(Math.ceil(meta.punctualPercent * 100) / 100.0); //get ceiling of 0.0x decimal. eg: 0.732 -> 0.74
    var employee_full_name = $("#employee-name").text()
    var employee_first_name = employee_full_name.split(" ", 2)[0];
    var punctualPercent = Math.ceil(meta.punctualPercent * 100).toString()
    var savedOrOver = (meta.timeSaved < 0) ? "Total overtime" : "Time saved"

    var abs_time = Math.abs(meta.timeSaved)
    var time;
    var time_units;
    if (abs_time > 60) {
        time = (Math.floor(abs_time/6)/10) //Round to 1 decimal place
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

function display_data(shifts) {
    init_table_html = '<table id="punctual-table" class="table " cellspacing="0" width="100%">' +
        '<thead> <tr>' +
        '<th>Day</th>' +
        '<th>Rostered Start</th>' +
        '<th>Actual Start</th>' +
        '<th>Rostered Finish</th>' +
        '<th>Actual Finish</th>' +
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
    $('#punctual-table').DataTable({
        "dom": '<"top">rt<"bottom"lip><"clear">',
        "fnDrawCallback": function (oSettings) {
            $('[data-toggle="tooltip"]').tooltip();
        }
    });
}

function status_to_html(actual) {
    html_start = '<span data-toggle="tooltip" data-placement="top" title="' + actual.time + '">'
    html_end = '</span>'
    if (actual.status == "on time") {
        var on_time = ' <span class="on-time">' + actual.status + '</span>'
        return html_start + on_time + html_end
    } else if (actual.status == "no time clocked") {
        return html_start + actual.status + html_end
    } else {
        time_diff = ' <span class="not-on-time">' + actual.diff + '</span>'
        return html_start + actual.status + time_diff + html_end
    }
}