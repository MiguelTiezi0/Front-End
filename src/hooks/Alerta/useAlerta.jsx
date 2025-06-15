import React, { createContext, useContext, useState, useRef } from "react";
import "./useAlerta.css";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerta, setAlerta] = useState(null);
  const timeoutRef = useRef(null);

  const showAlert = (mensagem, tipo) => {
    setAlerta({ mensagem, tipo });

    // Limpa timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Fecha automaticamente após 3s
    timeoutRef.current = setTimeout(() => {
      setAlerta(null);
      timeoutRef.current = null;
    }, 3000);
  };

  const fecharAlerta = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAlerta(null);
  };

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      {alerta && (
        <div className={`alerta alerta-${alerta.tipo}`}>
          <h1>MigTiera Diz:</h1>
          <p>{alerta.mensagem}</p>
          <button onClick={fecharAlerta}>OK</button>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlerta = () => useContext(AlertContext);
