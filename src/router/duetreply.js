export default {
  path: '/duet/duet_replies',
  name: 'duet/duet_replies',
  component: () => import('../components/duetreply/Layout'),
  redirect: { name: 'DuetReplyList' },
  children: [
    {
      name: 'DuetReplyList',
      path: '',
      component: () => import('../views/duetreply/List')
    },
    {
      name: 'DuetReplyCreate',
      path: 'new',
      component: () => import('../views/duetreply/Create')
    },
    {
      name: 'DuetReplyUpdate',
      path: ':id/edit',
      component: () => import('../views/duetreply/Update')
    },
    {
      name: 'DuetReplyShow',
      path: ':id',
      component: () => import('../views/duetreply/Show')
    }
  ]
};
