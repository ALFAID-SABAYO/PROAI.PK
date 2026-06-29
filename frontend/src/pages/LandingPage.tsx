import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CyberBackground } from '../components/cyber/CyberBackground';
import { CitySkyline } from '../components/landing/CitySkyline';
import { LandingHeader } from '../components/landing/LandingHeader';
import { PageLoader } from '../components/ui/Loading';
import { usePlatformStats } from '../hooks/usePlatformStats';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath } from '../utils/auth';
import { formatModelName, formatNumber } from '../utils/format';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
};

export function LandingPage() {
  const { user } = useAuthStore();
  const { dataset, metrics, loading, error } = usePlatformStats();

  const cityLabels = metrics.cities.map((c) => {
    const abbr = c.city.slice(0, 3).toUpperCase();
    return `${abbr} (${formatNumber(c.property_count)})`;
  });

  const listingsLabel = loading ? '…' : formatNumber(metrics.totalListings);
  const accuracyLabel =
    metrics.modelAccuracyPct != null ? `${metrics.modelAccuracyPct}%` : '—';
  const citiesLabel = loading
    ? '…'
    : cityLabels.join(' · ') || `${metrics.cityCount} cities`;

  const featureIcons = [
    <svg key="1" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    <svg key="2" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    <svg key="3" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    <svg key="4" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
  ];

  const features = [
    {
      title: 'Price Predictions',
      desc: `${formatModelName(metrics.modelName)} trained on ${formatNumber(metrics.trainingRows)} rows with ${accuracyLabel} R² on holdout data.`,
    },
    {
      title: 'Risk Analysis',
      desc: 'Location volatility scoring highlights areas with wider price spreads across live listing data.',
    },
    {
      title: 'Role-Based Dashboards',
      desc: `Unified cyber workspaces for investors, agents, and admins across ${metrics.propertyTypeCount} property types.`,
    },
    {
      title: 'Market Analytics',
      desc: `Interactive charts across ${metrics.cityCount} cities and ${formatNumber(metrics.totalListings)} active listings.`,
    },
  ];

  const steps = [
    { num: '01', title: 'Browse areas', desc: 'Explore neighborhoods with statistics computed from the live property database.' },
    { num: '02', title: 'Run prediction', desc: 'Enter property details and get an AI-powered price estimate in seconds.' },
    { num: '03', title: 'Decide smarter', desc: 'Compare risk scores, favorites, and market trends before you invest.' },
  ];

  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-950">
        <CyberBackground />
        <LandingHeader />
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <CyberBackground />
      <LandingHeader />

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="stat-pill">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                Live platform data
              </span>
              {error && <span className="stat-pill text-amber-400">API: using cached view</span>}
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-[3.25rem]">
              Pakistan&apos;s <span className="gradient-text">smart property</span> intelligence
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Every hero metric below is computed from the live dataset —{' '}
              <span className="text-indigo-300">{dataset.length} records</span> loaded from the API.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              {user ? (
                <Link to={getDashboardPath(user.role)} className="btn-cyber">
                  Open Workspace
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-cyber">
                    Start free — Register
                  </Link>
                  <Link to="/login" className="btn-cyber-ghost">
                    Sign in
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-800/60 pt-8">
              {[
                { value: listingsLabel, label: 'Listings' },
                { value: accuracyLabel, label: 'Model R²' },
                { value: String(metrics.cityCount), label: 'Cities' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="cyber-glass rounded-3xl p-4 sm:p-6">
              <CitySkyline
                variant="hero"
                className="h-[260px] sm:h-[300px]"
                listingsLabel={listingsLabel}
                accuracyLabel={accuracyLabel}
                citiesLabel={citiesLabel}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative border-t border-slate-800/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-violet-400">Platform features</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Data-connected capabilities</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp} transition={{ delay: i * 0.08 }} className="feature-card group">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-300 transition group-hover:bg-indigo-600/30">
                  {featureIcons[i]}
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-12">
            <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold">Three steps to smarter investing</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div key={step.num} {...fadeUp} transition={{ delay: i * 0.1 }} className="cyber-glass rounded-2xl p-8">
                <span className="font-display text-5xl font-bold text-slate-800">{step.num}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="cities" className="border-t border-slate-800/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold">Live market coverage</h2>
            <p className="mt-3 text-slate-400">Counts derived from cities.reduce() on platform dataset</p>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics.cities.map((city, i) => (
              <motion.div
                key={city.city}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="cyber-glass cyber-glass-hover overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-indigo-600 to-violet-500" />
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-2xl font-bold">{city.city}</h3>
                    <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-300">
                      {formatNumber(city.property_count)} listings
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {((city.property_count / Math.max(metrics.totalListings, 1)) * 100).toFixed(1)}% of platform inventory
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div {...fadeUp} className="cyber-glass rounded-3xl p-10 sm:p-14">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Enter your role-based workspace</h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-400">
              Investor, agent, and admin dashboards share this exact cyber design system.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {user ? (
                <Link to={getDashboardPath(user.role)} className="btn-cyber">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-cyber">
                    Create free account
                  </Link>
                  <Link to="/login" className="btn-cyber-ghost">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="font-display text-lg font-bold">
            PropAI<span className="text-violet-400">.pk</span>
          </p>
          <p className="text-sm text-slate-600">
            {formatNumber(metrics.totalListings)} listings · {metrics.cityCount} cities · live data
          </p>
        </div>
      </footer>
    </div>
  );
}
