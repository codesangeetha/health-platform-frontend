import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/landing-page.css';
import '../../styles/components/patient-login.styles.css';


type FieldErrors = {
    email?: string;
    password?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin, authState } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [submitting, setSubmitting] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Validation states
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
        email: false,
        password: false,
    });

    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Validation helpers
    const validateEmail = (value: string): string | undefined => {
        const v = value.trim();
        if (!v) return 'Email is required.';
        if (!emailRegex.test(v)) return 'Enter a valid email address.';
        return undefined;
    };

    const validatePassword = (value: string): string | undefined => {
        if (!value) return 'Password is required.';
        if (value.length < 8) return 'Password must be at least 8 characters.';
        return undefined;
    };

    const validateField = (name: 'email' | 'password', value: string): string | undefined => {
        if (name === 'email') return validateEmail(value);
        if (name === 'password') return validatePassword(value);
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: FieldErrors = {
            email: validateEmail(email),
            password: validatePassword(password),
        };
        setErrors(newErrors);
        return !newErrors.email && !newErrors.password;
    };

    const handleInvalidCredentials = (message?: string) => {
        const msg = message || 'Invalid email or password';
        setErrors({
            email: msg,
            password: msg,
        });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        // Client-side validation
        const isValid = validateForm();
        if (!isValid) {
            setTouched({ email: true, password: true });
            return;
        }

        try {
            setSubmitting(true);
            await login(email, password);
            if (authState?.error) {
                const ctxErr = (authState as any)?.errorCode || (authState as any)?.code || authState.error;
                if (ctxErr === 'INVALID_CREDENTIALS' || /invalid email or password/i.test(String(authState.error))) {
                    handleInvalidCredentials(typeof authState.error === 'string' ? authState.error : undefined);
                    return;
                }
                setFormError(authState.error);
            }
        } catch (error: any) {
            const message = error?.message || 'An error occurred during sign in.';
            setFormError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const name = id as 'email' | 'password';
        setTouched((t) => ({ ...t, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === 'email') {
            setEmail(value);
            if (touched.email) {
                setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
            }
        }
        if (id === 'password') {
            setPassword(value);
            if (touched.password) {
                setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
            }
        }
        // Clear form-level error if user starts editing again
        if (formError) setFormError(null);
    };

    useEffect(() => {
        if (authState.isAuthenticated && !authState.isLoading) {
            // Get the redirect location from state or default to admin dashboard
            const from = location.state?.from?.pathname || '/admin/dashboard';
            navigate(from, { replace: true });
        }
    }, [authState.isAuthenticated, authState.isLoading, navigate, location]);

    return (
        <div>
            <header className={`hc-header ${scrolled ? 'scrolled' : ''}`}>
                <div className="hc-container hc-header__inner">
                    <Link to="/" className="hc-logo" aria-label="HealthCare+ Home">
                        <span className="hc-logo__mark">+</span>
                        <span>HealthCare+</span>
                    </Link>
                    <nav className="hc-nav" aria-label="Primary">
                        <Link to="/">Home</Link>
                        <a href="#services">Services</a>
                        <a href="#about">About Us</a>
                        <a href="#contact">Contact</a>
                    </nav>
                </div>
            </header>

            <main className="pl-page">
                <div className="pl-auth">
                    <section className="pl-card" aria-labelledby="admin-login-title">
                        <div className="pl-card__icon" aria-hidden="true">⚡</div>
                        <h1 id="admin-login-title" className="pl-card__title">Admin Login</h1>
                        <p className="pl-card__subtitle">Manage your healthcare platform efficiently.</p>

                        {formError && (
                            <div className="pl-form-error" role="alert" aria-live="assertive" style={{ marginBottom: 12 }}>
                                {formError}
                            </div>
                        )}
                        {!formError && authState?.error && (
                            <div className="pl-form-error" role="alert" aria-live="polite" style={{ marginBottom: 12 }}>
                                {String(authState.error)}
                            </div>
                        )}

                        <form className="pl-form" onSubmit={handleSubmit}>
                            <div className="pl-form-group">
                                <label htmlFor="email">Email</label>
                                <div className="pl-input-wrapper">
                                    <span className="pl-input-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                                            <polyline points="3,7 12,13 21,7"></polyline>
                                        </svg>
                                    </span>
                                    <input
                                        className={`pl-input ${touched.email && errors.email ? 'pl-input--invalid' : ''}`}
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter your email"
                                        autoComplete="username"
                                        aria-invalid={Boolean(touched.email && errors.email)}
                                        aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                                        inputMode="email"
                                    />
                                </div>
                                {touched.email && errors.email && (
                                    <p className="pl-input-error" id="email-error" role="alert">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="pl-form-group">
                                <label htmlFor="password">Password</label>
                                <div className="pl-input-wrapper">
                                    <span className="pl-input-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                    </span>
                                    <input
                                        className={`pl-input ${touched.password && errors.password ? 'pl-input--invalid' : ''}`}
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        aria-invalid={Boolean(touched.password && errors.password)}
                                        aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                                        minLength={8}
                                    />
                                </div>
                                {touched.password && errors.password && (
                                    <p className="pl-input-error" id="password-error" role="alert">
                                        {errors.password}
                                    </p>
                                )}
                            </div>


                            <button type="submit" className="pl-btn pl-btn--primary" disabled={submitting}>
                                {submitting ? 'Signing in…' : 'Sign In'}
                            </button>

                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdminLogin;