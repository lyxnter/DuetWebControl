export default {
  path: '/duet/duet_configs',
  name: 'duet/duet_configs',
  component: () => import('../components/duetconfig/Layout'),
  redirect: { name: 'DuetConfigList' },
  children: [
    {
      name: 'DuetConfigList',
      path: '',
      component: () => import('../views/duetconfig/List')
    },
    {
      name: 'DuetConfigCreate',
      path: 'new',
      component: () => import('../views/duetconfig/Create')
    },
    {
      name: 'DuetConfigUpdate',
      path: ':id/edit',
      component: () => import('../views/duetconfig/Update')
    },
    {
      name: 'DuetConfigShow',
      path: ':id',
      component: () => import('../views/duetconfig/Show')
    }
  ]
};
