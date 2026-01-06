import React, { useState, useEffect, useRef } from "react"
import "./Modal.css"
import { postApi } from "./api"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  )
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (
      isOpen &&
      turnstileRef.current &&
      window.turnstile &&
      !widgetIdRef.current
    ) {
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: process.env.CLOUDFLARE_SITE_KEY as string,
        callback: (token: string) => {
          setTurnstileToken(token)
        },
        "error-callback": () => {
          setTurnstileToken(null)
        },
        "expired-callback": () => {
          setTurnstileToken(null)
        },
      })
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).className === "modal") {
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await postApi("feedback", {
        fromName: name,
        fromEmail: email,
        message,
        turnstileToken,
      })
      setSubmitStatus("success")
      setName("")
      setEmail("")
      setMessage("")
      setTurnstileToken(null)
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
    } catch (error) {
      console.error("Error sending feedback:", error)
      setSubmitStatus("error")
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOk = () => {
    onClose()
    setSubmitStatus(null)
  }

  return (
    <div className="modal" onClick={handleOverlayClick}>
      <div className="modal-box">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>Send Feedback</h2>
        <p>
          We'd love to hear from you! Share your thoughts, report bugs, or
          suggest new features.
        </p>

        {submitStatus === "success" ? (
          <div>
            <div className="feedback-success">
              Thank you! Your feedback has been sent successfully.
            </div>
            <div className="feedback-actions">
              <button
                type="button"
                onClick={handleOk}
                className="feedback-button feedback-button-primary"
              >
                OK
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label htmlFor="name">
                Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                required
                rows={6}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <div ref={turnstileRef}></div>
            </div>

            {submitStatus === "error" && (
              <div className="feedback-error">
                Sorry, there was an error sending your feedback. Please try
                again.
              </div>
            )}

            <div className="feedback-actions">
              <button
                type="button"
                onClick={onClose}
                className="feedback-button feedback-button-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="feedback-button feedback-button-primary"
                disabled={
                  isSubmitting ||
                  !message.trim() ||
                  !name.trim() ||
                  !email.trim() ||
                  !turnstileToken
                }
              >
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default FeedbackModal
