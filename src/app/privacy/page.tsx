import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'privacy policy — loadout',
  description: 'Privacy policy for loadout, the fitness creator storefront platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0a]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🏋️</span>
              <span className="text-lg font-bold tracking-tight lowercase">loadout</span>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">.fit</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-white/80 hover:text-white transition-colors px-3 py-2 lowercase font-medium">
                sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 lowercase tracking-tight">privacy policy</h1>
            <p className="text-white/60 text-lg">
              last updated: march 10, 2026
            </p>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">introduction</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  loadout (available at loadout.fit) is committed to protecting your privacy. this privacy policy explains how we collect, use, and protect your information when you use our fitness creator storefront platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">information we collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">account information</h3>
                    <ul className="text-white/80 space-y-1 ml-4">
                      <li>• email address</li>
                      <li>• profile information (handle, display name, bio, avatar)</li>
                      <li>• social media links</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">content & products</h3>
                    <ul className="text-white/80 space-y-1 ml-4">
                      <li>• products and content you create</li>
                      <li>• discount codes you generate</li>
                      <li>• storefront customizations</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">analytics data</h3>
                    <ul className="text-white/80 space-y-1 ml-4">
                      <li>• page views on your storefront</li>
                      <li>• link clicks and engagement metrics</li>
                      <li>• usage patterns (aggregated and anonymized)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">how we use your information</h2>
                <ul className="text-white/80 space-y-2 ml-4">
                  <li>• provide and improve our platform services</li>
                  <li>• display your content on your storefront</li>
                  <li>• process transactions and manage your account</li>
                  <li>• provide analytics and insights for your business</li>
                  <li>• communicate important updates and support</li>
                  <li>• ensure platform security and prevent abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">third-party services</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  we work with trusted third-party providers to deliver our services:
                </p>
                <ul className="text-white/80 space-y-2 ml-4">
                  <li>• <strong>supabase:</strong> database and authentication services</li>
                  <li>• <strong>vercel:</strong> hosting and infrastructure</li>
                  <li>• <strong>brandfetch:</strong> brand logos and visual assets</li>
                </ul>
                <p className="text-white/80 leading-relaxed mt-4">
                  these services may have their own privacy policies and data practices. we ensure all partners meet high standards for data protection.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">data sharing & sale</h2>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <p className="text-emerald-400 font-medium mb-2">we do not sell your personal data.</p>
                  <p className="text-white/80">
                    your personal information is never sold to third parties for marketing or other commercial purposes. we only share data as necessary to provide our services or as required by law.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">data retention</h2>
                <p className="text-white/80 leading-relaxed">
                  we retain your personal data as long as your account is active or as needed to provide services. when you close your account, we will delete your personal information within 90 days, except where required by law or legitimate business purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">your rights</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">ccpa rights (california residents)</h3>
                    <ul className="text-white/80 space-y-1 ml-4">
                      <li>• right to know what personal information we collect</li>
                      <li>• right to delete your personal information</li>
                      <li>• right to opt-out of sale (we don't sell data)</li>
                      <li>• right to non-discrimination for exercising rights</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">gdpr rights (eu residents)</h3>
                    <ul className="text-white/80 space-y-1 ml-4">
                      <li>• right to access your personal data</li>
                      <li>• right to rectification of inaccurate data</li>
                      <li>• right to erasure ("right to be forgotten")</li>
                      <li>• right to data portability</li>
                      <li>• right to object to processing</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">security</h2>
                <p className="text-white/80 leading-relaxed">
                  we implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits. however, no system is 100% secure, and we encourage you to use strong passwords and secure practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">changes to this policy</h2>
                <p className="text-white/80 leading-relaxed">
                  we may update this privacy policy periodically. we will notify you of significant changes via email or prominent notice on our platform. your continued use of loadout after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">contact us</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  if you have questions about this privacy policy or wish to exercise your rights, contact us at:
                </p>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-emerald-400 font-mono">support@loadout.fit</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}