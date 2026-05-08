import { LegalDocument } from "@/components/legal-document"

export default function AboutPage() {
  return (
    <LegalDocument
      kind="about"
      title="About MeGPT"
      summary="MeGPT is a student project by David Yoder, built as a human-assisted chat site for Radical Software at Davidson College."
      intro={[
        "Hi, I'm David Yoder, a student at Davidson College in the class of 2026.",
        "I made this site for Radical Software, a class about software as a creative, social, and critical medium.",
        "I wanted to see what it'd be like to be on the other end of ChatGPT. Receiving and replying to messages constantly, appeasing the user, etc.",
      ]}
      dateLabel="Project"
      dateValue="Radical Software"
      sections={[
        {
          title: "Concept and Execution",
          paragraphs: [
            "MeGPT started as an idea for a broken ChatGPT clone. My original plan was to use prompt engineering to make an AI model answer every message incorrectly. I wanted the site to feel like ChatGPT at first glance, but then disappoint the user by being confidently wrong, strange, or useless. Before building that version, I realized it would probably be expensive to run through an API, especially if people sent a lot of messages. I also was not sure I could trust the model to fail in the exact way I wanted. It might sometimes follow the prompt, sometimes accidentally become helpful, or sometimes produce errors that felt random instead of intentional. The project shifted when I realized the most direct way to control the wrongness, timing, and tone of each reply was to remove the model from the response process and answer everything myself.",
            "The final version keeps the structure of a chatbot but replaces automated generation with a manual operator workflow. I built a web app with guest access, Google sign-in, persistent conversation history, image uploads, and a Discord connection. When someone sends a message, it is saved to a Postgres database and mirrored into a private Discord thread where I can read it and respond. My reply is then sent back into the chat interface as if it came from the system. The execution matters because the site still uses the familiar visual language of AI products: chat bubbles, loading states, conversation history, and a calm input box. But behind that interface, the response is just me deciding what to say next.",
          ],
        },
        {
          title: "Links",
          paragraphs: [
            "You can find more of my work on my website or connect with me on LinkedIn.",
          ],
          links: [
            {
              label: "yoder.ing",
              href: "https://yoder.ing",
            },
            {
              label: "LinkedIn",
              href: "https://www.linkedin.com/in/yodering",
            },
          ],
        },
      ]}
    />
  )
}
