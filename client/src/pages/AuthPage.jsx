import { useState } from 'react';

const roleOptions = ['student', 'employee', 'faculty', 'hr', 'admin', 'guest'];

export function AuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'General',
  });

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await onLogin({ email: form.email, password: form.password });
      } else {
        await onRegister(form);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">NoticeBoard</p>
          <h1>Smart digital notices with live updates.</h1>
          <p>
            Publish, schedule, and share notices instantly with role-based access, file attachments,
            and a real-time notification feed.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="segmented-control">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
              Login
            </button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
              Register
            </button>
          </div>

          {mode === 'register' ? (
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          ) : null}

          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>

          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>

          {mode === 'register' ? (
            <>
              <label>
                Role
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Department
                <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
              </label>
            </>
          ) : null}

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="primary-button">
            {mode === 'login' ? 'Enter dashboard' : 'Create account'}
          </button>
        </form>
      </div>
    </section>
  );
}
