import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';

const CookiePolicy = () => {
    return (
        <LegalLayout
            title="Cookie Policy"
            description="How this portfolio uses cookies, local storage, and how you can control them."
        >
            <article className="space-y-8 text-sm leading-relaxed text-foreground/85">
                <section className="space-y-2">
                    <p>Effective date: 11 February 2026</p>
                    <p>
                        Cookies and similar technologies keep the site secure and help me understand traffic patterns. For broader details about personal data, visit the{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Types of Cookies Used</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li><strong>Essential:</strong> Google reCAPTCHA may set short-lived cookies to confirm a real visitor before a form is submitted.</li>
                        <li><strong>Analytics:</strong> Google Analytics uses cookies to record aggregated site statistics such as page views and device type.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Local Storage</h2>
                    <p>
                        The site stores minimal values (for example, dark or light theme choice and service worker refresh flags) directly in your browser. You can remove these at any time without affecting account data.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Your Controls</h2>
                    <ul className="list-disc space-y-2 pl-5">
                        <li>Adjust cookie settings or clear storage through your browser preferences.</li>
                        <li>
                            Use Google’s Analytics opt-out add-on at{' '}
                            <a className="text-primary hover:underline" href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                                https://tools.google.com/dlpage/gaoptout
                            </a>
                            .
                        </li>
                        <li>Blocking essential cookies may prevent forms from submitting successfully.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Updates</h2>
                    <p>
                        I review this policy when cookie behaviour or legal requirements change. Updated versions will show a new effective date.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                    <p>
                        Need more information? Email{' '}
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

export default CookiePolicy;
