import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'terms of service — loadout',
  description: 'Terms of service for loadout, the fitness creator storefront platform.',
};

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold mb-4 lowercase tracking-tight">terms of service</h1>
            <p className="text-white/60 text-lg">
              last updated: march 10, 2026
            </p>
          </div>

          <div className="prose prose-invert prose-emerald max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">agreement to terms</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  by accessing and using loadout (available at loadout.fit), you agree to be bound by these terms of service and our privacy policy. if you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">service description</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  loadout is a creator storefront platform designed specifically for fitness creators. our service enables you to:
                </p>
                <ul className="text-white/80 space-y-2 ml-4">
                  <li>• create a personalized storefront for your fitness business</li>
                  <li>• sell digital products like workout plans and coaching programs</li>
                  <li>• manage discount codes and promotional campaigns</li>
                  <li>• track analytics and engagement metrics</li>
                  <li>• connect with your audience through a link-in-bio experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">account registration</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  to use loadout, you must create an account and provide accurate information. you are responsible for:
                </p>
                <ul className="text-white/80 space-y-2 ml-4">
                  <li>• maintaining the confidentiality of your account credentials</li>
                  <li>• ensuring all information you provide is accurate and current</li>
                  <li>• promptly updating your account information when necessary</li>
                  <li>• all activities that occur under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">user responsibilities</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">content guidelines</h3>
                    <p className="text-white/80 leading-relaxed mb-2">you agree that all content you post or share must:</p>
                    <ul className="text-white/80 space-y-1 ml-4">
                      <li>• be legal and not infringe on others' rights</li>
                      <li>• be accurate and not misleading</li>
                      <li>• not contain spam, malware, or harmful content</li>
                      <li>• not violate any applicable laws or regulations</li>
                      <li>• be appropriate for a fitness and wellness audience</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">prohibited activities</h3>
                    <ul className="text-white/80 space-y-1 ml-4">
                      <li>• uploading harmful or malicious content</li>
                      <li>• impersonating others or creating fake accounts</li>
                      <li>• spamming or sending unsolicited communications</li>
                      <li>• attempting to hack or disrupt our services</li>
                      <li>• selling illegal products or services</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">pricing & payment</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">free tier</h3>
                    <p className="text-white/80 leading-relaxed">
                      loadout currently offers a free tier with basic storefront features. we reserve the right to introduce usage limits or modify free tier features with reasonable notice.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">future paid plans</h3>
                    <p className="text-white/80 leading-relaxed">
                      we may introduce paid subscription tiers in the future with additional features and capabilities. existing users will receive advance notice of any pricing changes, and continued use constitutes acceptance of new pricing.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">intellectual property</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">your content ownership</h3>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                      <p className="text-emerald-400 font-medium mb-2">you retain ownership of your content.</p>
                      <p className="text-white/80">
                        all workout plans, programs, images, and other content you create and upload remain your intellectual property. loadout does not claim ownership of your content.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">platform license</h3>
                    <p className="text-white/80 leading-relaxed mb-2">
                      by using loadout, you grant us a limited license to:
                    </p>
                    <ul className="text-white/80 space-y-1 ml-4">
                      <li>• display your content on your storefront</li>
                      <li>• process and optimize content for platform performance</li>
                      <li>• back up your content for service reliability</li>
                      <li>• feature your storefront in promotional materials (with permission)</li>
                    </ul>
                    <p className="text-white/80 leading-relaxed mt-3">
                      this license ends when you remove content or close your account.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">platform rights</h3>
                    <p className="text-white/80 leading-relaxed">
                      the loadout platform, including our software, design, and branding, is owned by loadout and protected by intellectual property laws. you may not copy, modify, or redistribute our platform.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">account termination</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">termination by you</h3>
                    <p className="text-white/80 leading-relaxed">
                      you may close your account at any time through your account settings. upon closure, we will delete your personal data in accordance with our privacy policy, but may retain some data as required by law or legitimate business purposes.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-emerald-400 lowercase">termination by loadout</h3>
                    <p className="text-white/80 leading-relaxed mb-2">
                      we may suspend or terminate your account if you:
                    </p>
                    <ul className="text-white/80 space-y-1 ml-4">
                      <li>• violate these terms of service</li>
                      <li>• engage in prohibited activities</li>
                      <li>• fail to pay fees (for future paid plans)</li>
                      <li>• create risk for other users or our platform</li>
                    </ul>
                    <p className="text-white/80 leading-relaxed mt-3">
                      we will provide reasonable notice when possible, except in cases of serious violations or legal requirements.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">limitation of liability</h2>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <p className="text-yellow-400 font-medium mb-2">service provided "as is"</p>
                  <p className="text-white/80">
                    loadout is provided on an "as is" and "as available" basis. we make no warranties about the reliability, availability, or fitness for purpose of our service.
                  </p>
                </div>
                
                <p className="text-white/80 leading-relaxed mb-4">
                  to the maximum extent permitted by law, loadout and its team shall not be liable for:
                </p>
                <ul className="text-white/80 space-y-1 ml-4">
                  <li>• indirect, incidental, or consequential damages</li>
                  <li>• loss of profits, revenue, or business opportunities</li>
                  <li>• data loss or corruption</li>
                  <li>• service interruptions or downtime</li>
                  <li>• actions or content of other users</li>
                </ul>
                
                <p className="text-white/80 leading-relaxed mt-4">
                  our total liability for any claim shall not exceed the amount you paid to loadout in the 12 months preceding the claim.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">indemnification</h2>
                <p className="text-white/80 leading-relaxed">
                  you agree to indemnify and hold harmless loadout from any claims, damages, or expenses arising from your use of our platform, violation of these terms, or infringement of third-party rights through your content or activities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">governing law</h2>
                <p className="text-white/80 leading-relaxed">
                  these terms are governed by the laws of the united states and the state where loadout is incorporated. any disputes will be resolved through binding arbitration or in the courts of competent jurisdiction in that state.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">changes to terms</h2>
                <p className="text-white/80 leading-relaxed">
                  we may update these terms periodically to reflect changes in our service or legal requirements. we will notify you of significant changes via email or platform notice. continued use after changes constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">contact information</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  if you have questions about these terms of service, please contact us at:
                </p>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-emerald-400 font-mono">support@loadout.fit</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-white lowercase">severability</h2>
                <p className="text-white/80 leading-relaxed">
                  if any provision of these terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect. the invalid provision will be replaced with a valid provision that most closely matches the intent of the original.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}