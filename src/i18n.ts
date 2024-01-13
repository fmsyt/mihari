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

  memory: string;
}

const translation_en: Translation = {
  title: "Settings",
  themeMode: "Theme mode",
  alwaysOnTop: "Always on top",
  decoration: "Show title bar",

  windowConfigTitle: "Window",

  cpu: "CPU",
  cpuDisplayContentHeader: "Display content",
  cpuDisplayContentLogical: "Display usage per logical processor",
  cpuDisplayContentAggregate: "Display overall usage",

  memory: "Memory",
};

const translation_ja: Translation = {
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
