import { LegalDocument } from "@/components/legal-document"

export default function TermsPage() {
  return (
    <LegalDocument
      kind="terms"
      title="Terms of Use (AI Generated)"
      summary="MeGPT is a student-built chat site with guest access, optional Google sign-in, and replies that may be read or sent by a human. This page is the practical version: what the project is, what to expect, and the ground rules that keep it usable."
      intro={[
        "Thanks for spending time with MeGPT.",
        "These terms apply to the MeGPT website, chat interface, guest mode, sign-in flow, and related project pages. By using the site, you are agreeing to the basics described here.",
        "MeGPT is a school project, not an official OpenAI or ChatGPT product, and not a polished commercial service. A human operator may read, route, and respond to messages sent through the site.",
      ]}
      dateLabel="Published"
      dateValue="April 16, 2026"
      effectiveDate="April 16, 2026"
      sections={[
        {
          title: "Using MeGPT",
          paragraphs: [
            "You must be at least 13 years old, or the minimum age required in your location to use an online service like this on your own. If you are under 18, use MeGPT only with permission from a parent or legal guardian.",
            "You may use MeGPT in guest mode or through a signed-in account when that option is available. Some features, saved history, or reply workflows may work differently depending on which mode you use.",
          ],
        },
        {
          title: "What MeGPT Is",
          paragraphs: [
            "MeGPT is a communication tool built around operator-assisted messaging. Replies may be written, reviewed, or sent by a human, so you should not assume the site is a fully autonomous chatbot.",
            "The project may use connected tools and infrastructure to store conversation history, manage attachments, notify the operator, and route replies back to the site.",
          ],
        },
        {
          title: "Accounts and Guest Chats",
          paragraphs: [
            "If you sign in, use your own account information and keep your login secure. You are responsible for activity that happens through your account.",
            "If you use guest mode, you understand that guest chats are temporary and may disappear automatically after a short period of inactivity.",
            "Do not impersonate another person, misrepresent your identity, or try to access conversations, files, or systems that are not meant for you.",
          ],
        },
        {
          title: "Keeping Things Usable",
          paragraphs: [
            "Use MeGPT lawfully and in a way that does not interfere with the operation, security, or availability of the site. In normal-person terms, do not try to break the project or make it miserable for other people.",
          ],
          bullets: [
            "Do not attempt unauthorized access, scraping, reverse engineering, or technical interference with the app or its connected systems.",
            "Do not send unlawful, abusive, harassing, hateful, fraudulent, or harmful content.",
            "Do not use the site for malware, phishing, spam, scams, or deceptive activity.",
            "Do not try to bypass moderation choices, conversation limits, or rate limits.",
          ],
        },
        {
          title: "What You Send",
          paragraphs: [
            "You are responsible for the messages, images, and other material you submit. You must have the rights needed to send that content, and it must not violate the law or anyone else’s rights.",
            "You keep ownership of your content. By sending it to MeGPT, you give the project permission to host, store, display, transmit, review, and process it so the site can function and a human operator can respond.",
          ],
        },
        {
          title: "Project Availability",
          paragraphs: [
            "MeGPT is a school project and is offered as-is. Features may change, break, pause, or disappear without notice.",
            "The operator may set conversation limits, file limits, or other usage controls to keep the project usable and safe.",
          ],
        },
        {
          title: "Important Reality Checks",
          paragraphs: [
            "MeGPT does not provide legal, medical, financial, academic, mental health, compliance, or other professional advice. You are responsible for checking anything important before acting on it.",
            "Responses may be delayed, incomplete, mistaken, biased, or written in a way that does not fit your situation. Use your own judgment and human review.",
            "To the extent allowed by law, MeGPT is provided without warranties, and the project owner is not responsible for indirect, incidental, or consequential losses that result from your use of the site.",
          ],
        },
        {
          title: "Pausing or Ending Access",
          paragraphs: [
            "You may stop using MeGPT at any time.",
            "The project may suspend access, delete content, or end conversations when reasonably needed to address abuse, security concerns, legal obligations, project shutdown, or violations of these terms.",
          ],
        },
        {
          title: "Updates",
          paragraphs: [
            "These terms may change as the project changes. When that happens, the date on this page will be updated.",
            "If you continue using MeGPT after a change takes effect, that continued use means you accept the revised terms.",
          ],
        },
      ]}
    />
  )
}
