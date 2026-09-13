import type { Metadata } from "next";
import { LegalList, LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
	title: "Terms of Use",
	description: "Read the terms that apply when you use Comynity.",
};

export default function TermsPage() {
	return (
		<LegalPage
			title="Terms of Use"
			intro="These Terms of Use govern your access to and use of Comynity. By using the service, you agree to these terms. If you do not agree, please do not use Comynity."
			sections={[
				{
					title: "Using Comynity",
					content: <p>You may use Comynity to discover local businesses and services and, where available, manage an account or business listing. You must comply with applicable laws and provide accurate information when creating an account or submitting content.</p>,
				},
				{
					title: "Accounts and security",
					content: <p>You are responsible for activity under your account and for maintaining control of your device and login credentials. Notify us through an available support channel if you believe your account has been accessed without authorization.</p>,
				},
				{
					title: "Business listings and user content",
					content: (
						<>
							<p>You retain ownership of content you submit. You grant Comynity a worldwide, non-exclusive, royalty-free license to host, store, reproduce, adapt, publish, display, and distribute that content as needed to operate and promote the service.</p>
							<p>You confirm that you have the rights and permissions needed to submit the content and that it is accurate, lawful, and does not violate another person’s rights. We may edit formatting, verify details, reject submissions, or remove content.</p>
						</>
					),
				},
				{
					title: "Prohibited conduct",
					content: (
						<LegalList>
							<li>Submitting false, misleading, unlawful, infringing, or harmful information.</li>
							<li>Impersonating another person or claiming a business without authorization.</li>
							<li>Scraping, disrupting, reverse engineering, or attempting unauthorized access to the service.</li>
							<li>Using Comynity to distribute spam, malware, harassment, or fraudulent promotions.</li>
						</LegalList>
					),
				},
				{
					title: "Third-party businesses and services",
					content: <p>Comynity helps users discover independent businesses but does not control or endorse their products, services, pricing, availability, safety, or conduct. Transactions and communications with a business are between you and that business. External links and third-party services are governed by their own terms.</p>,
				},
				{
					title: "Service availability",
					content: <p>We may change, suspend, or discontinue features and may correct or remove listings without notice. We do not guarantee that Comynity will always be available, error-free, complete, or current.</p>,
				},
				{
					title: "Disclaimers and liability",
					content: <p>To the extent permitted by law, Comynity is provided “as is” and “as available” without warranties of any kind. Comynity and its operators will not be liable for indirect, incidental, special, consequential, or punitive damages, or for losses arising from third-party businesses, listings, or reliance on service content.</p>,
				},
				{
					title: "Termination",
					content: <p>You may stop using Comynity at any time. We may restrict or terminate access when we reasonably believe these terms have been violated, the service or users are at risk, or the law requires it. Provisions intended to survive termination will remain effective.</p>,
				},
				{
					title: "Changes and contact",
					content: <p>We may update these terms as the service evolves. Continued use after updated terms take effect constitutes acceptance where permitted by law. For questions about these terms, use the support or contact channel made available within Comynity.</p>,
				},
			]}
		/>
	);
}
