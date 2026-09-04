(function () {
  "use strict";

  var botao = document.getElementById("botaoParabens");
  var festa = document.getElementById("festa");
  var foto = document.getElementById("festaFoto");
  var fechar = document.getElementById("festaFechar");
  var audio = document.getElementById("festaAudio");
  var canvas = document.getElementById("confete");
  var ctx = canvas.getContext("2d");

  var semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Se assets/heloisa.jpg ainda não existir, mostra o bolo no lugar da foto.
  foto.addEventListener("error", function () {
    festa.classList.add("festa--sem-foto");
  });
  if (foto.complete && foto.naturalWidth === 0) {
    festa.classList.add("festa--sem-foto");
  }

  /* ---------------- Papel picado ---------------- */

  var CORES = ["#e8262f", "#f2669a", "#f5a623", "#8dc63f", "#3d9dbd", "#ffd83d", "#ffffff"];
  var GRAVIDADE = 0.3;
  var papeis = [];
  var rodando = false;
  var ultimoQuadro = 0;

  function ajustarCanvas() {
    var escala = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * escala);
    canvas.height = Math.round(window.innerHeight * escala);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
  }

  function criarPapel(x, y, forca) {
    // Ângulo apontando para cima, com uma abertura em leque.
    var angulo = -Math.PI / 2 + (Math.random() - 0.5) * 1.15;
    var velocidade = forca * (0.55 + Math.random() * 0.55);

    return {
      x: x + (Math.random() - 0.5) * 40,
      y: y,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      largura: 6 + Math.random() * 6,
      altura: 9 + Math.random() * 8,
      cor: CORES[Math.floor(Math.random() * CORES.length)],
      rotacao: Math.random() * Math.PI * 2,
      giro: (Math.random() - 0.5) * 0.35,
      balanco: Math.random() * Math.PI * 2
    };
  }

  function soltarConfete() {
    if (semMovimento) {
      return;
    }

    ajustarCanvas();

    var largura = window.innerWidth;
    var altura = window.innerHeight;
    // Força suficiente para o papel subir quase até o topo da tela.
    var forca = Math.sqrt(2 * GRAVIDADE * altura * 0.95);

    var canhoes = [
      { x: largura * 0.5, y: altura + 10, quantidade: 70 },
      { x: largura * 0.15, y: altura + 10, quantidade: 45 },
      { x: largura * 0.85, y: altura + 10, quantidade: 45 }
    ];

    papeis = [];
    canhoes.forEach(function (canhao) {
      for (var i = 0; i < canhao.quantidade; i++) {
        papeis.push(criarPapel(canhao.x, canhao.y, forca));
      }
    });

    if (!rodando) {
      rodando = true;
      ultimoQuadro = 0;
      requestAnimationFrame(animarConfete);
    }
  }

  function animarConfete(agora) {
    if (!ultimoQuadro) {
      ultimoQuadro = agora;
    }
    // Passo relativo a 60 quadros por segundo, limitado para não "teleportar".
    var passo = Math.min((agora - ultimoQuadro) / 16.67, 3);
    ultimoQuadro = agora;

    var altura = window.innerHeight;
    ctx.clearRect(0, 0, window.innerWidth, altura);

    for (var i = papeis.length - 1; i >= 0; i--) {
      var p = papeis[i];

      p.vy += GRAVIDADE * passo;
      p.vx *= Math.pow(0.99, passo);
      p.balanco += 0.12 * passo;
      p.rotacao += p.giro * passo;
      p.x += (p.vx + Math.sin(p.balanco) * 0.6) * passo;
      p.y += p.vy * passo;

      // Já caiu para fora da tela: pode sumir.
      if (p.y - p.altura > altura) {
        papeis.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotacao);
      // O "achatar e abrir" imita o papel girando no ar.
      ctx.scale(1, Math.cos(p.balanco));
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.largura / 2, -p.altura / 2, p.largura, p.altura);
      ctx.restore();
    }

    if (papeis.length > 0) {
      requestAnimationFrame(animarConfete);
    } else {
      rodando = false;
      ctx.clearRect(0, 0, window.innerWidth, altura);
    }
  }

  function pararConfete() {
    papeis = [];
    rodando = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", function () {
    if (rodando) {
      ajustarCanvas();
    }
  });

  /* ---------------- Abrir e fechar a tela de parabéns ---------------- */

  function abrir() {
    festa.hidden = false;
    document.body.classList.add("festa-aberta");
    // Reinicia as animações caso a tela já tenha sido aberta antes.
    festa.classList.remove("festa--tocando");
    void festa.offsetWidth;
    festa.classList.add("festa--tocando");
    soltarConfete();
    tocarAudio();
    fechar.focus();
  }

  function tocarAudio() {
    audio.currentTime = 0;
    var tentativa = audio.play();
    // Alguns navegadores devolvem uma promessa que pode ser recusada.
    if (tentativa && typeof tentativa.catch === "function") {
      tentativa.catch(function () {
        /* Sem som: a festa continua do mesmo jeito. */
      });
    }
  }

  function fecharFesta() {
    festa.hidden = true;
    festa.classList.remove("festa--tocando");
    document.body.classList.remove("festa-aberta");
    pararConfete();
    audio.pause();
    audio.currentTime = 0;
    botao.focus();
  }

  botao.addEventListener("click", abrir);
  fechar.addEventListener("click", fecharFesta);

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && !festa.hidden) {
      fecharFesta();
    }
  });

  festa.hidden = true;
})();
