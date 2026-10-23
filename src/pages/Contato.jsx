import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Camera, ThumbsUp, MessageCircle, ArrowLeft } from 'lucide-react';
import './Contato.css';

const INFO = [
  { icon: MapPin,  label: 'ENDEREÇO', value: 'Rua Luiz Henrique, 240 — Florianópolis/SC' },
  { icon: Phone,   label: 'TELEFONE', value: '(48) 3025-1180' },
  { icon: Mail,    label: 'E-MAIL',   value: 'contato@hellopeople.com.br' },
  { icon: Clock,   label: 'HORÁRIO',  value: 'Seg a Sáb · 09h às 19h' },
];

export function Contato() {
  document.title = 'Contato — Hello People';

  return (
    <div className="contato-page">
      {/* Header */}
      <div className="contato-header-bar">
        <div className="contato-header-inner">
          <Link to="/inicio" className="contato-brand">Hello People</Link>
          <Link to="/inicio" className="contato-back">
            <ArrowLeft size={16} /> Voltar ao início
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="contato-body">
        <h1 className="contato-title">Fale com a gente</h1>
        <p className="contato-sub">Estamos prontos pra te atender — passa na loja ou manda mensagem.</p>

        <div className="contato-grid">
          {/* Info card */}
          <div className="contato-info-card">
            {INFO.map(({ icon: Icon, label, value }) => (
              <div key={label} className="contato-info-row">
                <div className="contato-info-icon">
                  <Icon size={20} color="#C99700" />
                </div>
                <div>
                  <div className="contato-info-label">{label}</div>
                  <div className="contato-info-value">{value}</div>
                </div>
              </div>
            ))}
            <div className="contato-socials">
              <div className="contato-social-btn"><Camera size={20} color="#F5C518" /></div>
              <div className="contato-social-btn"><ThumbsUp size={20} color="#F5C518" /></div>
              <div className="contato-social-btn"><MessageCircle size={20} color="#F5C518" /></div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="contato-map-card">
            <div className="contato-map-placeholder">mapa da loja</div>
          </div>
        </div>
      </div>
    </div>
  );
}
