import LegalLayout from './LegalLayout';

const TermsOfService = () => {
    return (
        <LegalLayout
            title="Terms of Service"
            description="Guidelines for using this portfolio site."
        >
            <article className="space-y-8 text-sm leading-relaxed text-foreground/85">
                <section className="space-y-2">
                    <p>Effective date: 11 February 2026</p>
                    <p>
                        By using this site you agree to the simple rules below. If anything here is unclear, please
                        reach out before continuing.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Acceptable Use</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Use the contact form for genuine project or collaboration enquiries.</li>
                        <li>Avoid activities that disrupt the service, including automated scraping or security testing without consent.</li>
                        <li>Do not submit unlawful, abusive, or misleading content.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
                    <p>
                        All portfolio content remains owned by Ruchira Tharanka unless otherwise noted. You are welcome to view and share links, but please do not reuse assets without permission.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
                    <p>
                        Google reCAPTCHA protects the contact form, Google Analytics provides usage insights, and Cloudinary serves media assets. These processors operate under the Privacy Policy.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Disclaimer</h2>
                    <p>
                        The site is provided “as is.” While I aim for accuracy and uptime, I cannot guarantee uninterrupted service or error-free content.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Changes</h2>
                    <p>
                        Terms may change when new features launch or legal guidance shifts. The latest version and effective date will always be posted here.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                    <p>
                        Questions about these terms? Email{' '}
                        <a href="mailto:ruchiratharanka1@gmail.com" className="text-primary hover:underline">
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
