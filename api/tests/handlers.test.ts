import { getRandomRecordingForSpecies } from "../src/recording"
import {
  getRecording,
  getSpeciesList,
  getSpeciesPresetLists,
  suggestPresetList,
  approvePresetList,
  notifyPresetListSuggested,
} from "../src/handlers"
import { mockApiGatewayEvent, mockRecordingResponse } from "./mockObjects"
import {
  loadSpeciesListById,
  loadSpeciesListForRegion,
  getSpeciesPresetListsForRegion,
} from "../src/species"
import {
  storeSuggestedSpeciesList,
  approveSuggestedSpeciesList,
} from "../src/preset_suggestions"
import { sendEmailWithSuggestionData } from "../src/preset_suggestions"
import { S3Event } from "aws-lambda"

jest.mock("../src/recording", () => ({
  getRandomRecordingForSpecies: jest.fn(),
}))

jest.mock("../src/species", () => ({
  loadSpeciesListById: jest.fn(),
  loadSpeciesListForRegion: jest.fn(),
  getSpeciesPresetListsForRegion: jest.fn(),
}))

jest.mock("../src/preset_suggestions", () => ({
  sendEmailWithSuggestionData: jest.fn(),
  storeSuggestedSpeciesList: jest.fn(),
  approveSuggestedSpeciesList: jest.fn(),
}))

const mockGetRandomRecordingForSpecies =
  getRandomRecordingForSpecies as jest.Mock
const mockLoadSpeciesListById = loadSpeciesListById as jest.Mock
const mockLoadSpeciesListForRegion = loadSpeciesListForRegion as jest.Mock
const mockGetSpeciesPresetListsForRegion =
  getSpeciesPresetListsForRegion as jest.Mock
const mockStoreSuggestedSpeciesList = storeSuggestedSpeciesList as jest.Mock
const mockApproveSuggestedSpeciesList = approveSuggestedSpeciesList as jest.Mock
const mockSendEmailWithSuggestionData = sendEmailWithSuggestionData as jest.Mock

const TEST_SPECIES = "Testus specieus"
const TEST_SOUND_URL = "https://xeno-canto.com/some-mp3.mp3"
const CACHE_CONTROL_HEADER_MAX_AGE_YEAR = "public, max-age=31536000"

const givenRecordingAvailable = () => {
  const response = mockRecordingResponse(TEST_SPECIES, TEST_SOUND_URL)
  mockGetRandomRecordingForSpecies.mockResolvedValue(response)
  return response
}

describe("getRecording tests", () => {
  it("Should call through to getRandomRecordingForSpecies", async () => {
    const recordingData = givenRecordingAvailable()
    const recordingResponse = await getRecording(
      mockApiGatewayEvent(null, { species: TEST_SPECIES })
    )
    expect(getRandomRecordingForSpecies).toHaveBeenCalledWith(
      TEST_SPECIES,
      null
    )
    expect(recordingResponse.statusCode).toEqual(200)
    expect(recordingResponse.body).toEqual(
      JSON.stringify({
        species: TEST_SPECIES,
        recording: {
          id: "737917",
          en: "Great Black-backed Gull",
          rec: "Alan Dalton",
          gen: "Larus",
          sp: "marinus",
        },
        soundUrl: TEST_SOUND_URL,
      })
    )
  })

  it("Should return a 400 status code when species isn't provided", async () => {
    const response = await getRecording(mockApiGatewayEvent(null))
    expect(getRandomRecordingForSpecies).not.toHaveBeenCalled()
    expect(response.statusCode).toEqual(400)
  })
})

