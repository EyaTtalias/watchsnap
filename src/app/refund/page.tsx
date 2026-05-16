import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Refund Policy — WatchSnap",
  description: "WatchSnap Refund Policy — our commitment to your satisfaction with a 30-day money-back guarantee.",
  openGraph: {
    title: "Refund Policy — WatchSnap",
    description: "WatchSnap offers a 30-day money-back guarantee on all paid plans — no questions asked.",
    url: "https://watchsnap.vercel.app/refund",
    siteName: "WatchSnap",
    images: [{ url: "https://watchsnap.vercel.app/icons/icon-512.png", width: 512, height: 512 }],
  },
  twitter: { card: "summary", title: "Refund Policy — WatchSnap" },
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-3xl px-4 pt-20 pb-10">
        <Link href="/landing" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        {/* Header */}
        <div className="mb-12 border-b border-[#1E1E1E] pb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">Legal</p>
          <h1 className="text-4xl font-black sm:text-5xl mb-4">Refund Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: May 11, 2026</p>
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <SummaryCard
            icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
            color="border-emerald-500/20 bg-emerald-500/5"
            title="Annual Plan"
            desc="30-day money-back guarantee from purchase date"
          />
          <SummaryCard
            icon={<CheckCircle className="h-5 w-5 text-[#C9A84C]" />}
            color="border-[#C9A84C]/20 bg-[#C9A84C]/5"
            title="Monthly Plan"
            desc="7-day refund window after first charge (post-trial)"
          />
          <SummaryCard
            icon={<AlertCircle className="h-5 w-5 text-blue-400" />}
            color="border-blue-500/20 bg-blue-500/5"
            title="Free Trial"
            desc="No charge during trial — cancel any time, no fees"
          />
        </div>

        <div className="prose-legal">
          <Section title="1. Our Commitment">
            <p>
              We stand behind WatchSnap and want every subscriber to be fully satisfied.
              If you are not happy with the Service for any reason, please contact us and we will do our best to help.
            </p>
          </Section>

          <Section title="2. Free Trial">
            <p>
              Monthly subscriptions include a <strong>7-day free trial</strong>. During this period:
            </p>
            <ul>
              <li>Your payment method is saved securely by Paddle but <strong>not charged</strong>.</li>
              <li>You have full access to all Pro features.</li>
              <li>You may cancel at any time before the trial ends with <strong>zero charge</strong> — no questions asked.</li>
            </ul>
            <p>
              If you forget to cancel and are charged at the end of your trial, you may request a full refund
              within <strong>7 days</strong> of that first charge. See Section 3 below.
            </p>
          </Section>

          <Section title="3. Monthly Subscription Refunds">
            <p>
              Monthly subscribers are eligible for a <strong>full refund</strong> if requested within
              <strong> 7 days</strong> of their first payment (i.e. after the free trial ends).
              Refunds are not available for subsequent monthly renewals.
            </p>
            <p>
              Rationale: the free trial gives you 7 days to fully evaluate the Service before being charged.
              Subsequent months are non-refundable because the Service has been available to you for the full period.
            </p>
          </Section>

          <Section title="4. Annual Subscription Refunds">
            <p>
              Annual subscribers are covered by a <strong>30-day money-back guarantee</strong> from the date of purchase.
              If you are unsatisfied for any reason within 30 days, contact us for a full refund — no questions asked.
            </p>
            <p>
              After 30 days, annual subscriptions are non-refundable; however, you will continue to have access
              to the Service for the remainder of your paid year.
            </p>
          </Section>

          <Section title="5. How to Request a Refund">
            <p>To request a refund:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Email us at <a href="mailto:watchsnapapp@gmail.com" className="text-[#C9A84C] hover:underline">watchsnapapp@gmail.com</a></li>
              <li>Include the email address associated with your subscription</li>
              <li>Include your Paddle order ID (found in your receipt email) if available</li>
              <li>Briefly describe your reason (optional but appreciated)</li>
            </ol>
            <p>
              We aim to respond within <strong>1 business day</strong> and process eligible refunds within
              <strong> 5–10 business days</strong> depending on your bank or card issuer.
            </p>
          </Section>

          <Section title="6. Exceptions — When Refunds Are Not Available">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-300 mb-2">Refunds are not available in these cases:</p>
                  <ul className="space-y-1.5 text-red-400/80">
                    <li>Requests made outside the eligible refund window (7 days for monthly, 30 days for annual)</li>
                    <li>Monthly subscription renewals beyond the first payment</li>
                    <li>Accounts found to have violated our Terms of Service</li>
                    <li>Abuse of the refund policy (e.g. repeated subscribe-refund cycles)</li>
                    <li>Free scans — the 3 free scans available without a subscription carry no charge</li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          <Section title="7. Chargebacks">
            <p>
              We ask that you contact us before initiating a chargeback with your bank. Chargebacks filed without
              first contacting our support team may result in account suspension. We are committed to resolving
              any billing issues quickly and fairly.
            </p>
          </Section>

          <Section title="8. Cancellation vs. Refund">
            <p>
              Cancelling your subscription stops future charges but does not automatically issue a refund for the
              current period. To receive a refund (within the eligible window), you must explicitly request one
              by contacting support.
            </p>
          </Section>

          <Section title="9. Paddle as Merchant of Record">
            <p>
              All payments for WatchSnap are processed by <strong>Paddle</strong>, who acts as our Merchant of Record.
              Refunds are issued through Paddle back to your original payment method. Paddle&apos;s own refund processing
              is subject to their terms and conditions. In all cases, WatchSnap will honour the refund commitments
              stated in this policy.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page
              with an updated &quot;Last updated&quot; date. Your continued use of the Service after changes constitutes
              acceptance of the revised policy. Changes do not affect refund rights already accrued.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>Questions about refunds? We&apos;re here to help:</p>
            <div className="mt-3 rounded-2xl border border-[#1E1E1E] bg-[#111111] p-5">
              <p className="font-bold text-white">WatchSnap Support</p>
              <p className="text-gray-400 mt-1">Email: <a href="mailto:watchsnapapp@gmail.com" className="text-[#C9A84C] hover:underline">watchsnapapp@gmail.com</a></p>
              <p className="text-gray-500 text-xs mt-2">Response time: within 1 business day</p>
            </div>
          </Section>
        </div>

      </div>
    </div>
  );
}

function SummaryCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  return (
    <div className={`rounded-2xl border ${color} p-4`}>
      <div className="mb-2">{icon}</div>
      <p className="font-black text-white text-sm mb-1">{title}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="mb-4 text-xl font-black text-white">{title}</h2>
      <div className="space-y-3 text-gray-400 leading-relaxed text-sm [&_strong]:text-gray-200 [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-[#C9A84C]">
        {children}
      </div>
    </div>
  );
}
