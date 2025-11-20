// Circuit Animation 
const components = document.querySelectorAll(".component");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Increase canvas resolution for high-DPI devices
const scale = window.devicePixelRatio; // Scale based on the device's pixel density
canvas.width = canvas.offsetWidth * scale;
canvas.height = canvas.offsetHeight * scale;
ctx.scale(scale, scale);

const x = 150;
const y = 150;
res1EndX = x + 155;
upperLineEnd = res1EndX + 400;
res2EndY = y + 150;
voltagePoint2Y = res2EndY - 8;
voltagePoint1Y = y + 107;

// Simulating current flow
const points = [
  { x: x, y: y },  // P1
  { x: upperLineEnd, y: y },  // P2
  { x: upperLineEnd, y: y + 250 },  // P3
  { x: x, y: y + 250 }   // P4
];

const linesToAnimate = [];
linesToAnimate.push({ pointA: points[0], pointB: points[1] });
linesToAnimate.push({ pointA: points[1], pointB: points[2] });
linesToAnimate.push({ pointA: points[2], pointB: points[3] });
linesToAnimate.push({ pointA: points[3], pointB: points[0] });
linesToAnimate.push({ pointA: { x: res1EndX + 150, y: y }, pointB: { x: res1EndX + 150, y: y + 250 } });

let offset = 0;
let animationFrameId;
const dotSpacing = 10;
const dotLength = 5;

components.forEach((component) => {
  component.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", e.target.id);
  });
});

canvas.addEventListener("dragover", (e) => e.preventDefault());

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData("text");
  const draggedComponent = document.getElementById(id);

  const clone = draggedComponent.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.left = `${e.offsetX}px`;
  clone.style.top = `${e.offsetY}px`;
  clone.draggable = false;
  clone.classList.add("draggable");
  canvas.appendChild(clone);

  enableDragWithinCanvas(clone);

  clone.addEventListener("dblclick", () => {
    clone.remove();
  });
});

function enableDragWithinCanvas(element) {
  let isDragging = false;

  const startDrag = (e) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();

    const offsetX = (e.clientX || e.touches[0].clientX) - element.getBoundingClientRect().left;
    const offsetY = (e.clientY || e.touches[0].clientY) - element.getBoundingClientRect().top;

    const move = (event) => {
      if (!isDragging) return;
      const clientX = event.clientX || event.touches[0].clientX;
      const clientY = event.clientY || event.touches[0].clientY;

      element.style.left = `${clientX - rect.left - offsetX}px`;
      element.style.top = `${clientY - rect.top - offsetY}px`;
    };

    const stopDrag = () => {
      isDragging = false;
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("touchmove", move);
      document.removeEventListener("mouseup", stopDrag);
      document.removeEventListener("touchend", stopDrag);
    };

    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("touchmove", move);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchend", stopDrag);
  };

  element.addEventListener("mousedown", startDrag);
  element.addEventListener("touchstart", startDrag);
}

function drawMovingDottedLine(totalCurrent = 0, zenerCurrent = 0, loadCurrent = 0, vz = 0, rl = 0, r = 0, vin = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStaticComponents(totalCurrent, zenerCurrent, loadCurrent, vz, rl, r, vin);

  // Only animate if vin >= vz (breakdown voltage reached)
  if (vin >= vz) {
    linesToAnimate.forEach((line) => {
      const { pointA, pointB } = line;

      // Calculate the line length
      const lineLength = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));

      // Draw the line with moving dots
      let position = offset; // Start position for the dots

      while (position < lineLength) {
        const tStart = position / lineLength; // Start proportion along the line
        const tEnd = Math.min((position + dotLength) / lineLength, 1); // End proportion along the line

        // Calculate start and end points for this segment
        const xStart = pointA.x + tStart * (pointB.x - pointA.x);
        const yStart = pointA.y + tStart * (pointB.y - pointA.y);
        const xEnd = pointA.x + tEnd * (pointB.x - pointA.x);
        const yEnd = pointA.y + tEnd * (pointB.y - pointA.y);

        // Draw the segment
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Increment position for the next dot
        position += dotSpacing + dotLength;
      }
    });

    // Increment offset for the next frame
    offset = (offset + 2) % (dotSpacing + dotLength);

    // Loop the animation
    animationFrameId = requestAnimationFrame(() => {
      drawMovingDottedLine(totalCurrent, zenerCurrent, loadCurrent, vz, rl, r, vin);
    });
  } else {
    // If vin < vz, stop the animation and just draw the static components
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }
}

