import type { SupportedLanguage, DayKey } from "../data/dailyPuzzles";

export type { SupportedLanguage };

// Mismo criterio que enroscaloReact/imaginaloReact: UNA interfaz con
// todos los strings de la UI, un objeto por idioma. Acá, al ser un juego
// mucho más chico, con bastante menos claves.
export interface Translation {
  pageTitle: string;
  pageDescription: string;

  // Home — hero
  tagline: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingNight: string;
  readyToPlay: string;
  playButton: string;
  todayLabel: string;
  todaySubtitle: string;
  // Las dos palabras de ejemplo que completa la animación de la vidriera
  // (HomePreviewBoard) — cualquier largo sirve en los dos: previewWord1
  // revela su primera y su última letra, previewWord2 solo la primera
  // (las posiciones de blanco se calculan por largo real, no están
  // fijas).
  previewWord1: string;
  previewWord2: string;

  // Home — semana + bonus
  weekSection: string;
  dayLabels: Record<DayKey, string>;
  statusSolved: string;
  statusNotSolved: string;
  statusNotPlayed: string;
  unlocksOn: (day: string) => string;
  buttonLocked: string;
  buttonPlay: string;
  buttonSeeResult: string;
  bonusLabel: string;
  bonusAvailable: string;
  bonusLockedMessage: string;

  // Home — secciones de texto
  whatIsTitle: string;
  whatIsBody: string;
  howToPlayTitle: string;
  howToPlayBodyHome: string;
  faqTitle: string;
  faqLoseQuestion: string;
  faqLoseAnswer: string;
  faqAllLettersQuestion: string;
  faqAllLettersAnswer: string;
  faqFreeQuestion: string;
  faqFreeAnswer: string;

  // Juego
  riskHint: string;
  revealLabel: string;
  flagLabel: string;
  allLettersFound: string;
  outOfLives: string;
  riskWithWhatYouFound: string;
  clueLabel: (n: number) => string;
  finalWordQuestion: string;
  correctLabel: string;
  wasLabel: (answer: string) => string;
  shareButton: string;
  copiedLabel: string;
  bonusInviteTitle: string;
  bonusInviteButton: string;
  backHome: string;
  howToPlayBodyGame: string;
  rewardModalText: string;
  rewardModalButton: string;

  // Accesibilidad
  ariaBack: string;
  ariaMenu: string;
  ariaPlayAgain: string;
  ariaCloseKeyboard: string;
  ariaBackspace: string;

  // Layout
  menuHome: string;
  menuPlay: string;
  menuPrivacy: string;
  languageLabel: string;
}

