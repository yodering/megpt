"use client"

import { Copy, RotateCcw, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  contentType?: "text" | "image"
  imageUrl?: string | null
  isStreaming?: boolean
}

export function ChatMessage({
  role,
  content,
  contentType = "text",
  imageUrl,
  isStreaming,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "group flex gap-4 py-4",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {role === "assistant" && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
          <svg
            viewBox="0 0 41 41"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
          >
            <path
              d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500512C16.1708 0.495043 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.26994 24.1293C2.81161 25.4759 2.65583 26.9026 2.80355 28.3141C2.95127 29.7256 3.39869 31.0892 4.11615 32.3138C5.17969 34.166 6.80423 35.6324 8.75512 36.5015C10.706 37.3706 12.8826 37.5974 14.9709 37.1492C15.9128 38.2107 17.0705 39.0588 18.3667 39.6366C19.6629 40.2144 21.0675 40.5088 22.4866 40.4995C24.6217 40.505 26.7032 39.832 28.4311 38.5779C30.159 37.3238 31.4439 35.5533 32.1007 33.5219C33.4916 33.2372 34.8056 32.6586 35.9547 31.825C37.1039 30.9913 38.0617 29.9218 38.764 28.688C39.8359 26.8409 40.2935 24.7012 40.0707 22.5772C39.8479 20.4532 38.9563 18.4551 37.5224 16.8707H37.5324ZM22.4866 37.3995C21.0816 37.4062 19.7041 36.9924 18.5283 36.2088C18.5682 36.1859 18.6366 36.1474 18.6849 36.1189L27.3778 31.1115C27.5679 31.0033 27.7251 30.8445 27.8323 30.6527C27.9394 30.4608 27.9927 30.2431 27.9867 30.0227V18.8983L31.5931 21.0003C31.6091 21.0088 31.6228 21.0214 31.633 21.037C31.6431 21.0526 31.6493 21.0707 31.6509 21.0897V30.1317C31.6475 32.0618 30.8784 33.912 29.5121 35.2779C28.1458 36.6438 26.2956 37.4122 24.3658 37.4148L22.4866 37.3995ZM6.39265 30.4708C5.68831 29.2432 5.39168 27.8217 5.54681 26.4126C5.58676 26.4368 5.65485 26.4783 5.70319 26.508L14.3961 31.5154C14.585 31.6248 14.7984 31.6826 15.0159 31.6826C15.2333 31.6826 15.4467 31.6248 15.6356 31.5154L26.4296 25.2776V29.4815C26.4336 29.5003 26.4333 29.5197 26.4288 29.5382C26.4242 29.5568 26.4155 29.5741 26.4035 29.5887L17.6227 34.6514C15.9579 35.6089 13.9999 35.932 12.1124 35.5582C10.2249 35.1844 8.53836 34.1384 7.37313 32.6116L6.39265 30.4708ZM4.29778 13.3131C5.00095 12.0832 6.08604 11.1106 7.38679 10.5394C7.38679 10.5853 7.38679 10.6637 7.38679 10.7214V20.7363C7.38075 20.9559 7.43388 21.1728 7.54055 21.3643C7.64721 21.5558 7.80364 21.715 7.99299 21.8245L18.787 28.0622L15.1806 30.1642C15.1643 30.1745 15.1457 30.1808 15.1264 30.1826C15.1071 30.1844 15.0876 30.1816 15.0699 30.1745L6.28915 25.1111C4.6291 24.1484 3.40665 22.5796 2.86078 20.7279C2.3149 18.8762 2.48609 16.8884 3.34012 15.1582L4.29778 13.3131ZM33.5225 19.1755L22.7285 12.9377L26.3349 10.8358C26.3512 10.8255 26.3697 10.8192 26.3891 10.8174C26.4084 10.8156 26.4279 10.8184 26.4456 10.8254L35.2263 15.8888C36.4322 16.5807 37.4329 17.5892 38.1191 18.8033C38.8053 20.0174 39.1514 21.3926 39.1203 22.7869C39.0892 24.1811 38.6822 25.5395 37.9434 26.7218C37.2046 27.9041 36.1612 28.8665 34.9266 29.5033V19.4884C34.9325 19.2695 34.8798 19.0532 34.7738 18.862C34.6678 18.6708 34.5124 18.512 34.3242 18.4022L33.5225 19.1755ZM37.1085 14.5844C37.0685 14.5602 37.0005 14.5186 36.9521 14.489L28.2592 9.48159C28.0703 9.37219 27.8569 9.3144 27.6395 9.3144C27.4221 9.3144 27.2087 9.37219 27.0198 9.48159L16.2258 15.7194V11.5154C16.2243 11.4964 16.2273 11.4774 16.2345 11.4598C16.2417 11.4422 16.2528 11.4266 16.2671 11.4144L25.0479 6.35173C26.254 5.65941 27.6229 5.30595 29.0129 5.32836C30.4028 5.35078 31.7589 5.74816 32.9412 6.47822C34.1234 7.20828 35.0893 8.24477 35.7382 9.48011C36.3871 10.7154 36.6961 12.1033 36.6336 13.5006L37.1085 14.5844ZM14.6682 22.1017L11.0618 19.9996C11.0458 19.9912 11.0321 19.9786 11.0219 19.963C11.0118 19.9474 11.0056 19.9294 11.004 19.9103V10.8683C11.0069 9.47335 11.3878 8.10534 12.1067 6.91C12.8257 5.71466 13.855 4.73665 15.0836 4.08058C16.3122 3.42451 17.6942 3.11457 19.0883 3.18391C20.4824 3.25326 21.8339 3.69917 22.9959 4.47266C22.9559 4.49548 22.8879 4.53403 22.8396 4.56261L14.1467 9.57003C13.9566 9.67822 13.7994 9.83704 13.6922 10.0289C13.5851 10.2207 13.5318 10.4385 13.5378 10.6588L14.6682 22.1017ZM16.2258 18.3328L20.3078 15.9703L24.3897 18.3328V23.0672L20.3078 25.4296L16.2258 23.0672V18.3328Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[70%] flex-col gap-2",
          role === "user" ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-3xl px-5 py-2.5",
            role === "user"
              ? "bg-card text-card-foreground"
              : "bg-transparent text-foreground"
          )}
        >
          {contentType === "image" && imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={content || "Operator reply image"}
                className="mb-3 max-h-[28rem] rounded-2xl border border-border object-cover"
              />
              {content ? (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {content}
                </p>
              ) : null}
            </>
          ) : (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
              {content}
              {isStreaming ? (
                <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-foreground align-middle" />
              ) : null}
            </p>
          )}
        </div>

        {role === "assistant" && !isStreaming && contentType !== "image" && content ? (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
