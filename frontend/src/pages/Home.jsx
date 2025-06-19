import Navbar from "../components/common/Navbar";
import { Link } from "react-router-dom";
import HomeProductShowcase from "./HomeProductShowcase";

const Home = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
            padding: 0,
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
                    color: '#222',
                    marginBottom: 16,
                    letterSpacing: 1,
                    textShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                    Welcome to <span style={{ color: '#007bff' }}>Department Store</span>
                </h1>
                <p style={{
                    fontSize: 22,
                    color: '#555',
                    maxWidth: 600,
                    margin: '0 auto 2.5rem auto',
                    lineHeight: 1.5
                }}>
                    Discover the best deals on electronics, games, fashion, and more. Shop with confidence and enjoy fast delivery, easy returns, and exclusive offers!
                </p>
                <Link
                    to="/products"
                    style={{
                        background: 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        padding: '18px 48px',
                        fontWeight: 700,
                        fontSize: 22,
                        boxShadow: 'none', // remove shadow
                        cursor: 'pointer',
                        textDecoration: 'none',
                        transition: 'background 0.2s',
                        outline: 'none',
                        marginTop: 8,
                        marginBottom: 0 // no gap
                    }}
                >
                    Start Shopping
                </Link>
            </section>
            <div style={{ height: 4 }} /> {/* minimal spacer for visual separation */}
            <HomeProductShowcase />
            <section style={{ marginTop: 4, display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', boxShadow: 'none', border: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, minWidth: 220, maxWidth: 320, textAlign: 'center' }}>
                    <span style={{ fontSize: 40, color: '#007bff', display: 'block', marginBottom: 12 }}>🚚</span>
                    <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Fast Delivery</h3>
                    <p style={{ color: '#666', fontSize: 16 }}>Get your products delivered quickly and reliably to your doorstep.</p>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, minWidth: 220, maxWidth: 320, textAlign: 'center' }}>
                    <span style={{ fontSize: 40, color: '#28a745', display: 'block', marginBottom: 12 }}>💳</span>
                    <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Secure Payments</h3>
                    <p style={{ color: '#666', fontSize: 16 }}>Shop with confidence using our secure and trusted payment options.</p>
                </div>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: 32, minWidth: 220, maxWidth: 320, textAlign: 'center' }}>
                    <span style={{ fontSize: 40, color: '#ff9800', display: 'block', marginBottom: 12 }}>⭐</span>
                    <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Top-Rated Products</h3>
                    <p style={{ color: '#666', fontSize: 16 }}>Browse our curated selection of best-selling and highly rated items.</p>
                </div>
            </section>
            <section style={{
                background: 'linear-gradient(90deg, #f8fafc 60%, #e0e7ff 100%)',
                padding: '3rem 0 2rem 0',
                marginTop: 48,
            }}>
                <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: 32, color: '#222', marginBottom: 32, letterSpacing: 1 }}>Featured Categories</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
                    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 28, minWidth: 180, textAlign: 'center' }}>
                        <span style={{ fontSize: 32, color: '#007bff', display: 'block', marginBottom: 10 }}>🎮</span>
                        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Games & Consoles</div>
                        <div style={{ color: '#888', fontSize: 15 }}>Latest releases and classics</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 28, minWidth: 180, textAlign: 'center' }}>
                        <span style={{ fontSize: 32, color: '#28a745', display: 'block', marginBottom: 10 }}>🖥️</span>
                        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Electronics</div>
                        <div style={{ color: '#888', fontSize: 15 }}>Gadgets, computers, and more</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 28, minWidth: 180, textAlign: 'center' }}>
                        <span style={{ fontSize: 32, color: '#ff9800', display: 'block', marginBottom: 10 }}>👗</span>
                        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Fashion</div>
                        <div style={{ color: '#888', fontSize: 15 }}>Trendy styles for everyone</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
