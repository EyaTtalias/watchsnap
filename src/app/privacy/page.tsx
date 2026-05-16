import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — WatchSnap",
  description: "WatchSnap Privacy Policy — how we collect, use, and protect your data.",
  openGraph: {
    title: "Privacy Policy — WatchSnap",
    description: "WatchSnap Privacy Policy — how we collect, use, and protect your data.",
    url: "https://watchsnap.vercel.app/privacy",
    siteName: "WatchSnap",
    images: [{ url: "https://watchsnap.vercel.app/icons/icon-512.png", width: 512, height: 512 }],
  },
  twitter: { card: "summary", title: "Privacy Policy — WatchSnap" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-3xl px-4 pt-20 pb-10">
        {/* Back link */}
        <Link href="/landing" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        {/* Header */}
        <div className="mb-12 border-b border-[#1E1E1E] pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">Legal</p>
          <h1 className="text-4xl font-black sm:text-5xl mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: May 11, 2026</p>
        </div>

        {/* Content */}
        <div className="prose-legal">
          <Section title="1. Introduction">
            <p>
              WatchSnap (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the WatchSnap web application (the &quot;Service&quot;).
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              By using WatchSnap you agree to the collection and use of information in accordance with this policy.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <SubHeading>2.1 Information You Provide</SubHeading>
            <p>When you use WatchSnap we may collect:</p>
            <ul>
              <li><strong>Images:</strong> Photos of watches you upload or capture through the app for AI identification.</li>
              <li><strong>Email address:</strong> If you create an account or subscribe to a paid plan via Paddle Billing.</li>
              <li><strong>Payment information:</strong> Processed entirely by Paddle (our Merchant of Record). We never see or store your card details.</li>
            </ul>

            <SubHeading>2.2 Information Collected Automatically</SubHeading>
            <ul>
              <li><strong>Usage data:</strong> Scan count, feature interactions, and app navigation, stored locally in your browser.</li>
              <li><strong>Device information:</strong> Browser type, operating system, and IP address for security and analytics.</li>
              <li><strong>Cookies:</strong> Session cookies required for the app to function. We do not use advertising cookies.</li>
            </ul>

            <SubHeading>2.3 Watch Image Processing</SubHeading>
            <p>
              Images you submit are sent to Anthropic&apos;s Claude API for AI analysis. Images are processed in real time
              and are not stored permanently by WatchSnap or Anthropic beyond what is required for the immediate API call.
              Anthropic&apos;s data handling is governed by their{" "}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#C9A84C] hover:underline">Privacy Policy</a>.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use collected information to:</p>
            <ul>
              <li>Provide, operate, and improve the WatchSnap Service</li>
              <li>Process subscription payments through Paddle</li>
              <li>Track your free-scan usage (stored locally, not on our servers)</li>
              <li>Send transactional emails related to your subscription (via Paddle)</li>
              <li>Monitor and prevent fraudulent or abusive use of the Service</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>We do <strong>not</strong> sell your personal data to third parties. We do not use your data for advertising.</p>
          </Section>

          <Section title="4. Data Storage and Security">
            <p>
              Subscription and account data is stored in Supabase (hosted on AWS). All data is encrypted in transit (TLS 1.2+)
              and at rest (AES-256). Your collection data (saved watches) is stored locally in your browser&apos;s localStorage
              and is not transmitted to our servers unless you are signed in.
            </p>
            <p>
              We implement industry-standard security measures; however, no method of transmission over the internet
              is 100% secure. We cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="5. Third-Party Services">
            <p>WatchSnap relies on the following third-party processors:</p>
            <ul>
              <li><strong>Anthropic Claude API</strong> — AI image analysis</li>
              <li><strong>Paddle</strong> — Payment processing, subscription management, and tax compliance (Merchant of Record)</li>
              <li><strong>Supabase</strong> — Database and authentication infrastructure</li>
              <li><strong>Vercel</strong> — Web hosting and content delivery</li>
            </ul>
            <p>Each processor handles data in accordance with their own privacy policies and applicable data protection laws.</p>
          </Section>

          <Section title="6. Cookies">
            <p>We use minimal, essential cookies necessary to operate the Service. We do not use tracking or advertising cookies.
              You may disable cookies in your browser settings, but this may affect functionality.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time (where processing is based on consent)</li>
            </ul>
            <p>To exercise any of these rights, please contact us at <strong>watchsnapapp@gmail.com</strong>.</p>
          </Section>

          <Section title="8. Data Retention">
            <p>
              We retain account and subscription data for as long as your account is active and for up to 90 days after deletion,
              for fraud-prevention and legal-compliance purposes. Watch images submitted for analysis are not retained beyond
              the duration of the API call.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              WatchSnap is not directed to children under 13 years of age. We do not knowingly collect personal information
              from children under 13. If you believe a child has provided us with personal information, please contact us
              so we can delete it promptly.
            </p>
          </Section>

          <Section title="10. International Transfers">
            <p>
              Your data may be transferred to and processed in countries other than your own (including the United States).
              These countries may have different data protection laws. We take reasonable steps to ensure your data
              receives adequate protection wherever it is processed.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by updating
              the &quot;Last updated&quot; date above. Your continued use of the Service after changes constitutes acceptance
              of the revised policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-3 rounded-2xl border border-[#1E1E1E] bg-[#111111] p-5">
              <p className="font-bold text-white">WatchSnap</p>
              <p className="text-gray-400 mt-1">Email: <a href="mailto:watchsnapapp@gmail.com" className="text-[#C9A84C] hover:underline">watchsnapapp@gmail.com</a></p>
            </div>
          </Section>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="mb-4 text-xl font-black text-white">{title}</h2>
      <div className="space-y-3 text-gray-400 leading-relaxed text-sm [&_strong]:text-gray-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#C9A84C]">
        {children}
      </div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-5 mb-2 font-bold text-gray-200 text-base">{children}</h3>;
}
