import LegalLayout from './LegalLayout';

const CookiePolicy = () => {
    return (
        <LegalLayout
            title="Cookie Policy"
            description="Details about cookies and similar technologies used on this portfolio."
        >
            <article className="space-y-8 text-sm leading-relaxed text-foreground/85">
                <section className="space-y-2">
                    <p>Effective date: 11 February 2026</p>
                    <p>
                        This policy explains what cookies and local storage values are used on the site, why they
                        are stored, and how you can manage your preferences.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">What Are Cookies?</h2>
                    <p>
                        Cookies are small text files placed on your device when you visit a website. They help the
                        site remember your preferences and understand how it is used. Similar technologies such as
                        local storage and session storage serve comparable purposes.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">How I Use Cookies</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>
                            <strong>Essential cookies:</strong> Google reCAPTCHA may set cookies that are required to
                            differentiate human visitors from automated traffic when you submit the contact form.
                        </li>
                        <li>
                            <strong>Analytics cookies:</strong> Google Analytics uses cookies to generate aggregated
                            reports about site traffic and interactions. These insights help improve content and
                            performance.
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Local Storage & Service Workers</h2>
                    <p>
                        The application stores limited information in your browser, such as your chosen theme
                        (light or dark) and flags that help manage service worker updates. This data stays on your
                        device and can be cleared at any time.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Managing Cookies</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>You can clear or block cookies through your browser settings.</li>
                        <li>
                            Google provides opt-out tools for Analytics at{' '}
                            <a
                                className="text-primary hover:underline"
                                href="https://tools.google.com/dlpage/gaoptout"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                https://tools.google.com/dlpage/gaoptout
                            </a>
                            .
                        </li>
                        <li>
                            Removing cookies may affect features that rely on them, such as reCAPTCHA form
                            submissions.
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Updates</h2>
                    <p>
                        This policy will be reviewed after substantive changes to the site or to applicable legal
                        requirements. Material updates will be posted on this page with a revised effective date.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                    <p>
                        For questions about cookies or data usage, email{' '}
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

export default CookiePolicy;
