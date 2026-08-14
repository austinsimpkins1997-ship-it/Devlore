import { Metadata } from 'next';
import { PricingTable } from '@/components/marketing/PricingTable';
import { Navbar } from '@/components/marketing/Navbar';

export const metadata: Metadata = {
  title: 'Pricing',
};

export default function PricingPage() {
  return (
    <div style={{ background: 'var(--color-void)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '7rem 2rem 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', color: 'var(--color-rune)', marginBottom: '1rem', textAlign: 'center' }}>
        Unlock Your Full Legend
      </h1>
      <p style={{ color: 'var(--color-mist)', fontSize: '1.2rem', marginBottom: '4rem', textAlign: 'center', maxWidth: '600px' }}>
        Choose the tier that fits your journey. Upgrade anytime to unlock deeper lore and legendary cards.
      </p>
      
      <PricingTable />

      <section style={{ marginTop: '6rem', maxWidth: '800px', width: '100%' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-frost)', marginBottom: '2rem', textAlign: 'center' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', background: 'var(--color-abyss)', borderRadius: '8px', border: '1px solid var(--color-dusk)' }}>
            <h3 style={{ color: 'var(--color-rune)', marginBottom: '0.5rem' }}>Can I cancel anytime?</h3>
            <p style={{ color: 'var(--color-mist)' }}>Yes, you can cancel your subscription at any time from your settings page. Your benefits will continue until the end of your billing cycle.</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'var(--color-abyss)', borderRadius: '8px', border: '1px solid var(--color-dusk)' }}>
            <h3 style={{ color: 'var(--color-rune)', marginBottom: '0.5rem' }}>What happens to my unlocked chapters if I downgrade?</h3>
            <p style={{ color: 'var(--color-mist)' }}>You keep all chapters and lore cards you&apos;ve already unlocked. However, future chapters will be restricted to the limits of your new tier.</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'var(--color-abyss)', borderRadius: '8px', border: '1px solid var(--color-dusk)' }}>
            <h3 style={{ color: 'var(--color-rune)', marginBottom: '0.5rem' }}>How does the AI work?</h3>
            <p style={{ color: 'var(--color-mist)' }}>We analyze your commit messages, languages used, and contribution times to prompt a specialized AI model that generates thematic fantasy narratives tailored to your coding habits.</p>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
