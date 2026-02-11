import LegalLayout from './LegalLayout';

const TermsOfService = () => {
    return (
        <LegalLayout
            title="Terms of Service"
            description="The rules for using this portfolio site and administrative area."
        >
            <article className="space-y-8 text-sm leading-relaxed text-foreground/85">
                <section className="space-y-2">
                    <p>Effective date: 11 February 2026</p>
                    <p>
                        By visiting this site you agree to follow these Terms of Service. The site showcases my
                        professional work and provides a contact form for project enquiries. If you disagree with
                        the terms, please refrain from using the site.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Acceptable Use</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Use the contact form only for genuine collaboration or enquiry requests.</li>
                        <li>Do not upload or inject malicious code, attempt to overwhelm the service, or scrape content.</li>
                        <li>Respect intellectual property rights. All portfolio content remains owned by Ruchira Tharanka.</li>
                        <li>Do not impersonate others or submit content that is unlawful, abusive, or misleading.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Account & Admin Area</h2>
                    <p>
                        An authenticated admin interface exists to maintain projects, skills, and media. Access is
                        restricted to authorised administrators. Cloudinary integrations, media uploads, and API
                        management occur only within this secure admin area. Visitors to the public site do not
                        upload files or interact directly with Cloudinary.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            Google reCAPTCHA protects forms from automated abuse. From 2 April 2026 Google provides
                            this strictly as a data processor.
                        </li>
                        <li>Google Analytics helps understand aggregated site usage.</li>
                        <li>Cloudinary delivers media assets and stores files added through the admin area.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
                    <p>
                        Unless otherwise noted, all code samples, graphics, and written content on this site are
                        owned by Ruchira Tharanka. You may review and link to public content but may not copy or
                        repurpose it without permission.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Disclaimer</h2>
                    <p>
                        The portfolio is provided "as is" without warranties of any kind. I strive to keep the
                        content accurate and the site available, but I cannot guarantee uninterrupted operation or
                        error-free information. I am not liable for losses arising from your use of the site.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Changes</h2>
                    <p>
                        These terms may be updated occasionally to reflect new features or legal requirements. The
                        latest version will always be published on this page with an updated effective date.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                    <p>
                        Questions about these terms may be sent to{' '}
                        <a
                            href="mailto:ruchiratharanka1@gmail.com"
                            className="text-primary hover:underline"
                        >
                            ruchiratharanka1@gmail.com
                        </a>
                        .
                    </p>
                </section>
            </article>
        </LegalLayout>
    );
};

export default TermsOfService;
