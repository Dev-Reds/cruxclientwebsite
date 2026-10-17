export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'de', name: 'Deutsch', file: 'de.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'de',
    langDir: 'locales',
    strategy: 'prefix_except_default'
  }
})   