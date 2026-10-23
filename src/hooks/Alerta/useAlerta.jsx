import React, { createContext, useContext, useState, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './useAlerta.css';

const AlertContext = createContext();

const TYPE_CONFIG = {
  sucesso: { icon: CheckCircle, color: '#2F8F5B' },
  erro:    { icon: AlertCircle, color: '#C9453F' },
  aviso:   { icon: Info,        color: '#C99700' },
};

export const AlertProvider = ({ children }) => {
  const [alerta, setAlerta] = useState(null);
  const timerRef = useRef(null);

  const showAlert = (mensagem, tipo = 'sucesso') => {
    setAlerta({ mensagem, tipo });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setAlerta(null); timerRef.current = null; }, 2800);
  };

  const fechar = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setAlerta(null);
  };

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      {alerta && (() => {
        const cfg = TYPE_CONFIG[alerta.tipo] || TYPE_CONFIG.sucesso;
        const Icon = cfg.icon;
        return (
          <div className="hp-toast" style={{ borderLeftColor: cfg.color }}>
            <Icon size={20} color={cfg.color} />
            <span className="hp-toast-msg">{alerta.mensagem}</span>
            <button className="hp-toast-close" onClick={fechar}><X size={16} /></button>
          </div>
        );
      })()}
    </AlertContext.Provider>
  );
};

export const useAlerta = () => useContext(AlertContext);
