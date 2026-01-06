const validateTurnstile = async (
  token: string,
  remoteip: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: process.env.CLOUDFLARE_SECRET_KEY,
          response: token,
          remoteip: remoteip,
        }),
      }
    )

    const result = await response.json()
    console.log("Got Turnstile validation result", result)
    return true
  } catch (error) {
    console.error("Turnstile validation error:", error)
    return false
  }
}

export { validateTurnstile }
