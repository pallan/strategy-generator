"use strict";

function calculateAge(birthDate, otherDate) {
  birthDate = new Date(birthDate);
  otherDate = new Date(otherDate);

  let years = otherDate.getFullYear() - birthDate.getFullYear();

  if (otherDate.getMonth() < birthDate.getMonth() ||
      (otherDate.getMonth() === birthDate.getMonth() && otherDate.getDate() < birthDate.getDate())) {
    years--;
  }

  return years;
}

function updateEligibility() {
  const elements = [
    { name: "U15 Rockfest", eligible_date: "2025-06-30", groups: [{ max_age: 14, min_age: 0 }] },
    { name: "U18 National Championship", eligible_date: "2025-06-30", groups: [{ max_age: 17, min_age: 0 }] },
    { name: "U21 National Championship", eligible_date: "2026-06-30", groups: [
      { max_age: 20, min_age: 0 },
      { max_age: 21, min_age: 21, note: "Eligible as an overage. One allowed per team." }
    ]},
    { name: "U23 Invitational", eligible_date: "2025-06-30", groups: [{ max_age: 24, min_age: 20, note: "Cumulative team age must be 88 years or less" }] },
    { name: "U25 Invitational", eligible_date: "2026-06-30", groups: [{ max_age: 25, min_age: 0, note: "Cumulative team age must be 96 years or less for four-person teams" }] },
    { name: "World Juniors Qualification", eligible_date: "2025-06-30", groups: [{ max_age: 20, min_age: 0 }] },
  ];

  const tbl = document.getElementById("event-list");
  tbl.innerHTML = "";
  const bdayInput = document.getElementById("birthdateField").value;

  if (!bdayInput) return;

  for (const event of elements) {
    const row = tbl.insertRow(0);
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    cell1.className = "py-3 pr-4 text-sm text-gray-900";
    cell2.className = "py-3 pr-4 text-sm";
    cell3.className = "py-3 text-sm text-gray-500";

    cell1.textContent = event.name;

    const age = calculateAge(bdayInput, event.eligible_date);
    let found = false;

    for (const group of event.groups) {
      if (age >= group.min_age && age <= group.max_age) {
        const span = document.createElement("span");
        span.className = "inline-flex items-center gap-1 text-green-700";

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 20 20");
        svg.setAttribute("fill", "currentColor");
        svg.setAttribute("class", "size-5");
        svg.setAttribute("aria-hidden", "true");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("fill-rule", "evenodd");
        path.setAttribute("d", "M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z");
        path.setAttribute("clip-rule", "evenodd");
        svg.appendChild(path);
        span.appendChild(svg);
        span.appendChild(document.createTextNode("Eligible"));

        cell2.appendChild(span);

        if (group.note) {
          const small = document.createElement("small");
          small.className = "text-xs italic text-gray-500";
          small.textContent = group.note;
          cell3.appendChild(small);
        }
        found = true;
        break;
      }
    }

    if (!found) {
      const span = document.createElement("span");
      span.className = "inline-flex items-center gap-1 text-red-700";

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 20 20");
      svg.setAttribute("fill", "currentColor");
      svg.setAttribute("class", "size-5");
      svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z");
      svg.appendChild(path);
      span.appendChild(svg);
      span.appendChild(document.createTextNode("Not Eligible"));

      cell2.appendChild(span);
    }
  }
}

window.addEventListener('load', function() {
  document.getElementById('checkForm').addEventListener('submit', function(evt) {
    evt.preventDefault();
    updateEligibility();
  });
});