function formatNumber(number, decimalPlaces = 3) {
  if (Math.abs(number) < 10000) {
    return number.toFixed(number % 1 === 0 ? 0 : decimalPlaces);
  }
  const scientificNotation = number.toExponential(decimalPlaces - 1);
  const [coefficient, power] = scientificNotation.split('e');
  return `${parseFloat(coefficient)}e${parseInt(power)}`;
}

function drawStaticComponents(totalCurrent = 0, zenerCurrent = 0, loadCurrent = 0, vz = 0, rl = 0, r = 0, vin = 0) {
  // Your existing drawStaticComponents function code here
  // ...
  ctx.beginPath();
  if (vin < vz) {
    ctx.font = 'bold 15px Roboto';
    ctx.fillStyle = 'blue';
    ctx.fillText('[ Vin<Vz ] Zener Diode is in Reverse Bias: No Breakdown, Hence no Current Flow.', 230, 90);
  }

  ctx.moveTo(x, y);
  ctx.lineTo(x + 100, y);
  // Resistor 1
  ctx.lineTo(x + 105, y - 5);
  ctx.lineTo(x + 110, y + 5);
  ctx.lineTo(x + 115, y - 5);
  ctx.lineTo(x + 120, y + 5);
  ctx.lineTo(x + 125, y - 5);
  ctx.lineTo(x + 130, y + 5);
  ctx.lineTo(x + 135, y - 5);
  ctx.lineTo(x + 140, y + 5);
  ctx.lineTo(x + 145, y - 5);
  ctx.lineTo(x + 150, y + 5);
  ctx.lineTo(x + 155, y);

  ctx.lineTo(res1EndX + 400, y);

  ctx.lineTo(upperLineEnd, y + 100);

  // Resistor 2
  ctx.lineTo(upperLineEnd + 5, y + 105);
  ctx.lineTo(upperLineEnd - 5, y + 110);
  ctx.lineTo(upperLineEnd + 5, y + 115);
  ctx.lineTo(upperLineEnd - 5, y + 120);
  ctx.lineTo(upperLineEnd + 5, y + 125);
  ctx.lineTo(upperLineEnd - 5, y + 130);
  ctx.lineTo(upperLineEnd + 5, y + 135);
  ctx.lineTo(upperLineEnd - 5, y + 140);
  ctx.lineTo(upperLineEnd + 5, y + 145);
  ctx.lineTo(upperLineEnd, y + 150);

  ctx.lineTo(upperLineEnd, res2EndY + 100);

  ctx.lineTo(x, res2EndY + 100);
  ctx.lineTo(x, res2EndY);

  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 100);
  ctx.strokeStyle = "black"; // Set line color
  ctx.lineWidth = 1; // Set line width
  ctx.stroke(); // Draw the line
  // Component 1 End ======================================================

  // Component 2======================================================

  ctx.beginPath();
  ctx.moveTo(res1EndX + 150, y);
  ctx.lineTo(res1EndX + 150, y + 100);

  ctx.moveTo(res1EndX + 150, res2EndY + 100);
  ctx.lineTo(res1EndX + 150, res2EndY);

  ctx.moveTo(res1EndX + 150, y + 100);
  ctx.lineTo(res1EndX + 110, res2EndY);
  ctx.lineTo(res1EndX + 190, res2EndY);
  ctx.lineTo(res1EndX + 150, y + 100);

  ctx.lineTo(res1EndX + 110, y + 100);
  ctx.lineTo(res1EndX + 110, y + 90);
  ctx.moveTo(res1EndX + 150, y + 100);
  ctx.lineTo(res1EndX + 190, y + 100);
  ctx.lineTo(res1EndX + 190, y + 110);

  ctx.moveTo(res1EndX + 150, res2EndY + 100);
  ctx.lineTo(res1EndX + 150, res2EndY + 130);
  ctx.moveTo(res1EndX + 120, res2EndY + 130);
  ctx.lineTo(res1EndX + 180, res2EndY + 130);

  ctx.moveTo(res1EndX + 130, res2EndY + 137);
  ctx.lineTo(res1EndX + 170, res2EndY + 137);

  ctx.moveTo(res1EndX + 140, res2EndY + 144);
  ctx.lineTo(res1EndX + 160, res2EndY + 144);

  // Voltage
  ctx.moveTo(x, res2EndY);
  ctx.lineTo(x, voltagePoint2Y);

  ctx.moveTo(x, y + 100);
  ctx.lineTo(x, voltagePoint1Y);

  ctx.moveTo(x - 10, voltagePoint2Y);
  ctx.lineTo(x + 10, voltagePoint2Y);

  ctx.moveTo(x - 20, voltagePoint2Y - 11);
  ctx.lineTo(x + 20, voltagePoint2Y - 11);

  ctx.moveTo(x - 10, voltagePoint2Y - 11 * 2);
  ctx.lineTo(x + 10, voltagePoint2Y - 11 * 2);

  ctx.moveTo(x - 20, voltagePoint1Y);
  ctx.lineTo(x + 20, voltagePoint1Y);

  // voltage Arrow
  ctx.moveTo(x - 25, voltagePoint2Y + 15);
  ctx.lineTo(x + 25, voltagePoint1Y - 15);

  ctx.strokeStyle = "black"; // Set line color
  ctx.lineWidth = 1; // Set line width
  ctx.stroke(); // Draw the line

  ctx.beginPath();
  ctx.strokeStyle = "green"; // Set line color
  ctx.lineWidth = 1; // Set line width
  // i arrow
  ctx.moveTo(x + 20, y - 15);
  ctx.lineTo(x + 70, y - 15);

  // Vz arrow
  ctx.moveTo(res1EndX + 210, y - 15);
  ctx.lineTo(upperLineEnd - 60, y - 15);

  // iL arrow
  ctx.moveTo(upperLineEnd - 15, y + 30);
  ctx.lineTo(upperLineEnd - 15, y + 100);

  // iZ arrow
  ctx.moveTo(res1EndX + 90, y + 80);
  ctx.lineTo(res1EndX + 90, y + 150);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "black";
  // Vr arrow
  ctx.moveTo(x + 105, y - 15);
  ctx.lineTo(x + 150, y - 15);

  // V0 arrow
  ctx.moveTo(upperLineEnd + 90, y);
  ctx.lineTo(upperLineEnd + 90, y + 250);

  // RL arrow
  ctx.moveTo(upperLineEnd - 20, res2EndY + 5);
  ctx.lineTo(upperLineEnd + 20, y + 95);

  // V0 arrow boundaries
  ctx.moveTo(upperLineEnd + 65, y);
  ctx.lineTo(upperLineEnd + 115, y);
  ctx.moveTo(upperLineEnd + 65, y + 250);
  ctx.lineTo(upperLineEnd + 115, y + 250);

  // Labels All
  ctx.font = '20px Arial';  // Font size and family
  ctx.fillStyle = 'red';  // Text color
  ctx.fillText('+', x - 20, voltagePoint1Y - 15);
  ctx.fillText('-', x - 20, voltagePoint2Y + 25);

  ctx.font = '15px Arial';
  ctx.fillText('V', x - 134, voltagePoint1Y - 2);
  ctx.font = '10px Arial';
  ctx.fillText('in', x - 123, voltagePoint1Y - 2);
  ctx.font = '14px Arial';
  ctx.fillText('=', x - 111, voltagePoint1Y - 2);
  ctx.fillText(formatNumber(vin) + " V", x - 99, voltagePoint1Y - 2);

  ctx.font = '14px Arial';
  ctx.fillText('Variable Input', x - 134, voltagePoint1Y + 20);
  ctx.fillText('Voltage', x - 117, voltagePoint1Y + 37);

  ctx.font = '15px Arial';
  ctx.fillText('i', x + 10, y - 25);
  ctx.font = '14px Arial';
  ctx.fillText('=', x + 20, y - 25);
  ctx.fillText(formatNumber(totalCurrent) + " A", x + 34, y - 25);
  // ctx.font = '20px Arial';

  ctx.font = '15px Arial';
  ctx.fillText('V', x + 115, y - 23);
  ctx.font = '10px Arial';
  ctx.fillText('R', x + 127, y - 23);

  // ctx.font = '20px Arial';
  // ctx.fillText('R', x+115, y+30); 
  // ctx.font = '10px Arial';
  // ctx.fillText('S', x+130, y+30); 

  ctx.font = '15px Arial';
  ctx.fillText('R', x + 90, y + 30);
  ctx.font = '10px Arial';
  ctx.fillText('S', x + 101, y + 30);
  ctx.font = '14px Arial';
  ctx.fillText('=', x + 113, y + 30);
  ctx.fillText(formatNumber(r) + " Ω", x + 125, y + 30);
  ctx.font = '20px Arial';

  // ctx.font = '20px Arial';
  // ctx.fillText('V', res1EndX+140, y-23); 
  // ctx.font = '10px Arial';
  // ctx.fillText('Z', res1EndX+152, y-23); 
  ctx.font = '15px Arial';
  ctx.fillText('V', res1EndX + 110, y - 16);
  ctx.font = '10px Arial';
  ctx.fillText('Z', res1EndX + 121, y - 16);
  ctx.font = '14px Arial';
  ctx.fillText('=', res1EndX + 133, y - 16);
  ctx.fillText(formatNumber(vz) + " V", res1EndX + 145, y - 16);
  ctx.font = '20px Arial';

  ctx.save();
  ctx.translate(res1EndX + 80, y + 155);
  ctx.rotate(3 * Math.PI / 2);
  ctx.font = '17px Arial';
  ctx.fillText('i', 0, 0);

  ctx.font = '10px Arial';
  ctx.fillText('Z', 5, 0);

  ctx.font = '14px Arial';
  ctx.fillText('=', 16, 0);
  ctx.fillText(formatNumber(zenerCurrent) + " A", 26, 0);
  ctx.restore();


  // ctx.font = '15px Arial';
  // ctx.fillText('i', res1EndX+30, y+125); 
  // ctx.font = '10px Arial';
  // ctx.fillText('Z', res1EndX+34, y+125);
  // ctx.font = '14px Arial';
  // ctx.fillText('=', res1EndX+46, y+125);
  // ctx.fillText(formatNumber(zenerCurrent)+" A", res1EndX+56, y+125);

  ctx.font = '20px Arial';
  ctx.fillText('+', res1EndX + 160, voltagePoint1Y - 15);
  ctx.fillText('-', res1EndX + 162, voltagePoint2Y + 30);

  ctx.save();
  ctx.translate(upperLineEnd - 23, y + 110);
  ctx.rotate(3 * Math.PI / 2);
  ctx.font = '17px Arial';
  ctx.fillText('i', 0, 0);

  ctx.font = '10px Arial';
  ctx.fillText('L', 5, 0);

  ctx.font = '14px Arial';
  ctx.fillText('=', 15, 0);
  ctx.fillText(formatNumber(loadCurrent) + " A", 26, 0);
  ctx.restore();

  // ctx.font = '20px Arial';
  // ctx.fillText('i', upperLineEnd-35, y+85); 
  // ctx.font = '10px Arial';
  // ctx.fillText('L', upperLineEnd-30, y+85);

  // ctx.font = '20px Arial';
  // ctx.fillText('R', upperLineEnd+15, y+135); 
  // ctx.font = '10px Arial';
  // ctx.fillText('L', upperLineEnd+32, y+135);

  ctx.save();
  ctx.translate(upperLineEnd + 35, y + 165);
  ctx.rotate(3 * Math.PI / 2);
  ctx.font = '15px Arial';
  ctx.fillText('R', 0, 0);

  ctx.font = '10px Arial';
  ctx.fillText('L', 12, 0);

  ctx.font = '14px Arial';
  ctx.fillText('=', 23, 0);
  ctx.fillText(formatNumber(rl) + " Ω", 33, 0);
  ctx.restore();

  ctx.font = '20px Arial';
  ctx.fillText('V', upperLineEnd + 100, y + 135);
  ctx.font = '10px Arial';
  ctx.fillText('O', upperLineEnd + 112, y + 135);

  ctx.strokeStyle = "black"; // Set line color
  ctx.lineWidth = 1; // Set line width
  ctx.stroke(); // Draw the line

  // Dots
  ctx.beginPath();
  ctx.arc(res1EndX + 150, res2EndY + 100, 5, 0, 2 * Math.PI); // Create circle
  ctx.fillStyle = "black"; // Fill color
  ctx.fill();

  ctx.beginPath();
  ctx.arc(res1EndX + 150, y, 5, 0, 2 * Math.PI); // Create circle
  ctx.fillStyle = "black"; // Fill color
  ctx.fill();


  // ArrowHead Function
  drawArrowHead(x - 25, voltagePoint2Y + 15, x + 25, voltagePoint1Y - 15, "black"); //input voltage arrowhead
  drawArrowHead(upperLineEnd - 20, res2EndY + 5, upperLineEnd + 20, y + 95, "black"); //RL arrowhead
  drawArrowHead(x + 20, y - 15, x + 70, y - 15, "green"); //i
  drawArrowHead(x + 105, y - 15, x + 150, y - 15, "black"); //Vr rightarrow
  drawArrowHead(x + 150, y - 15, x + 105, y - 15, "black"); //Vr leftarrow
  drawArrowHead(res1EndX + 210, y - 15, upperLineEnd - 60, y - 15, "green"); //Vz
  drawArrowHead(res1EndX + 90, y + 80, res1EndX + 90, y + 150, "green"); //iZ
  drawArrowHead(upperLineEnd - 15, y + 30, upperLineEnd - 15, y + 100, "green"); //iL
  drawArrowHead(upperLineEnd + 90, y, upperLineEnd + 90, y + 250, "black"); //v0 down arrow
  drawArrowHead(upperLineEnd + 90, y + 250, upperLineEnd + 90, y, "black"); //v0 up arrow

  function drawArrowHead(fromX, fromY, toX, toY, color_) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowPoint1X = toX - 10 * Math.cos(angle - Math.PI / 6); // Left side of arrowhead
    const arrowPoint1Y = toY - 10 * Math.sin(angle - Math.PI / 6);
    const arrowPoint2X = toX - 10 * Math.cos(angle + Math.PI / 6); // Right side of arrowhead
    const arrowPoint2Y = toY - 10 * Math.sin(angle + Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(toX, toY); // Tip of the arrow
    ctx.lineTo(arrowPoint1X, arrowPoint1Y); // Left side of the arrowhead
    ctx.lineTo(arrowPoint2X, arrowPoint2Y); // Right side of the arrowhead
    ctx.closePath(); // Connects back to the tip
    ctx.fillStyle = color_;
    ctx.fill(); // Fill the arrowhead
  }
}