const es: Translation = {
  pageTitle: "Minado",
  pageDescription: "Un buscaminas distinto: en vez de minas, se esconden letras. Encontrá las 4 pistas y adiviná la palabra final del día.",

  tagline: "buscá · encontrá · resolvé",
  greetingMorning: "Buen día ☀️",
  greetingAfternoon: "Buenas tardes 🌤️",
  greetingNight: "Buenas noches 🌙",
  readyToPlay: "¿Listo para jugar?",
  playButton: "JUGAR",
  todayLabel: "EL MINADO DE HOY",
  todaySubtitle: "4 pistas · 1 palabra final",
  previewWord1: "ENCUENTRA",
  previewWord2: "LETRAS",

  weekSection: "Esta semana",
  dayLabels: {
    sun: "Domingo", mon: "Lunes", tue: "Martes", wed: "Miércoles",
    thu: "Jueves", fri: "Viernes", sat: "Sábado",
  },
  statusSolved: "¡Resuelto!",
  statusNotSolved: "No acertada",
  statusNotPlayed: "Sin jugar",
  unlocksOn: (day) => `Se desbloquea el ${day}`,
  buttonLocked: "Bloqueado",
  buttonPlay: "Jugar",
  buttonSeeResult: "Ver resultado",
  bonusLabel: "Bonus",
  bonusAvailable: "¡Disponible!",
  bonusLockedMessage: "Completá todos los días de la semana",

  whatIsTitle: "¿Qué es Minado?",
  whatIsBody: "Minado es un buscaminas distinto: en vez de minas, lo que se esconde en la grilla son letras — las de 4 palabras-pista mezcladas en un solo tablero. Encontrá las letras de cada pista para descubrirlas, y usalas para adivinar la palabra final del día.",
  howToPlayTitle: "¿Cómo jugar?",
  howToPlayBodyHome: "Un buscaminas común, con el riesgo real de siempre: tocá una celda para revelarla. Si es simple, te muestra un número con la cantidad de letras escondidas entre sus vecinas — revelar una celda simple nunca cuesta nada. El riesgo está en las celdas de letra: tocarla directo sin marcarla antes es una bomba, y marcarla con bandera cuando en realidad era simple también cuesta una vida (tenés 3 en total). Si acertás la bandera en una celda de letra, la reclamás sin costo (click derecho en computadora, o el modo Bandera en el celular) y la letra baja directo al lugar que le corresponde en la tarjeta de su pista. Usá esas 4 pistas para adivinar la palabra final, siempre en la misma pantalla.",
  faqTitle: "Preguntas frecuentes",
  faqLoseQuestion: "¿Puedo perder?",
  faqLoseAnswer: "Sí: tenés 3 vidas. Revelar una celda de letra directo sin marcarla antes, o marcar con bandera una que resulta ser simple, te cuesta una vida cada vez — recién cuando se te acaban las 3 no podés seguir jugando, pero igual podés intentar adivinar la palabra final con las letras que hayas encontrado hasta ese momento.",
  faqAllLettersQuestion: "¿Tengo que encontrar todas las letras antes de adivinar?",
  faqAllLettersAnswer: "No, podés intentarlo en cualquier momento con las letras que ya tengas — a veces alcanza con dos o tres para darte cuenta de cuál es la palabra.",
  faqFreeQuestion: "¿Es gratis?",
  faqFreeAnswer: "Sí, jugar a Minado es completamente gratis.",

  riskHint: "Revelar una letra directo, o marcar con bandera una que no lo era, cuesta una vida. Encontrá las 4 pistas antes de perder las 3.",
  revealLabel: "Revelar",
  flagLabel: "Bandera",
  allLettersFound: "¡Encontraste todas las letras!",
  outOfLives: "¡Te quedaste sin vidas!",
  riskWithWhatYouFound: "Arriesgá con lo que encontraste.",
  clueLabel: (n) => `Pista ${n}`,
  finalWordQuestion: "¿Cuál es la palabra final?",
  correctLabel: "¡Correcto!",
  wasLabel: (answer) => `Era: ${answer}`,
  shareButton: "Compartir resultado",
  copiedLabel: "¡Copiado!",
  bonusInviteTitle: "¿Te copaste? Hay más pistas esperando.",
  bonusInviteButton: "Jugar un Minado bonus",
  backHome: "Volver al inicio",
  howToPlayBodyGame: "Tocá una celda simple para revelarla: siempre es segura y te muestra un número (cuántas letras hay en sus vecinas) — si da 0, destapa en bloque sus vecinas. El riesgo está en las celdas de letra: tocarla directo sin marcarla antes es una bomba, y marcarla con bandera cuando en realidad era simple también cuesta una vida — tenés 3 en total. Si acertás la bandera en una celda de letra, la reclamás sin costo: en computadora, click derecho; en el celular, activá el modo Bandera arriba del tablero. Cada letra que reclamás baja directo al lugar que le corresponde en la tarjeta de su pista. Usá las 4 pistas para adivinar la palabra final, abajo de todo.",
  rewardModalText: "Para jugar de vuelta tenés que ver un anuncio.",
  rewardModalButton: "Ver anuncio",

  ariaBack: "Volver",
  ariaMenu: "Menú",
  ariaPlayAgain: "Jugar de nuevo",
  ariaCloseKeyboard: "Cerrar teclado",
  ariaBackspace: "Borrar",

  menuHome: "Inicio",
  menuPlay: "Jugar",
  menuPrivacy: "Política de Privacidad",
  languageLabel: "Idioma",
};

