import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Picks Leagues",
  description: "Terms of Service for Picks Leagues",
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="mb-6 text-3xl font-bold">Terms of Service</h1>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-2xl font-semibold">Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to Picks Leagues. By accessing or using our service, you
            agree to be bound by these Terms of Service. If you disagree with
            any part of the terms, you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Account Registration</h2>
          <p className="text-muted-foreground">
            To use certain features of our service, you must register for an
            account. You agree to provide accurate, current, and complete
            information during the registration process and to update such
            information to keep it accurate, current, and complete.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">User Conduct</h2>
          <p className="mb-2 text-muted-foreground">You agree not to:</p>
          <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
            <li>Use the service for any illegal purpose</li>
            <li>Violate any regulations, rules, or laws</li>
            <li>Interfere with or disrupt the service or servers</li>
            <li>Impersonate any person or entity</li>
            <li>Engage in any harassing, abusive, or harmful behavior</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Intellectual Property</h2>
          <p className="text-muted-foreground">
            The service and its original content, features, and functionality
            are and will remain the exclusive property of Picks Leagues. Our
            service may contain user-generated content that is not owned by us.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Termination</h2>
          <p className="text-muted-foreground">
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason, including without limitation if
            you breach the Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">
            Limitation of Liability
          </h2>
          <p className="text-muted-foreground">
            In no event shall Picks Leagues, nor its directors, employees,
            partners, agents, suppliers, or affiliates, be liable for any
            indirect, incidental, special, consequential or punitive damages,
            including without limitation, loss of profits, data, use, goodwill,
            or other intangible losses.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Governing Law</h2>
          <p className="text-muted-foreground">
            These Terms shall be governed and construed in accordance with the
            laws of the United States, without regard to its conflict of law
            provisions.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material we will try to
            provide at least 30 days notice prior to any new terms taking
            effect.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about these Terms, please contact us at:
            <br />
            <a
              href="mailto:picksleagues@gmail.com"
              className="text-primary hover:underline"
            >
              picksleagues@gmail.com
            </a>
          </p>
        </section>

        <footer className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Last updated: March 15, 2025
          </p>
        </footer>
      </div>
    </div>
  );
}
