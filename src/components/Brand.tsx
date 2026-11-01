export function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href={import.meta.env.BASE_URL}>
        <span className="brand-mark" aria-hidden="true">
          g<span>_</span>
        </span>
        glitchme<span className="brand-period">.</span>
      </a>
      <a
        className="github-link"
        href="https://github.com/ngynkvn/glitchme"
        target="_blank"
        rel="noreferrer"
      >
        Open source <span aria-hidden="true">↗</span>
      </a>
    </header>
  )
}

export function Intro() {
  return (
    <div className="intro">
      <div>
        <p className="eyebrow">
          <span /> IMAGE EDITOR
        </p>
        <h1>
          Pixel <em>sorting.</em>
        </h1>
        <p className="intro-description">
          Sort pixels into streaks. Adjust the effect and export a PNG.
        </p>
      </div>
    </div>
  )
}
