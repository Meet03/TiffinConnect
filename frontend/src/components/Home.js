import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLeaf, faClock, faShieldHalved, faStar,
  faUtensils, faTruck, faClipboardList, faArrowRight,
  faFire, faUsers, faThumbsUp
} from '@fortawesome/free-solid-svg-icons';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const stats = [
    { icon: faUsers, value: '500+', label: 'Happy Customers' },
    { icon: faUtensils, value: '50+', label: 'Tiffin Providers' },
    { icon: faTruck, value: '1000+', label: 'Meals Delivered' },
    { icon: faThumbsUp, value: '4.8★', label: 'Average Rating' },
  ];

  const features = [
    {
      icon: faLeaf,
      title: 'Fresh & Nutritious',
      desc: 'Every meal is home-cooked daily with fresh ingredients — no preservatives, just wholesome goodness.',
      color: '#27ae60',
    },
    {
      icon: faClock,
      title: 'Flexible Subscriptions',
      desc: 'Weekly or monthly plans that fit your lifestyle. Pause, resume, or switch anytime.',
      color: '#e67e22',
    },
    {
      icon: faShieldHalved,
      title: 'Trusted Providers',
      desc: 'All providers are verified and rated by our community. Quality you can count on.',
      color: '#2980b9',
    },
    {
      icon: faStar,
      title: 'Top Rated Meals',
      desc: 'Discover the most loved tiffins in your area, ranked by real customer reviews.',
      color: '#8e44ad',
    },
  ];

  const steps = [
    { icon: faClipboardList, step: '01', title: 'Choose a Plan', desc: 'Browse providers and pick a subscription plan that suits your taste and budget.' },
    { icon: faUtensils, step: '02', title: 'Customize Your Meals', desc: 'Select your preferred meals from the menu. Veg, non-veg, or vegan — your choice.' },
    { icon: faTruck, step: '03', title: 'Get It Delivered', desc: 'Your fresh tiffin is delivered right to your door, every day, on time.' },
  ];

  return (
    <div className="home-wrapper">

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg-overlay" />
        <div className="hero-content">
          <span className="hero-badge">
            <FontAwesomeIcon icon={faFire} /> Mississauga's #1 Tiffin Service
          </span>
          <h1 className="hero-title">
            Taste of Home,<br />
            <span className="hero-accent">Delivered Daily.</span>
          </h1>
          <p className="hero-subtitle">
            Fresh, home-cooked tiffins from trusted local providers — delivered to your doorstep every day.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Get Started <FontAwesomeIcon icon={faArrowRight} />
            </button>
            <button className="btn-outline" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>Scroll to explore</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats-bar">
        {stats.map((s, i) => (
          <div className="stat-item animate-on-scroll" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <FontAwesomeIcon icon={s.icon} className="stat-icon" />
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* WHY CHOOSE US */}
      <section className="features-section">
        <div className="section-header animate-on-scroll">
          <span className="section-tag">Why Tiffin Connect?</span>
          <h2>Everything You Need,<br />Nothing You Don't</h2>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card animate-on-scroll" key={i} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="feature-icon-wrap" style={{ background: f.color + '18', color: f.color }}>
                <FontAwesomeIcon icon={f.icon} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="how-bg" />
        <div className="section-header animate-on-scroll">
          <span className="section-tag light">How It Works</span>
          <h2 style={{ color: '#fff' }}>Simple. Fast. Delicious.</h2>
        </div>
        <div className="steps-row">
          {steps.map((s, i) => (
            <div className="step-card animate-on-scroll" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="step-number">{s.step}</div>
              <div className="step-icon">
                <FontAwesomeIcon icon={s.icon} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section animate-on-scroll">
        <div className="cta-inner">
          <span className="section-tag">Ready to Start?</span>
          <h2>Your Next Favourite Meal<br />Is One Click Away</h2>
          <p>Join hundreds of happy customers enjoying fresh home-cooked tiffins every day.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Order Now <FontAwesomeIcon icon={faArrowRight} />
            </button>
            <button className="btn-outline dark" onClick={() => navigate('/login')}>
              I have an account
            </button>
          </div>
        </div>
        <div className="cta-decoration">
          <div className="deco-circle c1" />
          <div className="deco-circle c2" />
          <div className="deco-circle c3" />
        </div>
      </section>

    </div>
  );
};

export default Home;