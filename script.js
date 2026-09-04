(function () {
  "use strict";

  var botao = document.getElementById("botaoParabens");
  var festa = document.getElementById("festa");
  var foto = document.getElementById("festaFoto");
  var semFoto = document.getElementById("festaSemFoto");
  var fechar = document.getElementById("festaFechar");

  // Se assets/heloisa.jpg ainda não existir, mostra o bolo no lugar da foto.
  foto.addEventListener("error", function () {
    festa.classList.add("festa--sem-foto");
  });
  if (foto.complete && foto.naturalWidth === 0) {
    festa.classList.add("festa--sem-foto");
  }

  function abrir() {
    festa.hidden = false;
    document.body.classList.add("festa-aberta");
    // Reinicia as animações caso a tela já tenha sido aberta antes.
    festa.classList.remove("festa--tocando");
    void festa.offsetWidth;
    festa.classList.add("festa--tocando");
    fechar.focus();
  }

  function fecharFesta() {
    festa.hidden = true;
    festa.classList.remove("festa--tocando");
    document.body.classList.remove("festa-aberta");
    botao.focus();
  }

  botao.addEventListener("click", abrir);
  fechar.addEventListener("click", fecharFesta);

  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && !festa.hidden) {
      fecharFesta();
    }
  });

  // Evita que o elemento escondido continue acessível ao leitor de tela.
  festa.hidden = true;
  semFoto.setAttribute("aria-hidden", "true");
})();