// Calculate Button Logic
document.getElementById("calculate-btn").addEventListener("click", () => {
  const vin = parseFloat(document.getElementById("input-voltage").value);
  const r = parseFloat(document.getElementById("resistor-value").value);
  const rl = parseFloat(document.getElementById("load-resistor-value").value);
  const vz = parseFloat(document.getElementById("zener-diode").value);

  if (!r || !rl || !vz || vin < 0 || r < 0 || rl < 0 || vz < 0) {
    alert("Please enter valid positive values.");
    return;
  }

  let totalCurrent, loadCurrent, zenerCurrent, loadVoltage, zenerVoltage;

  if (vin < vz) {
    zenerVoltage = vin;
    loadVoltage = vin * (rl / (r + rl));
    totalCurrent = loadVoltage / rl;
    loadCurrent = totalCurrent;
    const leakageCurrent = Math.max(0.0005, 0.0005 * Math.exp((vin - vz) * 8));
    zenerCurrent = leakageCurrent;
  }

  if (Math.abs(vin - vz) < 0.05) {
    zenerVoltage = vz;
    totalCurrent = (vin - vz) / r;
    loadCurrent = vz / rl;
    loadVoltage = vz;
    const transitionFactor = Math.exp((vin - vz) * 50);
    zenerCurrent = Math.max(0.00025, transitionFactor * (totalCurrent - loadCurrent));
  }

  if (vin > vz) {
    zenerVoltage = vz;
    totalCurrent = (vin - vz) / r;
    loadCurrent = vz / rl;
    zenerCurrent = totalCurrent - loadCurrent;
    loadVoltage = vz;
  }

  document.getElementById("total-current").textContent = totalCurrent.toFixed(4) + " A";
  document.getElementById("load-current").textContent = loadCurrent.toFixed(4) + " A";
  document.getElementById("zener-current").textContent = zenerCurrent.toFixed(4) + " A";
  document.getElementById("zener-voltage").textContent = zenerVoltage.toFixed(4) + " V";
  document.getElementById("load-voltage").textContent = loadVoltage.toFixed(4) + " V";

  // Start the animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  drawMovingDottedLine(totalCurrent, zenerCurrent, loadCurrent, vz, rl, r, vin);
});

