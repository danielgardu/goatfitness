import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

// Removed unused props interface
const privacyContent = {
  en: {
    title: "GOAT AI Workout – Privacy Policy",
    lastUpdated: "Last updated: June 3, 2026",
    intro: "This Privacy Policy explains how the creator of GOAT AI Workout collects, uses, and protects your personal information when you use the application and related services. By using the Service, you accept the practices described herein.",
    sections: [
      {
        title: "1. Information We Collect",
        content: "Account and profile data: name, email, age, gender, weight, height, and fitness goals. Workout data: exercises, weight, repetitions, routines, and notes. Technical data: device type, operating system, and error logs. Apple HealthKit data (only if authorized): steps, calories, weight, distance, and exercise minutes."
      },
      {
        title: "2. How We Use Your Information",
        content: "We use your information to: Provide and synchronize the Service. Personalize AI Coach recommendations. Improve the application and fix errors. Sync activity with Apple Watch."
      },
      {
        title: "3. Artificial Intelligence (Google Gemini / Firebase AI Logic)",
        content: "When you use the AI Coach, we send your query along with minimal contextual data (age, weight, height, gender, goals, and a summary of recent workouts) to Google services through their API. Google does not use data sent through its commercial APIs (such as Gemini API) to train its public or foundational AI models. GOAT AI Workout also does not use your data to train its own models."
      },
      {
        title: "4. Apple HealthKit Data",
        content: "HealthKit data is used only for health and fitness features. It is never sold or used for advertising or marketing purposes. You control permissions from the iOS Health app."
      },
      {
        title: "5. App Tracking Transparency",
        content: "We do not track your activity across third-party apps or websites for targeted advertising purposes, nor do we use your information to create external marketing profiles."
      },
      {
        title: "6. Sharing Data with Third Parties",
        content: "We do not sell your personal information. We share data only with the following providers to operate the Service: Appwrite: Authentication and database (see appwrite.io/privacy). Google Firebase / Firestore: Database and synchronization (see firebase.google.com/support/privacy). Google Gemini API: AI Coach features (see ai.google.dev/gemini-api/terms). Apple: Payment processing and subscriptions."
      },
      {
        title: "7. International Transfers",
        content: "Your data may be processed on servers located in the United States and other countries where our providers operate. We take reasonable measures to protect your information."
      },
      {
        title: "8. Your Rights",
        content: "You can access, correct, or request deletion of your data. To exercise these rights, send an email to lobs-word-8q@icloud.com with the subject “Data Rights Request”. You can also delete your account directly from the application and revoke HealthKit permissions from iOS Settings."
      },
      {
        title: "9. Child Privacy",
        content: "The Service is not directed at children under 13. We do not knowingly collect information from children."
      },
      {
        title: "10. Security",
        content: "We implement industry-standard security measures through Appwrite and Google Firebase. No system is completely secure."
      },
      {
        title: "11. Changes to This Policy",
        content: "We may update this Policy occasionally. We will notify you within the application before significant changes."
      },
      {
        title: "12. Contact Us",
        content: "If you have questions about this Privacy Policy, write to: lobs-word-8q@icloud.com"
      }
    ]
  },
  es: {
    title: "GOAT AI Workout – Política de Privacidad",
    lastUpdated: "Última actualización: 3 de junio de 2026",
    intro: "Esta Política de Privacidad explica cómo el creador de GOAT AI Workout recopila, utiliza y protege tu información personal cuando usas la aplicación y los servicios relacionados. Al utilizar el Servicio, aceptas las prácticas aquí descritas.",
    sections: [
      {
        title: "1. Información que recopilamos",
        content: "Datos de cuenta y perfil: nombre, correo electrónico, edad, género, peso, altura y objetivos de fitness. Datos de entrenamiento: ejercicios, peso, repeticiones, rutinas y notas. Datos técnicos: tipo de dispositivo, sistema operativo y registros de errores. Datos de Apple HealthKit (solo si lo autorizas): pasos, calorías, peso, distancia y minutos de ejercicio."
      },
      {
        title: "2. Cómo utilizamos tu información",
        content: "Usamos tu información para: Proporcionar y sincronizar el Servicio. Personalizar las recomendaciones del Coach de IA. Mejorar la aplicación y corregir errores. Sincronizar actividad con Apple Watch."
      },
      {
        title: "3. Inteligencia Artificial (Google Gemini / Firebase AI Logic)",
        content: "Cuando usas el Coach de IA, enviamos tu consulta junto con datos contextuales mínimos (edad, peso, altura, género, objetivos y un resumen de entrenamientos recientes) a los servicios de Google a través de su API. Google no utiliza los datos enviados a través de sus APIs comerciales (como Gemini API) para entrenar sus modelos de inteligencia artificial públicos o fundacionales. GOAT AI Workout tampoco utiliza tus datos para entrenar modelos propios."
      },
      {
        title: "4. Datos de Apple HealthKit",
        content: "Los datos de Apple HealthKit solo se usan para funcionalidades de salud y fitness. Nunca se venden ni se utilizan con fines publicitarios o de marketing. Tú controlas los permisos desde la app Salud de iOS."
      },
      {
        title: "5. Transparencia de Rastreo (App Tracking Transparency)",
        content: "No rastreamos tu actividad a través de aplicaciones o sitios web de terceros con fines publicitarios dirigidos ni utilizamos tu información para la creación de perfiles de marketing externos."
      },
      {
        title: "6. Compartir datos con terceros",
        content: "No vendemos tu información personal. Compartimos datos únicamente con los siguientes proveedores para operar el Servicio: Appwrite: Autenticación y base de datos (consulta su política en appwrite.io/privacy). Google Firebase / Firestore: Base de datos y sincronización (consulta firebase.google.com/support/privacy). Google Gemini API: Funcionalidades del Coach de IA (consulta ai.google.dev/gemini-api/terms). Apple: Procesamiento de pagos y suscripciones."
      },
      {
        title: "7. Transferencias Internacionales",
        content: "Tus datos pueden procesarse en servidores ubicados en Estados Unidos y otros países donde operen nuestros proveedores. Tomamos medidas razonables para proteger tu información."
      },
      {
        title: "8. Tus Derechos",
        content: "Puedes acceder, corregir o solicitar la eliminación de tus datos. Para ejercer estos derechos, envía un correo a lobs-word-8q@icloud.com con el asunto “Solicitud de Derechos de Datos”. También puedes eliminar tu cuenta directamente desde la aplicación y revocar permisos de HealthKit desde Ajustes de iOS."
      },
      {
        title: "9. Privacidad Infantil",
        content: "El Servicio no está dirigido a menores de 13 años. No recopilamos información de niños de forma consciente."
      },
      {
        title: "10. Seguridad",
        content: "Implementamos medidas de seguridad estándar de la industria a través de Appwrite y Google Firebase. Ningún sistema es completamente seguro."
      },
      {
        title: "11. Cambios en esta Política",
        content: "Podemos actualizar esta Política ocasionalmente. Te notificaremos dentro de la aplicación antes de cambios significativos."
      },
      {
        title: "12. Contáctanos",
        content: "Si tienes dudas sobre esta Política de Privacidad, escríbenos a: lobs-word-8q@icloud.com"
      }
    ]
  },
  fr: {
    title: "GOAT AI Workout – Politique de Confidentialité",
    lastUpdated: "Dernière mise à jour : 3 juin 2026",
    intro: "Cette Politique de Confidentialité explique comment le créateur de GOAT AI Workout collecte, utilise et protège vos informations personnelles lorsque vous utilisez l'application et les services connexes. En utilisant le Service, vous acceptez les pratiques décrites ici.",
    sections: [
      {
        title: "1. Informations que Nous Collectons",
        content: "Données de compte et de profil : nom, e-mail, âge, sexe, poids, taille et objectifs de fitness. Données d'entraînement : exercices, poids, répétitions, routines et notes. Données techniques : type d'appareil, système d'exploitation et journaux d'erreurs. Données Apple HealthKit (seulement si autorisé) : pas, calories, poids, distance et minutes d'exercice."
      },
      {
        title: "2. Comment Nous Utilisons Vos Informations",
        content: "Nous utilisons vos informations pour : Fournir et synchroniser le Service. Personnaliser les recommandations du Coach IA. Améliorer l'application et corriger les erreurs. Synchroniser l'activité avec Apple Watch."
      },
      {
        title: "3. Intelligence Artificielle (Google Gemini / Firebase AI Logic)",
        content: "Lorsque vous utilisez le Coach IA, nous envoyons votre requête avec des données contextuelles minimales (âge, poids, taille, sexe, objectifs et un résumé des entraînements récents) aux services Google via leur API. Google n'utilise pas les données envoyées via ses API commerciales (comme Gemini API) pour former ses modèles d'IA publics ou fondamentaux. GOAT AI Workout n'utilise pas non plus vos données pour former ses propres modèles."
      },
      {
        title: "4. Données Apple HealthKit",
        content: "Les données HealthKit sont utilisées uniquement pour les fonctionnalités santé et fitness. Elles ne sont jamais vendues ou utilisées à des fins publicitaires ou de marketing. Vous contrôlez les autorisations depuis l'application Santé iOS."
      },
      {
        title: "5. Transparence de Suivi (App Tracking Transparency)",
        content: "Nous ne suivons pas votre activité sur des applications ou sites web tiers à des fins de publicité ciblée, ni n'utilisons vos informations pour créer des profils marketing externes."
      },
      {
        title: "6. Partage de Données avec des Tiers",
        content: "Nous ne vendons pas vos informations personnelles. Nous partageons des données uniquement avec les fournisseurs suivants pour faire fonctionner le Service : Appwrite : Authentification et base de données (voir appwrite.io/privacy). Google Firebase / Firestore : Base de données et synchronisation (voir firebase.google.com/support/privacy). Google Gemini API : Fonctionnalités du Coach IA (voir ai.google.dev/gemini-api/terms). Apple : Traitement des paiements et abonnements."
      },
      {
        title: "7. Transferts Internationaux",
        content: "Vos données peuvent être traitées sur des serveurs situés aux États-Unis et dans d'autres pays où nos fournisseurs opèrent. Nous prenons des mesures raisonnables pour protéger vos informations."
      },
      {
        title: "8. Vos Droits",
        content: "Vous pouvez accéder, corriger ou demander la suppression de vos données. Pour exercer ces droits, envoyez un e-mail à lobs-word-8q@icloud.com avec le sujet « Demande de Droits de Données ». Vous pouvez également supprimer votre compte directement depuis l'application et révoquer les autorisations HealthKit depuis les Réglages iOS."
      },
      {
        title: "9. Confidentialité des Enfants",
        content: "Le Service n'est pas destiné aux enfants de moins de 13 ans. Nous ne collectons pas consciemment d'informations d'enfants."
      },
      {
        title: "10. Sécurité",
        content: "Nous mettons en œuvre des mesures de sécurité standard de l'industrie via Appwrite et Google Firebase. Aucun système n'est complètement sécurisé."
      },
      {
        title: "11. Modifications de Cette Politique",
        content: "Nous pouvons mettre à jour cette politique occasionnellement. Nous vous informerons dans l'application avant des modifications importantes."
      },
      {
        title: "12. Contactez-nous",
        content: "Si vous avez des questions sur cette Politique de Confidentialité, écrivez à : lobs-word-8q@icloud.com"
      }
    ]
  },
  de: {
    title: "GOAT AI Workout – Datenschutzrichtlinie",
    lastUpdated: "Zuletzt aktualisiert: 3. Juni 2026",
    intro: "Diese Datenschutzrichtlinie erklärt, wie der Ersteller von GOAT AI Workout Ihre persönlichen Informationen sammelt, verwendet und schützt, wenn Sie die Anwendung und verwandte Dienste verwenden. Durch die Nutzung des Dienstes akzeptieren Sie die hier beschriebenen Praktiken.",
    sections: [
      {
        title: "1. Informationen, die Wir Sammeln",
        content: "Konto- und Profildaten: Name, E-Mail, Alter, Geschlecht, Gewicht, Größe und Fitnessziele. Trainingsdaten: Übungen, Gewicht, Wiederholungen, Routinen und Notizen. Technische Daten: Gerätetyp, Betriebssystem und Fehlerprotokolle. Apple HealthKit-Daten (nur wenn autorisiert): Schritte, Kalorien, Gewicht, Distanz und Trainingsminuten."
      },
      {
        title: "2. Wie Wir Ihre Informationen Verwenden",
        content: "Wir verwenden Ihre Informationen für: Bereitstellung und Synchronisierung des Dienstes. Personalisierung der KI-Coach-Empfehlungen. Verbesserung der Anwendung und Fehlerbehebung. Synchronisierung der Aktivität mit Apple Watch."
      },
      {
        title: "3. Künstliche Intelligenz (Google Gemini / Firebase AI Logic)",
        content: "Wenn Sie den KI-Coach verwenden, senden wir Ihre Anfrage zusammen mit minimalen Kontextdaten (Alter, Gewicht, Größe, Geschlecht, Ziele und eine Zusammenfassung der letzten Trainings) an Google-Dienste über deren API. Google verwendet nicht die über ihre kommerziellen APIs (wie Gemini API) gesendeten Daten, um ihre öffentlichen oder grundlegenden KI-Modelle zu trainieren. GOAT AI Workout verwendet Ihre Daten auch nicht, um eigene Modelle zu trainieren."
      },
      {
        title: "4. Apple HealthKit-Daten",
        content: "HealthKit-Daten werden nur für Gesundheits- und Fitnessfunktionen verwendet. Sie werden niemals für Werbung oder Marketingzwecke verkauft oder verwendet. Sie steuern die Berechtigungen aus der iOS Gesundheits-App."
      },
      {
        title: "5. App Tracking Transparency",
        content: "Wir verfolgen Ihre Aktivität nicht über Apps oder Websites Dritter für gezielte Werbung und verwenden Ihre Informationen nicht zur Erstellung externer Marketingprofile."
      },
      {
        title: "6. Datenaustausch mit Dritten",
        content: "Wir verkaufen Ihre persönlichen Informationen nicht. Wir teilen Daten nur mit den folgenden Anbietern, um den Dienst zu betreiben: Appwrite: Authentifizierung und Datenbank (siehe appwrite.io/privacy). Google Firebase / Firestore: Datenbank und Synchronisation (siehe firebase.google.com/support/privacy). Google Gemini API: KI-Coach-Funktionen (siehe ai.google.dev/gemini-api/terms). Apple: Zahlungsabwicklung und Abonnements."
      },
      {
        title: "7. Internationale Übertragungen",
        content: "Ihre Daten können auf Servern in den Vereinigten Staaten und anderen Ländern verarbeitet werden, in denen unsere Anbieter tätig sind. Wir treffen angemessene Maßnahmen zum Schutz Ihrer Informationen."
      },
      {
        title: "8. Ihre Rechte",
        content: "Sie können auf Ihre Daten zugreifen, sie korrigieren oder deren Löschung beantragen. Um diese Rechte auszuüben, senden Sie eine E-Mail an lobs-word-8q@icloud.com mit dem Betreff „Datenrechtsantrag“. Sie können Ihr Konto auch direkt aus der Anwendung löschen und HealthKit-Berechtigungen aus den iOS-Einstellungen widerrufen."
      },
      {
        title: "9. Kinderschutz",
        content: "Der Dienst richtet sich nicht an Kinder unter 13 Jahren. Wir sammeln bewusst keine Informationen von Kindern."
      },
      {
        title: "10. Sicherheit",
        content: "Wir implementieren branchenübliche Sicherheitsmaßnahmen über Appwrite und Google Firebase. Kein System ist vollständig sicher."
      },
      {
        title: "11. Änderungen an Dieser Richtlinie",
        content: "Wir können diese Richtlinie gelegentlich aktualisieren. Wir werden Sie in der Anwendung vor wichtigen Änderungen benachrichtigen."
      },
      {
        title: "12. Kontaktieren Sie Uns",
        content: "Wenn Sie Fragen zu dieser Datenschutzrichtlinie haben, schreiben Sie an: lobs-word-8q@icloud.com"
      }
    ]
  },
  ja: {
    title: "GOAT AI Workout – プライバシーポリシー",
    lastUpdated: "最終更新: 2026年6月3日",
    intro: "このプライバシーポリシーは、アプリケーションおよび関連サービスを使用する際にGOAT AI Workoutの作成者が個人情報をどのように収集、使用、保護するかを説明します。サービスを使用することで、ここで説明されている慣行に同意したものとみなされます。",
    sections: [
      {
        title: "1. 収集する情報",
        content: "アカウントおよびプロフィールデータ: 名前、メール、年齢、性別、体重、身長、フィットネス目標。トレーニングデータ: エクササイズ、重量、回数、ルーチン、メモ。技術データ: デバイスタイプ、オペレーティングシステム、エラーログ。Apple HealthKitデータ（許可した場合のみ）: 歩数、カロリー、体重、距離、運動分数。"
      },
      {
        title: "2. 情報の使用方法",
        content: "情報を以下の目的で使用します: サービスの提供と同期。AIコーチの推奨事項のパーソナライズ。アプリケーションの改善とエラー修正。Apple Watchとのアクティビティ同期。"
      },
      {
        title: "3. 人工知能（Google Gemini / Firebase AI Logic）",
        content: "AIコーチを使用する場合、クエリと最小限のコンテキストデータ（年齢、体重、身長、性別、目標、最近のトレーニングの要約）をAPI経由でGoogleサービスに送信します。Googleは、商用API（Gemini APIなど）を通じて送信されたデータを使用して、公開または基礎的なAIモデルをトレーニングしません。GOAT AI Workoutも独自のモデルをトレーニングするためにデータを使用しません。"
      },
      {
        title: "4. Apple HealthKitデータ",
        content: "HealthKitデータはヘルスおよびフィットネス機能のみに使用されます。広告またはマーケティング目的で販売または使用されることはありません。iOSヘルスアプリから権限を制御できます。"
      },
      {
        title: "5. アプリ追跡の透明性",
        content: "ターゲット広告の目的でサードパーティアプリやウェブサイト全体でアクティビティを追跡せず、外部マーケティングプロファイルを作成するために情報を使用しません。"
      },
      {
        title: "6. サードパーティとのデータ共有",
        content: "個人情報を販売しません。サービスを運営するために以下のプロバイダーとデータを共有のみします: Appwrite: 認証とデータベース（appwrite.io/privacyを参照）。Google Firebase / Firestore: データベースと同期（firebase.google.com/support/privacyを参照）。Google Gemini API: AIコーチ機能（ai.google.dev/gemini-api/termsを参照）。Apple: 支払い処理とサブスクリプション。"
      },
      {
        title: "7. 国際移転",
        content: "データは、プロバイダーが運営する米国およびその他の国のサーバーで処理される場合があります。情報を保護するために合理的な措置を講じています。"
      },
      {
        title: "8. あなたの権利",
        content: "データにアクセス、修正、削除を要求できます。これらの権利を行使するには、件名を「データ権利要求」としてlobs-word-8q@icloud.comにメールを送信してください。アプリから直接アカウントを削除し、iOS設定からHealthKit権限を取り消すこともできます。"
      },
      {
        title: "9. 子供のプライバシー",
        content: "サービスは13歳未満の子供を対象としていません。意図的に子供から情報を収集しません。"
      },
      {
        title: "10. セキュリティ",
        content: "AppwriteとGoogle Firebaseを通じて業界標準のセキュリティ対策を実装しています。システムは完全に安全ではありません。"
      },
      {
        title: "11. このポリシーの変更",
        content: "このポリシーを時折更新する場合があります。重要な変更前にアプリ内で通知します。"
      },
      {
        title: "12. お問い合わせ",
        content: "このプライバシーポリシーについて質問がある場合は、次のアドレスまでご連絡ください: lobs-word-8q@icloud.com"
      }
    ]
  },
  ko: {
    title: "GOAT AI Workout – 개인정보 처리방침",
    lastUpdated: "최종 업데이트: 2026년 6월 3일",
    intro: "이 개인정보 처리방침은 애플리케이션 및 관련 서비스를 사용할 때 GOAT AI Workout 작성자가 개인정보를 수집, 사용 및 보호하는 방법을 설명합니다. 서비스를 사용함으로써 여기에 설명된 관행에 동의하게 됩니다.",
    sections: [
      {
        title: "1. 수집하는 정보",
        content: "계정 및 프로필 데이터: 이름, 이메일, 나이, 성별, 체중, 키 및 피트니스 목표. 운동 데이터: 운동, 무게, 반복, 루틴 및 메모. 기술 데이터: 장치 유형, 운영 체제 및 오류 로그. Apple HealthKit 데이터(승인한 경우에만): 걸음 수, 칼로리, 체중, 거리 및 운동 분."
      },
      {
        title: "2. 정보 사용 방법",
        content: "정보를 다음 목적으로 사용합니다: 서비스 제공 및 동기화. AI 코치 추천 사항 개인화. 애플리케이션 개선 및 오류 수정. Apple Watch와 활동 동기화."
      },
      {
        title: "3. 인공 지능(Google Gemini / Firebase AI Logic)",
        content: "AI 코치를 사용할 때 쿼리와 최소한의 컨텍스트 데이터(나이, 체중, 키, 성별, 목표 및 최근 운동 요약)를 API를 통해 Google 서비스로 보냅니다. Google은 상용 API(Gemini API 등)를 통해 전송된 데이터를 사용하여 공개 또는 기본 AI 모델을 훈련하지 않습니다. GOAT AI Workout도 자체 모델을 훈련하기 위해 데이터를 사용하지 않습니다."
      },
      {
        title: "4. Apple HealthKit 데이터",
        content: "HealthKit 데이터는 건강 및 피트니스 기능에만 사용됩니다. 광고 또는 마케팅 목적으로 판매되거나 사용되지 않습니다. iOS 건강 앱에서 권한을 제어할 수 있습니다."
      },
      {
        title: "5. 앱 추적 투명성",
        content: "타겟 광고 목적으로 타사 앱 또는 웹사이트 전체에서 활동을 추적하지 않으며 외부 마케팅 프로필을 만들기 위해 정보를 사용하지 않습니다."
      },
      {
        title: "6. 제3자와의 데이터 공유",
        content: "개인정보를 판매하지 않습니다. 서비스를 운영하기 위해 다음 공급자와만 데이터를 공유합니다: Appwrite: 인증 및 데이터베이스(appwrite.io/privacy 참조). Google Firebase / Firestore: 데이터베이스 및 동기화(firebase.google.com/support/privacy 참조). Google Gemini API: AI 코치 기능(ai.google.dev/gemini-api/terms 참조). Apple: 결제 처리 및 구독."
      },
      {
        title: "7. 국제 전송",
        content: "데이터는 공급자가 운영하는 미국 및 기타 국가의 서버에서 처리될 수 있습니다. 정보를 보호하기 위해 합리적인 조치를 취합니다."
      },
      {
        title: "8. 귀하의 권리",
        content: "데이터에 액세스, 수정 또는 삭제를 요청할 수 있습니다. 이러한 권리를 행사하려면 제목을 \"데이터 권리 요청\"으로 하여 lobs-word-8q@icloud.com으로 이메일을 보내십시오. 앱에서 직접 계정을 삭제하고 iOS 설정에서 HealthKit 권한을 취소할 수도 있습니다."
      },
      {
        title: "9. 어린이 개인정보 보호",
        content: "서비스는 13세 미만 어린이를 대상으로 하지 않습니다. 의도적으로 어린이로부터 정보를 수집하지 않습니다."
      },
      {
        title: "10. 보안",
        content: "Appwrite 및 Google Firebase를 통해 업계 표준 보안 조치를 구현합니다. 시스템은 완전히 안전하지 않습니다."
      },
      {
        title: "11. 이 정책의 변경",
        content: "이 정책을 가끔 업데이트할 수 있습니다. 중요한 변경 사항 전에 앱 내에서 알림을 드립니다."
      },
      {
        title: "12. 문의하기",
        content: "이 개인정보 처리방침에 대해 질문이 있는 경우 다음으로 문의하십시오: lobs-word-8q@icloud.com"
      }
    ]
  },
  ar: {
    title: "GOAT AI Workout – سياسة الخصوصية",
    lastUpdated: "آخر تحديث: 3 يونيو 2026",
    intro: "توضح سياسة الخصوصية هذه كيف يجمع منشئ GOAT AI Workout ويستخدم ويحمي معلوماتك الشخصية عند استخدامك للتطبيق والخدمات ذات الصلة. باستخدام الخدمة، فإنت تقبل الممارسات الموضحة هنا.",
    sections: [
      {
        title: "1. المعلومات التي نجمعها",
        content: "بيانات الحساب والملف الشخصي: الاسم، البريد الإلكتروني، العمر، الجنس، الوزن، الطول وأهداف اللياقة. بيانات التدريب: التمارين، الوزن، التكرار، الروتين والملاحظات. البيانات التقنية: نوع الجهاز، نظام التشغيل وسجلات الأخطاء. بيانات Apple HealthKit (فقط إذا أذنت): الخطوات، السعرات الحرارية، الوزن، المسافة ودقائق التمرين."
      },
      {
        title: "2. كيف نستخدم معلوماتك",
        content: "نستخدم معلوماتك لـ: توفير ومزامنة الخدمة. تخصيص توصيات مدرب AI. تحسين التطبيق وإصلاح الأخطاء. مزامنة النشاط مع Apple Watch."
      },
      {
        title: "3. الذكاء الاصطناعي (Google Gemini / Firebase AI Logic)",
        content: "عند استخدام مدرب AI، نرسل استعلامك مع بيانات سياقية دنيا (العمر، الوزن، الطول، الجنس، الأهداف وموجز التدريبات الأخيرة) إلى خدمات Google عبر API الخاص بهم. Google لا تستخدم البيانات المرسلة عبر APIs التجارية (مثل Gemini API) لتدريب نماذج AI العامة أو الأساسية الخاصة بها. GOAT AI Workout لا يستخدم بياناتك أيضًا لتدريب نماذجه الخاصة."
      },
      {
        title: "4. بيانات Apple HealthKit",
        content: "بيانات HealthKit تُستخدم فقط لميزات الصحة واللياقة. لا تُباع أبدًا أو تُستخدم لأغراض إعلانية أو تسويقية. تتحكم في الأذونات من تطبيق iOS Health."
      },
      {
        title: "5. شفافية التتبع (App Tracking Transparency)",
        content: "نحن لا نتتبع نشاطك عبر تطبيقات أو مواقع ويب تابعة لأغراض إعلانية مستهدفة، ولا نستخدم معلوماتك لإنشاء ملفات تسويق خارجية."
      },
      {
        title: "6. مشاركة البيانات مع أطراف ثالثة",
        content: "نحن لا نبيع معلوماتك الشخصية. نشارك البيانات فقط مع مقدمي الخدمات التالية لتشغيل الخدمة: Appwrite: المصادقة وقاعدة البيانات (انظر appwrite.io/privacy). Google Firebase / Firestore: قاعدة البيانات والمزامنة (انظر firebase.google.com/support/privacy). Google Gemini API: ميزات مدرب AI (انظر ai.google.dev/gemini-api/terms). Apple: معالجة المدفوعات والاشتراكات."
      },
      {
        title: "7. النقل الدولي",
        content: "قد تُعالج بياناتك على خوادم تقع في الولايات المتحدة ودول أخرى حيث يعمل مقدمو الخدمة لدينا. نتخذ تدابير معقولة لحماية معلوماتك."
      },
      {
        title: "8. حقوقك",
        content: "يمكنك الوصول إلى بياناتك أو تصحيحها أو طلب حذفها. لممارسة هذه الحقوق، أرسل بريدًا إلكترونيًا إلى lobs-word-8q@icloud.com مع الموضوع «طلب حقوق البيانات». يمكنك أيضًا حذف حسابك مباشرة من التطبيق وإلغاء أذونات HealthKit من إعدادات iOS."
      },
      {
        title: "9. خصوصية الأطفال",
        content: "الخدمة ليست موجهة للأطفال دون سن 13 عامًا. لا نجمع معلومات الأطفال عن قصد."
      },
      {
        title: "10. الأمان",
        content: "نحن ننفذ تدابير أمان معيارية في الصناعة عبر Appwrite و Google Firebase. لا يوجد نظام آمن تمامًا."
      },
      {
        title: "11. التغييرات في هذه السياسة",
        content: "قد نقوم بتحديث هذه السياسة بشكل دوري. سنخطرك داخل التطبيق قبل التغييرات المهمة."
      },
      {
        title: "12. اتصل بنا",
        content: "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، اكتب إلى: lobs-word-8q@icloud.com"
      }
    ]
  },
  pt: {
    title: "GOAT AI Workout – Política de Privacidade",
    lastUpdated: "Última atualização: 3 de junho de 2026",
    intro: "Esta Política de Privacidade explica como o criador do GOAT AI Workout coleta, usa e protege suas informações pessoais quando você usa o aplicativo e serviços relacionados. Ao usar o Serviço, você aceita as práticas descritas aqui.",
    sections: [
      {
        title: "1. Informações que Coletamos",
        content: "Dados de conta e perfil: nome, e-mail, idade, gênero, peso, altura e objetivos de fitness. Dados de treino: exercícios, peso, repetições, rotinas e notas. Dados técnicos: tipo de dispositivo, sistema operacional e logs de erro. Dados Apple HealthKit (somente se autorizado): passos, calorias, peso, distância e minutos de exercício."
      },
      {
        title: "2. Como Usamos Suas Informações",
        content: "Usamos suas informações para: Fornecer e sincronizar o Serviço. Personalizar recomendações do Coach IA. Melhorar o aplicativo e corrigir erros. Sincronizar atividade com Apple Watch."
      },
      {
        title: "3. Inteligência Artificial (Google Gemini / Firebase AI Logic)",
        content: "Quando você usa o Coach IA, enviamos sua consulta com dados contextuais mínimos (idade, peso, altura, gênero, objetivos e um resumo dos treinos recentes) para os serviços Google através de sua API. Google não usa dados enviados através de suas APIs comerciais (como Gemini API) para treinar seus modelos de IA públicos ou fundamentais. GOAT AI Workout também não usa seus dados para treinar seus próprios modelos."
      },
      {
        title: "4. Dados Apple HealthKit",
        content: "Dados HealthKit são usados apenas para recursos de saúde e fitness. Nunca são vendidos ou usados para fins publicitários ou de marketing. Você controla as permissões a partir do aplicativo Saúde iOS."
      },
      {
        title: "5. Transparência de Rastreamento (App Tracking Transparency)",
        content: "Não rastreamos sua atividade em aplicativos ou sites de terceiros para publicidade direcionada, nem usamos suas informações para criar perfis de marketing externos."
      },
      {
        title: "6. Compartilhamento de Dados com Terceiros",
        content: "Não vendemos suas informações pessoais. Compartilhamos dados apenas com os seguintes provedores para operar o Serviço: Appwrite: Autenticação e banco de dados (veja appwrite.io/privacy). Google Firebase / Firestore: Banco de dados e sincronização (veja firebase.google.com/support/privacy). Google Gemini API: Recursos do Coach IA (veja ai.google.dev/gemini-api/terms). Apple: Processamento de pagamentos e assinaturas."
      },
      {
        title: "7. Transferências Internacionais",
        content: "Seus dados podem ser processados em servidores localizados nos Estados Unidos e outros países onde nossos provedores operam. Tomamos medidas razoáveis para proteger suas informações."
      },
      {
        title: "8. Seus Direitos",
        content: "Você pode acessar, corrigir ou solicitar a exclusão de seus dados. Para exercer esses direitos, envie um e-mail para lobs-word-8q@icloud.com com o assunto «Solicitação de Direitos de Dados». Você também pode excluir sua conta diretamente do aplicativo e revogar permissões HealthKit nas Configurações iOS."
      },
      {
        title: "9. Privacidade Infantil",
        content: "O Serviço não é direcionado a crianças menores de 13 anos. Não coletamos conscientemente informações de crianças."
      },
      {
        title: "10. Segurança",
        content: "Implementamos medidas de segurança padrão da indústria através do Appwrite e Google Firebase. Nenhum sistema é completamente seguro."
      },
      {
        title: "11. Alterações nesta Política",
        content: "Podemos atualizar esta política ocasionalmente. Notificaremos você dentro do aplicativo antes de alterações significativas."
      },
      {
        title: "12. Entre em Contato",
        content: "Se você tiver perguntas sobre esta Política de Privacidade, escreva para: lobs-word-8q@icloud.com"
      }
    ]
  },
  nl: {
    title: "GOAT AI Workout – Privacybeleid",
    lastUpdated: "Laatst bijgewerkt: 3 juni 2026",
    intro: "Dit Privacybeleid legt uit hoe de maker van GOAT AI Workout uw persoonlijke informatie verzamelt, gebruikt en beschermt wanneer u de applicatie en gerelateerde diensten gebruikt. Door de Dienst te gebruiken, accepteert u de hier beschreven praktijken.",
    sections: [
      {
        title: "1. Informatie die Wij Verzamelen",
        content: "Account- en profielgegevens: naam, e-mail, leeftijd, geslacht, gewicht, lengte en fitnessdoelen. Trainingsgegevens: oefeningen, gewicht, herhalingen, routines en notities. Technische gegevens: apparaattype, besturingssysteem en foutenlogboeken. Apple HealthKit-gegevens (alleen als geautoriseerd): stappen, calorieën, gewicht, afstand en trainingsminuten."
      },
      {
        title: "2. Hoe Wij Uw Informatie Gebruiken",
        content: "Wij gebruiken uw informatie voor: Het leveren en synchroniseren van de Dienst. Personaliseren van AI Coach-aanbevelingen. Verbeteren van de applicatie en oplossen van fouten. Synchroniseren van activiteit met Apple Watch."
      },
      {
        title: "3. Kunstmatige Intelligentie (Google Gemini / Firebase AI Logic)",
        content: "Wanneer u de AI Coach gebruikt, sturen wij uw query samen met minimale contextuele gegevens (leeftijd, gewicht, lengte, geslacht, doelen en een samenvatting van recente trainingen) naar Google-diensten via hun API. Google gebruikt geen gegevens die via hun commerciële API's (zoals Gemini API) worden verzonden om hun openbare of fundamentele AI-modellen te trainen. GOAT AI Workout gebruikt uw gegevens ook niet om zijn eigen modellen te trainen."
      },
      {
        title: "4. Apple HealthKit-gegevens",
        content: "HealthKit-gegevens worden alleen gebruikt voor gezondheids- en fitnessfuncties. Ze worden nooit verkocht of gebruikt voor reclame- of marketingdoeleinden. U controleert de machtigingen vanuit de iOS Health-app."
      },
      {
        title: "5. App Tracking Transparency",
        content: "Wij volgen uw activiteit niet via apps of websites van derden voor gerichte reclame en gebruiken uw informatie niet om externe marketingprofielen te maken."
      },
      {
        title: "6. Gegevens Delen met Derden",
        content: "Wij verkopen uw persoonlijke informatie niet. Wij delen gegevens alleen met de volgende providers om de Dienst te laten werken: Appwrite: Authenticatie en database (zie appwrite.io/privacy). Google Firebase / Firestore: Database en synchronisatie (zie firebase.google.com/support/privacy). Google Gemini API: AI Coach-functies (zie ai.google.dev/gemini-api/terms). Apple: Betalingsverwerking en abonnementen."
      },
      {
        title: "7. Internationale Overdrachten",
        content: "Uw gegevens kunnen worden verwerkt op servers in de Verenigde Staten en andere landen waar onze providers actief zijn. Wij nemen redelijke maatregelen om uw informatie te beschermen."
      },
      {
        title: "8. Uw Rechten",
        content: "U kunt toegang krijgen tot uw gegevens, deze corrigeren of verwijdering aanvragen. Om deze rechten uit te oefenen, stuurt u een e-mail naar lobs-word-8q@icloud.com met het onderwerp «Data Rights Request». U kunt uw account ook direct verwijderen vanuit de applicatie en HealthKit-machtigingen intrekken via iOS-instellingen."
      },
      {
        title: "9. Kinderprivacy",
        content: "De Dienst is niet bedoeld voor kinderen jonger dan 13 jaar. Wij verzamelen niet bewust informatie van kinderen."
      },
      {
        title: "10. Beveiliging",
        content: "Wij implementeren industrie-standaard beveiligingsmaatregelen via Appwrite en Google Firebase. Geen systeem is volledig beveiligd."
      },
      {
        title: "11. Wijzigingen in Dit Beleid",
        content: "Wij kunnen dit beleid af en toe bijwerken. Wij zullen u in de applicatie op de hoogte stellen als wij significante wijzigingen aanbrengen."
      },
      {
        title: "12. Neem Contact Op",
        content: "Als u vragen heeft over dit Privacybeleid, schrijf naar: lobs-word-8q@icloud.com"
      }
    ]
  },
  pl: {
    title: "GOAT AI Workout – Polityka Prywatności",
    lastUpdated: "Ostatnia aktualizacja: 3 czerwca 2026",
    intro: "Ta Polityka Prywatności wyjaśniaia, jak twórca GOAT AI Workout gromadzi, wykorzystuje i chroni Twoje dane osobowe, gdy korzystasz z aplikacji i powiązanych usług. Korzystając z Usługi, akceptujesz opisane tutaj praktyki.",
    sections: [
      {
        title: "1. Informacje, Które Gromadzimy",
        content: "Dane konta i profilu: imię, e-mail, wiek, płeć, waga, wzrost i cele fitness. Dane treningowe: ćwiczenia, waga, powtórzenia, rutyny i notatki. Dane techniczne: typ urządzenia, system operacyjny i logi błędów. Dane Apple HealthKit (tylko jeśli autoryzowano): kroki, kalorie, waga, dystans i minuty treningowe."
      },
      {
        title: "2. Jak Wykorzystujemy Twoje Informacje",
        content: "Wykorzystujemy Twoje informacje do: Dostarczania i synchronizacji Usługi. Personalizacji rekomendacji Trenera AI. Ulepszania aplikacji i naprawiania błędów. Synchronizacji aktywności z Apple Watch."
      },
      {
        title: "3. Sztuczna Inteligencja (Google Gemini / Firebase AI Logic)",
        content: "Gdy używasz Trenera AI, wysyłamy Twoje zapytanie wraz z minimalnymi danymi kontekstowymi (wiek, waga, wzrost, płeć, cele i podsumowanie ostatnich treningów) do usług Google przez ich API. Google nie używa danych wysyłanych przez ich komercyjne API (takie jak Gemini API) do trenowania swoich publicznych lub fundamentalnych modeli AI. GOAT AI Workout również nie używa Twoich danych do trenowania własnych modeli."
      },
      {
        title: "4. Dane Apple HealthKit",
        content: "Dane HealthKit są używane tylko do funkcji zdrowia i fitness. Nigdy nie są sprzedawane ani używane do celów reklamowych lub marketingowych. Kontrolujesz uprawnienia z aplikacji iOS Health."
      },
      {
        title: "5. Przejrzystość Śledzenia (App Tracking Transparency)",
        content: "Nie śledzimy Twojej aktywności w aplikacjach lub witrynach stron trzecich w celach reklamowych ani nie używamy Twoich informacji do tworzenia zewnętrznych profili marketingowych."
      },
      {
        title: "6. Udostępnianie Danych Stronom Trzecim",
        content: "Nie sprzedajemy Twoich danych osobowych. Udostępniamy dane tylko następującym dostawcom do działania Usługi: Appwrite: Uwierzytelnianie i baza danych (zobacz appwrite.io/privacy). Google Firebase / Firestore: Baza danych i synchronizacja (zobacz firebase.google.com/support/privacy). Google Gemini API: Funkcje Trenera AI (zobacz ai.google.dev/gemini-api/terms). Apple: Przetwarzanie płatności i subskrypcje."
      },
      {
        title: "7. Transfer Międzynarodowy",
        content: "Twoje dane mogą być przetwarzane na serwerach w Stanach Zjednoczonych i innych krajach, gdzie działają nasi dostawcy. Podejmujemy rozsądne środki w celu ochrony Twoich informacji."
      },
      {
        title: "8. Twoje Prawa",
        content: "Możesz uzyskać dostęp do swoich danych, poprawić je lub żądać ich usunięcia. Aby skorzystać z tych praw, wyślij e-mail na lobs-word-8q@icloud.com z tematem «Prośba o prawa do danych». Możesz również usunąć swoje konto bezpośrednio z aplikacji i odwołać uprawnienia HealthKit w ustawieniach iOS."
      },
      {
        title: "9. Prywatność Dzieci",
        content: "Usługa nie jest przeznaczona dla dzieci poniżej 13 roku życia. Nie gromadzimy świadomie informacji o dzieciach."
      },
      {
        title: "10. Bezpieczeństwo",
        content: "Wdrażamy środki bezpieczeństwa standardowe w branży za pośrednictwem Appwrite i Google Firebase. Żaden system nie jest całkowicie bezpieczny."
      },
      {
        title: "11. Zmiany w Tej Polityce",
        content: "Możemy okresowo aktualizować tę politykę. Powiadomimy Cię w aplikacji przed znaczącymi zmianami."
      },
      {
        title: "12. Skontaktuj się z Nami",
        content: "Jeśli masz pytania dotyczące tej Polityki Prywatności, napisz do: lobs-word-8q@icloud.com"
      }
    ]
  },
  it: {
    title: "GOAT AI Workout – Informativa sulla Privacy",
    lastUpdated: "Ultimo aggiornamento: 3 giugno 2026",
    intro: "Questa Informativa sulla Privacy spiega come il creatore di GOAT AI Workout raccoglie, utilizza e protegge le tue informazioni personali quando utilizi l'applicazione e i servizi correlati. Utilizzando il Servizio, accetti le pratiche descritte qui.",
    sections: [
      {
        title: "1. Informazioni che Raccogliamo",
        content: "Dati account e profilo: nome, email, età, sesso, peso, altezza e obiettivi fitness. Dati di allenamento: esercizi, peso, ripetizioni, routine e note. Dati tecnici: tipo di dispositivo, sistema operativo e log degli errori. Dati Apple HealthKit (solo se autorizzato): passi, calorie, peso, distanza e minuti di esercizio."
      },
      {
        title: "2. Come Utilizziamo le Tue Informazioni",
        content: "Utilizziamo le tue informazioni per: Fornire e sincronizzare il Servizio. Personalizzare le raccomandazioni del Coach IA. Migliorare l'applicazione e correggere gli errori. Sincronizzare l'attività con Apple Watch."
      },
      {
        title: "3. Intelligenza Artificiale (Google Gemini / Firebase AI Logic)",
        content: "Quando utilizzi il Coach IA, inviamo la tua query con dati contestuali minimi (età, peso, altezza, sesso, obiettivi e un riepilogo degli allenamenti recenti) ai servizi Google tramite la loro API. Google non utilizza i dati inviati tramite le sue API commerciali (come Gemini API) per addestrare i suoi modelli AI pubblici o fondamentali. GOAT AI Workout non utilizza i tuoi dati per addestrare i propri modelli."
      },
      {
        title: "4. Dati Apple HealthKit",
        content: "I dati HealthKit vengono utilizzati solo per le funzionalità di salute e fitness. Non vengono mai venduti o utilizzati per scopi pubblicitari o di marketing. Controlli le autorizzazioni dall'app iOS Health."
      },
      {
        title: "5. Trasparenza del Tracciamento (App Tracking Transparency)",
        content: "Non tracciamo la tua attività su app o siti web di terze parti per pubblicità mirata, né utilizziamo le tue informazioni per creare profili di marketing esterni."
      },
      {
        title: "6. Condivisione dei Dati con Terze Parti",
        content: "Non vendiamo le tue informazioni personali. Condividiamo i dati solo con i seguenti fornitori per operare il Servizio: Appwrite: Autenticazione e database (vedi appwrite.io/privacy). Google Firebase / Firestore: Database e sincronizzazione (vedi firebase.google.com/support/privacy). Google Gemini API: Funzionalità del Coach IA (vedi ai.google.dev/gemini-api/terms). Apple: Elaborazione dei pagamenti e abbonamenti."
      },
      {
        title: "7. Trasferimenti Internazionali",
        content: "I tuoi dati possono essere elaborati su server situati negli Stati Uniti e in altri paesi dove operano i nostri fornitori. Adottiamo misure ragionevoli per proteggere le tue informazioni."
      },
      {
        title: "8. I Tuoi Diritti",
        content: "Puoi accedere, correggere o richiedere la cancellazione dei tuoi dati. Per esercitare questi diritti, invia un'email a lobs-word-8q@icloud.com con l'oggetto «Richiesta Diritti Dati». Puoi anche eliminare il tuo account direttamente dall'applicazione e revocare le autorizzazioni HealthKit dalle Impostazioni iOS."
      },
      {
        title: "9. Privacy dei Bambini",
        content: "Il Servizio non è rivolto ai bambini di età inferiore ai 13 anni. Non raccogliamo consapevolmente informazioni dai bambini."
      },
      {
        title: "10. Sicurezza",
        content: "Implementiamo misure di sicurezza standard del settore tramite Appwrite e Google Firebase. Nessun sistema è completamente sicuro."
      },
      {
        title: "11. Modifiche a Questa Informativa",
        content: "Possiamo aggiornare questa politica occasionalmente. Ti notificheremo all'interno dell'applicazione prima di modifiche significative."
      },
      {
        title: "12. Contattaci",
        content: "Se hai domande su questa Informativa sulla Privacy, scrivi a: lobs-word-8q@icloud.com"
      }
    ]
  },
  ru: {
    title: "GOAT AI Workout – Политика Конфиденциальности",
    lastUpdated: "Последнее обновление: 3 июня 2026",
    intro: "Эта Политика Конфиденциальности объясняет, как создатель GOAT AI Workout собирает, использует и защищает вашу личную информацию при использовании приложения и связанных услуг. Используя Сервис, вы принимаете описанные здесь практики.",
    sections: [
      {
        title: "1. Информация, Которую Мы Собираем",
        content: "Данные учетной записи и профиля: имя, электронная почта, возраст, пол, вес, рост и цели фитнеса. Данные тренировок: упражнения, вес, повторения, процедуры и заметки. Технические данные: тип устройства, операционная система и журналы ошибок. Данные Apple HealthKit (только если авторизовано): шаги, калории, вес, расстояние и минуты упражнений."
      },
      {
        title: "2. Как Мы Используем Вашу Информацию",
        content: "Мы используем вашу информацию для: Предоставления и синхронизации Сервиса. Персонализации рекомендаций AI Тренера. Улучшения приложения и исправления ошибок. Синхронизации активности с Apple Watch."
      },
      {
        title: "3. Искусственный Интеллект (Google Gemini / Firebase AI Logic)",
        content: "Когда вы используете AI Тренер, мы отправляем ваш запрос с минимальными контекстными данными (возраст, вес, рост, пол, цели и сводка последних тренировок) в сервисы Google через их API. Google не использует данные, отправленные через их коммерческие API (например, Gemini API), для обучения своих общедоступных или фундаментальных моделей AI. GOAT AI Workout также не использует ваши данные для обучения собственных моделей."
      },
      {
        title: "4. Данные Apple HealthKit",
        content: "Данные HealthKit используются только для функций здоровья и фитнеса. Они никогда не продаются и не используются в рекламных или маркетинговых целях. Вы контролируете разрешения из приложения iOS Health."
      },
      {
        title: "5. Прозрачность Отслеживания (App Tracking Transparency)",
        content: "Мы не отслеживаем вашу активность через сторонние приложения или веб-сайты для целевой рекламы и не используем вашу информацию для создания внешних маркетинговых профилей."
      },
      {
        title: "6. Совместное Использование Данных со Сторонними Лицами",
        content: "Мы не продаем вашу личную информацию. Мы делимся данными только со следующими поставщиками для работы Сервиса: Appwrite: Аутентификация и база данных (см. appwrite.io/privacy). Google Firebase / Firestore: База данных и синхронизация (см. firebase.google.com/support/privacy). Google Gemini API: Функции AI Тренера (см. ai.google.dev/gemini-api/terms). Apple: Обработка платежей и подписок."
      },
      {
        title: "7. Международные Передачи",
        content: "Ваши данные могут обрабатываться на серверах, расположенных в Соединенных Штатах и других странах, где работают наши поставщики. Мы принимаем разумные меры для защиты вашей информации."
      },
      {
        title: "8. Ваши Права",
        content: "Вы можете получить доступ к своим данным, исправить их или запросить удаление. Для осуществления этих прав отправьте электронное письмо на lobs-word-8q@icloud.com с темой «Запрос прав на данные». Вы также можете удалить свою учетную запись непосредственно из приложения и отозвать разрешения HealthKit в настройках iOS."
      },
      {
        title: "9. Конфиденциальность Детей",
        content: "Сервис не предназначен для детей моложе 13 лет. Мы не собираем информацию от детей сознательно."
      },
      {
        title: "10. Безопасность",
        content: "Мы реализуем меры безопасности отраслевого стандарта через Appwrite и Google Firebase. Никакая система не является полностью безопасной."
      },
      {
        title: "11. Изменения в Этой Политике",
        content: "Мы можем время от времени обновлять эту политику. Мы уведомим вас внутри приложения перед значительными изменениями."
      },
      {
        title: "12. Свяжитесь с Нами",
        content: "Если у вас есть вопросы об этой Политике Конфиденциальности, напишите на: lobs-word-8q@icloud.com"
      }
    ]
  },
  sv: {
    title: "GOAT AI Workout – Integritetspolicy",
    lastUpdated: "Senast uppdaterad: 3 juni 2026",
    intro: "Denna Integritetspolicy förklarar hur skaparen av GOAT AI Workout samlar in, använder och skyddar din personliga information när du använder applikationen och relaterade tjänster. Genom att använda Tjänsten accepterar du de här beskrivna praktikerna.",
    sections: [
      {
        title: "1. Information Vi Samlar In",
        content: "Konto- och profildata: namn, e-post, ålder, kön, vikt, längd och fitnessmål. Träningsdata: övningar, vikt, repetitioner, rutiner och anteckningar. Teknisk data: enhetstyp, operativsystem och felloggar. Apple HealthKit-data (endast om auktoriserat): steg, kalorier, vikt, distans och träningsminuter."
      },
      {
        title: "2. Hur Vi Använder Din Information",
        content: "Vi använder din information för: Att tillhandahålla och synkronisera Tjänsten. Att anpassa AI Coach-rekommendationer. Att förbättra applikationen och åtgärda fel. Att synkronisera aktivitet med Apple Watch."
      },
      {
        title: "3. Artificiell Intelligens (Google Gemini / Firebase AI Logic)",
        content: "När du använder AI Coach skickar vi din förfrågan med minimal kontextdata (ålder, vikt, längd, kön, mål och en sammanfattning av senaste träningspass) till Google-tjänster via deras API. Google använder inte data som skickas via deras kommersiella API:er (som Gemini API) för att träna sina offentliga eller grundläggande AI-modeller. GOAT AI Workout använder inte heller dina data för att träna sina egna modeller."
      },
      {
        title: "4. Apple HealthKit-data",
        content: "HealthKit-data används endast för hälsa- och fitnessfunktioner. De säljs aldrig eller används för reklam- eller marknadsföringsändamål. Du kontrollerar behörigheterna från iOS Health-appen."
      },
      {
        title: "5. App Tracking Transparency",
        content: "Vi spårar inte din aktivitet över tredjepartsappar eller webbplatser för riktad reklam, och vi använder inte din information för att skapa externa marknadsföringsprofiler."
      },
      {
        title: "6. Delning av Data med Tredje Part",
        content: "Vi säljer inte din personliga information. Vi delar data endast med följande leverantörer för att driva Tjänsten: Appwrite: Autentisering och databas (se appwrite.io/privacy). Google Firebase / Firestore: Databas och synkronisering (se firebase.google.com/support/privacy). Google Gemini API: AI Coach-funktioner (se ai.google.dev/gemini-api/terms). Apple: Betalningshantering och prenumerationer."
      },
      {
        title: "7. Internationella Överföringar",
        content: "Dina data kan behandlas på servrar i USA och andra länder där våra leverantörer är verksamma. Vi vidtar rimliga åtgärder för att skydda din information."
      },
      {
        title: "8. Dina Rättigheter",
        content: "Du kan komma åt, korrigera eller begära radering av dina data. För att utöva dessa rättigheter, skicka ett e-postmeddelande till lobs-word-8q@icloud.com med ämnet «Data Rights Request». Du kan också ta bort ditt konto direkt från applikationen och återkalla HealthKit-behörigheter från iOS-inställningar."
      },
      {
        title: "9. Barns Integritet",
        content: "Tjänsten är inte avsedd för barn under 13 år. Vi samlar inte medvetet in information från barn."
      },
      {
        title: "10. Säkerhet",
        content: "Vi implementerar branschstandard säkerhetsåtgärder via Appwrite och Google Firebase. Inget system är helt säkert."
      },
      {
        title: "11. Ändringar i Denna Policy",
        content: "Vi kan uppdatera denna policy då och då. Vi kommer att meddela dig i applikationen innan vi gör betydande ändringar."
      },
      {
        title: "12. Kontakta Oss",
        content: "Om du har frågor om denna Integritetspolicy, skriv till: lobs-word-8q@icloud.com"
      }
    ]
  },
  hi: {
    title: "GOAT AI Workout – गोपनीयता नीति",
    lastUpdated: "अंतिम अपडेट: 3 जून 2026",
    intro: "यह गोपनीयता नीति समझाती है कि जब आप एप्लिकेशन और संबंधित सेवाओं का उपयोग करते हैं तो GOAT AI Workout का निर्माता आपकी व्यक्तिगत जानकारी कैसे एकत्रित, उपयोग और सुरक्षित करता है। सेवा का उपयोग करके, आप यहां वर्णित प्रथाओं को स्वीकार करते हैं।",
    sections: [
      {
        title: "1. हम क्या जानकारी एकत्रित करते हैं",
        content: "खाता और प्रोफाइल डेटा: नाम, ईमेल, आयु, लिंग, वजन, ऊंचाई और फिटनेस लक्ष्य। वर्कआउट डेटा: व्यायाम, वजन, पुनरावृत्ति, दिनचर्या और नोट्स। तकनीकी डेटा: डिवाइस प्रकार, ऑपरेटिंग सिस्टम और त्रुटि लॉग। Apple HealthKit डेटा (केवल यदि अधिकृत): कदम, कैलोरी, वजन, दूरी और व्यायाम मिनट।"
      },
      {
        title: "2. हम आपकी जानकारी का उपयोग कैसे करते हैं",
        content: "हम आपकी जानकारी का उपयोग इसके लिए करते हैं: सेवा प्रदान करना और सिंक करना। AI कोच सिफारिशों को वैयक्तिकृत करना। एप्लिकेशन में सुधार करना और त्रुटियों को ठीक करना। Apple Watch के साथ गतिविधि सिंक करना।"
      },
      {
        title: "3. कृत्रिम बुद्धिमत्ता (Google Gemini / Firebase AI Logic)",
        content: "जब आप AI कोच का उपयोग करते हैं, तो हम आपकी क्वेरी को न्यूनत संदर्भ डेटा (आयु, वजन, ऊंचाई, लिंग, लक्ष्य और हाल के वर्कआउट का सारांश) के साथ उनके API के माध्यम से Google सेवाओं को भेजते हैं। Google अपने सार्वजनिक या मौलिक AI मॉडल को प्रशिक्षित करने के लिए अपने वाणिज्यिक API (जैसे Gemini API) के माध्यम से भेजे गए डेटा का उपयोग नहीं करता है। GOAT AI Workout अपने मॉडल को प्रशिक्षित करने के लिए आपके डेटा का उपयोग भी नहीं करता है।"
      },
      {
        title: "4. Apple HealthKit डेटा",
        content: "HealthKit डेटा का उपयोग केवल स्वास्थ्य और फिटनेस सुविधाओं के लिए किया जाता है। इसे कभी भी विज्ञापन या मार्केटिंग उद्देश्यों के लिए बेचा या उपयोग नहीं किया जाता है। आप iOS Health ऐप से अनुमतियों को नियंत्रित करते हैं।"
      },
      {
        title: "5. ऐप ट्रैकिंग पारदर्शिता",
        content: "हम लक्षित विज्ञापन के लिए तीसरे पक्ष के ऐप्स या वेबसाइट पर आपकी गतिविधि को ट्रैक नहीं करते हैं, और हम बाहरी मार्केटिंग प्रोफाइल बनाने के लिए आपकी जानकारी का उपयोग नहीं करते हैं।"
      },
      {
        title: "6. तीसरे पक्ष के साथ डेटा साझा करना",
        content: "हम आपकी व्यक्तिगत जानकारी नहीं बेचते हैं। हम सेवा को संचालित करने के लिए केवल निम्नलिखित प्रदाताओं के साथ डेटा साझा करते हैं: Appwrite: प्रमाणीकरण और डेटाबेस (appwrite.io/privacy देखें)। Google Firebase / Firestore: डेटाबेस और सिंक (firebase.google.com/support/privacy देखें)। Google Gemini API: AI कोच सुविधाएं (ai.google.dev/gemini-api/terms देखें)। Apple: भुगतान प्रसंस्करण और सदस्यता।"
      },
      {
        title: "7. अंतरराष्ट्रीय स्थानांतरण",
        content: "आपका डेटा संयुक्त राज्यों और अन्य देशों के सर्वर पर संसाधित हो सकता है जहां हमारे प्रदाता संचालित होते हैं। हम आपकी जानकारी की सुरक्षा के लिए उचित उपाय करते हैं।"
      },
      {
        title: "8. आपके अधिकार",
        content: "आप अपने डेटा तक पहुंच सकते हैं, उसे सुधा सकते हैं या हटाने का अनुरोध कर सकते हैं। इन अधिकारों का प्रयोग करने के लिए, विषय के साथ «डेटा अधिकार अनुरोध» के साथ lobs-word-8q@icloud.com पर ईमेल भेजें। आप सीधे ऐप्लिकेशन से अपना खाता हटा सकते हैं और iOS सेटिंग्स से HealthKit अनुमतियों को रद्द कर सकते हैं।"
      },
      {
        title: "9. बाल गोपनीयता",
        content: "सेवा 13 वर्ष से कम आयु के बच्चों के लिए नहीं है। हम जानबूदकर बच्चों से जानकारी एकत्रित नहीं करते हैं।"
      },
      {
        title: "10. सुरक्षा",
        content: "हम Appwrite और Google Firebase के माध्यम से उद्योग मानक सुरक्षा उपाय लागू करते हैं। कोई भी प्रणाली पूरी तरह सुरक्षित नहीं है।"
      },
      {
        title: "11. इस नीति में परिवर्तन",
        content: "हम समय-समय पर इस नीति को अपडेट कर सकते हैं। हम महत्वपूर्ण परिवर्तन करने से पहले आपको ऐप्लिकेशन के भीतर सूचित करेंगे।"
      },
      {
        title: "12. हमसे संपर्क करें",
        content: "यदि आपके इस गोपनीयता नीति के बारे में कोई प्रश्न हैं, तो लिखें: lobs-word-8q@icloud.com"
      }
    ]
  }
}

