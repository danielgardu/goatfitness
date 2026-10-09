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
        watch: 'Watch GPS points are added to the iPhone route map.',
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
        feature: 'Start from the wrist',
        iphone: 'You start the workout on iPhone.',
        watch: 'Start any activity, a routine while checking off sets, or a Combo of up to 4 activities chained together.',
      },
      {
        feature: 'Live heart rate, zones and calories',
        iphone: 'Without a Watch, effort is a 1–10 rating you enter. With a Watch, BPM and the zone bar sync live to the iPhone about every 2 seconds, in a Live Watch banner and on the Live Activity and Dynamic Island.',
        watch: 'Every workout: heart rate, 5 zones with time in each zone, average heart rate, active calories and total calories.',
      },
      {
        feature: 'Live running stats',
        iphone: 'The iPhone keeps the route. Watch GPS points are added to that map.',
        watch: 'Distance, pace, cadence, power, stride length, ground contact time and vertical oscillation.',
      },
      {
        feature: 'Live walking and hiking stats',
        iphone: 'The iPhone keeps the route.',
        watch: 'Distance, pace, elevation gain and loss, cadence and VO2 max.',
      },
      {
        feature: 'Live cycling stats',
        iphone: 'Pause, resume, lap, end and discard also work on iPhone.',
        watch: 'Speed, cadence, power, FTP and elevation.',
      },
      {
        feature: 'Live swimming stats',
        iphone: 'Pool or open water can be logged on iPhone. A Watch is not required to save the session.',
        watch: 'Distance, pace per 100, laps, strokes, stroke style, SWOLF and stroke rate.',
      },
      {
        feature: 'After the workout',
        iphone: 'The summary is saved on iPhone and to Apple Health.',
        watch: 'Time in zones, average and max heart rate, calories, running form, cycling power and speed, swim SWOLF, stroke breakdown and lap splits.',
      },
    ],
    note: 'Checked in the app source on 8 October 2026: 263 exercises with video demos (written here as 260+) and 40 activity types (8 strength, 14 cardio or wellness, 14 sports, 4 outdoor). Free download, with an optional GOAT Plus subscription. GOAT Plus includes the AI coach and chat, one-tap routine generation, weekly plans, muscle recovery, themes, extra widgets and full history. Logging workouts and routines, and the AI calorie estimate, are free. No subscription price is listed here. The iPhone app requires iOS 26 or later. There is no iPad app and no Android app. The Watch app needs watchOS 26 or later.',
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
        watch: 'Los puntos GPS del Watch se suman al mapa de ruta del iPhone.',
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
        feature: 'Empezar desde la muñeca',
        iphone: 'El entrenamiento se inicia en el iPhone.',
        watch: 'Inicia cualquier actividad, una rutina marcando las series, o un Combo de hasta 4 actividades encadenadas.',
      },
      {
        feature: 'Pulso, zonas y calorías en vivo',
        iphone: 'Sin Watch, el esfuerzo es una nota del 1 al 10. Con Watch, las PPM y la barra de zona llegan al iPhone en vivo, más o menos cada 2 segundos, en un aviso Live Watch y en la Live Activity y Dynamic Island.',
        watch: 'En todos los entrenamientos: pulso, 5 zonas con el tiempo en cada una, pulso medio, calorías activas y calorías totales.',
      },
      {
        feature: 'Carrera en vivo',
        iphone: 'El iPhone guarda la ruta. Los puntos GPS del Watch se suman a ese mapa.',
        watch: 'Distancia, ritmo, cadencia, potencia, longitud de zancada, tiempo de contacto y oscilación vertical.',
      },
      {
        feature: 'Caminar y senderismo en vivo',
        iphone: 'El iPhone guarda la ruta.',
        watch: 'Distancia, ritmo, desnivel positivo y negativo, cadencia y VO2 max.',
      },
      {
        feature: 'Ciclismo en vivo',
        iphone: 'Pausar, reanudar, marcar vuelta, terminar y descartar también se hace en el iPhone.',
        watch: 'Velocidad, cadencia, potencia, FTP y desnivel.',
      },
      {
        feature: 'Natación en vivo',
        iphone: 'Piscina o aguas abiertas se pueden registrar en el iPhone. El Watch no es obligatorio para guardar la sesión.',
        watch: 'Distancia, ritmo por 100, largos, brazadas, estilo, SWOLF y frecuencia de brazada.',
      },
      {
        feature: 'Después del entrenamiento',
        iphone: 'El resumen se guarda en el iPhone y en Apple Health.',
        watch: 'Tiempo en zonas, pulso medio y máximo, calorías, técnica de carrera, potencia y velocidad en bici, SWOLF, desglose de brazadas y parciales.',
      },
    ],
    note: 'Comprobado en el código de la app el 8 de octubre de 2026: 263 ejercicios con video (aquí, 260+) y 40 tipos de actividad (8 de fuerza, 14 de cardio o bienestar, 14 deportes, 4 de exterior). Descarga gratis, con una suscripción opcional GOAT Plus. GOAT Plus incluye el entrenador y el chat con IA, rutinas en un toque, planes semanales, recuperación muscular, temas, widgets extra e historial completo. Registrar entrenamientos y rutinas, y la estimación de calorías con IA, son gratis. Esta página no publica un precio. La app de iPhone pide iOS 26 o posterior. No hay app para iPad ni para Android. La app del Watch necesita watchOS 26 o posterior. Este texto en español necesita revisión de un hablante nativo.',
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
        watch: 'GPS-Punkte der Watch werden zur Routenkarte auf dem iPhone hinzugefügt.',
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
        feature: 'Start am Handgelenk',
        iphone: 'Das Training startest du auf dem iPhone.',
        watch: 'Starte jede Aktivität, eine Routine mit Abhaken der Sätze, oder ein Combo aus bis zu 4 verketteten Aktivitäten.',
      },
      {
        feature: 'Live-Puls, Zonen und Kalorien',
        iphone: 'Ohne Watch gibst du die Anstrengung von 1 bis 10 ein. Mit Watch kommen BPM und die Zonenleiste etwa alle 2 Sekunden live aufs iPhone, im Live-Watch-Hinweis und in der Live Activity und Dynamic Island.',
        watch: 'Bei jedem Training: Herzfrequenz, 5 Zonen mit Zeit in jeder Zone, Durchschnittspuls, aktive und gesamte Kalorien.',
      },
      {
        feature: 'Laufen live',
        iphone: 'Das iPhone speichert die Route. GPS-Punkte der Watch kommen auf dieselbe Karte.',
        watch: 'Distanz, Pace, Kadenz, Leistung, Schrittlänge, Bodenkontaktzeit und vertikale Oszillation.',
      },
      {
        feature: 'Gehen und Wandern live',
        iphone: 'Das iPhone speichert die Route.',
        watch: 'Distanz, Pace, Höhenmeter bergauf und bergab, Kadenz und VO2 max.',
      },
      {
        feature: 'Radfahren live',
        iphone: 'Pause, Fortsetzen, Runde, Beenden und Verwerfen gehen auch auf dem iPhone.',
        watch: 'Geschwindigkeit, Kadenz, Leistung, FTP und Höhe.',
      },
      {
        feature: 'Schwimmen live',
        iphone: 'Becken oder Freiwasser lässt sich auf dem iPhone erfassen. Eine Watch ist dafür nicht nötig.',
        watch: 'Distanz, Pace pro 100, Bahnen, Züge, Zugstil, SWOLF und Zugfrequenz.',
      },
      {
        feature: 'Nach dem Training',
        iphone: 'Die Zusammenfassung bleibt auf dem iPhone und in Apple Health.',
        watch: 'Zeit in den Zonen, durchschnittliche und maximale Herzfrequenz, Kalorien, Lauftechnik, Radsport-Leistung und Tempo, SWOLF, Zugverteilung und Bahnzeiten.',
      },
    ],
    note: 'Im App-Quellcode am 8. Oktober 2026 geprüft: 263 Übungen mit Video (hier als 260+) und 40 Aktivitätsarten (8 Kraft, 14 Cardio oder Wellness, 14 Sportarten, 4 Outdoor). Kostenloser Download, mit optionalem GOAT-Plus-Abo. GOAT Plus umfasst KI-Coach und Chat, Routinen auf einen Tipp, Wochenpläne, Muskelregeneration, Themes, zusätzliche Widgets und die volle Historie. Workouts und Routinen protokollieren und die KI-Kalorienschätzung sind kostenlos. Ein Abo-Preis steht hier nicht. Die iPhone-App setzt iOS 26 oder neuer voraus. Es gibt keine iPad- und keine Android-App. Die Watch-App braucht watchOS 26 oder neuer. Dieser deutsche Text braucht eine muttersprachliche Prüfung.',
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
        watch: 'Les points GPS de la montre s’ajoutent à la carte du parcours sur l’iPhone.',
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
        feature: 'Démarrer au poignet',
        iphone: 'La séance se lance sur l’iPhone.',
        watch: 'Démarre n’importe quelle activité, une routine en cochant les séries, ou un Combo de 4 activités enchaînées au maximum.',
      },
      {
        feature: 'Pouls, zones et calories en direct',
        iphone: 'Sans montre, l’effort est une note de 1 à 10. Avec une montre, les BPM et la barre de zone arrivent sur l’iPhone en direct, environ toutes les 2 secondes, dans un bandeau Live Watch et sur la Live Activity et Dynamic Island.',
        watch: 'Pour chaque séance : fréquence cardiaque, 5 zones avec le temps dans chacune, fréquence moyenne, calories actives et calories totales.',
      },
      {
        feature: 'Course en direct',
        iphone: 'L’iPhone garde le parcours. Les points GPS de la montre s’y ajoutent.',
        watch: 'Distance, allure, cadence, puissance, longueur de foulée, temps de contact au sol et oscillation verticale.',
      },
      {
        feature: 'Marche et randonnée en direct',
        iphone: 'L’iPhone garde le parcours.',
        watch: 'Distance, allure, dénivelé positif et négatif, cadence et VO2 max.',
      },
      {
        feature: 'Vélo en direct',
        iphone: 'Pause, reprise, tour, fin et abandon se font aussi sur l’iPhone.',
        watch: 'Vitesse, cadence, puissance, FTP et dénivelé.',
      },
      {
        feature: 'Natation en direct',
        iphone: 'Bassin ou eau libre s’enregistrent sur l’iPhone. La montre n’est pas exigée pour garder la séance.',
        watch: 'Distance, allure aux 100, longueurs, mouvements, nage, SWOLF et fréquence de mouvements.',
      },
      {
        feature: 'Après la séance',
        iphone: 'Le bilan reste sur l’iPhone et dans Apple Santé.',
        watch: 'Temps dans les zones, fréquence moyenne et maximale, calories, technique de course, puissance et vitesse à vélo, SWOLF, détail des mouvements et temps par longueur.',
      },
    ],
    note: 'Vérifié dans le code de l’app le 8 octobre 2026 : 263 exercices avec vidéo (écrits ici 260+) et 40 types d’activité (8 force, 14 cardio ou bien-être, 14 sports, 4 extérieur). Téléchargement gratuit, avec un abonnement GOAT Plus facultatif. GOAT Plus comprend le coach IA et le chat, les routines en un geste, les plans hebdomadaires, la récupération musculaire, les thèmes, des widgets en plus et l’historique complet. Noter les séances et les routines, et l’estimation de calories par IA, sont gratuits. Aucun prix d’abonnement n’est publié ici. L’app iPhone demande iOS 26 ou ultérieur. Il n’y a pas d’app iPad ni Android. L’app Watch a besoin de watchOS 26 ou ultérieur. Ce texte français doit être relu par un locuteur natif.',
    relatedLabel: 'Ce guide dans d’autres langues',
    duoHref: '/iphone-duo-fitness-app',
    duoLabel: 'Application fitness iPhone Duo (anglais)',
  },
}