describe("getSpeciesList tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("when querying by region", () => {
    const TEST_REGION = "GB"
    const MOCK_SPECIES_LIST = [
      "Passer domesticus",
      "Turdus merula",
      "Erithacus rubecula",
    ]

    it("should return species list for valid region", async () => {
      mockLoadSpeciesListForRegion.mockResolvedValue(MOCK_SPECIES_LIST)

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { region: TEST_REGION })
      )

      expect(loadSpeciesListForRegion).toHaveBeenCalledWith(TEST_REGION)
      expect(loadSpeciesListById).not.toHaveBeenCalled()
      expect(response.statusCode).toEqual(200)
      expect(response.headers?.["Cache-Control"]).toEqual(
        CACHE_CONTROL_HEADER_MAX_AGE_YEAR
      )
      expect(JSON.parse(response.body)).toEqual({ species: MOCK_SPECIES_LIST })
    })

    it("should return 404 when no species list found for region", async () => {
      mockLoadSpeciesListForRegion.mockResolvedValue(null)

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { region: TEST_REGION })
      )

      expect(loadSpeciesListForRegion).toHaveBeenCalledWith(TEST_REGION)
      expect(response.statusCode).toEqual(404)
      expect(JSON.parse(response.body)).toEqual({
        message: "No species list found for region",
      })
    })
  })

  describe("when querying by listId", () => {
    const TEST_LIST_ID = "common-uk-garden"
    const MOCK_SPECIES_LIST = [
      "Passer domesticus",
      "Turdus merula",
      "Erithacus rubecula",
      "Fringilla coelebs",
    ]

    it("should return species list for valid listId", async () => {
      mockLoadSpeciesListById.mockResolvedValue(MOCK_SPECIES_LIST)

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { listId: TEST_LIST_ID })
      )

      expect(loadSpeciesListById).toHaveBeenCalledWith(
        TEST_LIST_ID.toLowerCase()
      )
      expect(loadSpeciesListForRegion).not.toHaveBeenCalled()
      expect(response.statusCode).toEqual(200)
      expect(response.headers?.["Cache-Control"]).toEqual(
        CACHE_CONTROL_HEADER_MAX_AGE_YEAR
      )
      expect(JSON.parse(response.body)).toEqual({ species: MOCK_SPECIES_LIST })
    })

    it("should convert listId to lowercase before querying", async () => {
      mockLoadSpeciesListById.mockResolvedValue(MOCK_SPECIES_LIST)

      const UPPERCASE_LIST_ID = "COMMON-UK-GARDEN"
      await getSpeciesList(
        mockApiGatewayEvent(null, { listId: UPPERCASE_LIST_ID })
      )

      expect(loadSpeciesListById).toHaveBeenCalledWith(
        UPPERCASE_LIST_ID.toLowerCase()
      )
    })

    it("should return 404 when no species list found for listId", async () => {
      mockLoadSpeciesListById.mockResolvedValue(null)

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { listId: TEST_LIST_ID })
      )

      expect(loadSpeciesListById).toHaveBeenCalledWith(TEST_LIST_ID)
      expect(response.statusCode).toEqual(404)
      expect(JSON.parse(response.body)).toEqual({
        message: "No species list found for given id",
      })
    })
  })

  describe("when both region and listId are provided", () => {
    it("should prioritize region parameter", async () => {
      const MOCK_SPECIES_LIST = ["Species 1", "Species 2"]
      mockLoadSpeciesListForRegion.mockResolvedValue(MOCK_SPECIES_LIST)

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, {
          region: "GB",
          listId: "some-list",
        })
      )

      expect(loadSpeciesListForRegion).toHaveBeenCalledWith("GB")
      expect(loadSpeciesListById).not.toHaveBeenCalled()
      expect(response.statusCode).toEqual(200)
    })
  })

  describe("when neither region nor listId are provided", () => {
    it("should return 400 with error message", async () => {
      const response = await getSpeciesList(mockApiGatewayEvent(null, {}))

      expect(loadSpeciesListForRegion).not.toHaveBeenCalled()
      expect(loadSpeciesListById).not.toHaveBeenCalled()
      expect(response.statusCode).toEqual(400)
      expect(JSON.parse(response.body)).toEqual({
        message: "Must supply either 'region' or 'listId' parameters",
      })
    })

    it("should return 400 when queryStringParameters is null", async () => {
      const response = await getSpeciesList(mockApiGatewayEvent(null, null))

      expect(loadSpeciesListForRegion).not.toHaveBeenCalled()
      expect(loadSpeciesListById).not.toHaveBeenCalled()
      expect(response.statusCode).toEqual(400)
    })
  })

  describe("response headers", () => {
    it("should include CORS headers", async () => {
      const MOCK_SPECIES_LIST = ["Species 1"]
      mockLoadSpeciesListForRegion.mockResolvedValue(MOCK_SPECIES_LIST)

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { region: "GB" })
      )

      expect(response.headers).toMatchObject({
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      })
    })

    it("should include cache headers for successful responses", async () => {
      const MOCK_SPECIES_LIST = ["Species 1"]
      mockLoadSpeciesListForRegion.mockResolvedValue(MOCK_SPECIES_LIST)

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { region: "GB" })
      )

      expect(response.headers?.["Cache-Control"]).toEqual(
        CACHE_CONTROL_HEADER_MAX_AGE_YEAR
      )
    })

    it("should not include cache headers for error responses", async () => {
      const response = await getSpeciesList(mockApiGatewayEvent(null, {}))

      expect(response.headers?.["Cache-Control"]).toBeUndefined()
    })
  })
})

