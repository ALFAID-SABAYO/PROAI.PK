import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-primary-900 to-surface-900 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <span className="font-display text-2xl font-bold">
          PropAI<span className="text-accent-400">.pk</span>
        </span>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-400"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-400">
            Predictive AI · Karachi & Islamabad
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Smarter real estate investment decisions for Pakistan
          </h1>
          <p className="mt-6 text-lg text-white/70">
            Analyze Zameen.com listings with ML-powered price predictions, location risk scores,
            and investment insights — built for investors, agents, and administrators.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-primary-800 transition hover:bg-primary-50"
            >
              Start investing
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              Agent / Admin login
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 grid gap-6 sm:grid-cols-3"
        >
          {[
            {
              title: 'Price Predictions',
              desc: 'Random Forest model trained on 97K+ Karachi & Islamabad listings with 90% R².',
            },
            {
              title: 'Risk Analysis',
              desc: 'Location-based volatility scoring to flag high-risk investment zones.',
            },
            {
              title: 'Role-Based Access',
              desc: 'Tailored dashboards for investors, agents, and system administrators.',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-white/60">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
