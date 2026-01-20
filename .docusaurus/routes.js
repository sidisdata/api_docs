import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '6e4'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '35c'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'b32'),
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
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
