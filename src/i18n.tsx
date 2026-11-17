import React, { createContext, useContext, useEffect, useState } from 'react'

export const LANGS = ['en', 'es', 'fr', 'de', 'pt', 'it'] as const
export type Lang = (typeof LANGS)[number]

export type Copy = {
  beThe: string
  route: string
  experience: string
  seeGallop: string
  backToView: string
  centerCamera: string
  runThird: string
  runThirdSmall: string
  playShort: string
  leaving: string
  everyStep: string
  footer: string
  cameraHint: string
  download: string
  continue: string
  loading: string
  loadFail: string
  needWebgl: string
  pause: string
  play: string
  routeEyebrow: string
  routeTitle: string
  exitRun: string
  scoreLabel: string
  record: string
  runKicker: string
  runHelp: string
  runKeys: string
  runMobile: string
  obstacles: string
  jump: string
  lane: string
  resultKicker: string
  goodPath: string
  meters: string
  again: string
  downloadBig: string
  downloadSub: string
  watchNote: string
  watchLink: string
  watchHref: string
  downloadNow: string
  terms: string
  privacy: string
  youCanLog: string
  andMore: string
  activities: string[]
}

const activities = {
  en: ['Strength Training.', 'Calisthenics.', 'Running.', 'Cycling.', 'Swimming.', 'Cardio.', 'HIIT.', 'Yoga.', 'Pilates.', 'Core.', 'Soccer.', 'Basketball.', 'Baseball.', 'Tennis.', 'Volleyball.', 'Golf.', 'Boxing.', 'Martial Arts.', 'American Football.', 'Hockey.', 'Dance.', 'Padel.', 'Hiking.', 'Skate.'],
  es: ['Fuerza.', 'Calistenia.', 'Running.', 'Ciclismo.', 'Natación.', 'Cardio.', 'HIIT.', 'Yoga.', 'Pilates.', 'Core.', 'Fútbol.', 'Baloncesto.', 'Béisbol.', 'Tenis.', 'Voleibol.', 'Golf.', 'Boxeo.', 'Artes marciales.', 'Fútbol americano.', 'Hockey.', 'Baile.', 'Pádel.', 'Senderismo.', 'Skate.'],
  fr: ['Musculation.', 'Callisthénie.', 'Course.', 'Vélo.', 'Natation.', 'Cardio.', 'HIIT.', 'Yoga.', 'Pilates.', 'Gainage.', 'Football.', 'Basket.', 'Baseball.', 'Tennis.', 'Volley.', 'Golf.', 'Boxe.', 'Arts martiaux.', 'Football US.', 'Hockey.', 'Danse.', 'Padel.', 'Randonnée.', 'Skate.'],
  de: ['Krafttraining.', 'Calisthenics.', 'Laufen.', 'Radfahren.', 'Schwimmen.', 'Cardio.', 'HIIT.', 'Yoga.', 'Pilates.', 'Core.', 'Fußball.', 'Basketball.', 'Baseball.', 'Tennis.', 'Volleyball.', 'Golf.', 'Boxen.', 'Kampfsport.', 'American Football.', 'Hockey.', 'Tanz.', 'Padel.', 'Wandern.', 'Skaten.'],
  pt: ['Força.', 'Calistenia.', 'Corrida.', 'Ciclismo.', 'Natação.', 'Cardio.', 'HIIT.', 'Yoga.', 'Pilates.', 'Core.', 'Futebol.', 'Basquete.', 'Beisebol.', 'Tênis.', 'Vôlei.', 'Golfe.', 'Boxe.', 'Artes marciais.', 'Futebol americano.', 'Hóquei.', 'Dança.', 'Padel.', 'Trilha.', 'Skate.'],
  it: ['Forza.', 'Calistenia.', 'Corsa.', 'Ciclismo.', 'Nuoto.', 'Cardio.', 'HIIT.', 'Yoga.', 'Pilates.', 'Core.', 'Calcio.', 'Basket.', 'Baseball.', 'Tennis.', 'Pallavolo.', 'Golf.', 'Boxe.', 'Arti marziali.', 'Football americano.', 'Hockey.', 'Danza.', 'Padel.', 'Escursioni.', 'Skate.'],
}

