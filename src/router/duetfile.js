export default {
  path: '/duet/duet_files',
  name: 'duet/duet_files',
  component: () => import('../components/duetfile/Layout'),
  redirect: { name: 'DuetFileList' },
  children: [
    {
      name: 'DuetFileList',
      path: '',
      component: () => import('../views/duetfile/List')
    },
    {
      name: 'DuetFileCreate',
      path: 'new',
      component: () => import('../views/duetfile/Create')
    },
    {
      name: 'DuetFileUpdate',
      path: ':id/edit',
      component: () => import('../views/duetfile/Update')
    },
    {
      name: 'DuetFileShow',
      path: ':id',
      component: () => import('../views/duetfile/Show')
    }
  ]
};
