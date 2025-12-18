import { test, expect } from "@playwright/test"
import { invokeLambda } from "./aws_utils/lambda"
import { RUN_IN_PROD_TAG } from "./constants"
import { getObjectFromS3AsString } from "./aws_utils/s3"

const getEnvironmentVariable = (name: string): string => {
  const result = process.env[name]
  if (!result || result == "") {
    throw Error(`No value set for environment variable ${name}`)
  }
  return result as string
}

const getApiRoot = (): string => {
  return getEnvironmentVariable("API_ROOT")
}

const getApprovePresetListLambdaName = (): string => {
  return getEnvironmentVariable("APPROVE_PRESET_LIST_LAMBDA")
}

export interface SpeciesDetail {
  Species: string
  ScientificName: string
}

export interface PresetListSuggestion {
  region: string
  listName: string
  speciesList: SpeciesDetail[]
}

test(
  "should get a list of species for country",
  { tag: RUN_IN_PROD_TAG },
  async ({ request }) => {
    const speciesListResponse = await request.get(
      `${getApiRoot()}/species?region=GB`
    )
    expect(speciesListResponse.status()).toEqual(200)
    const speciesList = await speciesListResponse.json()
    expect(speciesList.species).toBeInstanceOf(Array)
    expect(
      speciesList.species.length,
      "Species list should have more than 200 entries"
    ).toBeGreaterThan(200)
    expect(
      speciesList.species.some(
        (species: SpeciesDetail) =>
          species.Species === "Blackbird" &&
          species.ScientificName == "Turdus merula"
      ),
      "Species list should contain Blackbird"
    ).toBe(true)
  }
)

const callApprovalEndpoint = async (
  suggestionId: string,
  approvalId: string
): Promise<Response> => {
  return fetch(
    `${getApiRoot()}/presets/approve/${suggestionId}?approvalId=${approvalId}`
  )
}

test("should be able to submit a suggestion, and on approval it shows up in the preset lists", async ({
  request,
}) => {
  const testPresetListName = `Test List ${Date.now()}`
  const testSpeciesList = [
    {
      Species: "Black Grouse",
      ScientificName: "Lyrurus tetrix",
    },
    {
      Species: "Ptarmigan",
      ScientificName: "Lagopus muta",
    },
  ]
  const presetListSuggestion = {
    region: "GB",
    listName: testPresetListName,
    speciesList: testSpeciesList,
  } as PresetListSuggestion
  const suggestionResponse = await request.post(
    `${getApiRoot()}/presets/suggestion`,
    { data: presetListSuggestion }
  )
  expect(suggestionResponse.status()).toEqual(200)
  const suggestion = await suggestionResponse.json()
  expect(suggestion.suggestionId).toBeDefined()

  const suggestionId = suggestion.suggestionId

  // Get the suggestion data from the bucket
  const suggestionsData = JSON.parse(
    await getObjectFromS3AsString(
      getEnvironmentVariable("SPECIES_LIST_BUCKET"),
      `suggestions/${suggestionId}.json`
    )
  )

  const approvalId = suggestionsData["approvalId"]

  // Check that using the wrong suggestionId gives a 403
  expect(
    (await callApprovalEndpoint("someSuggestionId", approvalId)).status
  ).toEqual(403)

  // Check that using the wrong approvalId gives a 403
  expect(
    (await callApprovalEndpoint(suggestionId, "someApprovalId")).status
  ).toEqual(403)
  // Approve the suggestion
  expect((await callApprovalEndpoint(suggestionId, approvalId)).status).toEqual(
    200
  )

  const presetsListResponse = await request.get(`${getApiRoot()}/presets/GB`)
  expect(presetsListResponse.status()).toEqual(200)
  const presetsList = await presetsListResponse.json()
  const newPresetList = presetsList.presets.find(
    (preset: { name: string }) => preset.name === testPresetListName
  )
  expect(newPresetList).toBeDefined()

  const newPresetListGetResponse = await request.get(
    `${getApiRoot()}/species?listId=${newPresetList.id}`
  )
  expect(newPresetListGetResponse.status()).toEqual(200)
  expect(await newPresetListGetResponse.json()).toEqual({
    species: testSpeciesList,
  })
})
