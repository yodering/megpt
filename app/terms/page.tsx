import { LegalDocument } from "@/components/legal-document"

export default function TermsPage() {
  return (
    <LegalDocument
      kind="terms"
      title="Terms of Service"
      description="These terms govern your access to MeGPT, including guest mode, authenticated accounts, operator-assisted replies, and the service rules that keep the product usable and safe."
      lastUpdated="April 13, 2026"
      sections={[
        {
          title: "Using MeGPT",
          paragraphs: [
            "By accessing or using MeGPT, you agree to these Terms of Service. If you do not agree, do not use the service.",
            "MeGPT may offer both guest access and authenticated access. Some features, history retention, and operator workflows may behave differently depending on whether you are using a guest session or a signed-in account.",
          ],
        },
        {
          title: "Service Model",
          paragraphs: [
            "MeGPT is a communication tool built around operator-assisted messaging. Replies may be prepared, reviewed, or sent by a human operator. You should not assume the service is a fully autonomous chatbot or a source of professional advice.",
            "The product may use connected infrastructure and workflow tools to route messages, queue replies, and keep conversation state synchronized across interfaces.",
          ],
        },
        {
          title: "Accounts and Guest Sessions",
          paragraphs: [
            "You are responsible for using any account connected to MeGPT lawfully and for maintaining the security of credentials you choose to use with the service. If you access the product through guest mode, you understand that guest history may be temporary and may expire automatically.",
            "You may not impersonate another person, misrepresent your identity, or attempt to gain access to conversations or systems that are not intended for you.",
          ],
        },
        {
          title: "Acceptable Use",
          paragraphs: [
            "You may use MeGPT only in ways that comply with applicable law and do not interfere with the operation, security, or availability of the service.",
          ],
          bullets: [
            "Do not attempt unauthorized access, scraping, reverse engineering, or interference with the app, its APIs, or connected operator systems.",
            "Do not send unlawful, abusive, harassing, fraudulent, or harmful content.",
            "Do not use the service to distribute malware, phishing content, spam, or deceptive material.",
            "Do not use the product in ways that could overload shared infrastructure or bypass queueing, moderation, or rate-limit controls.",
          ],
        },
        {
          title: "User Content",
          paragraphs: [
            "You retain responsibility for the messages and materials you submit. You represent that you have the rights needed to provide that content and that your content does not violate law or the rights of others.",
            "You grant MeGPT the limited rights necessary to host, store, display, transmit, and process your content for the purpose of operating the service and supporting the operator workflow.",
          ],
        },
        {
          title: "Availability and Changes",
          paragraphs: [
            "MeGPT is provided on an as-is and as-available basis. Features, integrations, and access controls may change without notice. The service may be suspended, rate-limited, or modified at any time for maintenance, security, abuse prevention, or operational reasons.",
            "The operator may set queue limits, conversation limits, or other usage thresholds to keep the service functioning reliably.",
          ],
        },
        {
          title: "No Professional Advice",
          paragraphs: [
            "Unless MeGPT explicitly states otherwise in a separate written agreement, the service does not provide legal, medical, financial, compliance, or other regulated professional advice. You remain responsible for evaluating outputs and verifying important decisions independently.",
          ],
        },
        {
          title: "Suspension and Termination",
          paragraphs: [
            "MeGPT may suspend or terminate access, remove content, or disable conversations when reasonably necessary to address abuse, security concerns, legal obligations, operational issues, or violations of these terms.",
            "You may stop using the service at any time. Termination or suspension does not necessarily require advance notice.",
          ],
        },
        {
          title: "Disclaimers and Liability",
          paragraphs: [
            "To the fullest extent permitted by law, MeGPT disclaims warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted availability. The service may contain bugs, delays, or inaccurate outputs.",
            "To the fullest extent permitted by law, MeGPT and its operators will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, goodwill, or business opportunity arising from your use of the service.",
          ],
        },
        {
          title: "Updates to These Terms",
          paragraphs: [
            "These Terms of Service may be updated from time to time. When practical, the page will show a revised last-updated date. Continued use of MeGPT after changes take effect means you accept the revised terms.",
          ],
        },
      ]}
    />
  )
}