const PrivacyPage: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'ar' | 'pt' | 'nl' | 'pl' | 'it' | 'ru' | 'sv' | 'hi'>('en')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const content = privacyContent[language]

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border-subtle sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <a href="/" className="flex items-center gap-[2px] transition-opacity">
          {["G", "O", "A", "T"].map((letter, i) => (
            <motion.span
              key={i}
              className="text-3xl font-bold inline-block cursor-pointer"
              style={{ fontFamily: 'Righteous, cursive' }}
              whileHover={{ 
                y: -4, 
                scale: 1.1, 
                color: '#2C41FC', 
                textShadow: '0px 0px 12px rgba(44, 65, 252, 0.8)' 
              }}
              whileTap={{ 
                scale: 0.9, 
                y: 2,
                color: '#2C41FC', 
                textShadow: '0px 0px 8px rgba(44, 65, 252, 0.8)' 
              }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {letter}
            </motion.span>
          ))}
        </a>

        {/* Language Selector (Top Right) */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-text-primary font-medium text-sm"
          >
            <span>{language === 'en' ? 'EN' : language === 'es' ? 'ES' : language === 'fr' ? 'FR' : language === 'de' ? 'DE' : language === 'ja' ? 'JA' : language === 'ko' ? 'KO' : language === 'ar' ? 'AR' : language === 'pt' ? 'PT' : language === 'nl' ? 'NL' : language === 'pl' ? 'PL' : language === 'it' ? 'IT' : language === 'ru' ? 'RU' : language === 'sv' ? 'SV' : language === 'hi' ? 'HI' : language}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-[#111217] backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {[
                  { code: 'en', name: 'English' },
                  { code: 'es', name: 'Español' },
                  { code: 'fr', name: 'Français' },
                  { code: 'de', name: 'Deutsch' },
                  { code: 'ja', name: '日本語' },
                  { code: 'ko', name: '한국어' },
                  { code: 'ar', name: 'العربية' },
                  { code: 'pt', name: 'Português' },
                  { code: 'nl', name: 'Nederlands' },
                  { code: 'pl', name: 'Polski' },
                  { code: 'it', name: 'Italiano' },
                  { code: 'ru', name: 'Русский' },
                  { code: 'sv', name: 'Svenska' },
                  { code: 'hi', name: 'हिन्दी' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as any)
                      setDropdownOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-white/5 transition-colors text-sm ${
                      language === lang.code ? 'text-accent font-medium' : 'text-text-primary'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-4xl mx-auto w-full lg:px-12 lg:py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {content.title}
          </h1>
          <p className="text-text-muted text-sm">{content.lastUpdated}</p>
        </div>
        
        <p className="text-text-muted text-lg leading-relaxed">{content.intro}</p>

        <div className="space-y-10 mt-12">
          {content.sections.map((section, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-white font-semibold text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {section.title}
              </h3>
              <p className="text-text-muted text-base leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage
