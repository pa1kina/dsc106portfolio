import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON("../lib/projects.json");

const projectsContainer = document.querySelector(".projects");
renderProjects(projects, projectsContainer, "h2");

const titleElement = document.querySelector(".projects-title");
if (titleElement && Array.isArray(projects)) {
  titleElement.textContent = `${projects.length} Projects`;
}

let selectedIndex = -1;

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let newSVG = d3.select("svg");
  newSVG.selectAll("path").remove();
  d3.select(".legend").selectAll("li").remove();

  newArcData.forEach((arc, i) => {
    newSVG
      .append("path")
      .attr("d", newArcGenerator(arc))
      .attr("fill", colors(i))
      .on("click", () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        newSVG.selectAll("path").attr("class", (_, idx) =>
          // TODO: filter idx to find correct pie slice and apply CSS from above
          idx === selectedIndex ? "selected" : "",
        );
        d3.select(".legend")
          .selectAll("li")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : ""));

        if (selectedIndex === -1) {
          renderProjects(projectsGiven, projectsContainer, "h2");
        } else {
          let selectedYear = newData[selectedIndex].label;

          let filteredProjects = projectsGiven.filter((project) => {
            return project.year === selectedYear;
          });

          renderProjects(filteredProjects, projectsContainer, "h2");
        }
      });

    d3.select(".legend")
      .append("li")
      .attr("style", `--color:${colors(i)}`)
      .attr("class", i === selectedIndex ? "selected" : "")
      .html(
        `<span class="swatch"></span> ${newData[i].label} <em>(${newData[i].value})</em>`,
      );
  });
}

// Call this function on page load
renderPieChart(projects);

let searchInput = document.querySelector(".searchBar");
searchInput.addEventListener("input", (event) => {
  let query = event.target.value.toLowerCase();

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query);
  });

  // re-render legends and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, "h2");
  renderPieChart(filteredProjects);
});
