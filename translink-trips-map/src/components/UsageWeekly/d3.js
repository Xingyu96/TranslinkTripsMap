import * as d3 from 'd3';

export function createWeekdayUsageGraph(daysCountArray) {
  var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);
  var y = d3.scaleLinear()
    .range([height, 0]);

  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // get the data
  let data = [];
  // format the data
  daysCountArray.forEach(function (d, i) {
    data.push({ xValue: i, yValue: d });
  });

  // Scale the range of the data in the domains
  x.domain(data.map(function (d) { return d.xValue; }));
  y.domain([0, d3.max(data, function (d) { return d.yValue; })]);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function (d) { return x(d.xValue); })
    .attr("width", x.bandwidth())
    .attr("y", function (d) { return y(d.yValue); })
    .attr("height", function (d) { return height - y(d.yValue); });

  // add the x Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
    .call(d3.axisLeft(y));
}