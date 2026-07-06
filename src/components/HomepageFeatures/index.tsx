import type {ReactNode} from 'react';

export default function HomepageFeatures(): ReactNode {
  return (
    <section className="container margin-top--xl margin-bottom--xl">
      <div className="row">
        <div className="col col--8 col--offset-2">

          <p>
            This is where I keep notes from things I've been learning,
            building, and reading. Some pages are polished, others are simply
            references I found useful enough to write down.
          </p>

          <p>
            If something here helps someone else, that's a nice bonus.
          </p>

        </div>
      </div>
    </section>
  );
}
