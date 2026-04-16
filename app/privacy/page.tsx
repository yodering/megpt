import { LegalDocument } from "@/components/legal-document"

export default function PrivacyPage() {
  return (
    <LegalDocument
      kind="privacy"
      title="Privacy Policy"
      summary="This page explains what MeGPT collects, why it collects it, who may see it, and how long it is usually kept. It is written to match what the project actually does today, without hiding the important parts behind heavy legal wording."
      intro={[
        "MeGPT is a school project and a human-assisted chat tool. If you send a message through the site, a human operator may be able to read and reply to it.",
        "This Privacy Policy applies to the MeGPT website, guest sessions, Google sign-in flow, chat interface, uploads, and the operator tools used to receive and send messages.",
        "The goal of this page is transparency. It describes the information the project handles and the practical reasons that information is used.",
      ]}
      dateLabel="Updated"
      dateValue="April 16, 2026"
      sections={[
        {
          title: "Information We Collect",
          paragraphs: [
            "The information MeGPT collects depends on how you use the site. If you use guest mode, the app stores a temporary guest identifier so it can keep your session connected to the right conversation.",
            "If you sign in with Google, the project may receive basic account information such as your name, email address, profile image, and the identifiers needed to keep you signed in.",
            "When you send a message, MeGPT may store the message itself, timestamps, conversation IDs, status information, and any images you upload so the chat can appear in the interface and be answered by the operator workflow.",
          ],
          bullets: [
            "Guest-session identifiers stored in the browser for temporary chat access.",
            "Account details returned by Google sign-in when you choose to log in.",
            "Messages, attachments, timestamps, and conversation metadata.",
            "Basic technical and request information needed to operate and secure the site.",
            "Optional analytics data if the deployment enables Umami analytics in production.",
          ],
        },
        {
          title: "How We Use Information",
          paragraphs: [
            "MeGPT uses information to run the site, connect messages to the correct user or guest session, show conversation history, route messages to the operator workflow, and deliver replies back to the chat interface.",
            "Information may also be used to prevent abuse, enforce queue limits, troubleshoot bugs, maintain database records, and understand whether the site is working reliably.",
          ],
        },
        {
          title: "Human Review and Service Providers",
          paragraphs: [
            "A human operator may read, manage, and reply to messages sent through MeGPT. That is part of the core design of the project, not an exception.",
            "Depending on how the project is deployed, information may also pass through third-party providers that help run the site, such as Google for sign-in, hosting and database providers, Discord for operator message handling, and optional analytics providers. Those providers may process information according to their own terms and privacy notices.",
          ],
        },
        {
          title: "How Long We Keep Information",
          paragraphs: [
            "Guest conversations are meant to be temporary. In this project, guest chats are normally deleted after about 30 minutes of inactivity unless the deployment uses a different retention setting.",
            "Signed-in account conversations may be kept longer so they remain visible in the interface and operator workflow. Some logs, queue records, and related metadata may remain longer when needed for reliability, troubleshooting, abuse prevention, or legal compliance.",
            "If guest messages include uploaded images, those images are deleted when the related guest conversation is cleaned up.",
          ],
        },
        {
          title: "Your Choices",
          paragraphs: [
            "You can choose whether to use MeGPT in guest mode or with Google sign-in. You can also stop using the site at any time.",
            "When the interface allows it, you can delete conversations yourself. If you need additional help with deletion or privacy questions, use the project contact method listed on the site or the developer contact shown in the Google consent flow for this project.",
            "Because this project includes human review and ordinary cloud tooling, avoid sending highly sensitive personal, financial, medical, or confidential business information unless you are comfortable with that risk.",
          ],
        },
        {
          title: "Security and Limits",
          paragraphs: [
            "MeGPT uses reasonable steps to protect stored information, but no website or online service can promise perfect security.",
            "Using the site means accepting the usual risks of internet communication, cloud storage, and human handling of messages.",
          ],
        },
        {
          title: "Changes to This Policy",
          paragraphs: [
            "This policy may change if the project changes. When it does, the date at the top of this page will be updated.",
            "If you continue using MeGPT after a change takes effect, the updated policy will apply going forward.",
          ],
        },
      ]}
    />
  )
}
