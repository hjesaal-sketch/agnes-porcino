import React, { useState } from 'react';

// Props para recibir métodos de login y notificaciones
interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  errorMessage?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, errorMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(email.trim(), password);
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 400,
        margin: '2rem auto',
        background: '#fff',
        padding: '2rem',
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(50,80,40,0.05)'
      }}
    >
      {/* Logo AGNES grande y centrado, SIN textos */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.8rem' }}>
        <img
          src={require('./agnes_logo.png')}
          alt="Logo AGNES"
          style={{ width: 160, maxWidth: '85%', height: 'auto' }}
        />
      </div>

      {errorMessage && (
        <div style={{
          background: '#ffecec',
          color: '#b22222',
          borderRadius: 4,
          padding: '0.75rem',
          marginBottom: 12,
          textAlign: 'center',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          {errorMessage}
        </div>
      )}
      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="email" style={{ fontWeight: 600 }}>Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.65rem',
            marginTop: 2,
            borderRadius: 4,
            border: '1px solid #cccccc'
          }}
        />
      </div>
      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="password" style={{ fontWeight: 600 }}>Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.65rem',
            marginTop: 2,
            borderRadius: 4,
            border: '1px solid #cccccc'
          }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          background: '#226b32',
          color: '#fff',
          fontWeight: 700,
          border: 'none',
          borderRadius: 4,
          padding: '0.8rem',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      {/* Mujer con cerdo adornando debajo de los campos */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2.2rem' }}>
        <img
          src={require('./generated-image-2.png')}
          alt="Mujer joven con cerdo"
          style={{
            width: 120,
            maxWidth: '85%',
            height: 'auto',
            borderRadius: 18,
            boxShadow: '0 2px 8px rgba(40,60,30,0.09)'
          }}
        />
      </div>
    </form>
  );
};

export default LoginForm;
