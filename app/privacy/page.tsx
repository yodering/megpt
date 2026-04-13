import { LegalDocument } from "@/components/legal-document"

export default function PrivacyPage() {
  return (
    <LegalDocument
      kind="privacy"
      title="Privacy Policy"
      description="This policy explains what MeGPT collects, why it is processed, how long it may be retained, and how guest mode, sign-in, and human-operated replies affect your data."
      lastUpdated="April 13, 2026"
      sections={[
        {
          title: "Overview",
          paragraphs: [
            "MeGPT is a messaging product that supports both guest conversations and optional authenticated use. The service is designed around operator-assisted replies, which means information you send through the interface may be viewed and handled by a human operator in addition to any supporting software systems.",
            "This Privacy Policy applies to information processed through the MeGPT web application, its authentication flow, its internal operator workflow, and supporting infrastructure used to deliver, store, and manage conversations.",
          ],
        },
        {
          title: "Information We Collect",
          paragraphs: [
            "When you use guest mode, MeGPT may assign a temporary guest identifier so the app can keep the current session working and reconnect the browser to the correct conversation history during that session.",
            "When you sign in, MeGPT may store basic account information needed to operate the service, such as your name, email address, and profile image if those details are provided by your identity provider.",
            "When you send a message, MeGPT may store the message body, timestamps, conversation identifiers, and any associated metadata required to show the thread in the user interface and route it to the operator workflow.",
          ],
          bullets: [
            "Conversation content that you submit through the chat interface.",
            "Authentication details needed to recognize an account and maintain access.",
            "Operational metadata such as timestamps, thread identifiers, and conversation status.",
            "Images or other media sent through supported reply channels when those are attached to a conversation.",
          ],
        },
        {
          title: "How We Use Information",
          paragraphs: [
            "MeGPT uses collected information to run the product, associate requests with the correct user or guest session, route conversations to the operator workflow, display message history, and improve reliability and abuse prevention.",
            "Information may also be used to diagnose service problems, enforce rate limits or queueing rules, and maintain the integrity of the operator dashboard and external messaging integrations used to deliver replies.",
          ],
        },
        {
          title: "Human Operator Access",
          paragraphs: [
            "MeGPT is intentionally structured so that a human operator may read, respond to, and manage conversations. You should not assume that messages are processed only by an automated model.",
            "Because operator handling is part of the core product behavior, information visible in the conversation may also be visible in any connected operator tools used to manage response workflows.",
          ],
        },
        {
          title: "Third-Party Services",
          paragraphs: [
            "Depending on deployment configuration, MeGPT may rely on external providers for authentication, hosting, logging, database storage, and operator messaging infrastructure. Those providers may process data on behalf of the service as needed to supply their functionality.",
            "Examples may include identity providers, cloud hosting platforms, managed databases, and integrations used to deliver or synchronize operator replies. Their own privacy terms may apply to information processed through their systems.",
          ],
        },
        {
          title: "Retention",
          paragraphs: [
            "Guest conversations are intended to be temporary and may be automatically deleted after a short retention period or after inactivity. Logged-in account conversations may be retained longer so they can appear in the interface and operator workflow.",
            "Operational logs, queue records, and related metadata may persist for a different period than visible conversation content when needed for reliability, troubleshooting, abuse prevention, or legal compliance.",
          ],
        },
        {
          title: "Security and Limitations",
          paragraphs: [
            "MeGPT uses reasonable technical and organizational measures to protect stored data, but no internet-connected service can guarantee complete security. You should avoid submitting sensitive personal, financial, medical, or confidential business information unless you are comfortable with the risks of digital transmission and human review.",
            "Access controls, authentication, and infrastructure protections are intended to reduce risk, but they do not eliminate it entirely.",
          ],
        },
        {
          title: "Your Choices",
          paragraphs: [
            "You may choose whether to use guest mode or an authenticated account. You can also stop using the service at any time. If you want information deleted or need help with account-related privacy questions, use the support contact associated with the deployment or the contact details shown in the Google consent configuration.",
            "Requests may be limited by technical feasibility, legal requirements, security considerations, or the need to preserve operational records necessary to protect the service and its users.",
          ],
        },
        {
          title: "Policy Changes",
          paragraphs: [
            "This Privacy Policy may be updated as MeGPT changes. When practical, the service will reflect a revised effective date on this page. Continued use after an update means the revised policy governs future use of the service.",
          ],
        },
      ]}
    />
  )
}
