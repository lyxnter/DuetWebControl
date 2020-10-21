export default {
  path: '/users',
  name: 'users',
  component: () => import('../components/user/Layout'),
  redirect: { name: 'UserList' },
  meta: {
    breadcrumb: 'administration.user.users',
  },
  children: [
    {
      name: 'UserList',
      path: '',
      component: () => import('../views/user/List'),
      meta: {
        breadcrumb: 'global.list',
      },
    },
    /*
    {
      name: 'UserCreate',
      path: 'new',
      component: () => import('../views/user/Create'),
      meta: {
        breadcrumb: 'global.add',
      },
    },
    {
      name: 'UserUpdate',
      path: ':id/edit',
      component: () => import('../views/user/Update'),
      meta: {
        breadcrumb: 'administration.user.user',
      },
    },
    */
    {
      name: 'UserShow',
      path: ':id',
      component: () => import('../views/user/Show'),
      meta: {
        breadcrumb: 'administration.user.user',
      },
    }
  ]
};