const en: Translation = {
  pageTitle: "Minado",
  pageDescription: "A different kind of minesweeper: instead of mines, letters are hidden. Find all 4 clues and guess today's final word.",

  tagline: "search · find · solve",
  greetingMorning: "Good morning ☀️",
  greetingAfternoon: "Good afternoon 🌤️",
  greetingNight: "Good evening 🌙",
  readyToPlay: "Ready to play?",
  playButton: "PLAY",
  todayLabel: "TODAY'S MINADO",
  todaySubtitle: "4 clues · 1 final word",
  previewWord1: "FIND",
  previewWord2: "LETTERS",

  weekSection: "This week",
  dayLabels: {
    sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday",
    thu: "Thursday", fri: "Friday", sat: "Saturday",
  },
  statusSolved: "Solved!",
  statusNotSolved: "Not solved",
  statusNotPlayed: "Not played",
  unlocksOn: (day) => `Unlocks on ${day}`,
  buttonLocked: "Locked",
  buttonPlay: "Play",
  buttonSeeResult: "See result",
  bonusLabel: "Bonus",
  bonusAvailable: "Available!",
  bonusLockedMessage: "Finish every day of the week",

  whatIsTitle: "What is Minado?",
  whatIsBody: "Minado is a different kind of minesweeper: instead of mines, what's hidden in the grid are letters — from 4 clue-words mixed into a single board. Find the letters of each clue to uncover it, and use them to guess today's final word.",
  howToPlayTitle: "How to play",
  howToPlayBodyHome: "A regular minesweeper, with the real risk of always: tap a cell to reveal it. If it's plain, it shows you a number with how many letters are hidden among its neighbors — revealing a plain cell never costs anything. The risk is in letter cells: tap one directly without flagging it first and it's a bomb, and flagging a cell that turns out to be plain also costs a life (you've got 3 total). Get the flag right on a letter cell and you claim it for free (right click on desktop, or the Flag mode on mobile), and the letter drops straight into the slot it belongs to on its clue card. Use those 4 clues to guess the final word, always on the same screen.",
  faqTitle: "FAQ",
  faqLoseQuestion: "Can I lose?",
  faqLoseAnswer: "Yes: you've got 3 lives. Revealing a letter cell directly without flagging it first, or flagging a cell that turns out to be plain, costs you a life each time — only once all 3 are gone can you no longer keep playing, but you can still try to guess the final word with whatever letters you'd already found.",
  faqAllLettersQuestion: "Do I need to find every letter before guessing?",
  faqAllLettersAnswer: "No, you can try at any time with whatever letters you already have — sometimes two or three are enough to figure out the word.",
  faqFreeQuestion: "Is it free?",
  faqFreeAnswer: "Yes, playing Minado is completely free.",

  riskHint: "Revealing a letter directly, or flagging one that wasn't there, costs a life. Find all 4 clues before you lose all 3.",
  revealLabel: "Reveal",
  flagLabel: "Flag",
  allLettersFound: "You found every letter!",
  outOfLives: "You're out of lives!",
  riskWithWhatYouFound: "Take a guess with what you found.",
  clueLabel: (n) => `Clue ${n}`,
  finalWordQuestion: "What's the final word?",
  correctLabel: "Correct!",
  wasLabel: (answer) => `It was: ${answer}`,
  shareButton: "Share result",
  copiedLabel: "Copied!",
  bonusInviteTitle: "Into it? There's more clues waiting.",
  bonusInviteButton: "Play a bonus Minado",
  backHome: "Back home",
  howToPlayBodyGame: "Tap a plain cell to reveal it: it's always safe and shows a number (how many letters are among its neighbors) — if it's 0, it clears a whole block of neighbors. The risk is in letter cells: tap one directly without flagging it first and it's a bomb, and flagging a cell that turns out to be plain also costs a life — you've got 3 total. Get the flag right on a letter cell and you claim it for free: right click on desktop, or turn on Flag mode on mobile. Every letter you claim drops straight into the slot it belongs to on its clue card. Use the 4 clues to guess the final word, at the bottom.",
  rewardModalText: "Watch an ad to play again.",
  rewardModalButton: "Watch ad",

  ariaBack: "Back",
  ariaMenu: "Menu",
  ariaPlayAgain: "Play again",
  ariaCloseKeyboard: "Close keyboard",
  ariaBackspace: "Backspace",

  menuHome: "Home",
  menuPlay: "Play",
  menuPrivacy: "Privacy Policy",
  languageLabel: "Language",
};