const copy: Record<Lang, Copy> = {
  en: {
    beThe: 'be the',
    route: 'Activities',
    experience: 'The experience',
    seeGallop: 'Watch the gallop',
    backToView: 'Back to the view',
    centerCamera: 'Center camera',
    runThird: 'Run in third person',
    runThirdSmall: 'DODGE. JUMP. LEAVE YOUR MARK.',
    playShort: 'play',
    leaving: 'LEAVING A TRACE',
    everyStep: 'EVERY STEP LEAVES A MARK.',
    footer: 'GOAT FITNESS · EVERY MOVE COUNTS',
    cameraHint: 'POINT AT AN ACTIVITY · DRAG TO LOOK AROUND',
    download: 'DOWNLOAD GOAT FITNESS',
    continue: 'continue',
    loading: 'FINDING OUR OWN WAY',
    loadFail: 'The model could not load. Open the page again.',
    needWebgl: 'You need a browser with graphics acceleration.',
    pause: 'Pause animation',
    play: 'Play animation',
    routeEyebrow: 'IN GOAT FITNESS',
    routeTitle: 'Activities in GOAT',
    exitRun: 'Exit',
    scoreLabel: 'YOUR MARK, A LITTLE FURTHER',
    record: 'BEST',
    runKicker: 'THE PATH IS YOURS.',
    runHelp: 'Jump the hurdles. Find your space.',
    runKeys: 'Arrows or A / D to dodge. Space or ↑ to jump',
    runMobile: 'On mobile, swipe or use the buttons.',
    obstacles: 'OBSTACLES CLEARED',
    jump: 'Jump',
    lane: 'FIND YOUR LINE',
    resultKicker: 'EVERY TRY LEAVES A MARK',
    goodPath: 'Good path',
    meters: 'meters of freedom.',
    again: 'play again',
    downloadBig: 'DOWNLOAD',
    downloadSub: 'FOR iOS & WATCHOS 26',
    watchNote: 'Works great with or without Apple Watch — Watch is optional.',
    watchLink: 'Apple Watch Workout Tracker',
    watchHref: '/apple-watch-workout-tracker',
    downloadNow: 'Download now',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    youCanLog: 'you can log',
    andMore: 'and more',
    activities: activities.en,
  },
  es: {
    beThe: 'sé el',
    route: 'Actividades',
    experience: 'La experiencia',
    seeGallop: 'Ver el galope',
    backToView: 'Volver al paisaje',
    centerCamera: 'Centrar cámara',
    runThird: 'Corre en tercera persona',
    runThirdSmall: 'ESQUIVA. SALTA. DEJA TU HUELLA.',
    playShort: 'jugar',
    leaving: 'DEJANDO HUELLA',
    everyStep: 'CADA PASO DEJA SU HUELLA.',
    footer: 'GOAT FITNESS · CADA MOVIMIENTO CUENTA',
    cameraHint: 'SEÑALA UNA ACTIVIDAD · ARRASTRA PARA GIRAR',
    download: 'DESCARGAR GOAT FITNESS',
    continue: 'continuar',
    loading: 'BUSCANDO NUESTRO CAMINO',
    loadFail: 'No se pudo cargar el modelo. Vuelve a abrir la página.',
    needWebgl: 'Necesitas un navegador con aceleración gráfica.',
    pause: 'Pausar animación',
    play: 'Reproducir animación',
    routeEyebrow: 'EN GOAT FITNESS',
    routeTitle: 'Actividades en GOAT',
    exitRun: 'Salir',
    scoreLabel: 'TU HUELLA, UN POCO MÁS LEJOS',
    record: 'RÉCORD',
    runKicker: 'EL CAMINO ES TUYO.',
    runHelp: 'Salta las vallas. Encuentra tu espacio.',
    runKeys: 'Flechas o A / D para esquivar. Espacio o ↑ para saltar',
    runMobile: 'En móvil, desliza o usa los botones.',
    obstacles: 'OBSTÁCULOS SUPERADOS',
    jump: 'Saltar',
    lane: 'ENCUENTRA TU LÍNEA',
    resultKicker: 'CADA INTENTO DEJA HUELLA',
    goodPath: 'Buen camino',
    meters: 'metros de libertad.',
    again: 'jugar de nuevo',
    downloadBig: 'DESCARGAR',
    downloadSub: 'PARA iOS Y WATCHOS 26',
    watchNote: 'Funciona con o sin Apple Watch: el Watch es opcional.',
    watchLink: 'App de entrenamiento para Apple Watch',
    watchHref: '/es/app-entrenamiento-apple-watch',
    downloadNow: 'Descargar ahora',
    terms: 'Términos',
    privacy: 'Privacidad',
    youCanLog: 'puedes anotar',
    andMore: 'y más',
    activities: activities.es,
  },
  fr: {
    beThe: 'sois le',
    route: 'Activités',
    experience: "L'expérience",
    seeGallop: 'Voir le galop',
    backToView: 'Retour au paysage',
    centerCamera: 'Centrer la caméra',
    runThird: 'Cours à la troisième personne',
    runThirdSmall: 'ESQUIVE. SAUTE. LAISSE TA TRACE.',
    playShort: 'jouer',
    leaving: 'LAISSER UNE TRACE',
    everyStep: 'CHAQUE PAS LAISSE SA TRACE.',
    footer: 'GOAT FITNESS · CHAQUE MOUVEMENT COMPTE',
    cameraHint: 'DÉSIGNE UNE ACTIVITÉ · GLISSE POUR TOURNER',
    download: 'TÉLÉCHARGER GOAT FITNESS',
    continue: 'continuer',
    loading: 'ON CHERCHE NOTRE CHEMIN',
    loadFail: 'Le modèle n’a pas pu se charger. Rouvre la page.',
    needWebgl: 'Il te faut un navigateur avec accélération graphique.',
    pause: 'Mettre en pause',
    play: 'Reprendre',
    routeEyebrow: 'DANS GOAT FITNESS',
    routeTitle: 'Activités dans GOAT',
    exitRun: 'Quitter',
    scoreLabel: 'TA TRACE, UN PEU PLUS LOIN',
    record: 'RECORD',
    runKicker: 'LE CHEMIN EST À TOI.',
    runHelp: 'Saute les haies. Trouve ton espace.',
    runKeys: 'Flèches ou A / D pour esquiver. Espace ou ↑ pour sauter',
    runMobile: 'Sur mobile, glisse ou utilise les boutons.',
    obstacles: 'OBSTACLES FRANCHIS',
    jump: 'Sauter',
    lane: 'TROUVE TA LIGNE',
    resultKicker: 'CHAQUE ESSAI LAISSE UNE TRACE',
    goodPath: 'Belle route',
    meters: 'mètres de liberté.',
    again: 'rejouer',
    downloadBig: 'TÉLÉCHARGER',
    downloadSub: 'POUR iOS ET WATCHOS 26',
    watchNote: 'Parfait avec ou sans Apple Watch : la Watch est optionnelle.',
    watchLink: "Suivi d'entraînement Apple Watch",
    watchHref: '/fr/suivi-entrainement-apple-watch',
    downloadNow: 'Télécharger',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    youCanLog: 'tu suis',
    andMore: 'et plus',
    activities: activities.fr,
  },
  de: {
    beThe: 'sei der',
    route: 'Aktivitäten',
    experience: 'Das Erlebnis',
    seeGallop: 'Den Galopp sehen',
    backToView: 'Zurück zur Landschaft',
    centerCamera: 'Kamera zentrieren',
    runThird: 'Lauf in der Third Person',
    runThirdSmall: 'AUSWEICHEN. SPRINGEN. SPUR HINTERLASSEN.',
    playShort: 'spiel',
    leaving: 'EINE SPUR HINTERLASSEN',
    everyStep: 'JEDER SCHRITT HINTERLÄSST EINE SPUR.',
    footer: 'GOAT FITNESS · JEDER MOVE ZÄHLT',
    cameraHint: 'AKTIVITÄT ZEIGEN · ZIEHEN ZUM DREHEN',
    download: 'GOAT FITNESS LADEN',
    continue: 'weiter',
    loading: 'WIR SUCHEN UNSEREN WEG',
    loadFail: 'Das Modell konnte nicht laden. Öffne die Seite erneut.',
    needWebgl: 'Du brauchst einen Browser mit Grafikbeschleunigung.',
    pause: 'Animation pausieren',
    play: 'Animation fortsetzen',
    routeEyebrow: 'IN GOAT FITNESS',
    routeTitle: 'Aktivitäten in GOAT',
    exitRun: 'Verlassen',
    scoreLabel: 'DEINE SPUR, EIN STÜCK WEITER',
    record: 'REKORD',
    runKicker: 'DER WEG GEHÖRT DIR.',
    runHelp: 'Spring über die Hürden. Finde deinen Raum.',
    runKeys: 'Pfeile oder A / D zum Ausweichen. Leertaste oder ↑ zum Springen',
    runMobile: 'Auf dem Handy wischen oder die Tasten nutzen.',
    obstacles: 'HÜRDEN GESCHAFFT',
    jump: 'Springen',
    lane: 'FINDE DEINE LINIE',
    resultKicker: 'JEDER VERSUCH HINTERLÄSST EINE SPUR',
    goodPath: 'Guter Weg',
    meters: 'Meter Freiheit.',
    again: 'nochmal',
    downloadBig: 'LADEN',
    downloadSub: 'FÜR iOS & WATCHOS 26',
    watchNote: 'Läuft mit oder ohne Apple Watch — die Watch ist optional.',
    watchLink: 'Apple Watch Trainings-Tracker',
    watchHref: '/de/apple-watch-trainings-tracker',
    downloadNow: 'Jetzt laden',
    terms: 'Nutzungsbedingungen',
    privacy: 'Datenschutz',
    youCanLog: 'du erfasst',
    andMore: 'und mehr',
    activities: activities.de,
  },
  pt: {
    beThe: 'sê o',
    route: 'Atividades',
    experience: 'A experiência',
    seeGallop: 'Ver o galope',
    backToView: 'Voltar à paisagem',
    centerCamera: 'Centrar câmara',
    runThird: 'Corre em terceira pessoa',
    runThirdSmall: 'DESVIA. SALTA. DEIXA A TUA MARCA.',
    playShort: 'jogar',
    leaving: 'A DEIXAR MARCA',
    everyStep: 'CADA PASSO DEIXA MARCA.',
    footer: 'GOAT FITNESS · CADA MOVIMENTO CONTA',
    cameraHint: 'APONTA UMA ATIVIDADE · ARRASTA PARA GIRAR',
    download: 'BAIXAR GOAT FITNESS',
    continue: 'continuar',
    loading: 'A ENCONTRAR O NOSSO CAMINHO',
    loadFail: 'Não foi possível carregar o modelo. Abre a página outra vez.',
    needWebgl: 'Precisas de um navegador com aceleração gráfica.',
    pause: 'Pausar animação',
    play: 'Retomar animação',
    routeEyebrow: 'NO GOAT FITNESS',
    routeTitle: 'Atividades no GOAT',
    exitRun: 'Sair',
    scoreLabel: 'A TUA MARCA, UM POUCO MAIS LONGE',
    record: 'RECORDE',
    runKicker: 'O CAMINHO É TEU.',
    runHelp: 'Salta as barreiras. Encontra o teu espaço.',
    runKeys: 'Setas ou A / D para desviar. Espaço ou ↑ para saltar',
    runMobile: 'No telemóvel, desliza ou usa os botões.',
    obstacles: 'OBSTÁCULOS SUPERADOS',
    jump: 'Saltar',
    lane: 'ENCONTRA A TUA LINHA',
    resultKicker: 'CADA TENTATIVA DEIXA MARCA',
    goodPath: 'Bom caminho',
    meters: 'metros de liberdade.',
    again: 'jogar de novo',
    downloadBig: 'BAIXAR',
    downloadSub: 'PARA iOS E WATCHOS 26',
    watchNote: 'Funciona com ou sem Apple Watch — o Watch é opcional.',
    watchLink: 'Apple Watch Workout Tracker',
    watchHref: '/apple-watch-workout-tracker',
    downloadNow: 'Baixar agora',
    terms: 'Termos',
    privacy: 'Privacidade',
    youCanLog: 'você anota',
    andMore: 'e mais',
    activities: activities.pt,
  },
  it: {
    beThe: 'sii il',
    route: 'Attività',
    experience: "L'esperienza",
    seeGallop: 'Guarda il galoppo',
    backToView: 'Torna al paesaggio',
    centerCamera: 'Centra la camera',
    runThird: 'Corri in terza persona',
    runThirdSmall: 'SCHIVA. SALTA. LASCIA IL SEGNO.',
    playShort: 'gioca',
    leaving: 'LASCIANDO UN SEGNO',
    everyStep: 'OGNI PASSO LASCIA IL SEGNO.',
    footer: 'GOAT FITNESS · OGNI MOVIMENTO CONTA',
    cameraHint: "INDICA UN'ATTIVITÀ · TRASCINA PER GIRARE",
    download: 'SCARICA GOAT FITNESS',
    continue: 'continua',
    loading: 'CERCHIAMO LA NOSTRA STRADA',
    loadFail: 'Il modello non si è caricato. Apri di nuovo la pagina.',
    needWebgl: 'Serve un browser con accelerazione grafica.',
    pause: 'Metti in pausa',
    play: 'Riprendi',
    routeEyebrow: 'IN GOAT FITNESS',
    routeTitle: 'Attività in GOAT',
    exitRun: 'Esci',
    scoreLabel: 'IL TUO SEGNO, UN PO’ PIÙ LONTANO',
    record: 'RECORD',
    runKicker: 'LA STRADA È TUA.',
    runHelp: 'Salta gli ostacoli. Trova il tuo spazio.',
    runKeys: 'Frecce o A / D per schivare. Spazio o ↑ per saltare',
    runMobile: 'Su mobile, scorri o usa i pulsanti.',
    obstacles: 'OSTACOLI SUPERATI',
    jump: 'Salta',
    lane: 'TROVA LA TUA LINEA',
    resultKicker: 'OGNI TENTATIVO LASCIA IL SEGNO',
    goodPath: 'Bella strada',
    meters: 'metri di libertà.',
    again: 'gioca ancora',
    downloadBig: 'SCARICA',
    downloadSub: 'PER iOS E WATCHOS 26',
    watchNote: 'Funziona con o senza Apple Watch — il Watch è opzionale.',
    watchLink: 'Apple Watch Workout Tracker',
    watchHref: '/apple-watch-workout-tracker',
    downloadNow: 'Scarica ora',
    terms: 'Termini',
    privacy: 'Privacy',
    youCanLog: 'puoi segnare',
    andMore: 'e altro',
    activities: activities.it,
  },
}

function isLang(value: string | null | undefined): value is Lang {
  return !!value && (LANGS as readonly string[]).includes(value)
}

export function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const query = new URLSearchParams(window.location.search).get('lang')
  let stored: string | null = null
  try { stored = localStorage.getItem('goat-lang') } catch { /* private mode */ }
  const preset = document.documentElement.dataset.lang
  const list = [query, stored, preset, ...(navigator.languages ?? []), navigator.language]
  for (const candidate of list) {
    if (!candidate) continue
    const base = candidate.toLowerCase().split('-')[0]
    if (isLang(base)) return base
  }
  return 'en'
}

export function ui(lang: Lang = detectLang()): Copy {
  return copy[lang]
}

const LangContext = createContext<Lang>('en')

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang] = useState(detectLang)
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dataset.lang = lang
  }, [lang])
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

export function useLang(): Lang {
  return useContext(LangContext)
}

export function useCopy(): Copy {
  return copy[useLang()]
}
