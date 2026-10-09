/**
 * iPhone Duo landings. English is the source. Spanish is a draft and
 * needs native review. Layout facts were verified in the app code
 * (Daniel, 8 October 2026). No foldable screenshots are published here.
 */

export interface DuoSection {
  title: string
  paragraphs: string[]
}

export interface DuoFaq {
  question: string
  answer: string
}

export interface DuoCopy {
  code: 'en' | 'es'
  htmlLang: string
  ogLocale: string
  path: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  schemaDescription: string
  breadcrumbName: string
  h1: string
  subhead: string
  watchLine: string
  downloadLabel: string
  sections: DuoSection[]
  faqTitle: string
  faqs: DuoFaq[]
  ctaTitle: string
  ctaBody: string
  ctaLabel: string
  backLabel: string
  languagesLabel: string
  relatedLabel: string
  watchHref: string
  watchLabel: string
  reviewNote: string
}

export const duoPages: DuoCopy[] = [
  {
    code: 'en',
    htmlLang: 'en',
    ogLocale: 'en_US',
    path: '/iphone-duo-fitness-app',
    title: 'iPhone Duo Fitness & Gym App | GOAT AI Fitness (GOAT Fitness)',
    description:
      'GOAT AI Fitness on iPhone Duo: unfolded Home and Workouts side by side, gym, running and 40 activity types. Apple Watch stays optional.',
    ogTitle: 'The fitness app built for iPhone Duo | GOAT AI Fitness',
    ogDescription:
      'Two-column layouts when iPhone Duo is unfolded, full-width landscape, and a side tab bar. Gym, running and an optional Apple Watch.',
    schemaDescription:
      'GOAT AI Fitness on iPhone, iPhone Duo (foldable) and Apple Watch (optional). Unfolded Home and Workouts sit side by side.',
    breadcrumbName: 'iPhone Duo fitness app',
    h1: 'The fitness app built for iPhone Duo',
    subhead:
      'GOAT AI Fitness runs on iPhone, on iPhone Duo (Apple’s foldable iPhone) and on Apple Watch (optional). The iPhone app is complete without a Watch.',
    watchLine: 'Works great on iPhone and iPhone Duo — with or without Apple Watch.',
    downloadLabel: 'Download on the App Store',
    sections: [
      {
        title: 'What changes when iPhone Duo is unfolded',
        paragraphs: [
          'These layout facts were checked in the app code on 8 October 2026. They describe the unfolded phone. This page does not guess cover-screen behavior, hinge width or a screen-size number.',
          'Unfolded, Home and Workouts show side by side in two columns. You can see the home surface and the workout surface at the same time instead of stacking them on one narrow column.',
          'Landscape uses the full width. The layout does not leave black bars on the sides of the unfolded screen.',
          'Layouts avoid the fold area, so controls and text are not parked on the hinge.',
          'The tab bar moves to the side when the layout has room for it, instead of staying pinned to the bottom edge only.',
          'Stats, the timer, Feed and Coach each have an adapted layout for the unfolded phone. The same features exist on a regular iPhone. The difference is how they use the wider canvas.',
        ],
      },
      {
        title: 'Gym, running and 40 activity types',
        paragraphs: [
          'The training model is the same app you use on iPhone. Log gym sets, reps and weight across 260+ exercises, each with a video demo. The source count on 8 October 2026 was 263 exercises. This site says 260+ so a new exercise does not immediately make the sentence false.',
          'Runs and walks record a GPS route on the iPhone, including in the background, with time, distance and pace. There are 40 activity types: 8 strength, 14 cardio or wellness, 14 sports and 4 outdoor. Fourteen of those types are sports. Football, basketball, tennis, cycling, swimming, HIIT and yoga are among the activity types.',
          'On iPhone alone you also get the rest timer, step counting, a free AI calorie estimate, and a readiness score from 0 to 100%. Apple Health sync reads steps, energy, distance and outside workouts, and it saves workouts. Live Activities and Dynamic Island show the timer, the rest countdown and a Complete set button.',
          'The AI coach is part of the optional GOAT Plus subscription. It is not a Watch feature and it is not required to log a workout. The app does not offer Siri or Shortcuts support.',
        ],
      },
      {
        title: 'Apple Watch stays optional',
        paragraphs: [
          'You can train on iPhone Duo with no Watch paired. Without a Watch, effort is a 1–10 rating you enter. Heart rate is not estimated from that rating.',
          'From the wrist you can start any activity, start a routine and check off sets, or start a Combo of up to 4 activities chained together. Live on the Watch, every workout shows heart rate, 5 heart-rate zones with time in each zone, average heart rate, and active and total calories. Running adds distance, pace, cadence, power, stride length, ground contact time and vertical oscillation. Walking and hiking add elevation gain and loss and VO2 max. Cycling adds speed, cadence, power, FTP and elevation. Pool or open-water swimming adds distance, pace per 100, laps, strokes, stroke style, SWOLF and stroke rate. Those stats sync live to your iPhone about every 2 seconds, in a Live Watch banner and on the Live Activity and Dynamic Island, which show BPM and the zone bar. Watch GPS points are added to the iPhone route map. Pause, resume, lap, end and discard work from either device. Afterward, zone time, average and max heart rate, calories, running form, cycling power and speed, and swim SWOLF, stroke breakdown and lap splits are saved to Apple Health.',
        ],
      },
      {
        title: 'Free download, GOAT Plus optional',
        paragraphs: [
          'Free download, with an optional GOAT Plus subscription. This page does not publish a price.',
          'Logging workouts and routines, and the AI calorie estimate, are free. GOAT Plus includes the AI coach and chat, one-tap routine generation, weekly plans, muscle recovery, themes, extra widgets and full history.',
          'The app also includes a social feed with follows, likes, comments and stories, a muscle heatmap, achievements, an AI nutrition check-in, weekly and monthly summaries, and Memories, which are photo collages with route stickers. Five widgets ship with the app: Live Activity, calories, step goal, streak and muscle recovery. The interface is localized in 17 languages.',
          'Requirements: iOS 26 or later, iPhone only. There is no iPad app and no Android app. iPhone Duo uses that same iPhone app, with the unfolded layouts above.',
        ],
      },
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        question: 'Does GOAT AI Fitness work on iPhone Duo?',
        answer:
          'Yes. GOAT AI Fitness supports iPhone Duo, Apple’s foldable iPhone, as well as a regular iPhone. Unfolded, Home and Workouts show side by side in two columns, landscape is full width with no black bars, layouts avoid the fold area, and the tab bar moves to the side. Stats, the timer, Feed and Coach use adapted layouts.',
      },
      {
        question: 'Do I need an Apple Watch?',
        answer:
          'No. The app works fully on iPhone and on iPhone Duo. Apple Watch is optional. With a Watch, heart rate, zones, pace, distance and the other live stats sync live to your iPhone. Without a Watch, you rate effort from 1 to 10.',
      },
      {
        question: 'Is it free?',
        answer:
          'Yes. Free download, with an optional GOAT Plus subscription. Logging workouts and routines, and the AI calorie estimate, are free. GOAT Plus adds the AI coach and chat, one-tap routine generation, weekly plans, muscle recovery, themes, extra widgets and full history. No subscription price is listed here.',
      },
      {
        question: 'Does it work for gym and running?',
        answer:
          'Yes. Log gym sets, reps and weight, and track runs and walks with GPS, including in the background. Those sit with 40 activity types, including 14 sports, and 260+ exercises with video demos. The same history is on iPhone and iPhone Duo.',
      },
    ],
    ctaTitle: 'Open it on iPhone Duo',
    ctaBody:
      'GOAT AI Fitness for iPhone, iPhone Duo (foldable) and Apple Watch (optional). Free download, with an optional GOAT Plus subscription.',
    ctaLabel: 'Download GOAT AI Fitness on the App Store',
    backLabel: '← Back to GOAT AI Fitness home',
    languagesLabel: 'Languages',
    relatedLabel: 'Related guides',
    watchHref: '/apple-watch-workout-tracker',
    watchLabel: 'Apple Watch workout tracker',
    reviewNote: '',
  },
  {
    code: 'es',
    htmlLang: 'es',
    ogLocale: 'es_ES',
    path: '/es/app-fitness-iphone-duo',
    title: 'App de fitness y gimnasio para iPhone Duo | GOAT AI Fitness',
    description:
      'GOAT AI Fitness en iPhone Duo: Inicio y Entrenamientos en dos columnas al abrirlo, gym, running y 40 tipos de actividad. El Apple Watch es opcional.',
    ogTitle: 'La app de fitness hecha para iPhone Duo | GOAT AI Fitness',
    ogDescription:
      'Dos columnas con el iPhone Duo abierto, paisaje a todo el ancho y la barra de pestañas al lado. Gym, running y Apple Watch opcional.',
    schemaDescription:
      'GOAT AI Fitness en iPhone, iPhone Duo (plegable) y Apple Watch (opcional). Inicio y Entrenamientos quedan lado a lado al desplegarlo.',
    breadcrumbName: 'App de fitness para iPhone Duo',
    h1: 'La app de fitness hecha para iPhone Duo',
    subhead:
      'GOAT AI Fitness funciona en iPhone, en iPhone Duo (el iPhone plegable de Apple) y en Apple Watch (opcional). La app de iPhone está completa sin Watch.',
    watchLine: 'Funciona perfectamente en iPhone y iPhone Duo, con o sin Apple Watch.',
    downloadLabel: 'Descargar en el App Store',
    sections: [
      {
        title: 'Qué cambia cuando el iPhone Duo está desplegado',
        paragraphs: [
          'Estos datos de diseño se comprobaron en el código de la app el 8 de octubre de 2026. Describen el teléfono desplegado. Esta página no inventa el comportamiento de la pantalla exterior, el ancho de la bisagra ni una cifra de tamaño de pantalla.',
          'Desplegado, Inicio y Entrenamientos se ven a la vez en dos columnas. Ves la superficie de inicio y la de entrenamiento juntas, en lugar de apilarlas en una sola columna estrecha.',
          'El paisaje usa todo el ancho. El diseño no deja barras negras a los lados de la pantalla desplegada.',
          'Los diseños evitan la zona del pliegue, así que los controles y el texto no se quedan sobre la bisagra.',
          'La barra de pestañas pasa al lateral cuando el diseño tiene sitio, en lugar de quedarse solo en el borde inferior.',
          'Estadísticas, el temporizador, el Feed y el Coach tienen un diseño adaptado al teléfono desplegado. Las mismas funciones existen en un iPhone normal. Lo que cambia es cómo usan el lienzo más ancho.',
        ],
      },
      {
        title: 'Gimnasio, running y 40 tipos de actividad',
        paragraphs: [
          'El modelo de entrenamiento es la misma app del iPhone. Registra series, repeticiones y peso en 260+ ejercicios, cada uno con un video de demostración. El recuento en el código el 8 de octubre de 2026 era de 263 ejercicios. Aquí decimos 260+ para que un ejercicio nuevo no deje la frase falsa al día siguiente.',
          'Las carreras y las caminatas guardan una ruta GPS en el iPhone, también en segundo plano, con tiempo, distancia y ritmo. Hay 40 tipos de actividad: 8 de fuerza, 14 de cardio o bienestar, 14 deportes y 4 de exterior. Catorce de esos tipos son deportes. Fútbol, baloncesto, tenis, ciclismo, natación, HIIT y yoga están entre los tipos de actividad.',
          'Solo con el iPhone también tienes el temporizador de descanso, el conteo de pasos, una estimación de calorías con IA que es gratis y una puntuación de preparación de 0 a 100 %. La sincronización con Apple Health lee pasos, energía, distancia y entrenamientos externos, y guarda los entrenamientos. Las Live Activities y Dynamic Island muestran el temporizador, la cuenta atrás del descanso y el botón de completar la serie.',
          'El entrenador con IA forma parte de la suscripción opcional GOAT Plus. No es una función del Watch y no hace falta para registrar un entrenamiento. La app no ofrece compatibilidad con Siri ni con Atajos.',
        ],
      },
      {
        title: 'El Apple Watch sigue siendo opcional',
        paragraphs: [
          'Puedes entrenar en el iPhone Duo sin ningún Watch emparejado. Sin Watch, el esfuerzo es una nota del 1 al 10 que introduces tú. Esa nota no se convierte en frecuencia cardiaca.',
          'Desde la muñeca puedes iniciar cualquier actividad, una rutina marcando las series, o un Combo de hasta 4 actividades encadenadas. En vivo, el Watch muestra en todos los entrenamientos el pulso, 5 zonas con el tiempo en cada zona, el pulso medio y las calorías activas y totales. En carrera añade distancia, ritmo, cadencia, potencia, longitud de zancada, tiempo de contacto con el suelo y oscilación vertical. Al caminar o hacer senderismo añade desnivel positivo y negativo y VO2 max. En ciclismo añade velocidad, cadencia, potencia, FTP y desnivel. En natación en piscina o en aguas abiertas añade distancia, ritmo por 100, largos, brazadas, estilo, SWOLF y frecuencia de brazada. Esas cifras se sincronizan en vivo con el iPhone más o menos cada 2 segundos, en un aviso Live Watch y en la Live Activity y Dynamic Island, que muestran las PPM y la barra de zona. Los puntos GPS del Watch se suman al mapa de ruta del iPhone. Pausar, reanudar, marcar un largo, terminar o descartar se puede hacer desde cualquiera de los dos. Al terminar se guardan en Apple Health el tiempo en zonas, el pulso medio y máximo, las calorías, la técnica de carrera, la potencia y la velocidad en bici, y en natación el SWOLF, el desglose de brazadas y los parciales.',
        ],
      },
      {
        title: 'Descarga gratis, GOAT Plus opcional',
        paragraphs: [
          'Descarga gratis, con una suscripción opcional GOAT Plus. Esta página no publica un precio.',
          'Registrar entrenamientos y rutinas, y la estimación de calorías con IA, son gratis. GOAT Plus incluye el entrenador y el chat con IA, la generación de rutinas en un toque, planes semanales, recuperación muscular, temas, widgets extra e historial completo.',
          'La app también incluye un feed social con seguidos, me gusta, comentarios e historias, un mapa de calor muscular, logros, un check-in de nutrición con IA, resúmenes semanales y mensuales, y Memories, que son collages de fotos con stickers de ruta. Hay cinco widgets: Live Activity, calorías, meta de pasos, racha y recuperación muscular. La interfaz está traducida a 17 idiomas.',
          'Requisitos: iOS 26 o posterior, solo iPhone. No hay app para iPad ni para Android. iPhone Duo usa esa misma app de iPhone, con los diseños desplegados de arriba.',
        ],
      },
    ],
    faqTitle: 'Preguntas frecuentes',
    faqs: [
      {
        question: '¿GOAT AI Fitness funciona en iPhone Duo?',
        answer:
          'Sí. GOAT AI Fitness es compatible con iPhone Duo, el iPhone plegable de Apple, además del iPhone normal. Desplegado, Inicio y Entrenamientos se ven en dos columnas, el paisaje ocupa todo el ancho sin barras negras, los diseños evitan la zona del pliegue y la barra de pestañas pasa al lateral. Estadísticas, el temporizador, el Feed y el Coach usan diseños adaptados.',
      },
      {
        question: '¿Necesito un Apple Watch?',
        answer:
          'No. La app funciona completa en iPhone y en iPhone Duo. El Apple Watch es opcional. Con Watch, el pulso, las zonas, el ritmo, la distancia y el resto de cifras en vivo se sincronizan con el iPhone. Sin Watch, valoras el esfuerzo del 1 al 10.',
      },
      {
        question: '¿Es gratis?',
        answer:
          'Sí. Descarga gratis, con una suscripción opcional GOAT Plus. Registrar entrenamientos y rutinas, y la estimación de calorías con IA, son gratis. GOAT Plus añade el entrenador y el chat con IA, rutinas en un toque, planes semanales, recuperación muscular, temas, widgets extra e historial completo. Aquí no se publica un precio.',
      },
      {
        question: '¿Sirve para gimnasio y running?',
        answer:
          'Sí. Registra series, repeticiones y peso en el gimnasio, y sigue carreras y caminatas con GPS, también en segundo plano. Eso convive con 40 tipos de actividad, incluidos 14 deportes, y 260+ ejercicios con video. El mismo historial está en iPhone y en iPhone Duo.',
      },
    ],
    ctaTitle: 'Ábrela en iPhone Duo',
    ctaBody:
      'GOAT AI Fitness para iPhone, iPhone Duo (plegable) y Apple Watch (opcional). Descarga gratis, con una suscripción opcional GOAT Plus.',
    ctaLabel: 'Descargar GOAT AI Fitness en el App Store',
    backLabel: '← Volver a la home de GOAT AI Fitness',
    languagesLabel: 'Idiomas',
    relatedLabel: 'Guías relacionadas',
    watchHref: '/es/app-entrenamiento-apple-watch',
    watchLabel: 'Entrenamiento con Apple Watch',
    reviewNote: 'Este texto en español necesita revisión de un hablante nativo.',
  },
]