// Add to Table Logic
document.getElementById("add-to-table-btn").addEventListener("click", () => {
  const vin = document.getElementById("input-voltage").value;
  const totalCurrentElem = document.getElementById("total-current");
  const loadCurrentElem = document.getElementById("load-current");
  const zenerVoltageElem = document.getElementById("zener-voltage");
  const zenerCurrentElem = document.getElementById("zener-current");
  const loadVoltageElem = document.getElementById("load-voltage");

  const totalCurrent = totalCurrentElem.textContent;
  const loadCurrent = loadCurrentElem.textContent;
  const zenerVoltage = zenerVoltageElem.textContent;
  const zenerCurrent = zenerCurrentElem.textContent;
  const loadVoltage = loadVoltageElem.textContent;

  if (!totalCurrent || !loadCurrent || !zenerCurrent || !zenerVoltage || !loadVoltage) {
    alert("Please calculate the results first.");
    return;
  }

  const tableBody = document.querySelector("#results-table tbody");
  const newRow = document.createElement("tr");

  newRow.innerHTML = `
    <td>${tableBody.rows.length + 1}</td>
    <td>${vin} V</td>
    <td>${totalCurrent}</td>
    <td>${loadCurrent}</td>
    <td>${zenerVoltage}</td>
    <td>${zenerCurrent}</td>
  `;

  tableBody.appendChild(newRow);

  totalCurrentElem.textContent = "";
  loadCurrentElem.textContent = "";
  zenerVoltageElem.textContent = "";
  zenerCurrentElem.textContent = "";
  loadVoltageElem.textContent = "";
});

