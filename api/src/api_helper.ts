const getApiJsonData = async <T>(url: string): Promise<T> => {
  console.log("Calling with URL:", url)

  const response = await fetch(url)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to fetch recording results: status code ${response.status}, response body ${errorText}`
    )
  }

  try {
    return (await response.json()) as T
  } catch (error: unknown) {
    throw new Error(`Error parsing JSON: ${error}`)
  }
}

export { getApiJsonData }