describe("getSpeciesPresetLists tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const MOCK_PRESET_LISTS = [
    { id: "common-uk-garden", name: "Common UK Garden Birds" },
    { id: "uk-raptors", name: "UK Birds of Prey" },
  ]

  it("should return preset lists for valid region", async () => {
    mockGetSpeciesPresetListsForRegion.mockResolvedValue(MOCK_PRESET_LISTS)

    const event = mockApiGatewayEvent()
    event.pathParameters = { region: "GB" }
    const response = await getSpeciesPresetLists(event)

    expect(getSpeciesPresetListsForRegion).toHaveBeenCalledWith("GB")
    expect(response.statusCode).toEqual(200)
    expect(response.headers?.["Cache-Control"]).toEqual(
      CACHE_CONTROL_HEADER_MAX_AGE_YEAR
    )
    expect(JSON.parse(response.body)).toEqual({ presets: MOCK_PRESET_LISTS })
  })

  it("should return 400 when region path parameter is missing", async () => {
    const event = mockApiGatewayEvent()
    event.pathParameters = null
    const response = await getSpeciesPresetLists(event)

    expect(getSpeciesPresetListsForRegion).not.toHaveBeenCalled()
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body)).toEqual({
      message: "Missing required path parameter 'region'",
    })
  })

  it("should return empty array when no presets found", async () => {
    mockGetSpeciesPresetListsForRegion.mockResolvedValue([])

    const event = mockApiGatewayEvent()
    event.pathParameters = { region: "XX" }
    const response = await getSpeciesPresetLists(event)

    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual({ presets: [] })
  })
})

describe("suggestPresetList tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const VALID_PRESET_DATA = {
    region: "GB",
    listName: "My Custom List",
    speciesList: ["Passer domesticus", "Turdus merula"],
    name: "John Doe",
    email: "john@example.com",
    comments: "Great list!",
  }

  it("should store suggestion and return suggestionId", async () => {
    const mockSuggestionId = "suggestion-123"
    mockStoreSuggestedSpeciesList.mockResolvedValue(mockSuggestionId)

    const response = await suggestPresetList(
      mockApiGatewayEvent(VALID_PRESET_DATA)
    )

    expect(storeSuggestedSpeciesList).toHaveBeenCalledWith(VALID_PRESET_DATA)
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual({
      suggestionId: mockSuggestionId,
    })
  })

  it("should return 400 when listName is missing", async () => {
    const invalidData = { ...VALID_PRESET_DATA, listName: "" }
    const response = await suggestPresetList(mockApiGatewayEvent(invalidData))

    expect(storeSuggestedSpeciesList).not.toHaveBeenCalled()
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body)).toEqual({
      message: "Missing listName property from request body",
    })
  })

  it("should return 400 when region is missing", async () => {
    const invalidData = { ...VALID_PRESET_DATA, region: "" }
    const response = await suggestPresetList(mockApiGatewayEvent(invalidData))

    expect(storeSuggestedSpeciesList).not.toHaveBeenCalled()
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body)).toEqual({
      message: "Missing region property from request body",
    })
  })

  it("should return 400 when speciesList has fewer than 2 species", async () => {
    const invalidData = { ...VALID_PRESET_DATA, speciesList: ["One species"] }
    const response = await suggestPresetList(mockApiGatewayEvent(invalidData))

    expect(storeSuggestedSpeciesList).not.toHaveBeenCalled()
    expect(response.statusCode).toEqual(400)
    expect(JSON.parse(response.body)).toEqual({
      message:
        "Species list not found in speciesList, or has fewer than 2 species",
    })
  })

  it("should return 400 when speciesList is missing", async () => {
    const invalidData = { ...VALID_PRESET_DATA, speciesList: undefined }
    const response = await suggestPresetList(mockApiGatewayEvent(invalidData))

    expect(storeSuggestedSpeciesList).not.toHaveBeenCalled()
    expect(response.statusCode).toEqual(400)
  })

  it("should handle empty body", async () => {
    const event = mockApiGatewayEvent()
    event.body = null
    const response = await suggestPresetList(event)

    expect(storeSuggestedSpeciesList).not.toHaveBeenCalled()
    expect(response.statusCode).toEqual(400)
  })
})

