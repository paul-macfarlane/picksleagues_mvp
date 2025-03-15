import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Picks Leagues",
  description: "Privacy Policy for Picks Leagues",
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-2xl font-semibold">Introduction</h2>
          <p className="text-muted-foreground">
            At Picks Leagues, we respect your privacy and are committed to
            protecting your personal data. This Privacy Policy explains how we
            collect, use, and safeguard your information when you use our
            service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">
            Information We Collect
          </h2>
          <p className="mb-2 text-muted-foreground">
            We collect information you provide directly to us when you:
          </p>
          <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
            <li>Create an account</li>
            <li>Modify your profile</li>
            <li>Communicate with us</li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            This may include your name, email address, profile picture, and any
            other information you choose to provide.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">
            How We Use Your Information
          </h2>
          <p className="mb-2 text-muted-foreground">
            We use the information we collect to:
          </p>
          <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
            <li>Help league members identify you</li>
            <li>Provide, maintain, and improve our services</li>
            <li>Respond to your comments and questions</li>
            <li>
              Monitor and analyze trends, usage, and activities in connection
              with our services
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">
            Sharing of Information
          </h2>
          <p className="text-muted-foreground">
            We do not share your personal information with third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Data Security</h2>
          <p className="text-muted-foreground">
            We take reasonable measures to help protect your personal
            information from loss, theft, misuse, unauthorized access,
            disclosure, alteration, and destruction.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Your Rights</h2>
          <p className="text-muted-foreground">
            You may update, correct, or delete your account information at any
            time by accessing your profile's settings.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">
            Changes to This Privacy Policy
          </h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the effective date at the top of this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact
            us at:
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