// Delete Row Logic
document.getElementById("delete-row-btn").addEventListener("click", () => {
  const tableBody = document.querySelector("#results-table tbody");
  const rows = tableBody.querySelectorAll("tr");

  if (rows.length === 0) {
    alert("No rows to delete!");
    return;
  }

  tableBody.removeChild(rows[rows.length - 1]);
});

// Plot Graph
document.getElementById("plot-graph-btn").addEventListener("click", () => {
  const tableBody = document.querySelector("#results-table tbody");
  const rows = tableBody.querySelectorAll("tr");

  if (rows.length === 0) {
    alert("Please add data to the table first.");
    return;
  }

  const dataMap = new Map();
  let breakdownVoltage = null;

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const vz = parseFloat(cells[4].textContent);
    let iz = parseFloat(cells[5].textContent) * 1000;

    if (!isNaN(vz) && !isNaN(iz)) {
      if (iz > 1 && breakdownVoltage === null) {
        breakdownVoltage = vz;
      }

      if (breakdownVoltage !== null && vz < breakdownVoltage) {
        iz = 0.5 + 4 * Math.exp((vz - breakdownVoltage) * 12);
      }

      if (!dataMap.has(vz)) {
        dataMap.set(vz, []);
      }
      dataMap.get(vz).push(iz);
    }
  });

  if (breakdownVoltage !== null) {
    const rangeBefore = 0.9;
    const rangeAfter = 0;
    const stepSize = 0.005;

    for (let i = -rangeBefore; i < 0; i += stepSize) {
      let vz = breakdownVoltage + i;
      let iz = 0.4 + 6 * Math.exp((vz - breakdownVoltage) * 9);

      if (!dataMap.has(vz)) {
        dataMap.set(vz, []);
      }
      dataMap.get(vz).push(iz);
    }

    for (let i = 0; i <= rangeAfter; i += stepSize) {
      let vz = breakdownVoltage + i;
      let iz = 0.1 + 2 * Math.exp((vz - breakdownVoltage) * 5);

      if (!dataMap.has(vz)) {
        dataMap.set(vz, []);
      }
      dataMap.get(vz).push(iz);
    }
  }

  const sortedVoltages = Array.from(dataMap.keys()).sort((a, b) => a - b);

  const plotData = sortedVoltages.flatMap((vz) =>
    dataMap.get(vz).map((iz) => ({ x: vz, y: iz }))
  );

  const ctx = document.getElementById("zener-graph").getContext("2d");

  if (window.chartInstance) {
    window.chartInstance.destroy();
  }

  window.chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Zener Voltage vs. Zener Current",
          data: plotData,
          borderColor: "blue",
          backgroundColor: "blue",
          borderWidth: 2,
          tension: 0.9,
          pointRadius: 1.5,
          pointBackgroundColor: "red",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "linear",
          position: "top",
          reverse: true,
          title: {
            display: true,
            text: "Zener Voltage (V)",
          },
          ticks: {
            stepSize: 1,
            callback: function (value) {
              return value.toFixed(0);
            },
          },
        },
        y: {
          position: "right",
          reverse: true,
          title: {
            display: true,
            text: "Zener Current (mA)",
          },
        },
      },
    },
  });
});

