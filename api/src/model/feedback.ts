export interface FeedbackRequest {
  fromName: string
  fromEmail: string
  message: string
}

export const isFeedbackRequest = (arg: unknown): arg is FeedbackRequest => {
  const test = arg as FeedbackRequest
  return (
    typeof test?.fromEmail === "string" &&
    typeof test?.fromName === "string" &&
    typeof test?.message === "string"
  )
}
