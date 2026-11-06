// Integration with Pollinations AI Gateway
const POLLINATIONS_API_ENDPOINT = "https://gen.pollinations.ai/v1/chat/completions";

document.addEventListener('DOMContentLoaded', () => {
  const client = window.pollinationsClient;
  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');

  const hp1Fill = document.getElementById('hp1');
  const hp2Fill = document.getElementById('hp2');
  const hp1Num = document.getElementById('hp1Num');
  const hp2Num = document.getElementById('hp2Num');
  const roundNum = document.getElementById('roundNum');
  const matchStatus = document.getElementById('matchStatus');
  const combatLog = document.getElementById('combatLog');
  const blueProbs = document.getElementById('blueProbs');
  const redProbs = document.getElementById('redProbs');

  const btnAutoBattle = document.getElementById('btnAutoBattle');
  const btnStepRound = document.getElementById('btnStepRound');
  const btnRestart = document.getElementById('btnRestart');

  let round = 1;
  let isAuto = false;
  let battleTimer = null;

  let drone1 = { x: 180, y: 260, hp: 100, color: '#38bdf8', name: 'Jev Decision-1', angle: 0, shield: false };
  let drone2 = { x: 620, y: 260, hp: 100, color: '#ef4444', name: 'Decider-4B', angle: Math.PI, shield: false };
  let laserBeams = [];

  function drawArena() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid arena background
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Central danger zone
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lasers
    laserBeams.forEach((l, idx) => {
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      l.alpha -= 0.1;
      if (l.alpha <= 0) laserBeams.splice(idx, 1);
    });

    // Drones
    drawDrone(drone1);
    drawDrone(drone2);
  }

  function drawDrone(d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.angle);

    // Shield
    if (d.shield) {
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Drone Triangle Body
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(-12, -12);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 12);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();

    ctx.restore();
  }

  function appendLog(msg) {
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.textContent = msg;
    combatLog.appendChild(div);
    combatLog.scrollTop = combatLog.scrollHeight;
  }

  async function stepTurn() {
    if (drone1.hp <= 0 || drone2.hp <= 0) return;

    roundNum.textContent = `Round ${round++}`;
    const dist = Math.hypot(drone1.x - drone2.x, drone1.y - drone2.y);

    // Drone 1 Decision
    const d1Res = await client.getDecision('jev', { hp: drone1.hp, enemyHp: drone2.hp, distance: dist, angle: 0 }, ['Laser Blast', 'Thrust Forward', 'Shield Charge']);
    renderProbs(blueProbs, d1Res.probabilities);

    // Drone 2 Decision
    const d2Res = await client.getDecision('decider', { hp: drone2.hp, enemyHp: drone1.hp, distance: dist, angle: 180 }, ['Flank Maneuver', 'EMP Shockwave', 'Laser Blast']);
    renderProbs(redProbs, d2Res.probabilities);

    // Resolve Actions
    applyAction(drone1, drone2, d1Res.choice);
    applyAction(drone2, drone1, d2Res.choice);

    hp1Fill.style.width = `${Math.max(0, drone1.hp)}%`;
    hp2Fill.style.width = `${Math.max(0, drone2.hp)}%`;
    hp1Num.textContent = `${Math.max(0, drone1.hp)} HP`;
    hp2Num.textContent = `${Math.max(0, drone2.hp)} HP`;

    if (drone1.hp <= 0 || drone2.hp <= 0) {
      clearInterval(battleTimer);
      isAuto = false;
      btnAutoBattle.textContent = '▶ Start Auto-Battle';
      matchStatus.textContent = drone1.hp > 0 ? 'WINNER: BLUE DRONE (Jev)' : 'WINNER: RED DRONE (Decider)';
      appendLog(`VICTORY: ${matchStatus.textContent}`);
    }
    drawArena();
  }

  function applyAction(actor, target, action) {
    actor.shield = false;
    if (action.includes('Laser')) {
      laserBeams.push({ x1: actor.x, y1: actor.y, x2: target.x, y2: target.y, color: actor.color, alpha: 1.0 });
      const dmg = target.shield ? 8 : 18;
      target.hp -= dmg;
      appendLog(`${actor.name} fires Laser Blast dealing ${dmg} damage!`);
    } else if (action.includes('Shield')) {
      actor.shield = true;
      appendLog(`${actor.name} raises Shield Barrier!`);
    } else if (action.includes('Thrust') || action.includes('Flank')) {
      actor.x += (target.x - actor.x) * 0.2;
      appendLog(`${actor.name} maneuvers into combat angle!`);
    } else {
      target.hp -= 12;
      appendLog(`${actor.name} triggers EMP pulse!`);
    }
  }

  function renderProbs(container, probs) {
    container.innerHTML = '';
    for (const [k, v] of Object.entries(probs || {})) {
      const pct = Math.round(v * 100);
      const row = document.createElement('div');
      row.className = 'prob-row';
      row.innerHTML = `<span>${k} (${pct}%)</span><div class="bar-fill" style="width: ${pct}%;"></div>`;
      container.appendChild(row);
    }
  }

  btnAutoBattle.addEventListener('click', () => {
    if (isAuto) {
      clearInterval(battleTimer);
      isAuto = false;
      btnAutoBattle.textContent = '▶ Start Auto-Battle';
    } else {
      isAuto = true;
      btnAutoBattle.textContent = '⏸ Pause Battle';
      stepTurn();
      battleTimer = setInterval(stepTurn, 2500);
    }
  });

  btnStepRound.addEventListener('click', () => stepTurn());

  btnRestart.addEventListener('click', () => {
    clearInterval(battleTimer);
    isAuto = false;
    btnAutoBattle.textContent = '▶ Start Auto-Battle';
    round = 1;
    drone1 = { x: 180, y: 260, hp: 100, color: '#38bdf8', name: 'Jev Decision-1', angle: 0, shield: false };
    drone2 = { x: 620, y: 260, hp: 100, color: '#ef4444', name: 'Decider-4B', angle: Math.PI, shield: false };
    hp1Fill.style.width = '100%';
    hp2Fill.style.width = '100%';
    hp1Num.textContent = '100 HP';
    hp2Num.textContent = '100 HP';
    roundNum.textContent = 'Round 1';
    matchStatus.textContent = 'MATCH IN PROGRESS';
    combatLog.innerHTML = '<div class="log-entry">Arena reset. Ready for deployment.</div>';
    drawArena();
  });

  drawArena();
});