describe("approvePresetList tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should approve suggestion and return list path", async () => {
    const mockListPath = "presets/gb/my-list.json"
    mockApproveSuggestedSpeciesList.mockResolvedValue(mockListPath)

    const result = await approvePresetList({ suggestionId: "suggestion-123" })

    expect(approveSuggestedSpeciesList).toHaveBeenCalledWith("suggestion-123")
    expect(result).toEqual({ listPath: mockListPath })
  })

  it("should throw error when suggestionId is missing", async () => {
    await expect(approvePresetList({})).rejects.toThrow(
      "suggestionId property not set in event body"
    )

    expect(approveSuggestedSpeciesList).not.toHaveBeenCalled()
  })

  it("should throw error when suggestionId is undefined", async () => {
    await expect(
      approvePresetList({ suggestionId: undefined })
    ).rejects.toThrow("suggestionId property not set in event body")
  })
})

describe("notifyPresetListSuggested tests", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockS3Event = (bucket: string, key: string): S3Event => ({
    Records: [
      {
        eventVersion: "2.1",
        eventSource: "aws:s3",
        awsRegion: "us-east-1",
        eventTime: "2025-12-18T00:00:00.000Z",
        eventName: "ObjectCreated:Put",
        userIdentity: {
          principalId: "AWS:EXAMPLE",
        },
        requestParameters: {
          sourceIPAddress: "127.0.0.1",
        },
        responseElements: {
          "x-amz-request-id": "EXAMPLE123456789",
          "x-amz-id-2": "EXAMPLE123/456/789",
        },
        s3: {
          s3SchemaVersion: "1.0",
          configurationId: "testConfigRule",
          bucket: {
            name: bucket,
            ownerIdentity: {
              principalId: "EXAMPLE",
            },
            arn: `arn:aws:s3:::${bucket}`,
          },
          object: {
            key: key,
            size: 1024,
            eTag: "d41d8cd98f00b204e9800998ecf8427e",
            sequencer: "0055AED6DCD90281E5",
          },
        },
      },
    ],
  })

  it("should send email with suggestion data", async () => {
    mockSendEmailWithSuggestionData.mockResolvedValue(undefined)

    const bucket = "my-species-list-bucket"
    const key = "suggestions/suggestion-123.json"
    const event = createMockS3Event(bucket, key)

    await notifyPresetListSuggested(event)

    expect(sendEmailWithSuggestionData).toHaveBeenCalledWith(bucket, key)
  })

  it("should handle multiple records by processing the first", async () => {
    mockSendEmailWithSuggestionData.mockResolvedValue(undefined)

    const bucket = "my-bucket"
    const key = "suggestions/test.json"
    const event = createMockS3Event(bucket, key)

    // Add a second record (should be ignored)
    event.Records.push({
      ...event.Records[0],
      s3: {
        ...event.Records[0].s3,
        object: {
          ...event.Records[0].s3.object,
          key: "suggestions/ignored.json",
        },
      },
    })

    await notifyPresetListSuggested(event)

    expect(sendEmailWithSuggestionData).toHaveBeenCalledTimes(1)
    expect(sendEmailWithSuggestionData).toHaveBeenCalledWith(bucket, key)
  })

  it("should propagate errors from sendEmailWithSuggestionData", async () => {
    const error = new Error("Email service unavailable")
    mockSendEmailWithSuggestionData.mockRejectedValue(error)

    const event = createMockS3Event("bucket", "key")

    await expect(notifyPresetListSuggested(event)).rejects.toThrow(
      "Email service unavailable"
    )
  })
})
