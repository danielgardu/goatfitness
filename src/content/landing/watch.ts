import type { LocaleCode } from './types'

/**
 * Watch-optional line and the cluster A unique element.
 * ES / DE / FR paragraphs are drafts and need native review.
 * Facts are limited to the App Store listing checked 2026-10-08
 * (version 1.3.2) and Daniel's product note that the Watch is optional.
 * Mirror mode is named because Daniel listed it. It is not in the
 * App Store description, so the table says so.
 */

export interface WatchRow {
  feature: string
  iphone: string
  watch: string
}

export interface WatchCopy {
  line: string
  tableTitle: string
  tableIntro: string
  columns: [string, string, string]
  rows: WatchRow[]
  note: string
  relatedLabel: string
}

const checked = 'Checked on the App Store listing, 8 October 2026 (version 1.3.2).'

export const watchCopy: Record<LocaleCode, WatchCopy> = {
  en: {
    line: 'Works great with or without Apple Watch — Watch is optional.',
    tableTitle: 'What Apple Watch adds',
    tableIntro:
      'GOAT AI Fitness keeps a full training history on iPhone alone. You can log gym sets, reps and weight, track runs and walks, and record more than 30 sports without pairing a Watch. The App Store listing also describes an AI coach that builds routines, a 7-day plan and meal suggestions, 300+ exercises with video guides, calorie and muscle-recovery estimates, weekly summaries, Apple Health sync, and Live Activities on the iPhone lock screen. Those items are iPhone features in the listing. A Watch is not described as a requirement for them.',
    columns: ['Capability', 'iPhone alone', 'With Apple Watch'],
    rows: [
      {
        feature: 'Log gym sets, reps and weight',
        iphone: 'Yes',
        watch: 'Yes. Wrist controls can start the session.',
      },
      {
        feature: 'Runs, walks and 30+ sports',
        iphone: 'Yes',
        watch: 'Yes',
      },
      {
        feature: 'AI coach, exercise videos, weekly summaries, Live Activities',
        iphone: 'Yes. Listed for the iPhone app.',
        watch: 'The listing does not say the Watch is required.',
      },
      {
        feature: 'Live heart rate on the wrist',
        iphone: 'No',
        watch: 'Yes. The listing says the Watch shows live heart rate.',
      },
      {
        feature: 'Wrist controls',
        iphone: 'No',
        watch: 'Yes. Control the workout from the Watch.',
      },
      {
        feature: 'Mirror mode',
        iphone: 'No',
        watch: 'Named by the developer. Not in the App Store description yet.',
      },
    ],
    note: `${checked} Price on the listing is free to download, with an optional GOAT Plus subscription. The public listing does not state the current GOAT Plus price in a way this page should repeat until it is re-checked. The app requires iOS 26. It is not an Android app.`,
    relatedLabel: 'This guide in other languages',
  },
  es: {
    line: 'Funciona perfectamente con o sin Apple Watch: el Watch es opcional.',
    tableTitle: 'Qué añade el Apple Watch',
    tableIntro:
      'GOAT AI Fitness guarda el historial de entrenamiento completo solo con el iPhone. Puedes registrar series, repeticiones y peso en el gimnasio, seguir carreras y caminatas, y anotar más de 30 deportes sin emparejar un Watch. La ficha del App Store también describe un entrenador con IA que arma rutinas, un plan de 7 días y sugerencias de comida, más de 300 ejercicios con video, estimaciones de calorías y recuperación muscular, resúmenes semanales, sincronización con Apple Health y Live Activities en la pantalla de bloqueo del iPhone. La ficha no presenta el Watch como requisito para esas funciones.',
    columns: ['Función', 'Solo iPhone', 'Con Apple Watch'],
    rows: [
      {
        feature: 'Registrar series, repeticiones y peso',
        iphone: 'Sí',
        watch: 'Sí. Los controles de la muñeca pueden iniciar la sesión.',
      },
      {
        feature: 'Carreras, caminatas y más de 30 deportes',
        iphone: 'Sí',
        watch: 'Sí',
      },
      {
        feature: 'Entrenador con IA, videos, resúmenes y Live Activities',
        iphone: 'Sí. Están en la ficha de la app para iPhone.',
        watch: 'La ficha no dice que el Watch sea obligatorio.',
      },
      {
        feature: 'Frecuencia cardiaca en vivo en la muñeca',
        iphone: 'No',
        watch: 'Sí. La ficha dice que el Watch muestra el pulso en vivo.',
      },
      {
        feature: 'Controles en la muñeca',
        iphone: 'No',
        watch: 'Sí. Puedes controlar el entrenamiento desde el Watch.',
      },
      {
        feature: 'Modo espejo',
        iphone: 'No',
        watch: 'Lo nombra el desarrollador. Aún no está en la descripción del App Store.',
      },
    ],
    note: 'Revisado en el App Store el 8 de octubre de 2026 (versión 1.3.2). La descarga es gratis, con una suscripción opcional GOAT Plus. Esta página no repite un precio de GOAT Plus hasta volver a comprobarlo. La app pide iOS 26. No está en Android. Este texto en español necesita revisión de un hablante nativo.',
    relatedLabel: 'Esta guía en otros idiomas',
  },
  de: {
    line: 'Funktioniert bestens mit oder ohne Apple Watch – die Watch ist optional.',
    tableTitle: 'Was die Apple Watch ergänzt',
    tableIntro:
      'GOAT AI Fitness führt das Trainingsprotokoll vollständig auf dem iPhone. Du kannst Sätze, Wiederholungen und Gewicht im Gym erfassen, Läufe und Gehen tracken und mehr als 30 Sportarten notieren, ohne eine Watch zu koppeln. Der App-Store-Eintrag beschreibt außerdem einen KI-Coach für Trainingspläne, einen 7-Tage-Plan und Ernährungsvorschläge, über 300 Übungen mit Video, Schätzungen zu Kalorien und Muskelregeneration, Wochenübersichten, Apple-Health-Sync und Live Activities auf dem iPhone-Sperrbildschirm. Der Eintrag nennt die Watch nicht als Voraussetzung für diese Punkte.',
    columns: ['Funktion', 'Nur iPhone', 'Mit Apple Watch'],
    rows: [
      {
        feature: 'Sätze, Wiederholungen und Gewicht protokollieren',
        iphone: 'Ja',
        watch: 'Ja. Die Steuerung am Handgelenk kann die Einheit starten.',
      },
      {
        feature: 'Laufen, Gehen und 30+ Sportarten',
        iphone: 'Ja',
        watch: 'Ja',
      },
      {
        feature: 'KI-Coach, Übungsvideos, Wochenübersicht, Live Activities',
        iphone: 'Ja. Im Eintrag der iPhone-App genannt.',
        watch: 'Der Eintrag verlangt dafür keine Watch.',
      },
      {
        feature: 'Live-Herzfrequenz am Handgelenk',
        iphone: 'Nein',
        watch: 'Ja. Der Eintrag nennt die Live-Herzfrequenz auf der Watch.',
      },
      {
        feature: 'Steuerung am Handgelenk',
        iphone: 'Nein',
        watch: 'Ja. Das Training lässt sich von der Watch steuern.',
      },
      {
        feature: 'Spiegelmodus',
        iphone: 'Nein',
        watch: 'Vom Entwickler genannt. Steht noch nicht in der App-Store-Beschreibung.',
      },
    ],
    note: 'Geprüft im App Store am 8. Oktober 2026 (Version 1.3.2). Der Download ist kostenlos, mit optionalem GOAT-Plus-Abo. Ein aktueller GOAT-Plus-Preis wird hier nicht wiederholt, bevor er erneut geprüft ist. Die App setzt iOS 26 voraus. Es gibt keine Android-Version. Dieser deutsche Text braucht eine muttersprachliche Prüfung.',
    relatedLabel: 'Dieser Guide in anderen Sprachen',
  },
  fr: {
    line: 'Fonctionne parfaitement avec ou sans Apple Watch — la montre est optionnelle.',
    tableTitle: 'Ce que l’Apple Watch ajoute',
    tableIntro:
      'GOAT AI Fitness tient l’historique d’entraînement complet sur l’iPhone seul. Tu peux noter les séries, les répétitions et la charge en musculation, suivre les courses et la marche, et enregistrer plus de 30 sports sans appairer de montre. La fiche App Store décrit aussi un coach IA qui prépare des séances, un plan de 7 jours et des idées de repas, plus de 300 exercices avec vidéo, des estimations de calories et de récupération musculaire, des bilans hebdomadaires, la synchro Apple Santé, et les Live Activities sur l’écran verrouillé de l’iPhone. La fiche ne présente pas la montre comme obligatoire pour ces fonctions.',
    columns: ['Fonction', 'iPhone seul', 'Avec Apple Watch'],
    rows: [
      {
        feature: 'Noter séries, répétitions et charge',
        iphone: 'Oui',
        watch: 'Oui. Les commandes au poignet peuvent lancer la séance.',
      },
      {
        feature: 'Course, marche et plus de 30 sports',
        iphone: 'Oui',
        watch: 'Oui',
      },
      {
        feature: 'Coach IA, vidéos, bilans et Live Activities',
        iphone: 'Oui. Indiqués pour l’app iPhone.',
        watch: 'La fiche n’exige pas la montre pour cela.',
      },
      {
        feature: 'Fréquence cardiaque en direct au poignet',
        iphone: 'Non',
        watch: 'Oui. La fiche indique la fréquence en direct sur la montre.',
      },
      {
        feature: 'Commandes au poignet',
        iphone: 'Non',
        watch: 'Oui. La séance se pilote depuis la montre.',
      },
      {
        feature: 'Mode miroir',
        iphone: 'Non',
        watch: 'Nommé par le développeur. Pas encore dans la description de l’App Store.',
      },
    ],
    note: 'Vérifié sur l’App Store le 8 octobre 2026 (version 1.3.2). Le téléchargement est gratuit, avec un abonnement GOAT Plus facultatif. Cette page ne répète pas un prix GOAT Plus tant qu’il n’est pas revérifié. L’app demande iOS 26. Elle n’est pas sur Android. Ce texte français doit être relu par un locuteur natif.',
    relatedLabel: 'Ce guide dans d’autres langues',
  },
}