// Clear Results Button Logic
document.getElementById("clear-results-btn").addEventListener("click", () => {
  document.getElementById("total-current").textContent = "--";
  document.getElementById("load-current").textContent = "--";
  document.getElementById("zener-current").textContent = "--";
  document.getElementById("zener-voltage").textContent = "--";
  document.getElementById("load-voltage").textContent = "--";

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  console.log("Results have been cleared.");
  alert("Results have been cleared!");
});

let chartInstance;

// Clear Table Button Logic
document.getElementById("clear-table-btn").addEventListener("click", () => {
  const tableBody = document.querySelector("#results-table tbody");
  tableBody.innerHTML = "";

  console.log("Table has been cleared.");
  alert("Table has been cleared!");
});

// Clear Graph Button Logic
document.getElementById("clear-graph-btn").addEventListener("click", () => {
  const canvas = document.getElementById("zener-graph");

  if (!canvas) {
    console.error("Canvas element not found!");
    alert("Graph canvas is missing. Please check your HTML.");
    return;
  }

  const ctx = canvas.getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  console.log("Graph has been cleared successfully.");
  alert("Graph Cleared!");
});

// Save Graph Logic
document.getElementById("save-graph-btn").addEventListener("click", () => {
  const canvas = document.getElementById("zener-graph");

  if (!canvas) {
    alert("No graph to save!");
    return;
  }

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png", 1.0);
  link.download = "zener_graph.png";
  link.click();
});

// Smooth Refresh
window.addEventListener('load', function () {
  requestAnimationFrame(function () {
    window.scrollTo(0, 0);
  });
});

// Smooth Scrolling
document.documentElement.style.scrollBehavior = 'smooth';

// Nav Bar
document.getElementById('menu-toggle').addEventListener('click', function () {
  document.getElementById('mobile-menu').classList.toggle('active');
});


// ZenerBot
window.addEventListener('dfMessengerLoaded', function (event) {
  $df_messenger = document.querySelector("df-messenger");
  $df_messenger_chat = $df_messenger.shadowRoot.querySelector("df-messenger-chat");

  var sheet = new CSSStyleSheet;
  sheet.replaceSync(`div.chat-wrapper.chat-open { width: 400px; }`);
  sheet.replaceSync(`div.chat-wrapper.chat-open { height: 450px; }`);
  $df_messenger_chat.shadowRoot.adoptedStyleSheets = [...$df_messenger_chat.shadowRoot.adoptedStyleSheets, sheet];

  // $df_messenger.renderCustomText('Testing renderer.');
});
