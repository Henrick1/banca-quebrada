# Banca Quebrada

Roguelike de dados 3D na taverna. Three.js para a mesa, cannon.js para a física.

## Rodar

```bash
npm install        # só precisa para o Electron
npm run build      # gera dist/index.html (jogo completo, abre direto no navegador)
npm start          # build + abre a janela do Electron
npm run dev        # refaz o build sempre que um arquivo de src/ muda
npm run dist:win   # gera um .exe portátil em dist/
```

Sem instalar nada, `node build.mjs` já gera `dist/index.html`, que abre em qualquer navegador.

## Estrutura

```
src/index.html          casca da página (HUD, mesa, bandeja); CSS e JS entram no build
src/css/                estilos, na ordem dos números
src/js/                 código do jogo, na ordem dos números
  00-nucleo.js          constantes, sorteio com semente (RNG)
  01-dados.js           dados, inimigos, roteiros, relíquias, traços, encantamentos
  02-estado.js          estado da partida (S) e utilidades de dado
  03-modelos-3d.js      geometria dos dados, texturas de madeira e feltro
  04-contador.js        contador mecânico 3D, lâmpadas e alavanca
  05-mesa.js            cena principal e física dos lances
  06-rodada.js          fluxo da rodada, resolução, vitória
  07-hud.js             barras, placar e bandeja (DOM)
  08-bandeja.js         bandeja 3D da mão e saco de dados
  09-loja.js            loja e balcão 3D
  10-cliques.js         cliques e teclado das telas sobrepostas
  11-perfil-menu.js     perfil, salvamento, desafios, conquistas, menu e fim
  12-som-efeitos.js     sons sintetizados e efeitos visuais
  13-fichas-mesa.js     fichas de relíquias/traços e bolsa da casa
  14-combos-areas.js    encantamentos, combos e áreas de efeito
  15-mapa.js            mapa de caminhos
  16-eventos.js         fusão, eventos de taverna e descanso
  17-inicio.js          tratamento de erro e inicialização
tools/simulador.mjs     simulador de balanceamento
electron/main.cjs       janela do Electron
```

Os arquivos de `src/js` compartilham o escopo global e são concatenados em ordem. Um arquivo pode usar funções de qualquer outro, mas constantes usadas no topo de um arquivo precisam vir de um número menor.

## Simulador de balanceamento

```bash
npm run sim                     # 2000 partidas no Normal
npm run sim -- --des=3          # no Desafio 3
npm run sim -- --n=500 --vida=50
```

Ele lê os inimigos, roteiros e o mapa direto de `src/js` e joga com um jogador automático simples, que não usa combos, áreas nem relíquias específicas. Use para comparar mudanças, não como taxa de vitória real: um jogador humano vence bem mais.

Opções úteis: `--des`, `--n`, `--vida`, `--pressDiv`, `--calorDiv`, `--calorMax`, `--eliteMult`, `--armK`, `--missTier`.

## Arquivo de save

Na versão instalada (Electron), o progresso fica em `Documentos/Banca Quebrada/save.json`, com uma cópia de segurança em `save.json.bak`. Para levar o progresso para outro PC, basta copiar esse arquivo. Na versão de navegador, o progresso continua no armazenamento local do navegador.
