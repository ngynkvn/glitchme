export function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href={import.meta.env.BASE_URL}>
        <span className="brand-mark" aria-hidden="true">
          g<span>_</span>
        </span>
        glitchme<span className="brand-period">.</span>
      </a>
      <span className="header-note">A LITTLE DISORDER BY DESIGN</span>
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
          <span /> THE PIXEL SORTING PLAYGROUND
        </p>
        <h1>
          Perfectly <em>imperfect.</em>
        </h1>
        <p className="intro-description">Turn ordinary images into extraordinary accidents.</p>
      </div>
      <div className="intro-stamp" aria-hidden="true">
        <span>LESS</span>
        <strong>CONTROL.</strong>
        <span>MORE POSSIBILITY. ↗</span>
      </div>
    </div>
  )
}
