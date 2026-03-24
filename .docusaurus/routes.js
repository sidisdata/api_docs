import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'dfe'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'da0'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '7f8'),
            routes: [
              {
                path: '/docs/',
                component: ComponentCreator('/docs/', 'ee3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/api-documentation',
                component: ComponentCreator('/docs/api-documentation', '560'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/api-interactive',
                component: ComponentCreator('/docs/api-interactive', '8f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/auth-api-documentation',
                component: ComponentCreator('/docs/auth-api-documentation', '489'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/license',
                component: ComponentCreator('/docs/license', '773'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/webhook-executions',
                component: ComponentCreator('/docs/webhook-executions', '390'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
