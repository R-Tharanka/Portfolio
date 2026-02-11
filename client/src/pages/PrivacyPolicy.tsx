import LegalLayout from './LegalLayout';

const PrivacyPolicy = () => {
    return (
        <LegalLayout
            title="Privacy Policy"
            description="How I collect, use, and safeguard information shared through this portfolio."
        >
            <article className="space-y-8 text-sm leading-relaxed text-foreground/85">
                <section className="space-y-2">
                    <p>Effective date: 11 February 2026</p>
                    <p>
                        This portfolio is operated by Ruchira Tharanka. I use the information you share
                        to respond to enquiries, keep the site secure, and continually improve the
                        experience. I do not sell personal information or use it for advertising.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Information I Collect</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            <strong>Contact form:</strong> name, email address, the subject you provide, and the
                            message body. This data is required to reply to your request.
                        </li>
                        <li>
                            <strong>reCAPTCHA v2:</strong> Google reCAPTCHA processes device/browser metadata to
                            help prevent automated abuse. Beginning 2 April 2026, Google will act solely as a data
                            processor for this service. The data is used only to validate that a real person
                            submitted the form.
                        </li>
                        <li>
                            <strong>Site analytics:</strong> Google Analytics records anonymous usage information
                            such as page views, approximate location, device type, and referrers. These reports
                            help me understand which content is most helpful.
                        </li>
                        <li>
                            <strong>Media hosting:</strong> Portfolio screenshots and demo assets are delivered via
                            Cloudinary. When media loads, Cloudinary may collect standard web server logs (IP
                            address, browser details) to operate the CDN.
                        </li>
                        <li>
                            <strong>System logs:</strong> The hosting platform may automatically log requests for
                            security and debugging. These logs are retained for a short period.
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">How I Use the Information</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Responding to enquiries you submit through the contact form.</li>
                        <li>Protecting the site against spam and abuse, including automated submissions.</li>
                        <li>Monitoring performance and improving content using aggregated analytics.</li>
                        <li>Maintaining media assets and ensuring they load quickly for visitors.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Data Sharing</h2>
                    <p>
                        I limit third-party sharing to the services required to operate the portfolio:
                    </p>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            Google Analytics and Google reCAPTCHA process data on my behalf. They do not use it for
                            their own advertising when interacting with this site.
                        </li>
                        <li>
                            Cloudinary delivers static media files. Only media request metadata is shared.
                        </li>
                        <li>
                            Email responses are sent through my personal inbox at{' '}
                            <a
                                href="mailto:ruchiratharanka1@gmail.com"
                                className="text-primary hover:underline"
                            >
                                ruchiratharanka1@gmail.com
                            </a>
                            .
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Cookies & Storage</h2>
                    <p>
                        This site uses minimal cookies. Google Analytics sets cookies to understand visit
                        patterns. The application may also store settings (such as theme preference or service
                        worker status) in your browser&apos;s local storage to enhance the experience.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Data Retention</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Contact form submissions are stored securely and deleted once no longer needed.</li>
                        <li>Analytics data is retained within Google Analytics according to its default schedule.</li>
                        <li>Server logs are periodically purged as part of routine maintenance.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
                    <p>
                        You may request access to, correction of, or deletion of the personal data collected
                        through this site. Contact me by email to submit a request. For reCAPTCHA or Analytics
                        data, I will work with Google as the processor to address your request.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                    <p>
                        For privacy enquiries, please email{' '}
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

export default PrivacyPolicy;
