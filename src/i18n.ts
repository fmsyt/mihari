import i18next from "i18next";
import { initReactI18next } from "react-i18next";

interface Translation {
  title: string;
  themeMode: string;
  alwaysOnTop: string;
  decoration: string;

  windowConfigTitle: string;

  cpu: string;
  cpuDisplayContentHeader: string;
  cpuDisplayContentLogical: string;
  cpuDisplayContentAggregate: string;

  cpuDisplayCalculationHeader: string;
  cpuDisplayCalculationIncludeIdle: string;
  cpuDisplayCalculationExcludeIdle: string;
  cpuDisplayCalculationIncludeIdleHelper: string;
  cpuDisplayCalculationExcludeIdleHelper: string;

  memory: string;
}

const translation_en: Partial<Translation> = {
  title: "Settings",
  themeMode: "Theme mode",
  alwaysOnTop: "Always on top",
  decoration: "Show title bar",

  windowConfigTitle: "Window",

  cpu: "CPU",
  cpuDisplayContentHeader: "Display content",
  cpuDisplayContentLogical: "Display usage per logical processor",
  cpuDisplayContentAggregate: "Display overall usage",

  cpuDisplayCalculationHeader: "Calculation method",
  cpuDisplayCalculationIncludeIdle: "Include idle",
  cpuDisplayCalculationExcludeIdle: "Exclude idle",
  cpuDisplayCalculationIncludeIdleHelper: "The general method of calculating usage. It represents the reservation status of CPU resources. Includes the time to get data.",
  cpuDisplayCalculationExcludeIdleHelper: "It represents the percentage of resources being calculated. It may exceed 100% due to specifications.",

  memory: "Memory",
};

const translation_ja: Partial<Translation> = {
  ...translation_en,
  title: "設定",
  themeMode: "表示モード",
  alwaysOnTop: "常に手前に表示",
  decoration: "タイトルバーを表示",

  windowConfigTitle: "画面",

  cpu: "CPU",
  cpuDisplayContentHeader: "表示内容",
  cpuDisplayContentLogical: "論理プロセッサごとの使用率を表示",
  cpuDisplayContentAggregate: "全体的な使用率を表示",

  cpuDisplayCalculationHeader: "使用率の計算方法",
  cpuDisplayCalculationIncludeIdle: "アイドル状態を含める",
  cpuDisplayCalculationExcludeIdle: "稼働状態のみを表示",
  cpuDisplayCalculationIncludeIdleHelper: "一般的な使用率の計算方法です。CPUリソースの予約状況を表します。データ取得の時間を含みます。",
  cpuDisplayCalculationExcludeIdleHelper: "計算中のリソースの割合を表します。仕様上、100%を超えることがあります。",

  memory: "メモリ",
};

i18next
  .use(initReactI18next)
  .init({
    resources: {
      ja: {
        translation: translation_ja
      },
      en: {
        translation: translation_en
      }
    },
    lng: "ja",
    interpolation: {
      escapeValue: false
    }
  });

const i18n = {
  ...i18next,
  t: (key: keyof Translation) => i18next.t(key)
}

export default i18n;
