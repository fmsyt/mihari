import i18next from "i18next";
import { initReactI18next } from "react-i18next";

interface Translation {
  themeMode: string;
  themeModeLight: string;
  themeModeDark: string;
  themeModeSystem: string;

  alwaysOnTop: string;
  decoration: string;

  quit: string;
}

const translation_en: Partial<Translation> = {
  themeMode: "Theme mode",
  themeModeLight: "Light",
  themeModeDark: "Dark",
  themeModeSystem: "System",

  alwaysOnTop: "Always on top",
  decoration: "Show title bar",

  quit: "Quit",
};

const translation_ja: Partial<Translation> = {
  ...translation_en,
  themeMode: "表示モード",
  themeModeLight: "ライト",
  themeModeDark: "ダーク",
  themeModeSystem: "システム",

  alwaysOnTop: "常に手前に表示",
  decoration: "タイトルバーを表示",

  quit: "終了",
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
