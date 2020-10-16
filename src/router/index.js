import Vue from 'vue';
import VueRouter from 'vue-router';
import duetconfigRoutes from './duetconfig';
import duetconnexionRoutes from './duetconnexion';
import duetfileRoutes from './duetfile';
import duetgcodeRoutes from './duetgcode';
import duetreplyRoutes from './duetreply';
import duetstatutRoutes from './duetstatut';
import duetvideoRoutes from './duetvideo';

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  routes: [duetconfigRoutes, duetconnexionRoutes, duetfileRoutes, duetgcodeRoutes, duetreplyRoutes, duetstatutRoutes, duetvideoRoutes]
});
