import { LegalDocument } from "@/components/legal-document"

export default function AboutPage() {
  return (
    <LegalDocument
      kind="about"
      title="About MeGPT"
      summary="MeGPT is a student project by David Yoder, built as a human-assisted chat site for Radical Software at Davidson College."
      intro={[
        "Hi, I'm David Yoder. I'm a student at Davidson College in the class of 2026.",
        "I made this site for Radical Software, a class about software as a creative, social, and critical medium.",
        "MeGPT is intentionally a little uncanny: it looks like a chatbot, but the reply workflow is human-assisted. The project is partly about the interface, partly about expectation, and partly about what changes when software admits there is a person behind the curtain.",
      ]}
      dateLabel="Project"
      dateValue="Radical Software"
      sections={[
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
