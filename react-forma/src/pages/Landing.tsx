import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export function Landing() {
  return (
    <>
      <Navbar />
      {/* Hero */}
      <section className="landing-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="hero-copy animate-fade-in">
                <h1 className="hero-title fw-bold mb-4">
                  Forma+ — <br />
                  Vaš moderni <br />
                  fitnes pratilac
                </h1>
                <p className="hero-subtitle text-secondary-pro mb-5">
                  Trenirajte pametnije uz personalizirane planove, uvide u napredak i 
                  besprijekorna saradnja između trenera i klijenata.
                </p>
                <div className="hero-actions mb-4">
                  <Link to="/register" className="btn-hero-primary">
                    Počni odmah
                  </Link>
                  <Link to="/login" className="btn-hero-secondary">
                    Već imam račun
                  </Link>
                </div>
                <div className="hero-features">
                  <div className="feature-item">
                    <i className="bi bi-shield-check"></i>
                    <span>Nije potrebna kreditna kartica</span>
                  </div>
                  <div className="feature-item">
                    <i className="bi bi-lightning-charge"></i>
                    <span>Brzo, odzivno i sigurno</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-card">
                <div className="card-header">
                  <div className="badge-new">Novo</div>
                  <span className="card-title">Prelijepa analitika i izvještaji</span>
                </div>
                <div className="card-content">
                  <div className="feature-list">
                    <div className="feature-item">
                      <i className="bi bi-graph-up-arrow"></i>
                      <span>Pratite težinu, procenat masti i još mnogo toga</span>
                    </div>
                    <div className="feature-item">
                      <i className="bi bi-calendar-check"></i>
                      <span>Planirajte i upravljajte sesijama</span>
                    </div>
                    <div className="feature-item">
                      <i className="bi bi-people"></i>
                      <span>Komunikacija između trenera i klijenta</span>
                    </div>
                    <div className="feature-item">
                      <i className="bi bi-award"></i>
                      <span>Otključajte dostignuća dok napredujete</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-person-workspace"></i>
                </div>
                <h5 className="feature-title">Za trenere</h5>
                <p className="feature-description">
                  Kreirajte planove treninga i ishrane, zakazujte sesije i pratite napredak klijenata na jednom mjestu.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-activity"></i>
                </div>
                <h5 className="feature-title">Za klijente</h5>
                <p className="feature-description">
                  Pratite personalizirane planove, beležite svoj napredak i ostanite motivovani uz dostignuća i uvide.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-shield-lock"></i>
                </div>
                <h5 className="feature-title">Privatnost na prvom mjestu</h5>
                <p className="feature-description">
                  Vaši podaci ostaju na vašem uređaju uz sigurno lokalno skladištenje. Nema servera, nema curenja.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="reviews-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h3 className="section-title fw-bold">Šta kažu korisnici</h3>
            <p className="section-subtitle">Pravi povratni komentari od zadovoljnih trenera i klijenata</p>
          </div>
          <div id="reviewsCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="review-card mx-auto">
                  <div className="review-stars">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                  <blockquote className="review-text">
                    "Forma+ je transformisala način kako upravljam svojim klijentima — raspored, planovi i napredak u minutama."
                  </blockquote>
                  <div className="review-author">— Marko S., Trener snage</div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="review-card mx-auto">
                  <div className="review-stars">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star"></i>
                  </div>
                  <blockquote className="review-text">
                    "Grafici i PDF izvještaji me drže odgovornima. Konačno jasno vidim svoj napredak."
                  </blockquote>
                  <div className="review-author">— Ana K., Klijent</div>
                </div>
              </div>
              <div className="carousel-item">
                <div className="review-card mx-auto">
                  <div className="review-stars">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-half"></i>
                  </div>
                  <blockquote className="review-text">
                    "Brzo, lijepo i lako za korištenje. Poruke i zakazivanje su spas."
                  </blockquote>
                  <div className="review-author">— Nina M., Personalni trener</div>
                </div>
              </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#reviewsCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Prethodna</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#reviewsCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Sljedeća</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">Forma+ © {new Date().getFullYear()}</div>
            <div className="footer-links">
              <Link to="/login" className="footer-link">Prijava</Link>
              <Link to="/register" className="footer-link">Registracija</Link>
              <a className="footer-link" href="#reviewsCarousel">Recenzije</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Landing


