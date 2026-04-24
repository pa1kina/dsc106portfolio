console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// navLinks = $$("nav a")

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/" // Local server
    : "/dsc106portfolio/"; // GitHub Pages repo name

let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "resume/", title: "Resume" },
  { url: "contact/", title: "Contact" },
  { url: "https://github.com/pa1kina", title: "Github" },
];

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  url = !url.startsWith("http") ? BASE_PATH + url : url;
  let title = p.title;
  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;
  nav.append(a);
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add("current");
  }
  if (a.host !== location.host) {
    a.target = "_blank";
  }
}

document.body.insertAdjacentHTML(
  "afterbegin",
  `
	<label class="color-scheme">
		Theme:
		<select>
			<option value='light dark'>Automatic</option>
      <option value='light'>Light</option>
      <option value='dark'>Dark</option>
		</select>
	</label>`,
);

const select = document.querySelector(".color-scheme select");
if ("colorScheme" in localStorage) {
  document.documentElement.style.setProperty(
    "color-scheme",
    localStorage.colorScheme,
  );
  select.value = localStorage.colorScheme;
}

select.addEventListener("input", function (event) {
  document.documentElement.style.setProperty(
    "color-scheme",
    event.target.value,
  );
  localStorage.colorScheme = event.target.value;
  console.log("color scheme changed to", event.target.value);
});

export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching or parsing JSON data:", error);
    return null;
  }
}

export function renderProjects(projects, containerElement, headingLevel = "h2") {
  if (!containerElement) {
    return;
  }

  const validHeading = /^h[1-6]$/i.test(headingLevel) ? headingLevel : "h2";
  containerElement.innerHTML = "";

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = "<p>No projects available right now.</p>";
    return;
  }

  projects.forEach((project) => {
    const article = document.createElement("article");
    article.innerHTML = `
      <${validHeading}>${project.title ?? "Untitled Project"}</${validHeading}>
      <img src="${project.image ?? "https://dsc106.com/labs/lab02/images/empty.svg"}" alt="${project.title ?? "Project image"}">
      <p>${project.description ?? "Description coming soon."}</p>
    `;

    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}