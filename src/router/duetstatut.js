export default {
  path: '/duet/duet_statuts',
  name: 'duet/duet_statuts',
  component: () => import('../components/duetstatut/Layout'),
  redirect: { name: 'DuetStatutList' },
  children: [
    {
      name: 'DuetStatutList',
      path: '',
      component: () => import('../views/duetstatut/List')
    },
    {
      name: 'DuetStatutCreate',
      path: 'new',
      component: () => import('../views/duetstatut/Create')
    },
    {
      name: 'DuetStatutUpdate',
      path: ':id/edit',
      component: () => import('../views/duetstatut/Update')
    },
    {
      name: 'DuetStatutShow',
      path: ':id',
      component: () => import('../views/duetstatut/Show')
    }
  ]
};
