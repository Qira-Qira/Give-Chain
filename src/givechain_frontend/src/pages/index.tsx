import Head from 'next/head';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Replace with real data fetching later or connect to your canister
const casesData = [
  { id: 1, title: 'School Funding', description: 'Support families affected by recent events.', amountRaised: 350, goal: 1000 },
  { id: 2, title: 'Emergency Relief', description: 'Help provide emergency relief to affected areas.', amountRaised: 780, goal: 1500 },
  { id: 3, title: 'Medical Aid', description: 'Provide medical aid to those in need.', amountRaised: 120, goal: 800 },
];

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-emerald-50 font-sans">
      <Head>
        <title>GiveChain - Direct Help, Instant Impact</title>
      </Head>

      {/* Navbar */}
      <motion.header initial="hidden" animate="visible" variants={fadeIn} className="bg-emerald-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto relative flex items-center justify-between p-6">
          {/* Logo */}
          <motion.h1 whileHover={{ scale: 1.1 }} className="text-3xl font-bold cursor-pointer z-20">
            GiveChain
          </motion.h1>

          {/* Centered Nav Links */}
          <motion.nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:flex space-x-10 z-10">
            {['Submit Case', 'Cases', 'How It Works', 'Contact'].map((link, idx) => (
              <motion.a
                key={idx}
                href={`#${link.replace(/\s+/g, '').toLowerCase()}`}
                whileHover={{ color: '#FDE047', scale: 1.05 }}
                className="text-lg font-medium transition"
              >
                {link}
              </motion.a>
            ))}
          </motion.nav>

          {/* Auth Buttons Right */}
          <div className="hidden md:flex space-x-4 z-20">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 border border-white rounded-full font-medium hover:bg-white hover:text-emerald-700 transition"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-yellow-300 text-emerald-900 rounded-full font-medium hover:bg-yellow-400 transition"
            >
              Sign Up
            </motion.button>
          </div>

          {/* Mobile Menu Icon */}
          <button className="md:hidden z-20" onClick={() => setMobileMenuOpen(true)}>
            <Bars3Icon className="h-6 w-6 hover:text-yellow-300 transition" />
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-emerald-700 bg-opacity-95 flex flex-col p-6 space-y-6"
          >
            <button className="self-end" onClick={() => setMobileMenuOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-white hover:text-yellow-300 transition" />
            </button>
            {['Submit Case', 'Cases', 'How It Works', 'Contact'].map((link, idx) => (
              <motion.a
                key={idx}
                href={`#${link.replace(/\s+/g, '').toLowerCase()}`}
                whileHover={{ scale: 1.05 }}
                className="text-2xl text-white font-semibold transition"
              >
                {link}
              </motion.a>
            ))}
            <div className="mt-auto space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full px-4 py-2 border border-white rounded-full text-center font-medium hover:bg-white hover:text-emerald-700 transition"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full px-4 py-2 bg-yellow-300 text-emerald-900 rounded-full font-medium hover:bg-yellow-400 transition"
              >
                Sign Up
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <motion.section initial="hidden" animate="visible" variants={fadeIn} className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-b from-emerald-500 to-emerald-400 text-white">
        <motion.h2 initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }} className="text-5xl md:text-6xl font-extrabold mb-4">
          Direct Donations, Real Impact
        </motion.h2>
        <motion.p variants={fadeIn} className="text-lg md:text-xl max-w-3xl mb-8">
          GiveChain connects donors directly to individuals in urgent need. No middlemen, no fees.
        </motion.p>
        <div className="space-x-4">
          <motion.a whileHover={{ scale: 1.05 }} href="#submit" className="bg-yellow-300 hover:bg-yellow-400 text-emerald-900 font-semibold py-3 px-8 rounded-full shadow-lg transition">
            Submit Case
          </motion.a>
          <motion.a whileHover={{ scale: 1.05 }} href="#cases" className="border border-white hover:bg-white hover:text-emerald-700 font-semibold py-3 px-8 rounded-full shadow transition">
            Explore Cases
          </motion.a>
        </div>
      </motion.section>

      {/* Submit Case Section */}
      <motion.section id="submit" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="py-16 px-6 bg-white text-emerald-800">
        <motion.div className="container mx-auto max-w-xl">
          <h3 className="text-3xl font-bold text-center mb-6">Submit Your Emergency Case</h3>
          <motion.form className="space-y-4">
            <motion.input type="text" placeholder="Case Title" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300" whileFocus={{ scale: 1.02 }} />
            <motion.textarea placeholder="Description of your situation" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 h-32" whileFocus={{ scale: 1.02 }} />
            <motion.input type="text" placeholder="Your Wallet Address" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300" whileFocus={{ scale: 1.02 }} />
            <motion.input type="url" placeholder="Proof URL (IPFS link)" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300" whileFocus={{ scale: 1.02 }} />
            <motion.button type="submit" whileHover={{ scale: 1.03 }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg shadow-md transition">
              Submit Case
            </motion.button>
          </motion.form>
        </motion.div>
      </motion.section>

      {/* Cases Listing Section */}
      <motion.section id="cases" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="py-16 px-6 bg-emerald-50 text-emerald-900">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8">Current Cases</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {casesData.map(c => (
              <motion.div key={c.id} whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
                <h4 className="text-xl font-bold mb-2">{c.title}</h4>
                <p className="mb-4 text-gray-700">{c.description}</p>
                <div className="h-3 bg-emerald-200 rounded-full overflow-hidden mb-4">
                  <div className="bg-emerald-600 h-full" style={{ width: `${(c.amountRaised / c.goal) * 100}%` }} />
                </div>
                <p className="text-sm mb-4">Raised: {c.amountRaised} / {c.goal} ICP</p>
                <motion.a whileHover={{ scale: 1.05 }} href={`/donate/${c.id}`} className="block text-center bg-yellow-300 hover:bg-yellow-400 font-semibold py-2 rounded-lg transition">
                  Donate Now
                </motion.a>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section id="how" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="py-16 px-6 bg-white text-emerald-800">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {['Submit Case','Community Verify','Donate Directly'].map((step, idx) => (
            <motion.div key={idx} whileHover={{ translateY: -5 }} className="p-6 rounded-2xl shadow-md hover:shadow-lg transition bg-emerald-100">
              <h4 className="text-xl font-bold mb-2">{idx+1}. {step}</h4>
              <p>{step === 'Submit Case' ? 'Victims submit their emergency cases via blockchain-secured form.' : step === 'Community Verify' ? 'Cases are verified through DAO voting for authenticity and need.' : '100% of donations go straight to the recipient\'s wallet instantly.'}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Contact & Footer */}
      <motion.footer id="contact" initial="hidden" animate="visible" variants={fadeIn} className="bg-emerald-600 text-white py-12 px-6">
        <div className="container mx-auto text-center space-y-4">
          <h4 className="text-xl font-bold">Get in Touch</h4>
          <motion.p whileHover={{ scale: 1.02 }}>Questions? Email us at <a href="mailto:support@eter.xyz" className="underline">support@givechain.io</a></motion.p>
          <p className="mt-6 text-sm">Built with ❤️ for ICP Hackathon 2025 | GiveChain</p>
        </div>
      </motion.footer>
    </div>
  );
}
