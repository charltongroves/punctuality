function create_punctual_day_graph(data_set) {
    var svgHeight = 200;
    var svgWidth = 700;
    var maxRange = 100; // You can also compute this from the data
    var barSpacing = 30; // The amount of space you want to keep between the bars
    var padding = {
        left: 20,
        right: 0,
        top: 20,
        bottom: 20
    };
    var maxWidth = svgWidth - padding.left - padding.right;
    var maxHeight = svgHeight - padding.top - padding.bottom;
    var lowRGB = [183, 0, 0]
    var highRGB = [144, 202, 249]
    var diffRGB = [highRGB[0] - lowRGB[0], highRGB[1] - lowRGB[1], highRGB[2] - lowRGB[2]]
    // Define your conversion functions
    var convert = {
        x: d3.scale.ordinal(),
        y: d3.scale.linear()
    };

    // Define your axis
    var axis = {
        x: d3.svg.axis().orient('bottom'),
        y: d3.svg.axis().orient('left')
    };

    // Define the conversion function for the axis points
    axis.x.scale(convert.x);
    axis.y.scale(convert.y);
    axis.y.ticks(5)

    // Define the output range of your conversion functions
    convert.y.range([maxHeight, 0]);
    convert.x.rangeRoundBands([0, maxWidth]);

    // Once you get your data, compute the domains
    convert.x.domain(data_set.map(function (d) {
        return d.label;
    }));
    convert.y.domain([0, maxRange]);


    var svg = d3.select('.chart')
        .attr({
            width: svgWidth,
            height: svgHeight
        });

    var chart = svg.append('g')
        .attr({
            transform: function (d, i) {
                return 'translate(' + padding.left + ',' + padding.top + ')';
            }
        });

    chart.append('g') // Container for the axis
        .attr({
            class: 'x axis',
            transform: 'translate(0,' + maxHeight + ')'
        })
        .call(axis.x); // Insert an axis inside this node

    chart.append('g') // Container for the axis
        .attr({
            class: 'y axis',
            height: maxHeight
        })
        .call(axis.y); // Insert an axis inside this node

    var bars = chart
        .selectAll('g.bar-group')
        .data(data_set)
        .enter()
        .append('g') // Container for each bar
        .attr({
            transform: function (d, i) {
                return 'translate(' + (convert.x(d.label) + Math.ceil(barSpacing / 2)) + ', 0)';
            },
            class: 'bar-group'
        });

    bars.append('rect')
        .attr({
            y: maxHeight,
            height: 0,
            width: function (d) {
                return convert.x.rangeBand(d) - barSpacing;
            },
            class: 'bar',
            fill: function (d, i) {
                var rgb = [
                    lowRGB[0] + Math.ceil(diffRGB[0] * (d.value / 100)),
                    lowRGB[1] + Math.ceil(diffRGB[1] * (d.value / 100)),
                    lowRGB[2] + Math.ceil(diffRGB[2] * (d.value / 100))
                ]
                return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")"
            },
        })
        .transition()
        .delay(150)
        .duration(700)
        .attr({
            y: function (d, i) {
                return convert.y(d.value);
            },
            height: function (d, i) {
                return (maxHeight - convert.y(d.value) == 0) ? 0 : maxHeight - convert.y(d.value)-1;
            },

        });
    chart.selectAll("text.bar")
        .data(data_set)
        .enter().append("text")
        .attr("class", "bar")
        .attr("text-anchor", "middle")
        .attr("y", function (d) {
            return convert.y(d.value) - 5;
        })
        .attr("x", function (d) {
            return convert.x(d.label) + maxWidth/14;
        })
        .text(function (d) {
            if (d.noData) {
                return "No data"
            }
            return d.value + "%";
        })

    return chart;
}