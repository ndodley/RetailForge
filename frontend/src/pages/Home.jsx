import { Link } from "react-router-dom";
import HomeProductShowcase from "./HomeProductShowcase";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
    const { user } = useAuth();

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--app-bg)',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
        }}>
            <section style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                padding: '4rem 1rem 2rem 1rem',
                textAlign: 'center',
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    color: 'var(--text)',
                    marginBottom: 16,
                    letterSpacing: 1,
                    textShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                    Welcome to <span style={{ color: 'var(--link)' }}>RetailForge</span>
                </h1>
                <p style={{
                    fontSize: 22,
                    color: 'var(--muted)',
                    maxWidth: 600,
                    margin: '0 auto 2.5rem auto',
                    lineHeight: 1.5
                }}>
                    Discover the best deals on electronics, games, fashion, and more. Shop with confidence and enjoy fast delivery, easy returns, and exclusive offers!
                </p>
                <HomeProductShowcase />
            </section>

            <section style={{
                width: '100%',
                padding: '1.75rem 1rem 2.25rem',
                display: 'flex',
                justifyContent: 'center',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: 1200,
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    boxShadow: 'var(--shadow-2)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '1.5rem 1.5rem 1.25rem',
                        background: 'var(--nav-bg)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                    }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 900, fontSize: 22, color: 'var(--text)', letterSpacing: 0.2 }}>
                                Built for browsing, saving, and checking out fast.
                            </div>
                            <div style={{ marginTop: 8, color: 'var(--muted)', fontWeight: 700 }}>
                                Save favorites, track orders, and review products — all in one place.
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <Link
                                to="/products"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '10px 14px',
                                    borderRadius: 12,
                                    background: 'var(--link)',
                                    color: 'var(--surface-2)',
                                    fontWeight: 900,
                                    textDecoration: 'none',
                                    boxShadow: 'var(--shadow-1)',
                                }}
                            >
                                Browse products
                            </Link>
                            {!user && (
                                <Link
                                    to="/register"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '10px 14px',
                                        borderRadius: 12,
                                        background: 'var(--nav-pill-bg)',
                                        color: 'var(--text)',
                                        fontWeight: 900,
                                        textDecoration: 'none',
                                        border: '1px solid var(--border)',
                                    }}
                                >
                                    Create account
                                </Link>
                            )}
                        </div>
                    </div>

                    <div style={{
                        padding: '1.25rem 1.5rem 1.5rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 14,
                    }}>
                        <div style={{
                            background: 'var(--surface-3)',
                            border: '1px solid var(--border)',
                            borderRadius: 16,
                            padding: 16,
                            boxShadow: 'var(--shadow-1)',
                            textAlign: 'left',
                        }}>
                            <div style={{ fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span aria-hidden style={{ fontSize: 18 }}>★</span>
                                Favorites that stick
                            </div>
                            <div style={{ marginTop: 8, color: 'var(--muted-2)', fontWeight: 700, lineHeight: 1.5 }}>
                                Tap the star to save items and come back later.
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--surface-3)',
                            border: '1px solid var(--border)',
                            borderRadius: 16,
                            padding: 16,
                            boxShadow: 'var(--shadow-1)',
                            textAlign: 'left',
                        }}>
                            <div style={{ fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span aria-hidden style={{ fontSize: 18 }}>🧾</span>
                                Order history
                            </div>
                            <div style={{ marginTop: 8, color: 'var(--muted-2)', fontWeight: 700, lineHeight: 1.5 }}>
                                View past orders and details anytime in your account.
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--surface-3)',
                            border: '1px solid var(--border)',
                            borderRadius: 16,
                            padding: 16,
                            boxShadow: 'var(--shadow-1)',
                            textAlign: 'left',
                        }}>
                            <div style={{ fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span aria-hidden style={{ fontSize: 18 }}>✍️</span>
                                Reviews + ratings
                            </div>
                            <div style={{ marginTop: 8, color: 'var(--muted-2)', fontWeight: 700, lineHeight: 1.5 }}>
                                Read reviews and leave your own to help others decide.
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--surface-3)',
                            border: '1px solid var(--border)',
                            borderRadius: 16,
                            padding: 16,
                            boxShadow: 'var(--shadow-1)',
                            textAlign: 'left',
                        }}>
                            <div style={{ fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span aria-hidden style={{ fontSize: 18 }}>🔒</span>
                                Stock-safe checkout
                            </div>
                            <div style={{ marginTop: 8, color: 'var(--muted-2)', fontWeight: 700, lineHeight: 1.5 }}>
                                Checkout handles stock updates safely to avoid overselling.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{
                marginTop: 'auto',
                borderTop: '1px solid var(--border)',
                background: 'var(--nav-bg)',
                padding: '1.5rem 1rem',
            }}>
                <div style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                }}>
                    <div style={{ fontWeight: 900, color: 'var(--text)', letterSpacing: 0.2 }}>
                        RetailForge
                    </div>

                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link to="/products" style={{ color: 'var(--link)', fontWeight: 800, textDecoration: 'none' }}>Products</Link>
                        <Link to="/my-favorites" style={{ color: 'var(--link)', fontWeight: 800, textDecoration: 'none' }}>Favorites</Link>
                        <Link to="/my-orders" style={{ color: 'var(--link)', fontWeight: 800, textDecoration: 'none' }}>Orders</Link>
                        <Link to="/my-profile" style={{ color: 'var(--link)', fontWeight: 800, textDecoration: 'none' }}>Profile</Link>
                    </div>

                    <div style={{ color: 'var(--muted-2)', fontWeight: 700, fontSize: 13 }}>
                        © {new Date().getFullYear()} RetailForge. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
