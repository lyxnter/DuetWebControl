export default {
  path: '/duet/duet_connexions',
  name: 'duet/duet_connexions',
  component: () => import('../components/duetconnexion/Layout'),
  redirect: { name: 'DuetConnexionList' },
  children: [
    {
      name: 'DuetConnexionList',
      path: '',
      component: () => import('../views/duetconnexion/List')
    },
    {
      name: 'DuetConnexionCreate',
      path: 'new',
      component: () => import('../views/duetconnexion/Create')
    },
    {
      name: 'DuetConnexionUpdate',
      path: ':id/edit',
      component: () => import('../views/duetconnexion/Update')
    },
    {
      name: 'DuetConnexionShow',
      path: ':id',
      component: () => import('../views/duetconnexion/Show')
    }
  ]
};
