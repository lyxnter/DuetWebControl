import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

const opts = {
  icons: {
    iconfont: 'mdi'
  },
  theme: {
    themes: {
      dark: {
        primary: '#fcb603',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
      },
      darken1: {
        primary: '#ca9102',
      },
      darken2: {
        primary: '#976d02',
      },
      darken3: {
        primary: '#654901',
      },
      darken4: {
        primary: '#322401',
      },
      lighten1: {
        primary: '#fdbd1c',
      },
      lighten2: {
        primary: '#fdc435',
      },
      lighten3: {
        primary: '#fdcc4e',
      },
      lighten4: {
        primary: '#fdd368',
      },
      lighten5: {
        primary: '#feda81',
      },

    },
    dark: true,
  },
};

export default new Vuetify(opts);
