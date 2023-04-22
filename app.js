// Set the dimensions of the canvas / graph
const margin = { top: 40, right: 40, bottom: 60, left: 60 };
const width = 1100 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// Load the data from the JSON file
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then(function(data) {

  // Parse the year and time data into Date objects
  const parseYear = d3.timeParse("%Y");
  const parseTime = d3.timeParse("%M:%S");
  data.forEach(function(d) {
    d.Year = parseYear(d.Year);
    d.Time = d3.timeMinute.offset(parseTime(d.Time), -(new Date().getTimezoneOffset())); // adjust for local time zone
  });

  // Define the tooltip
  const tooltip = d3.select("#container")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

  // Create the x and y scales
  const xScale = d3.scaleTime()
    .domain([d3.timeYear.offset(d3.min(data, function(d) { return d.Year; }), -1),
             d3.timeYear.offset(d3.max(data, function(d) { return d.Year; }), 1)])
    .range([0, 1000]);

  const yScale = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.Time; }))
    .range([0, 500]);

  // Create the SVG element and add the dots
  const svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add the dots
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", function(d) { return xScale(d.Year); })
    .attr("cy", function(d) { return yScale(d.Time); })
    .attr("r", 5)
    .attr("data-xvalue", function(d) { return d.Year.getFullYear(); })
    .attr("data-yvalue", function(d) { return d.Time.toISOString(); })
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .style("fill", function(d) { return d.Doping === "" ? "orange" : "steelblue"; })
    .on("mouseover", function(event, d) {
      tooltip.attr("data-year", d.Year.getFullYear())
        .html(d.Name + " : " + d.Nationality + "<br/>Year: " + d.Year.getFullYear() + " Time: " + d3.timeFormat("%M:%S")(d.Time)  + "<br/>" + d.Doping)
        .style("opacity", .9)
        .style("color", "black")
        .style("text-align", "center")
        .style("font-family", "sans-serif")
        .style("background-color", "lightblue")
        .style("border-radius", "5%")
        .style("padding", "10px")
        .style("top", this.getBoundingClientRect().y - 100 + "px")
        .style("left", this.getBoundingClientRect().x - 40 + "px");
    })
    .on("mouseout", function(event, d) {
      tooltip.style("opacity", 0);
    })
  
  // Add the x and y axes
  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0, 500)")
    .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

  svg.append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S")));

  // Create a legend
  const legend = svg.append("g")
    .attr("id", "legend")
    .attr("transform", "translate(" + (width - margin.right - 200) + "," + (margin.top + 20) + ")");

  // Add a blue box for "Riders with doping allegations"
  legend.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "blue");

  // Add the text "Riders with doping allegations" next to the blue box
  legend.append("text")
    .attr("x", 30)
    .attr("y", 15)
    .text("Riders with doping allegations");

  // Add an orange box for "No doping allegations"
  legend.append("rect")
    .attr("y", 30)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "orange");

  // Add the text "No doping allegations" next to the orange box
  legend.append("text")
    .attr("x", 30)
    .attr("y", 45)
    .text("No doping allegations");
});