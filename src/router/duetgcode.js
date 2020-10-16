export default {
  path: '/duet/duet_gcodes',
  name: 'duet/duet_gcodes',
  component: () => import('../components/duetgcode/Layout'),
  redirect: { name: 'DuetGcodeList' },
  children: [
    {
      name: 'DuetGcodeList',
      path: '',
      component: () => import('../views/duetgcode/List')
    },
    {
      name: 'DuetGcodeCreate',
      path: 'new',
      component: () => import('../views/duetgcode/Create')
    },
    {
      name: 'DuetGcodeUpdate',
      path: ':id/edit',
      component: () => import('../views/duetgcode/Update')
    },
    {
      name: 'DuetGcodeShow',
      path: ':id',
      component: () => import('../views/duetgcode/Show')
    }
  ]
};
