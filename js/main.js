$(document).ready(function () {
    $('#daterange').daterangepicker({
        "ranges": {
            'This Pay Period': [moment(), moment()],
            'Last Pay Period': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last Pay Month': [moment().subtract(6, 'days'), moment()],
            'This Financial Year': [moment().subtract(29, 'days'), moment()],
            'Last Financial Year': [moment().startOf('month'), moment().endOf('month')],
        },
        "alwaysShowCalendars": true,
        "startDate": "08/06/2013",
        "endDate": "08/29/2013",
        "opens": "left"
    }, function (start, end, label) {
        console.log("New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')");
    });
    $('.media-right i').click(function () {
        $(this).parent().find('input').click();
    });
});