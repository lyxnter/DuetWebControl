import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en_messages from './locales/en';
import fr_messages from './locales/fr';

Vue.use(VueI18n);

export default new VueI18n({
  locale: process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: {
    en: en_messages,
    fr: fr_messages
  }
});
