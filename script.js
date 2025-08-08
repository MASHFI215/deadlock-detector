document.getElementById('setupBtn').addEventListener('click', setupMatrixInputs);
document.getElementById('detectBtn').addEventListener('click', detectDeadlock);

function setupMatrixInputs() {
  const n = +document.getElementById('numProc').value;
  const m = +document.getElementById('numRes').value;
  if (n < 1 || m < 1) return;

  let html = "<div class='matrix-title'>Allocation Matrix:</div><table><tr><th></th>";
  for (let j = 0; j < m; j++) html += `<th>Res${j}</th>`;
  html += "</tr>";

  for (let i = 0; i < n; i++) {
    html += `<tr><th>P${i}</th>`;
    for (let j = 0; j < m; j++) {
      html += `<td><input id="alloc_${i}_${j}" type="number" min="0" value="0" style="width:40px" /></td>`;
    }
    html += "</tr>";
  }

  html += "</table><div class='matrix-title'>Request Matrix:</div><table><tr><th></th>";
  for (let j = 0; j < m; j++) html += `<th>Res${j}</th>`;
  html += "</tr>";

  for (let i = 0; i < n; i++) {
    html += `<tr><th>P${i}</th>`;
    for (let j = 0; j < m; j++) {
      html += `<td><input id="req_${i}_${j}" type="number" min="0" value="0" style="width:40px" /></td>`;
    }
    html += "</tr>";
  }

  html += "</table>";

  document.getElementById('matrices').innerHTML = html;
  document.getElementById('detectBtn').style.display = 'inline-block';
  document.getElementById('output').innerHTML = '';
}

function buildWaitForGraph(n, m, allocation, request) {
  const graph = {};
  for (let i = 0; i < n; i++) {
    graph[i] = [];
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        let needsResource = false;
        for (let k = 0; k < m; k++) {
          if (request[i][k] > 0 && allocation[j][k] > 0) {
            needsResource = true;
            break;
          }
        }
        if (needsResource) graph[i].push(j);
      }
    }
  }
  return graph;
}

function detectCycle(graph, n) {
  const visited = new Array(n).fill(false);
  const recStack = new Array(n).fill(false);
  let cycleNodes = [];

  function dfs(v) {
    visited[v] = true;
    recStack[v] = true;

    for (const neighbor of graph[v]) {
      if (!visited[neighbor]) {
        if (dfs(neighbor)) {
          cycleNodes.push(neighbor);
          return true;
        }
      } else if (recStack[neighbor]) {
        cycleNodes.push(neighbor);
        return true;
      }
    }

    recStack[v] = false;
    return false;
  }

  for (let i = 0; i < n; i++) {
    cycleNodes = [];
    if (!visited[i] && dfs(i)) {
      cycleNodes.push(i);
      return Array.from(new Set(cycleNodes)).reverse();
    }
  }

  return [];
}

function detectDeadlock() {
  const n = +document.getElementById('numProc').value;
  const m = +document.getElementById('numRes').value;

  const allocation = [];
  const request = [];

  for (let i = 0; i < n; i++) {
    allocation[i] = [];
    request[i] = [];
    for (let j = 0; j < m; j++) {
      allocation[i][j] = +document.getElementById(`alloc_${i}_${j}`).value || 0;
      request[i][j] = +document.getElementById(`req_${i}_${j}`).value || 0;
    }
  }

  const graph = buildWaitForGraph(n, m, allocation, request);
  const deadlocked = detectCycle(graph, n);

  const output = document.getElementById('output');
  const mediaDiv = document.getElementById('mediaOutput');
  if (deadlocked.length > 0) {
    output.innerHTML = `<span style="color:#ff5555;font-weight:bold;">Deadlock detected among processes: P${deadlocked.join(', P')}</span>`;
    // Show image when deadlock is detected
    mediaDiv.innerHTML = `<img src="3_Spiderman_Pointing_Meme_Template_V1.jpg" alt="Deadlock Meme" style="max-width:350px; width:100%; border-radius:12px;"/>`;
  } else {
    output.innerHTML = `<span style="color:#7cfc00;font-weight:bold;">No deadlock detected!</span>`;
    // Show mp4 when deadlock not detected
    mediaDiv.innerHTML = `<video src="aura-farming-gif-indonesian-boat-racing-kid-iyyQ7IFOc6-video.mp4" controls autoplay loop style="max-width:350px; width:100%; border-radius:12px;"></video>`;
  }
}

