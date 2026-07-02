'use client';

import { useEffect, useState } from 'react';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const sections = document.querySelectorAll('article[id]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const totalTicks = 20;
  const cx = 130, cy = 130, rOuter = 100, rInner = 92;
  const startAngle = 135;

  return (
    <div className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable} font-inter antialiased bg-[#FAFAFA] text-[#14171F] min-h-screen selection:bg-[#3B5BDB] selection:text-white`}>
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; }
        body { font-feature-settings: "ss01"; }
        .toc-link { position: relative; }
        .toc-link.active { color: #14171F; font-weight: 600; }
        .toc-link.active::before {
          content: '';
          position: absolute;
          left: -17px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #3B5BDB;
        }
        .prose-block p { margin-bottom: 1rem; line-height: 1.75; }
        .prose-block ul { margin-bottom: 1rem; }
        .prose-block li { line-height: 1.7; }
        
        @keyframes settle {
          0% { transform: rotate(-90deg); }
          60% { transform: rotate(3deg); }
          100% { transform: rotate(0deg); }
        }
        .needle {
          transform-origin: 130px 130px;
          animation: settle 1.4s cubic-bezier(.22,1.4,.36,1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .needle { animation: none; transform: rotate(0deg); }
        }
      `}} />

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAFAFA]/90 backdrop-blur border-b border-[#14171F]/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 font-space font-semibold tracking-tight">
            <div className="w-7 h-7 rounded-md bg-[#2563eb] text-white flex items-center justify-center font-bold text-[10px]">CL</div>
            CompileLink
          </a>
          <a href="https://github.com/mdrijoanmaruf" target="_blank" rel="noopener noreferrer"
             className="hidden sm:flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#14171F] transition-colors">
            View developer
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
          </a>
        </div>
      </header>

      <main id="top" className="pt-16">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
            <div>
              <p className="font-mono text-xs tracking-widest text-[#3B5BDB] uppercase mb-5">Privacy Policy</p>
              <h1 className="font-space text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
                We don't collect<br/>your data.<span className="text-[#3B5BDB]"> Full stop.</span>
              </h1>
              <p className="mt-6 text-lg text-[#6B7280] max-w-lg leading-relaxed">
                This policy explains, in plain language, exactly what the CompileLink extension does and doesn't do with your information.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-[#EEF1FD] text-[#3B5BDB] font-medium">No data collection</span>
                <span className="px-3 py-1.5 rounded-full bg-[#EEF1FD] text-[#3B5BDB] font-medium">No analytics or trackers</span>
                <span className="px-3 py-1.5 rounded-full bg-[#EEF1FD] text-[#3B5BDB] font-medium">Nothing sent to third parties</span>
              </div>
              <p className="mt-8 text-sm text-[#6B7280] font-mono">Last updated: <span>July 2, 2026</span></p>
            </div>

            {/* Signature element */}
            <div className="justify-self-center hidden md:block">
              <svg width="260" height="200" viewBox="0 0 260 200" className="overflow-visible">
                <g strokeWidth="3" strokeLinecap="round">
                  {Array.from({ length: totalTicks + 1 }).map((_, i) => {
                    const angle = (startAngle + (270 * i) / totalTicks) * (Math.PI / 180);
                    const x1 = cx + rInner * Math.cos(angle);
                    const y1 = cy + rInner * Math.sin(angle);
                    const x2 = cx + rOuter * Math.cos(angle);
                    const y2 = cy + rOuter * Math.sin(angle);
                    return (
                      <line 
                        key={i} 
                        x1={x1} y1={y1} x2={x2} y2={y2} 
                        className={i <= 1 ? "stroke-[#3B5BDB]" : "stroke-[#E2E4EA]"}
                      />
                    );
                  })}
                </g>
                <path d="M 40 170 A 90 90 0 1 1 220 170" fill="none" stroke="#E2E4EA" strokeWidth="10" strokeLinecap="round"/>
                <path d="M 40 170 A 90 90 0 1 1 220 170" fill="none" stroke="#3B5BDB" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray="402" strokeDashoffset="390" opacity="0.9"/>
                <g className="needle">
                  <line x1="130" y1="130" x2="52" y2="130" stroke="#14171F" strokeWidth="4" strokeLinecap="round"/>
                  <circle cx="130" cy="130" r="7" fill="#14171F"/>
                </g>
                <text x="130" y="185" textAnchor="middle" className="font-mono" fontSize="20" fontWeight="600" fill="#14171F">0x</text>
                <text x="130" y="200" textAnchor="middle" className="font-mono" fontSize="9" fill="#6B7280" letterSpacing="1">DATA COLLECTED</text>
              </svg>
            </div>
          </div>
        </section>

        <div className="border-t border-[#14171F]/10"></div>

        {/* Body with TOC */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-[220px_1fr] gap-16">
          {/* TOC */}
          <nav className="hidden md:block sticky top-24 self-start">
            <p className="font-mono text-xs tracking-widest text-[#6B7280] uppercase mb-4">On this page</p>
            <ul className="space-y-3 text-sm text-[#6B7280] border-l border-[#14171F]/10 pl-4">
              <li><a href="#overview" className={`toc-link hover:text-[#14171F] transition-colors ${activeSection === 'overview' ? 'active' : ''}`}>Overview</a></li>
              <li><a href="#data" className={`toc-link hover:text-[#14171F] transition-colors ${activeSection === 'data' ? 'active' : ''}`}>Data we collect</a></li>
              <li><a href="#permissions" className={`toc-link hover:text-[#14171F] transition-colors ${activeSection === 'permissions' ? 'active' : ''}`}>Permissions we use</a></li>
              <li><a href="#storage" className={`toc-link hover:text-[#14171F] transition-colors ${activeSection === 'storage' ? 'active' : ''}`}>Where your settings live</a></li>
              <li><a href="#sharing" className={`toc-link hover:text-[#14171F] transition-colors ${activeSection === 'sharing' ? 'active' : ''}`}>Third parties</a></li>
              <li><a href="#children" className={`toc-link hover:text-[#14171F] transition-colors ${activeSection === 'children' ? 'active' : ''}`}>Children's privacy</a></li>
              <li><a href="#changes" className={`toc-link hover:text-[#14171F] transition-colors ${activeSection === 'changes' ? 'active' : ''}`}>Changes to this policy</a></li>
              <li><a href="#contact" className={`toc-link hover:text-[#14171F] transition-colors ${activeSection === 'contact' ? 'active' : ''}`}>Contact</a></li>
            </ul>
          </nav>

          {/* Content */}
          <div className="max-w-2xl">
            <article id="overview" className="scroll-mt-24 mb-16">
              <h2 className="font-space text-2xl font-semibold mb-4">Overview</h2>
              <div className="prose-block text-[15px] text-[#14171F]/80">
                <p>CompileLink for Codeforces ("the extension", "we", "our") is a Chrome
                extension that seamlessly bridges Codeforces problem pages with our online compiler. 
                This policy covers the extension only.</p>
                <p>The short version: the extension runs entirely on your device. It
                does not have a tracking server, does not use analytics, and does not send
                any information about you or your browsing anywhere. Everything below
                explains exactly why, permission by permission.</p>
              </div>
            </article>

            <article id="data" className="scroll-mt-24 mb-16">
              <h2 className="font-space text-2xl font-semibold mb-4">Data we collect</h2>
              <div className="prose-block text-[15px] text-[#14171F]/80">
                <p>None. Specifically, the extension does not collect, transmit, or
                sell:</p>
                <ul className="list-none space-y-2 pl-0">
                  <li className="flex items-start gap-2.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B5BDB] shrink-0"></span>Your browsing history or the URLs of pages you visit (except acting on Codeforces)</li>
                  <li className="flex items-start gap-2.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B5BDB] shrink-0"></span>Personally identifiable information (name, email, IP address)</li>
                  <li className="flex items-start gap-2.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B5BDB] shrink-0"></span>Analytics, usage statistics, or crash reports</li>
                  <li className="flex items-start gap-2.5"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3B5BDB] shrink-0"></span>Authentication credentials or keystrokes</li>
                </ul>
                <p>The extension contains no remote tracking code, no third-party SDKs, and
                no analytics calls of any kind.</p>
              </div>
            </article>

            <article id="permissions" className="scroll-mt-24 mb-16">
              <h2 className="font-space text-2xl font-semibold mb-4">Permissions we use</h2>
              <div className="prose-block text-[15px] text-[#14171F]/80">
                <p>Chrome requires extensions to declare permissions up front. Here is
                what each one is used for and, just as important, what it is
                never used for.</p>

                <div className="mt-6 space-y-4">
                  <div className="border border-[#14171F]/10 rounded-xl p-5">
                    <p className="font-mono text-xs text-[#3B5BDB] mb-1.5">storage</p>
                    <p className="text-sm text-[#14171F]/80">Saves your recent problems history inside Chrome's local storage on your own device, so they appear in the popup. This data never leaves your browser.</p>
                  </div>
                  <div className="border border-[#14171F]/10 rounded-xl p-5">
                    <p className="font-mono text-xs text-[#3B5BDB] mb-1.5">host permissions (*://*.codeforces.com/*)</p>
                    <p className="text-sm text-[#14171F]/80">Injects the "Solve in CompileLink" button onto Codeforces problem pages and reads basic problem details (name, rating, contest ID) to display in the extension popup.</p>
                  </div>
                </div>

                <p className="mt-6">No permission is used to read page content unrelated
                to competitive programming problems, and none is used to transmit tracking data off your
                device.</p>
              </div>
            </article>

            <article id="storage" className="scroll-mt-24 mb-16">
              <h2 className="font-space text-2xl font-semibold mb-4">Where your settings live</h2>
              <div className="prose-block text-[15px] text-[#14171F]/80">
                <p>All settings are stored using Chrome's built-in <code className="font-mono text-[13px] bg-[#14171F]/5 px-1.5 py-0.5 rounded">storage</code> API,
                directly on your device. Uninstalling the
                extension removes this data. We have no access to it at any point.</p>
              </div>
            </article>

            <article id="sharing" className="scroll-mt-24 mb-16">
              <h2 className="font-space text-2xl font-semibold mb-4">Third parties</h2>
              <div className="prose-block text-[15px] text-[#14171F]/80">
                <p>We do not share, sell, rent, or trade any information with third
                parties, because we do not collect any information to begin with.
                The extension does not embed advertising, analytics, or
                third-party tracking libraries of any kind.</p>
              </div>
            </article>

            <article id="children" className="scroll-mt-24 mb-16">
              <h2 className="font-space text-2xl font-semibold mb-4">Children's privacy</h2>
              <div className="prose-block text-[15px] text-[#14171F]/80">
                <p>The extension is not directed at children and does not knowingly
                collect information from anyone, regardless of age — consistent
                with the rest of this policy.</p>
              </div>
            </article>

            <article id="changes" className="scroll-mt-24 mb-16">
              <h2 className="font-space text-2xl font-semibold mb-4">Changes to this policy</h2>
              <div className="prose-block text-[15px] text-[#14171F]/80">
                <p>If this policy ever changes — for example, if a future version of
                the extension adds a feature that changes how data is handled — this
                page will be updated and the "Last updated" date at the top will
                reflect the change. Material changes will also be noted in the
                extension's Chrome Web Store changelog.</p>
              </div>
            </article>

            <article id="contact" className="scroll-mt-24">
              <h2 className="font-space text-2xl font-semibold mb-4">Contact</h2>
              <div className="prose-block text-[15px] text-[#14171F]/80">
                <p>Questions about this policy or the extension can be sent through
                either of the following:</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <a href="mailto:contact@rijoan.com" target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#14171F] text-[#FAFAFA] text-sm font-medium hover:bg-[#14171F]/90 transition-colors">
                    Email me
                  </a>
                  <a href="https://rijoan.com" target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[#14171F]/15 text-sm font-medium hover:bg-[#14171F]/5 transition-colors">
                    rijoan.com
                  </a>
                </div>
                <p className="mt-6 text-sm text-[#6B7280]">Developed by Md Rijoan Maruf.</p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#14171F]/10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-[#6B7280]">
          <p>© 2026 CompileLink</p>
          <p className="font-mono text-xs">Built with React · TypeScript · Chrome Manifest V3</p>
        </div>
      </footer>
    </div>
  );
}
