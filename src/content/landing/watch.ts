import type { LocaleCode } from './types'

/**
 * Watch-optional line and the cluster A unique element.
 * ES / DE / FR paragraphs are drafts and need native review.
 * Counts and the iPhone / Watch split were verified in the app source
 * on 8 October 2026 (Daniel). Do not publish a GOAT Plus price.
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
  duoHref: string
  duoLabel: string
}

export const watchCopy: Record<LocaleCode, WatchCopy> = {
  en: {
    line: 'Works great on iPhone and iPhone Duo — with or without Apple Watch.',
    tableTitle: 'What Apple Watch adds',
    tableIntro:
      'GOAT AI Fitness keeps a full training history on iPhone alone, including on iPhone Duo. You can log gym sets, reps and weight, track runs and walks with GPS, and record 40 activity types, including 14 sports, without pairing a Watch. The same iPhone app includes a free AI calorie estimate, a 0–100% readiness score, Apple Health sync, and Live Activities. The AI coach is part of the optional GOAT Plus subscription. A Watch is not required for any of that.',
    columns: ['Capability', 'iPhone alone', 'With Apple Watch'],
    rows: [
      {
        feature: 'Log gym sets, reps and weight',
        iphone: 'Yes',
        watch: 'Yes. You can also log sets from the wrist.',
      },
      {
        feature: 'GPS routes for runs and walks, including in the background',
        iphone: 'Yes',
        watch: 'Watch GPS is a Watch feature.',
      },
      {
        feature: '40 activity types, including 14 sports',
        iphone: 'Yes. 260+ exercises, each with a video demo.',
        watch: 'A Watch is not required to record them.',
      },
      {
        feature: 'Rest timer, step counting, Live Activities and Dynamic Island',
        iphone: 'Yes. Live Activities show the timer, the rest countdown and a Complete set button.',
        watch: 'These do not require a Watch.',
      },
      {
        feature: 'Apple Health sync',
        iphone: 'Yes. It reads steps, energy, distance and outside workouts, and it saves workouts.',
        watch: 'Health sync does not require a Watch.',
      },
      {
        feature: 'AI calorie estimate and 0–100% readiness score',
        iphone: 'Yes. The calorie estimate is free.',
        watch: 'These do not require a Watch.',
      },
      {
        feature: 'AI coach',
        iphone: 'Yes, with the optional GOAT Plus subscription.',
        watch: 'The coach does not require a Watch.',
      },
      {
        feature: 'Live and average heart rate, and heart-rate zones',
        iphone: 'No. Without a Watch, effort is a 1–10 rating you enter.',
        watch: 'Yes. Live heart rate, average heart rate and zones come from the Watch.',
      },
      {
        feature: 'Apple Watch Mirror',
        iphone: 'No. It is not an iPhone-only feature.',
        watch: 'Yes. It is free. It syncs the session between Apple Watch and iPhone.',
      },
    ],
    note: 'Checked in the app source on 8 October 2026: 263 exercises with video demos (written here as 260+) and 40 activity types (8 strength, 14 cardio or wellness, 14 sports, 4 outdoor). Free download, with an optional GOAT Plus subscription. GOAT Plus includes the AI coach and chat, one-tap routine generation, weekly plans, muscle recovery, themes, extra widgets and full history. Logging workouts and routines, the AI calorie estimate, and Apple Watch Mirror are free. No subscription price is listed here. The iPhone app requires iOS 26 or later. There is no iPad app and no Android app. The Watch app needs watchOS 26 or later.',
    relatedLabel: 'This guide in other languages',
    duoHref: '/iphone-duo-fitness-app',
    duoLabel: 'iPhone Duo fitness app',
  },
  es: {
    line: 'Funciona perfectamente en iPhone y iPhone Duo, con o sin Apple Watch.',
    tableTitle: 'Qué añade el Apple Watch',
    tableIntro:
      'GOAT AI Fitness guarda el historial de entrenamiento completo solo con el iPhone, también en iPhone Duo. Puedes registrar series, repeticiones y peso, seguir carreras y caminatas con GPS, y anotar 40 tipos de actividad, incluidos 14 deportes, sin emparejar un Watch. En el iPhone también están la estimación de calorías con IA (gratis), una puntuación de preparación de 0 a 100 %, la sincronización con Apple Health y las Live Activities. El entrenador con IA forma parte de la suscripción opcional GOAT Plus. El Watch no es un requisito para nada de eso.',
    columns: ['Función', 'Solo iPhone', 'Con Apple Watch'],
    rows: [
      {
        feature: 'Registrar series, repeticiones y peso',
        iphone: 'Sí',
        watch: 'Sí. También puedes registrar las series desde la muñeca.',
      },
      {
        feature: 'Rutas GPS de carreras y caminatas, también en segundo plano',
        iphone: 'Sí',
        watch: 'El GPS del Watch es una función del Watch.',
      },
      {
        feature: '40 tipos de actividad, incluidos 14 deportes',
        iphone: 'Sí. 260+ ejercicios, cada uno con un video de demostración.',
        watch: 'No hace falta un Watch para registrarlos.',
      },
      {
        feature: 'Temporizador de descanso, pasos, Live Activities y Dynamic Island',
        iphone: 'Sí. Las Live Activities muestran el temporizador, la cuenta atrás del descanso y el botón de completar la serie.',
        watch: 'No dependen del Watch.',
      },
      {
        feature: 'Sincronización con Apple Health',
        iphone: 'Sí. Lee pasos, energía, distancia y entrenamientos externos, y guarda los entrenamientos.',
        watch: 'La sincronización no exige un Watch.',
      },
      {
        feature: 'Estimación de calorías con IA y preparación de 0 a 100 %',
        iphone: 'Sí. La estimación de calorías es gratis.',
        watch: 'No dependen del Watch.',
      },
      {
        feature: 'Entrenador con IA',
        iphone: 'Sí, con la suscripción opcional GOAT Plus.',
        watch: 'El entrenador no exige un Watch.',
      },
      {
        feature: 'Frecuencia cardiaca en vivo y media, y zonas',
        iphone: 'No. Sin Watch, el esfuerzo es una nota del 1 al 10 que introduces tú.',
        watch: 'Sí. El pulso en vivo, la media y las zonas salen del Watch.',
      },
      {
        feature: 'Apple Watch Mirror',
        iphone: 'No. No es una función solo de iPhone.',
        watch: 'Sí. Es gratis. Sincroniza la sesión entre el Apple Watch y el iPhone.',
      },
    ],
    note: 'Comprobado en el código de la app el 8 de octubre de 2026: 263 ejercicios con video (aquí, 260+) y 40 tipos de actividad (8 de fuerza, 14 de cardio o bienestar, 14 deportes, 4 de exterior). Descarga gratis, con una suscripción opcional GOAT Plus. GOAT Plus incluye el entrenador y el chat con IA, rutinas en un toque, planes semanales, recuperación muscular, temas, widgets extra e historial completo. Registrar entrenamientos y rutinas, la estimación de calorías con IA y Apple Watch Mirror son gratis. Esta página no publica un precio. La app de iPhone pide iOS 26 o posterior. No hay app para iPad ni para Android. La app del Watch necesita watchOS 26 o posterior. Este texto en español necesita revisión de un hablante nativo.',
    relatedLabel: 'Esta guía en otros idiomas',
    duoHref: '/es/app-fitness-iphone-duo',
    duoLabel: 'App de fitness para iPhone Duo',
  },
  de: {
    line: 'Funktioniert bestens auf iPhone und iPhone Duo – mit oder ohne Apple Watch.',
    tableTitle: 'Was die Apple Watch ergänzt',
    tableIntro:
      'GOAT AI Fitness führt das Trainingsprotokoll vollständig auf dem iPhone, auch auf dem iPhone Duo. Du kannst Sätze, Wiederholungen und Gewicht erfassen, Läufe und Gehen per GPS tracken und 40 Aktivitätsarten aufzeichnen, darunter 14 Sportarten, ohne eine Watch zu koppeln. Auf dem iPhone liegen außerdem eine kostenlose KI-Kalorienschätzung, ein Bereitschaftswert von 0 bis 100 %, Apple-Health-Sync und Live Activities. Der KI-Coach gehört zum optionalen GOAT-Plus-Abo. Eine Watch ist dafür nicht nötig.',
    columns: ['Funktion', 'Nur iPhone', 'Mit Apple Watch'],
    rows: [
      {
        feature: 'Sätze, Wiederholungen und Gewicht protokollieren',
        iphone: 'Ja',
        watch: 'Ja. Sätze lassen sich auch am Handgelenk erfassen.',
      },
      {
        feature: 'GPS-Routen für Laufen und Gehen, auch im Hintergrund',
        iphone: 'Ja',
        watch: 'Watch-GPS ist eine Watch-Funktion.',
      },
      {
        feature: '40 Aktivitätsarten, darunter 14 Sportarten',
        iphone: 'Ja. 260+ Übungen, jede mit einem Video.',
        watch: 'Zum Aufzeichnen brauchst du keine Watch.',
      },
      {
        feature: 'Pausentimer, Schrittzählung, Live Activities und Dynamic Island',
        iphone: 'Ja. Live Activities zeigen den Timer, den Pausen-Countdown und den Knopf zum Abschließen des Satzes.',
        watch: 'Dafür ist keine Watch nötig.',
      },
      {
        feature: 'Apple-Health-Sync',
        iphone: 'Ja. Liest Schritte, Energie, Distanz und externe Workouts und speichert Workouts.',
        watch: 'Der Sync setzt keine Watch voraus.',
      },
      {
        feature: 'KI-Kalorienschätzung und Bereitschaftswert 0–100 %',
        iphone: 'Ja. Die Kalorienschätzung ist kostenlos.',
        watch: 'Dafür ist keine Watch nötig.',
      },
      {
        feature: 'KI-Coach',
        iphone: 'Ja, mit dem optionalen GOAT-Plus-Abo.',
        watch: 'Der Coach setzt keine Watch voraus.',
      },
      {
        feature: 'Live- und durchschnittliche Herzfrequenz, Zonen',
        iphone: 'Nein. Ohne Watch gibst du die Anstrengung als Wert von 1 bis 10 ein.',
        watch: 'Ja. Live-Puls, Durchschnitt und Zonen kommen von der Watch.',
      },
      {
        feature: 'Apple Watch Mirror',
        iphone: 'Nein. Das ist keine reine iPhone-Funktion.',
        watch: 'Ja. Kostenlos. Die Einheit wird zwischen Apple Watch und iPhone synchronisiert.',
      },
    ],
    note: 'Im App-Quellcode am 8. Oktober 2026 geprüft: 263 Übungen mit Video (hier als 260+) und 40 Aktivitätsarten (8 Kraft, 14 Cardio oder Wellness, 14 Sportarten, 4 Outdoor). Kostenloser Download, mit optionalem GOAT-Plus-Abo. GOAT Plus umfasst KI-Coach und Chat, Routinen auf einen Tipp, Wochenpläne, Muskelregeneration, Themes, zusätzliche Widgets und die volle Historie. Workouts und Routinen protokollieren, die KI-Kalorienschätzung und Apple Watch Mirror sind kostenlos. Ein Abo-Preis steht hier nicht. Die iPhone-App setzt iOS 26 oder neuer voraus. Es gibt keine iPad- und keine Android-App. Die Watch-App braucht watchOS 26 oder neuer. Dieser deutsche Text braucht eine muttersprachliche Prüfung.',
    relatedLabel: 'Dieser Guide in anderen Sprachen',
    duoHref: '/iphone-duo-fitness-app',
    duoLabel: 'iPhone Duo Fitness-App (Englisch)',
  },
  fr: {
    line: 'Fonctionne parfaitement sur iPhone et iPhone Duo — avec ou sans Apple Watch.',
    tableTitle: 'Ce que l’Apple Watch ajoute',
    tableIntro:
      'GOAT AI Fitness tient l’historique d’entraînement complet sur l’iPhone seul, y compris sur iPhone Duo. Tu peux noter les séries, les répétitions et la charge, suivre les courses et la marche en GPS, et enregistrer 40 types d’activité, dont 14 sports, sans appairer de montre. L’iPhone propose aussi une estimation de calories par IA, gratuite, un score de forme de 0 à 100 %, la synchro Apple Santé et les Live Activities. Le coach IA fait partie de l’abonnement facultatif GOAT Plus. La montre n’est pas exigée pour cela.',
    columns: ['Fonction', 'iPhone seul', 'Avec Apple Watch'],
    rows: [
      {
        feature: 'Noter séries, répétitions et charge',
        iphone: 'Oui',
        watch: 'Oui. Les séries se notent aussi depuis le poignet.',
      },
      {
        feature: 'Traces GPS des courses et marches, y compris en arrière-plan',
        iphone: 'Oui',
        watch: 'Le GPS de la montre est une fonction de la montre.',
      },
      {
        feature: '40 types d’activité, dont 14 sports',
        iphone: 'Oui. 260+ exercices, chacun avec une vidéo.',
        watch: 'Une montre n’est pas nécessaire pour les enregistrer.',
      },
      {
        feature: 'Minuteur de repos, pas, Live Activities et Dynamic Island',
        iphone: 'Oui. Les Live Activities affichent le minuteur, le compte à rebours du repos et le bouton pour terminer la série.',
        watch: 'Cela ne dépend pas de la montre.',
      },
      {
        feature: 'Synchro Apple Santé',
        iphone: 'Oui. Elle lit les pas, l’énergie, la distance et les entraînements extérieurs, et elle enregistre les séances.',
        watch: 'La synchro n’exige pas de montre.',
      },
      {
        feature: 'Estimation de calories par IA et score de forme 0–100 %',
        iphone: 'Oui. L’estimation des calories est gratuite.',
        watch: 'Cela ne dépend pas de la montre.',
      },
      {
        feature: 'Coach IA',
        iphone: 'Oui, avec l’abonnement facultatif GOAT Plus.',
        watch: 'Le coach n’exige pas de montre.',
      },
      {
        feature: 'Fréquence cardiaque en direct et moyenne, et zones',
        iphone: 'Non. Sans montre, l’effort est une note de 1 à 10 que tu saisis.',
        watch: 'Oui. Le pouls en direct, la moyenne et les zones viennent de la montre.',
      },
      {
        feature: 'Apple Watch Mirror',
        iphone: 'Non. Ce n’est pas une fonction réservée à l’iPhone.',
        watch: 'Oui. C’est gratuit. La séance se synchronise entre l’Apple Watch et l’iPhone.',
      },
    ],
    note: 'Vérifié dans le code de l’app le 8 octobre 2026 : 263 exercices avec vidéo (écrits ici 260+) et 40 types d’activité (8 force, 14 cardio ou bien-être, 14 sports, 4 extérieur). Téléchargement gratuit, avec un abonnement GOAT Plus facultatif. GOAT Plus comprend le coach IA et le chat, les routines en un geste, les plans hebdomadaires, la récupération musculaire, les thèmes, des widgets en plus et l’historique complet. Noter les séances et les routines, l’estimation de calories par IA et Apple Watch Mirror sont gratuits. Aucun prix d’abonnement n’est publié ici. L’app iPhone demande iOS 26 ou ultérieur. Il n’y a pas d’app iPad ni Android. L’app Watch a besoin de watchOS 26 ou ultérieur. Ce texte français doit être relu par un locuteur natif.',
    relatedLabel: 'Ce guide dans d’autres langues',
    duoHref: '/iphone-duo-fitness-app',
    duoLabel: 'Application fitness iPhone Duo (anglais)',
  },
}
