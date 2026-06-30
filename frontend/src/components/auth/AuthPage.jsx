import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./AuthPage.css";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function AuthPage() {
  const { login, loginWithGoogle, register } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });

  function handleLoginChange(e) {
    e.preventDefault();
    setLoginForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleRegisterChange(e) {
    setRegisterForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleGoogleSignIn() {
    setError("");
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("account-exists-with-different-credential")) {
        setError(t('auth.err.diffCred'));
      } else {
        setError(err?.data?.message || msg || t('auth.err.googleFail'));
      }
      setGoogleLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!loginForm.email || !loginForm.password) { setError(t('auth.err.fillAll')); return; }
    try {
      setLoading(true);
      await login(loginForm.email, loginForm.password);
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        setError(t('auth.err.invalidCred'));
      } else if (msg.includes("too-many-requests")) {
        setError(t('auth.err.tooMany'));
      } else {
        setError(err?.data?.message || msg || t('auth.err.loginFail'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    const { firstName, lastName, email, password, confirmPassword } = registerForm;
    if (!firstName || !lastName || !email || !password) { setError(t('auth.err.fillAllRequired')); return; }
    if (password.length < 6) { setError(t('auth.err.pwLength')); return; }
    if (password !== confirmPassword) { setError(t('auth.err.pwMatch')); return; }
    try {
      setLoading(true);
      await register(firstName, lastName, email, password);
    } catch (err) {
      const msg = err?.data?.message || err?.message || "";
      if (msg.includes("EMAIL_TAKEN") || msg.includes("email-already-in-use") || msg.includes("Email already")) {
        setError(t('auth.err.emailExists'));
      } else {
        setError(msg || t('auth.err.registerFail'));
      }
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t) { setTab(t); setError(""); }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="rgba(255,255,255,0.2)"/>
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="white"/>
              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div>
            <h1 className="auth-brand-title">{t('auth.appTitle')}</h1>
            <p className="auth-brand-sub">{t('auth.appSubtitle')}</p>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => switchTab("login")} type="button">
              {t('auth.signIn')}
            </button>
            <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => switchTab("register")} type="button">
              {t('auth.createAccount')}
            </button>
          </div>

          <div className="auth-card-body">
            {error && (
              <div className="auth-alert auth-alert-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {tab === "login" && (
              <form className="auth-form" onSubmit={handleLogin} noValidate>
                <div className="auth-greeting">
                  <h2 className="auth-heading">{t('auth.welcomeBack')}</h2>
                  <p className="auth-subheading">{t('auth.signInSubtitle')}</p>
                </div>

                <div className="auth-field">
                  <label className="auth-label">{t('auth.email')}</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input type="email" name="email" className="auth-input" placeholder="you@example.com" value={loginForm.email} onChange={handleLoginChange} autoComplete="email" autoFocus />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">{t('auth.password')}</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input type="password" name="password" className="auth-input" placeholder="••••••••" value={loginForm.password} onChange={handleLoginChange} autoComplete="current-password" />
                  </div>
                </div>

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? <span className="auth-btn-loading"><span className="auth-spinner" />{t('auth.signingIn')}</span> : t('auth.signIn')}
                </button>

                <div className="auth-divider"><span>{t('auth.or')}</span></div>

                <button type="button" className="auth-google-btn" onClick={handleGoogleSignIn} disabled={googleLoading || loading}>
                  {googleLoading
                    ? <span className="auth-btn-loading"><span className="auth-spinner auth-spinner-dark" />{t('auth.connecting')}</span>
                    : <><GoogleIcon />{t('auth.google')}</>
                  }
                </button>

                <p className="auth-switch">
                  {t('auth.noAccount')}{" "}
                  <button type="button" className="auth-switch-link" onClick={() => switchTab("register")}>{t('auth.createOne')}</button>
                </p>
              </form>
            )}

            {tab === "register" && (
              <form className="auth-form" onSubmit={handleRegister} noValidate>
                <div className="auth-greeting">
                  <h2 className="auth-heading">{t('auth.createTitle')}</h2>
                  <p className="auth-subheading">{t('auth.createSubtitle')}</p>
                </div>

                <div className="auth-row">
                  <div className="auth-field">
                    <label className="auth-label">{t('auth.firstName')}</label>
                    <input type="text" name="firstName" className="auth-input auth-input-plain" placeholder="Musabbereen" value={registerForm.firstName} onChange={handleRegisterChange} autoComplete="given-name" autoFocus />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">{t('auth.lastName')}</label>
                    <input type="text" name="lastName" className="auth-input auth-input-plain" placeholder="Khan" value={registerForm.lastName} onChange={handleRegisterChange} autoComplete="family-name" />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">{t('auth.email')}</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input type="email" name="email" className="auth-input" placeholder="you@example.com" value={registerForm.email} onChange={handleRegisterChange} autoComplete="email" />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">{t('auth.password')}</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input type="password" name="password" className="auth-input" placeholder={t('auth.pwPlaceholder')} value={registerForm.password} onChange={handleRegisterChange} autoComplete="new-password" />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">{t('auth.confirmPassword')}</label>
                  <div className="auth-input-wrap">
                    <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input type="password" name="confirmPassword" className="auth-input" placeholder="••••••••" value={registerForm.confirmPassword} onChange={handleRegisterChange} autoComplete="new-password" />
                  </div>
                </div>

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? <span className="auth-btn-loading"><span className="auth-spinner" />{t('auth.creatingAccount')}</span> : t('auth.createAccount')}
                </button>

                <div className="auth-divider"><span>{t('auth.or')}</span></div>

                <button type="button" className="auth-google-btn" onClick={handleGoogleSignIn} disabled={googleLoading || loading}>
                  {googleLoading
                    ? <span className="auth-btn-loading"><span className="auth-spinner auth-spinner-dark" />{t('auth.connecting')}</span>
                    : <><GoogleIcon />{t('auth.google')}</>
                  }
                </button>

                <p className="auth-switch">
                  {t('auth.hasAccount')}{" "}
                  <button type="button" className="auth-switch-link" onClick={() => switchTab("login")}>{t('auth.signInLink')}</button>
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="auth-footer">{t('auth.footer')} &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default AuthPage;
