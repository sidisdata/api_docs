import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Complete API documentation for SIDIS platform">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className="col col--4">
                <div className="text--center">
                  <h3>🚀 Complete API Reference</h3>
                  <p>
                    Comprehensive documentation for all SIDIS API endpoints with interactive examples.
                  </p>
                </div>
              </div>
              <div className="col col--4">
                <div className="text--center">
                  <h3>🔐 Authentication</h3>
                  <p>
                    Detailed authentication guide to secure your API connections and manage tokens.
                  </p>
                </div>
              </div>
              <div className="col col--4">
                <div className="text--center">
                  <h3>⚡ Interactive Testing</h3>
                  <p>
                    Test API endpoints directly from the documentation with live examples.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}