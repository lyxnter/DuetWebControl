export default {
  path: '/duet/duet_videos',
  name: 'duet/duet_videos',
  component: () => import('../components/duetvideo/Layout'),
  redirect: { name: 'DuetVideoList' },
  children: [
    {
      name: 'DuetVideoList',
      path: '',
      component: () => import('../views/duetvideo/List')
    },
    {
      name: 'DuetVideoCreate',
      path: 'new',
      component: () => import('../views/duetvideo/Create')
    },
    {
      name: 'DuetVideoUpdate',
      path: ':id/edit',
      component: () => import('../views/duetvideo/Update')
    },
    {
      name: 'DuetVideoShow',
      path: ':id',
      component: () => import('../views/duetvideo/Show')
    }
  ]
};
