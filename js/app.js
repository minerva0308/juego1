   const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const gameOverScreen = document.getElementById("gameOverScreen");

    let currentMode = 'rain';
    let particles = [];
    let iceBlocks = [];
    let spikes = [];
    let enemies = [];
    let bombs = [];
    let explosions = [];
    let jumpParticles = [];

    // Variables del juego
    const gravity = 0.5;
    let distance = 0;
    let gameOver = false;
    let multiplier = 1;
    let level = 1;
    let gameSpeed = 1;
    let iceFriction = 1; // Factor de fricción en modo hielo

    const ball = {
      x: 100,
      y: 380,
      radius: 15,
      color: "#FF4444",
      dx: 0,
      dy: 0,
      speed: 6,
      jumping: false,
      invincible: false,
      invincibleTimer: 0,
      // Nuevas propiedades para mejor salto
      jumpPower: 14, // Aumentado para salto más alto
      canJump: true,
      jumpCooldown: 0
    };


    /*const left;
    const right;
    if(left == true){*/

    //}

    const platform = {
      x: 0,
      y: 420,
      width: canvas.width,
      height: 80,
      color: "#228B22"
    };

    const obstacles = [];
    const stairs = [];
    let obstacleSpawnCounter = 0;
    let stairSpawnCounter = 0;
    let spikeSpawnCounter = 0;
    let enemySpawnCounter = 0;
    let bombSpawnCounter = 0;

    // Cambiar modo manual
    function changeMode(mode) {
      currentMode = mode;
      
      document.body.classList.remove('night-mode', 'snow-mode');
      if (mode === 'night') document.body.classList.add('night-mode');
      if (mode === 'snow') document.body.classList.add('snow-mode');
      
      let modeText = '🌧️ Lluvia';
      if (mode === 'night') modeText = '🌙 Oscuro';
      if (mode === 'snow') modeText = '❄️ Hielo';
      
      document.getElementById("modeDisplay").textContent = modeText;
      
      initParticles();
      initIceBlocks();
    }

    // Inicializar partículas (lluvia/nieve)
    function initParticles() {
      particles = [];
      const count = currentMode === 'rain' ? 150 : 100;
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: currentMode === 'rain' ? (10 + Math.random() * 10) : 0,
          size: currentMode === 'snow' ? (3 + Math.random() * 5) : 1,
          speed: currentMode === 'rain' ? (5 + Math.random() * 5) : (1 + Math.random() * 2),
          opacity: Math.random() * 0.5 + 0.3,
          wind: Math.random() * 2 - 1
        });
      }
    }

    // Inicializar bloques de hielo
    function initIceBlocks() {
      iceBlocks = [];
      if (currentMode === 'snow') {
        for (let i = 0; i < 10; i++) {
          iceBlocks.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 300,
            width: 40 + Math.random() * 40,
            height: 20 + Math.random() * 20,
            rotation: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1
          });
        }
      }
    }

    // Crear partículas de salto
    function createJumpParticles(x, y) {
      for (let i = 0; i < 8; i++) {
        jumpParticles.push({
          x: x,
          y: y,
          dx: (Math.random() - 0.5) * 4,
          dy: -Math.random() * 3,
          size: 2 + Math.random() * 3,
          color: '#FFAA00',
          life: 20 + Math.random() * 10
        });
      }
    }

    // Dibujar partículas de salto
    function drawJumpParticles() {
      for (let i = jumpParticles.length - 1; i >= 0; i--) {
        const p = jumpParticles[i];
        
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.1;
        p.life--;
        
        if (p.life <= 0) {
          jumpParticles.splice(i, 1);
        }
      }
    }

    // Dibujar partículas
    function drawParticles() {
      if (currentMode === 'rain') {
        ctx.strokeStyle = `rgba(200, 220, 255, 0.4)`;
        ctx.lineWidth = 1;

        for (let drop of particles) {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed * gameSpeed;
          drop.x -= 2;

          if (drop.y > canvas.height) {
            drop.y = -10;
            drop.x = Math.random() * canvas.width;
          }
        }
      } else if (currentMode === 'snow') {
        for (let snow of particles) {
          ctx.fillStyle = `rgba(255, 255, 255, ${snow.opacity})`;
          ctx.beginPath();
          ctx.arc(snow.x, snow.y, snow.size, 0, Math.PI * 2);
          ctx.fill();

          snow.y += snow.speed * gameSpeed;
          snow.x += snow.wind;

          if (snow.y > canvas.height) {
            snow.y = -10;
            snow.x = Math.random() * canvas.width;
          }
          
          if (snow.x < 0) snow.x = canvas.width;
          if (snow.x > canvas.width) snow.x = 0;
        }
      }
    }

    // Dibujar bloques de hielo
    function drawIceBlocks() {
      if (currentMode !== 'snow') return;
      
      for (let ice of iceBlocks) {
        ctx.save();
        ctx.translate(ice.x + ice.width/2, ice.y + ice.height/2);
        ctx.rotate(ice.rotation);
        
        // Dibujar bloque de hielo con efecto cristalino
        ctx.fillStyle = 'rgba(200, 230, 255, 0.7)';
        ctx.fillRect(-ice.width/2, -ice.height/2, ice.width, ice.height);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-ice.width/2, -ice.height/2, ice.width, ice.height);
        
        // Efectos de brillo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-ice.width/2 + 5, -ice.height/2 + 5, ice.width/3, ice.height/3);
        
        ctx.restore();
        
        // Actualizar posición y rotación
        ice.x -= ice.speed * gameSpeed;
        ice.rotation += 0.01;
        
        if (ice.x + ice.width < 0) {
          ice.x = canvas.width;
          ice.y = Math.random() * 300;
        }
      }
    }

    // Dibujar puas
    function drawSpikes() {
      for (let spike of spikes) {
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(spike.x, spike.y + spike.height);
        ctx.lineTo(spike.x + spike.width/2, spike.y);
        ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#660000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Actualizar posición
        spike.x -= spike.speed;
        
        if (spike.x + spike.width < 0) {
          spikes.splice(spikes.indexOf(spike), 1);
        }
      }
    }

    // Dibujar enemigos
    function drawEnemies() {
      for (let enemy of enemies) {
        // Cuerpo del enemigo
        ctx.fillStyle = '#8A2BE2';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojos
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(enemy.x - 5, enemy.y - 3, 4, 0, Math.PI * 2);
        ctx.arc(enemy.x + 5, enemy.y - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(enemy.x - 5, enemy.y - 3, 2, 0, Math.PI * 2);
        ctx.arc(enemy.x + 5, enemy.y - 3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Boca
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y + 5, 5, 0, Math.PI, false);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Actualizar posición
        enemy.x -= enemy.speed;
        
        if (enemy.x + enemy.radius < 0) {
          enemies.splice(enemies.indexOf(enemy), 1);
        }
      }
    }

    // Dibujar bombas
    function drawBombs() {
      for (let bomb of bombs) {
        // Cuerpo de la bomba
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.y, bomb.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Mechón
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(bomb.x - 2, bomb.y - bomb.radius - 5, 4, 8);
        
        // Detalles
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.y, bomb.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Actualizar posición
        bomb.x -= bomb.speed;
        
        if (bomb.x + bomb.radius < 0) {
          bombs.splice(bombs.indexOf(bomb), 1);
        }
      }
    }

    // Dibujar explosiones
    function drawExplosions() {
      for (let explosion of explosions) {
        ctx.fillStyle = `rgba(255, ${100 + explosion.frame * 10}, 0, ${1 - explosion.frame/20})`;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fill();
        
        explosion.frame++;
        explosion.radius += 2;
        
        if (explosion.frame > 20) {
          explosions.splice(explosions.indexOf(explosion), 1);
        }
      }
    }

        const keys = {
      right: false,
      left: false,
      up: false,
      down: false
    };
    // Control del teclado
document.addEventListener("keydown", (e) => {
  console.log("Tecla presionada:", e.code); // ✅ Verifica qué tecla se presiona

  if (e.code === "ArrowRight") {
    keys.right = true;
    console.log("→ Derecha presionada");
  }

  if (e.code === "ArrowLeft") {
    keys.left = true;
    console.log("← Izquierda presionada");
  }

  if (e.code === "ArrowDown") {
    keys.down = true;
    console.log("↓ Abajo presionada");
  }

  if (e.code === "ArrowUp") {
    keys.up = true;
    console.log("↑ Arriba presionada");

    // Salto inmediato sin verificación de "jumping"
    if (ball.canJump && ball.jumpCooldown <= 0) {
      console.log("Salto ejecutado ✅");
      ball.dy = -ball.jumpPower;
      ball.jumping = true;
      ball.canJump = false;
      ball.jumpCooldown = 10; // Pequeño cooldown para evitar saltos múltiples
      createJumpParticles(ball.x, ball.y + ball.radius);
    } else {
      console.log(
        "No puede saltar ❌ → canJump:",
        ball.canJump,
        " | cooldown:",
        ball.jumpCooldown
      );
    }
  }

  if (e.code === "Space") {
    console.log("Barra espaciadora presionada");
    if (gameOver) {
      console.log("Reiniciando juego...");
      restartGame();
    }
  }

  console.log("Estado actual de keys:", keys);
});

document.addEventListener("keyup", (e) => {
  console.log("Tecla soltada:", e.code);

  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "ArrowLeft") keys.left = false;
  if (e.code === "ArrowUp") keys.up = false;
  if (e.code === "ArrowDown") keys.down = false;

  console.log("Estado después de soltar:", keys);
});


    // document.addEventListener("keyup", (e) => {
    //   if (e.code === "ArrowRight") keys.right = false;
    //   if (e.code === "ArrowLeft") keys.left = false;
    //   if (e.code === "ArrowUp") keys.up = false;
    // });

    // Dibujar pelotita
    function drawBall() {
      // Efecto de invencibilidad (parpadeo)
      if (ball.invincible && Math.floor(ball.invincibleTimer / 5) % 2 === 0) {
        return;
      }
      
      const gradient = ctx.createRadialGradient(ball.x - 5, ball.y - 5, 0, ball.x, ball.y, ball.radius);
      gradient.addColorStop(0, "#FF6666");
      gradient.addColorStop(1, "#CC0000");
      
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      const shine = ctx.createRadialGradient(ball.x - 7, ball.y - 7, 0, ball.x, ball.y, ball.radius);
      shine.addColorStop(0, "rgba(255,255,255,0.4)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      ctx.fill();
    }

    // Dibujar plataforma
    function drawPlatform() {
      let gradient;
      
      if (currentMode === 'snow') {
        // Plataforma de hielo
        gradient = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
        gradient.addColorStop(0, "#B3E5FC");
        gradient.addColorStop(1, "#4FC3F7");
      } else {
        // Plataforma normal
        gradient = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
        gradient.addColorStop(0, "#32CD32");
        gradient.addColorStop(1, "#1a7a1a");
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        for (let j = 0; j < platform.height; j += 10) {
          ctx.beginPath();
          ctx.arc(i + 10, platform.y + j + 5, 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Dibujar obstáculos
    function drawObstacle(obs) {
      const gradient = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
      gradient.addColorStop(0, "#FF6B6B");
      gradient.addColorStop(1, "#C92A2A");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.width / 2, obs.y + 3);
      ctx.lineTo(obs.x + obs.width - 3, obs.y + obs.height - 3);
      ctx.lineTo(obs.x + 3, obs.y + obs.height - 3);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      ctx.shadowBlur = 0;
    }

    // Dibujar escaleras
    function drawStairs(stair) {
      const stepWidth = stair.width / stair.steps;
      const stepHeight = stair.height / stair.steps;
      
      const gradient = ctx.createLinearGradient(stair.x, stair.y, stair.x, stair.y + stair.height);
      gradient.addColorStop(0, "#D4A574");
      gradient.addColorStop(1, "#8B6914");
      
      for (let i = 0; i < stair.steps; i++) {
        const x = stair.x + (i * stepWidth);
        const y = stair.y + (i * stepHeight);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, stepWidth, stepHeight);
        
        ctx.strokeStyle = "#5D4E06";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, stepWidth, stepHeight);
        
        ctx.beginPath();
        ctx.moveTo(x, y + stepHeight - 3);
        ctx.lineTo(x + stepWidth, y + stepHeight - 3);
        ctx.stroke();
      }
    }

    // Crear obstáculos
    function spawnObstacle() {
      const height = 35 + Math.random() * 35;
      const width = 25 + Math.random() * 25;
      obstacles.push({
        x: canvas.width,
        y: platform.y - height,
        width: width,
        height: height,
        speed: 5 * gameSpeed,
        type: 'obstacle'
      });
    }

    // Crear escaleras
    function spawnStairs() {
      const height = 80 + Math.random() * 60;
      stairs.push({
        x: canvas.width,
        y: platform.y - height,
        width: 60,
        height: height,
        steps: 4,
        speed: 5 * gameSpeed,
        type: 'stairs'
      });
    }

    // Crear puas
    function spawnSpike() {
      spikes.push({
        x: canvas.width,
        y: platform.y - 20,
        width: 30,
        height: 20,
        speed: 5 * gameSpeed
      });
    }

    // Crear enemigos
    function spawnEnemy() {
      enemies.push({
        x: canvas.width,
        y: platform.y - 20,
        radius: 15,
        speed: 4 * gameSpeed
      });
    }

    // Crear bombas
    function spawnBomb() {
      bombs.push({
        x: canvas.width,
        y: platform.y - 20,
        radius: 12,
        speed: 3 * gameSpeed
      });
    }

    // Crear explosión
    function createExplosion(x, y) {
      explosions.push({
        x: x,
        y: y,
        radius: 10,
        frame: 0
      });
    }

    // Colisión
    function checkCollision(ball, obj) {
      return ball.x + ball.radius > obj.x &&
             ball.x - ball.radius < obj.x + obj.width &&
             ball.y + ball.radius > obj.y &&
             ball.y - ball.radius < obj.y + obj.height;
    }

    function checkCircleCollision(ball, obj) {
      const dx = ball.x - obj.x;
      const dy = ball.y - obj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < ball.radius + obj.radius;
    }

    function checkStairsCollision(ball, stair) {
      return ball.x + ball.radius > stair.x &&
             ball.x - ball.radius < stair.x + stair.width &&
             ball.y + ball.radius > stair.y &&
             ball.y - ball.radius < stair.y + stair.height;
    }

    // Reiniciar juego
    function restartGame() {
      gameOver = false;
      gameOverScreen.style.display = "none";
      distance = 0;
      multiplier = 1;
      level = 1;
      gameSpeed = 1;
      ball.x = 100;
      ball.y = 380;
      ball.dx = 0;
      ball.dy = 0;
      ball.jumping = false;
      ball.invincible = false;
      ball.canJump = true;
      ball.jumpCooldown = 0;
      obstacles.length = 0;
      stairs.length = 0;
      spikes.length = 0;
      enemies.length = 0;
      bombs.length = 0;
      explosions.length = 0;
      jumpParticles.length = 0;
      obstacleSpawnCounter = 0;
      stairSpawnCounter = 0;
      spikeSpawnCounter = 0;
      enemySpawnCounter = 0;
      bombSpawnCounter = 0;
      currentMode = 'rain';
      document.body.classList.remove('night-mode', 'snow-mode');
      initParticles();
      initIceBlocks();
    }

    // Actualizar juego
  function updateGame() {
  if (gameOver) return;

  // Actualizar invencibilidad
  if (ball.invincible) {
    ball.invincibleTimer--;
    if (ball.invincibleTimer <= 0) {
      ball.invincible = false;
    }
  }

  // Actualizar cooldown de salto
  if (ball.jumpCooldown > 0) {
    ball.jumpCooldown--;
  }

  // Movimiento en modo hielo (más deslizante)
  if (currentMode === 'snow') {
    iceFriction = 0.95;
  } else {
    iceFriction = 1;
  }

  // Movimiento horizontal
  if (keys.right) {
    ball.dx = ball.speed;
  } else if (keys.left) {
    ball.dx = -ball.speed;
  } else {
    // Si estás en hielo, se desliza un poco, sino se detiene
    if (currentMode === 'snow') {
      ball.dx *= iceFriction;
      if (Math.abs(ball.dx) < 0.1) ball.dx = 0; // detenerlo si la velocidad es muy baja
    } else {
      ball.dx = 0; // detener inmediatamente en modo normal
    }
  }

  // Movimiento vertical
  ball.dy += gravity;
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Detectar contacto con el suelo
  if (ball.y + ball.radius > platform.y && ball.dy > 0) {
    ball.y = platform.y - ball.radius;
    ball.dy = 0;
    ball.jumping = false;
    ball.canJump = true;

    // Efecto de rebote pequeño al tocar el suelo
    if (Math.abs(ball.dy) > 5) {
      createJumpParticles(ball.x, ball.y + ball.radius);
    }
  }

  // Limites horizontales
  if (ball.x - ball.radius < 0) ball.x = ball.radius;
  if (ball.x + ball.radius > canvas.width) ball.x = canvas.width - ball.radius;

  // Aumentar velocidad según progreso
  gameSpeed = 1 + (distance / 500);
  level = Math.floor(distance / 100) + 1;

  // Generar obstáculos
  obstacleSpawnCounter++;
  if (obstacleSpawnCounter > Math.max(40, 50 - distance / 50)) {
    if (Math.random() > 0.3) spawnObstacle();
    obstacleSpawnCounter = 0;
  }

  // Generar escaleras
  stairSpawnCounter++;
  if (stairSpawnCounter > Math.max(100, 140 - distance / 50)) {
    spawnStairs();
    stairSpawnCounter = 0;
  }

  // Generar puas
  spikeSpawnCounter++;
  if (spikeSpawnCounter > Math.max(60, 80 - distance / 50)) {
    if (Math.random() > 0.5) spawnSpike();
    spikeSpawnCounter = 0;
  }

  // Generar enemigos
  enemySpawnCounter++;
  if (enemySpawnCounter > Math.max(120, 160 - distance / 50)) {
    if (Math.random() > 0.6) spawnEnemy();
    enemySpawnCounter = 0;
  }

  // Generar bombas
  bombSpawnCounter++;
  if (bombSpawnCounter > Math.max(150, 200 - distance / 50)) {
    if (Math.random() > 0.7) spawnBomb();
    bombSpawnCounter = 0;
  }

  // Actualizar escaleras
  for (let i = stairs.length - 1; i >= 0; i--) {
    stairs[i].x -= stairs[i].speed;

    if (checkStairsCollision(ball, stairs[i]) && ball.dy >= 0) {
      ball.y = stairs[i].y - ball.radius;
      ball.dy = 0;
      ball.jumping = false;
      ball.canJump = true;
    }

    if (stairs[i].x + stairs[i].width < 0) {
      stairs.splice(i, 1);
      distance += 20;
      multiplier = Math.min(multiplier + 0.05, 5);
    }
  }

  // Actualizar obstáculos
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= obstacles[i].speed;

    if (!ball.invincible && checkCollision(ball, obstacles[i])) {
      gameOver = true;
      gameOverScreen.style.display = "block";
      document.getElementById("levelReached").textContent = level;
      document.getElementById("finalScore").textContent = `Puntuación Final: ${Math.floor(distance * multiplier)}`;
    }

    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
      distance += 10;
    }
  }

  // Actualizar puas
  for (let i = spikes.length - 1; i >= 0; i--) {
    if (!ball.invincible && checkCollision(ball, spikes[i])) {
      createExplosion(ball.x, ball.y);
      gameOver = true;
      gameOverScreen.style.display = "block";
      document.getElementById("levelReached").textContent = level;
      document.getElementById("finalScore").textContent = `Puntuación Final: ${Math.floor(distance * multiplier)}`;
    }
  }

  // Actualizar enemigos
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (!ball.invincible && checkCircleCollision(ball, enemies[i])) {
      createExplosion(ball.x, ball.y);
      gameOver = true;
      gameOverScreen.style.display = "block";
      document.getElementById("levelReached").textContent = level;
      document.getElementById("finalScore").textContent = `Puntuación Final: ${Math.floor(distance * multiplier)}`;
    }
  }

  // Actualizar bombas
  for (let i = bombs.length - 1; i >= 0; i--) {
    if (!ball.invincible && checkCircleCollision(ball, bombs[i])) {
      createExplosion(bombs[i].x, bombs[i].y);
      bombs.splice(i, 1);

      // La bomba otorga invencibilidad temporal en lugar de game over
      ball.invincible = true;
      ball.invincibleTimer = 60; // 1 segundo a 60fps
      distance += 30;
    }
  }

  // Actualizar HUD
  document.getElementById("score").textContent = distance;
  document.getElementById("multiplier").textContent = `x${multiplier.toFixed(1)}`;
  document.getElementById("level").textContent = level;
  document.getElementById("speedLevel").textContent = `${gameSpeed.toFixed(1)}x`;
  document.getElementById("finalPoints").textContent = Math.floor(distance * multiplier);
}


    // Bucle del juego
    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawPlatform();
      drawParticles();
      drawIceBlocks();
      stairs.forEach(drawStairs);
      obstacles.forEach(drawObstacle);
      drawSpikes();
      drawEnemies();
      drawBombs();
      drawExplosions();
      drawJumpParticles();
      drawBall();
      updateGame();

      requestAnimationFrame(gameLoop);
    }

    // Inicializar
    initParticles();
    initIceBlocks();
    gameLoop();