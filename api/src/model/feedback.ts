export interface FeedbackRequest {
  fromName: string
  fromEmail: string
  message: string
  turnstileToken: string
}

export const isFeedbackRequest = (arg: unknown): arg is FeedbackRequest => {
  const test = arg as FeedbackRequest
  return (
    typeof test?.turnstileToken === "string" &&
    typeof test?.fromEmail === "string" &&
    typeof test?.fromName === "string" &&
    typeof test?.message === "string"
  )
}
