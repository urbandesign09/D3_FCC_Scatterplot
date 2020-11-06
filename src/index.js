import "./styles.css";
import * as d3 from "d3";

document.getElementById("app").innerHTML = `
    <div id="chart">
      
      <h1 id="title"><i class="fas fa-syringe"></i> Doping in Professional Bicycle Racing <i class="fas fa-biking"></i></h1>
      <p id="description">35 Fastest times up Alpe d'Huez (1994-2015)</p>
      <div id="legend"></div>
      <div id="container"></div>
      
    </div>
`;

//two operations
//1. get data from API
//2. create D3 chart
//3. add details like tooltip, hover

//data API
const urlData =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

//get data
//global variable
//load and then bind data
var dataset;

const w = 850;
const h = 500;
const padding = 50;

d3.json(urlData).then((data) => {
  dataset = data;
  //put data into dataset

  //find domain of X and Y Axes
  const extentYear = d3.extent(dataset, (d) => new Date(d.Year, 0));

  const extentTime = d3.extent(
    dataset,
    (d) => new Date(0, 0, 0, 0, 0, d.Seconds)
  );
  //the Y-axis is reversed (slower is at bottom);

  //construct chart Scales
  const xScale = d3
    .scaleTime() //every time data is scaleTime
    .domain(extentYear)
    .range([padding, w - padding])
    .nice();

  const yScale = d3
    .scaleTime() //every time data is scaleTime
    .domain(extentTime) //domain is from slow to fast at the bottom
    .range([padding, h - padding])
    .nice();

  //construct svg
  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  //constructing main plot chart
  svg
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", (d) => new Date(d.Year, 0))
    .attr("data-yvalue", (d) => new Date(0, 0, 0, 0, 0, d.Seconds))
    .attr("cx", (d) => xScale(new Date(d.Year, 0)))
    //cy, just plot the time
    .attr("cy", (d) => yScale(new Date(0, 0, 0, 0, 0, d.Seconds)))
    .attr("r", 5)
    .style("fill", (d) => (d.Doping === "" ? "black" : "orange"))
    .style("stroke", "black")
    .style("stroke-width", 1)
    .on("mouseover", (event, d) => {
      return tooltip
        .html(
          `${d.Name}: ${d.Nationality} <br> 
        Year: ${d.Year}, Time: ${d.Time} <br> <br>
        ${d.Doping !== "" ? d.Doping : "No Doping Allegations"}
        `
        )
        .attr("data-year", new Date(d.Year, 0))
        .style("visibility", "visible")
        .style("background", d.Doping === "" ? "white" : "rgb(248, 190, 83)");
    })
    .on("mousemove", function (event) {
      return tooltip
        .style("top", event.pageY - 20 + "px")
        .style("left", event.pageX + 20 + "px");
    })
    .on("mouseout", function () {
      return tooltip.style("visibility", "hidden");
    });

  const xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(2));
  const yAxis = d3
    .axisLeft(yScale)
    .ticks(d3.timeSecond.every(15)) //mark ticks every 15 sec
    .tickFormat(d3.timeFormat("%M:%S")); //format of ticks in minutes, seconds

  //create tooltip
  var tooltip = d3
    .select("#container")
    .append("div") //add new div to each item
    .style("position", "absolute")
    .style("z-index", "10") //make sure its on top
    .style("visibility", "hidden")
    .attr("class", "tooltip")
    .attr("id", "tooltip");

  //x-axis
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0, " + (h - padding) + ")")
    .call(xAxis);

  //x-axis label
  svg
    .append("text")
    .attr("id", "x-label")
    .text("Year")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-size", "0.8rem")
    .attr("transform", "translate(" + w / 2 + " ," + (h - padding / 4) + ")");

  //y-axis
  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(" + padding + ", 0)") //this positions the y-axis
    .call(yAxis);

  //y-axis label
  svg
    .append("text")
    .attr("id", "y-label")
    .text("Time in Minutes")
    .style("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-size", "0.8rem")
    .attr("transform", "rotate(-90)")
    .attr("y", padding - padding / 1.3)
    .attr("x", 0 - h / 2);

  //y-grid
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(" + padding + ", 0)")
    .call(yAxis.tickSize(-(w - padding - padding), 0, 0).tickFormat("")) //tickFormat hides the text
    .style("opacity", 0.2);

  //x-grid
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0, " + (h - padding) + ")")
    .call(
      xAxis
        .tickSize(-(h - padding - padding), 0, 0)
        .ticks(d3.timeYear.every(1))
        .tickFormat("") //this hides the text
    )
    .style("opacity", 0.2);

  //create legend
  const legw = 220;
  const legh = 60;
  //create legend box
  svg
    .append("rect")
    .attr("id", "legend")
    .attr("width", legw)
    .attr("height", legh)
    .attr(
      "transform",
      "translate(" + (w - padding - legw) + "," + padding + ")"
    )
    .style("fill", "white")
    .style("stroke", "black");

  //create legend-icons
  svg
    .append("rect")
    .attr("class", "legend-icon")
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", "rgb(248, 190, 83)")
    .attr(
      "transform",
      `translate( ${w - padding - legw + 15}, ${padding + legh - 25})`
    );

  svg
    .append("rect")
    .attr("class", "legend-icon")
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", "black")
    .attr(
      "transform",
      `translate( ${w - padding - legw + 15}, ${padding + legh - 45})`
    );

  //create legend-texts
  svg
    .append("text")
    .attr("class", "legend-text")
    .text("No doping allegations")
    .style("font-family", "Roboto")
    .attr(
      "transform",
      `translate( ${w - padding - legw + 35}, ${padding + legh - 35})`
    );

  svg
    .append("text")
    .attr("class", "legend-text")
    .text("Recorded doping allegations")
    .style("font-family", "Roboto")
    .attr(
      "transform",
      `translate( ${w - padding - legw + 35}, ${padding + legh - 15})`
    );

  //create tooltip and place information on graph
});
