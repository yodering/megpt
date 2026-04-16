import { LegalDocument } from "@/components/legal-document"

export default function TermsPage() {
  return (
    <LegalDocument
      kind="terms"
      title="Terms of Use"
      summary="MeGPT is a student-built chat site with guest access, optional Google sign-in, and human-reviewed replies. These terms explain, in plain English, what the project is, what you can expect from it, and the basic rules for using it."
      intro={[
        "Thank you for using MeGPT.",
        "These Terms of Use apply to the MeGPT website, chat interface, guest mode, sign-in flow, and any related project pages or features. By using the site, you agree to these terms.",
        "MeGPT is a school project, not an official OpenAI or ChatGPT product, and not a guaranteed production service. A human operator may read, route, and respond to messages sent through the site.",
        "Please also read the Privacy Policy. It explains what information the project collects and how that information is handled.",
      ]}
      dateLabel="Published"
      dateValue="April 16, 2026"
      effectiveDate="April 16, 2026"
      sections={[
        {
          title: "Who Can Use MeGPT",
          paragraphs: [
            "You must be at least 13 years old, or the minimum age required in your location to use an online service like this on your own. If you are under 18, use MeGPT only with permission from a parent or legal guardian.",
            "You may use MeGPT in guest mode or through a signed-in account when that option is available. Some features, saved history, or reply workflows may work differently depending on which mode you use.",
          ],
        },
        {
          title: "How MeGPT Works",
          paragraphs: [
            "MeGPT is a communication tool built around operator-assisted messaging. That means replies may be written, reviewed, or sent by a human, and you should not assume the site is a fully autonomous chatbot.",
            "The project may use connected tools and infrastructure to queue messages, store conversation history, manage attachments, and route replies back to the site.",
          ],
        },
        {
          title: "Accounts and Guest Mode",
          paragraphs: [
            "If you sign in, provide accurate account information and keep your login credentials secure. You are responsible for activity that happens through your account.",
            "If you use guest mode, you understand that guest chats are temporary and may disappear automatically after a short period of inactivity.",
            "Do not impersonate another person, misrepresent your identity, or try to access conversations, files, or systems that are not meant for you.",
          ],
        },
        {
          title: "Acceptable Use",
          paragraphs: [
            "Use MeGPT lawfully and in a way that does not interfere with the operation, security, or availability of the site.",
          ],
          bullets: [
            "Do not attempt unauthorized access, scraping, reverse engineering, or technical interference with the app or its connected systems.",
            "Do not send unlawful, abusive, harassing, hateful, fraudulent, or harmful content.",
            "Do not use the site for malware, phishing, spam, scams, or deceptive activity.",
            "Do not try to bypass queue limits, moderation choices, or rate limits.",
          ],
        },
        {
          title: "User Content",
          paragraphs: [
            "You are responsible for the messages, images, and other material you submit. You must have the rights needed to send that content, and it must not violate the law or anyone else’s rights.",
            "You keep ownership of your content. By submitting it to MeGPT, you give the project a limited right to host, store, display, transmit, review, and process that content so the site can function and a human operator can respond.",
          ],
        },
        {
          title: "Project Availability",
          paragraphs: [
            "MeGPT is a school project and is offered on an as-is and as-available basis. Features may change, break, pause, or disappear without notice.",
            "The operator may set queue limits, conversation limits, file limits, or other usage controls to keep the project usable and safe.",
          ],
        },
        {
          title: "Important Disclaimers",
          paragraphs: [
            "MeGPT does not provide legal, medical, financial, academic, mental health, compliance, or other professional advice. You are responsible for checking anything important before acting on it.",
            "Responses may be delayed, incomplete, mistaken, biased, or written in a way that does not fit your situation. Use your own judgment and human review.",
            "To the extent allowed by law, MeGPT is provided without warranties, and the project owner is not responsible for indirect, incidental, or consequential losses that result from your use of the site.",
          ],
        },
        {
          title: "Suspension and Termination",
          paragraphs: [
            "You may stop using MeGPT at any time.",
            "The project may suspend access, delete content, or end conversations when reasonably needed to address abuse, security concerns, legal obligations, project shutdown, or violations of these terms.",
          ],
        },
        {
          title: "Changes to These Terms",
          paragraphs: [
            "These terms may change as the project changes. When that happens, the date on this page will be updated.",
            "If you continue using MeGPT after a change takes effect, that continued use means you accept the revised terms.",
          ],
        },
      ]}
    />
  )
}
