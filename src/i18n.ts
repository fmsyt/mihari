import i18n from "i18next";
import { initReactI18next } from "react-i18next";

interface Translation {
  title: string;
  themeMode: string;
  alwaysOnTop: string;
  decoration: string;
}

const translation_ja: Translation = {
  title: "設定",
  themeMode: "表示モード",
  alwaysOnTop: "常に手前に表示する",
  decoration: "タイトルバーを表示する",
};

const translation_en: Translation = {
  title: "Settings",
  themeMode: "Theme mode",
  alwaysOnTop: "Always on top",
  decoration: "Show title bar",
};


i18n
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

export default i18n;