const pt: Translation = {
  pageTitle: "Minado",
  pageDescription: "Um campo minado diferente: em vez de minas, se escondem letras. Encontre as 4 pistas e adivinhe a palavra final do dia.",

  tagline: "busque · encontre · resolva",
  greetingMorning: "Bom dia ☀️",
  greetingAfternoon: "Boa tarde 🌤️",
  greetingNight: "Boa noite 🌙",
  readyToPlay: "Pronto para jogar?",
  playButton: "JOGAR",
  todayLabel: "O MINADO DE HOJE",
  todaySubtitle: "4 pistas · 1 palavra final",
  previewWord1: "ENCONTRE",
  previewWord2: "LETRAS",

  weekSection: "Esta semana",
  dayLabels: {
    sun: "Domingo", mon: "Segunda", tue: "Terca", wed: "Quarta",
    thu: "Quinta", fri: "Sexta", sat: "Sabado",
  },
  statusSolved: "Resolvido!",
  statusNotSolved: "Nao acertou",
  statusNotPlayed: "Nao jogado",
  unlocksOn: (day) => `Libera ${day}`,
  buttonLocked: "Bloqueado",
  buttonPlay: "Jogar",
  buttonSeeResult: "Ver resultado",
  bonusLabel: "Bonus",
  bonusAvailable: "Disponivel!",
  bonusLockedMessage: "Complete todos os dias da semana",

  whatIsTitle: "O que e o Minado?",
  whatIsBody: "Minado e um campo minado diferente: em vez de minas, o que se esconde na grade sao letras — de 4 palavras-pista misturadas em um unico tabuleiro. Encontre as letras de cada pista para descobri-la, e use-as para adivinhar a palavra final do dia.",
  howToPlayTitle: "Como jogar",
  howToPlayBodyHome: "Um campo minado comum, com o risco real de sempre: toque em uma celula para revela-la. Se for simples, mostra um numero com a quantidade de letras escondidas entre as vizinhas — revelar uma celula simples nunca custa nada. O risco esta nas celulas de letra: tocar direto sem marca-la antes e uma bomba, e marcar com bandeira uma celula que era simples tambem custa uma vida (voce tem 3 no total). Se acertar a bandeira em uma celula de letra, voce reivindica sem custo (clique direito no computador, ou o modo Bandeira no celular), e a letra cai direto no lugar que pertence no cartao da sua pista. Use essas 4 pistas para adivinhar a palavra final, sempre na mesma tela.",
  faqTitle: "Perguntas frequentes",
  faqLoseQuestion: "Posso perder?",
  faqLoseAnswer: "Sim: voce tem 3 vidas. Revelar uma celula de letra direto sem marca-la antes, ou marcar com bandeira uma que era simples, custa uma vida cada vez — so quando as 3 acabarem voce nao pode mais jogar, mas ainda pode tentar adivinhar a palavra final com as letras que ja encontrou ate aquele momento.",
  faqAllLettersQuestion: "Preciso encontrar todas as letras antes de adivinhar?",
  faqAllLettersAnswer: "Nao, voce pode tentar a qualquer momento com as letras que ja tiver — as vezes duas ou tres ja bastam para perceber qual e a palavra.",
  faqFreeQuestion: "E gratis?",
  faqFreeAnswer: "Sim, jogar Minado e totalmente gratis.",

  riskHint: "Revelar uma letra direto, ou marcar com bandeira uma que nao era, custa uma vida. Encontre as 4 pistas antes de perder as 3.",
  revealLabel: "Revelar",
  flagLabel: "Bandeira",
  allLettersFound: "Voce encontrou todas as letras!",
  outOfLives: "Voce ficou sem vidas!",
  riskWithWhatYouFound: "Arrisque com o que encontrou.",
  clueLabel: (n) => `Pista ${n}`,
  finalWordQuestion: "Qual e a palavra final?",
  correctLabel: "Correto!",
  wasLabel: (answer) => `Era: ${answer}`,
  shareButton: "Compartilhar resultado",
  copiedLabel: "Copiado!",
  bonusInviteTitle: "Curtiu? Tem mais pistas esperando.",
  bonusInviteButton: "Jogar um Minado bonus",
  backHome: "Voltar ao inicio",
  howToPlayBodyGame: "Toque em uma celula simples para revela-la: e sempre segura e mostra um numero (quantas letras ha entre suas vizinhas) — se der 0, destampa em bloco as vizinhas. O risco esta nas celulas de letra: tocar direto sem marcar antes e uma bomba, e marcar com bandeira uma celula que era simples tambem custa uma vida — voce tem 3 no total. Se acertar a bandeira em uma celula de letra, voce reivindica sem custo: no computador, clique direito; no celular, ative o modo Bandeira acima do tabuleiro. Cada letra que voce reivindica cai direto no lugar que pertence no cartao da sua pista. Use as 4 pistas para adivinhar a palavra final, no final de tudo.",
  rewardModalText: "Para jogar de novo, voce precisa ver um anuncio.",
  rewardModalButton: "Ver anuncio",

  ariaBack: "Voltar",
  ariaMenu: "Menu",
  ariaPlayAgain: "Jogar de novo",
  ariaCloseKeyboard: "Fechar teclado",
  ariaBackspace: "Apagar",

  menuHome: "Inicio",
  menuPlay: "Jogar",
  menuPrivacy: "Politica de Privacidade",
  languageLabel: "Idioma",
};

export const translations: Record<SupportedLanguage, Translation> = { es, en, pt };
