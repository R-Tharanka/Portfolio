import LegalLayout from './LegalLayout';

const PrivacyPolicy = () => {
    return (
        <LegalLayout
            title="Privacy Policy"
            description="What personal information this portfolio collects, why it is used, and who helps process it."
        >
            <article className="space-y-8 text-sm leading-relaxed text-foreground/85">
                <section className="space-y-2">
                    <p>Effective date: 11 February 2026</p>
                    <p>
                        This site is operated by Ruchira Tharanka. I collect only the information needed to reply to
                        enquiries, keep the platform secure, and understand which content is helpful. Personal data is
                        never sold or used for advertising.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Data You Provide</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Contact form: name, email address, subject, and message.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Data Collected Automatically</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Google reCAPTCHA v2 evaluates browser/device signals to block automated abuse. As of 2 April 2026 Google processes this data solely on my behalf.</li>
                        <li>Google Analytics records anonymised usage metrics (page views, approximate region, device type) to improve the portfolio.</li>
                        <li>Hosting infrastructure may capture basic request logs for security and reliability monitoring.</li>
                        <li>Cloudinary serves media assets and receives standard CDN request metadata when images or videos load.</li>
                    </ul>
                    <p className="text-foreground/70">See the Cookie Policy for details about cookies and local storage.</p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">How The Data Is Used</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Replying to enquiries and ongoing project discussions.</li>
                        <li>Keeping the contact form secure and preventing spam.</li>
                        <li>Understanding site performance and prioritising improvements.</li>
                        <li>Delivering portfolio media quickly and reliably.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Data Processors</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Google reCAPTCHA (security) and Google Analytics (usage insights) operate under Google Cloud’s Data Processing Addendum.</li>
                        <li>Cloudinary hosts portfolio media assets.</li>
                        <li>Transactional email replies are sent from <a href="mailto:ruchiratharanka1@gmail.com" className="text-primary hover:underline">ruchiratharanka1@gmail.com</a>.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Retention</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Contact form submissions are kept only while the enquiry remains active.</li>
                        <li>Analytics data follows Google Analytics default retention periods.</li>
                        <li>Security and infrastructure logs are rotated on a routine schedule.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Your Choices</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>You can request access to, correction of, or deletion of data collected through the contact form.</li>
                        <li>Opt-out tools for Google Analytics and cookie preferences are described in the Cookie Policy.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                    <p>
                        Reach out with privacy questions at{' '}
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

export default PrivacyPolicy;
