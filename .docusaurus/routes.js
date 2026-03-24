import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/api_docs/docs',
    component: ComponentCreator('/api_docs/docs', '8fb'),
    routes: [
      {
        path: '/api_docs/docs',
        component: ComponentCreator('/api_docs/docs', 'c3d'),
        routes: [
          {
            path: '/api_docs/docs',
            component: ComponentCreator('/api_docs/docs', '6df'),
            routes: [
              {
                path: '/api_docs/docs/',
                component: ComponentCreator('/api_docs/docs/', 'acc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/api_docs/docs/api-documentation',
                component: ComponentCreator('/api_docs/docs/api-documentation', '715'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/api_docs/docs/api-interactive',
                component: ComponentCreator('/api_docs/docs/api-interactive', '248'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/api_docs/docs/auth-api-documentation',
                component: ComponentCreator('/api_docs/docs/auth-api-documentation', '71f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/api_docs/docs/intro',
                component: ComponentCreator('/api_docs/docs/intro', '699'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/api_docs/docs/license',
                component: ComponentCreator('/api_docs/docs/license', '31b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/api_docs/docs/permissions-documentation',
                component: ComponentCreator('/api_docs/docs/permissions-documentation', '149'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/api_docs/docs/webhook-executions',
                component: ComponentCreator('/api_docs/docs/webhook-executions', 'e6c'),
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
    path: '/api_docs/',
    component: ComponentCreator('/api_docs/', '3f4'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
