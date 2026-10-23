import React from 'react';
import { Link } from 'react-router-dom';
import './Inicio.css';

export function Inicio() {
  document.title = 'Hello People — Início';

  return (
    <div className="inicio-page">
      {/* Nav */}
      <nav className="inicio-nav">
        <div className="inicio-nav-inner">
          <span className="inicio-brand">Hello People</span>
          <div className="inicio-nav-links">
            <span className="inicio-nav-link inicio-nav-link--active">Início</span>
            <Link to="/contato" className="inicio-nav-link">Contato</Link>
            <Link to="/login" className="inicio-nav-btn--outline">Entrar</Link>
            <Link to="/cadastro" className="inicio-nav-btn--primary">Cadastrar</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="inicio-hero">
        <div className="inicio-hero-text">
          <div className="inicio-badge">COLEÇÃO INVERNO '26</div>
          <div className="inicio-logo-big">Hello People</div>
          <h1 className="inicio-headline">Streetwear que fala<br />a sua língua.</h1>
          <p className="inicio-sub">
            Peças casuais, urbanas e autorais. Vista a atitude da Hello People
            — do nosso ateliê direto pra sua quebrada.
          </p>
          <div className="inicio-ctas">
            <Link to="/cadastro" className="inicio-cta--primary">Criar conta</Link>
            <Link to="/login" className="inicio-cta--outline">Já sou cliente</Link>
          </div>
          <div className="inicio-stats">
            <div>
              <div className="inicio-stat-num">2.4k+</div>
              <div className="inicio-stat-lbl">Clientes fiéis</div>
            </div>
            <div>
              <div className="inicio-stat-num">320</div>
              <div className="inicio-stat-lbl">Modelos exclusivos</div>
            </div>
            <div>
              <div className="inicio-stat-num">4.9★</div>
              <div className="inicio-stat-lbl">Avaliação média</div>
            </div>
          </div>
        </div>
        <div className="inicio-hero-img">
          <div className="inicio-img-placeholder">
            <span>lookbook / foto streetwear</span>
          </div>
        </div>
      </section>
    </div>
  );
}
