import { getRandomRecordingForSpecies } from "../src/recording";
import { getRecording, getSpeciesList } from "../src/handlers";
import { mockApiGatewayEvent, mockRecordingResponse } from "./mockObjects";
import { loadSpeciesListById, loadSpeciesListForRegion } from "../src/species";

jest.mock("../src/recording", () => ({
  getRandomRecordingForSpecies: jest.fn(),
}));

jest.mock("../src/species", () => ({
  loadSpeciesListById: jest.fn(),
  loadSpeciesListForRegion: jest.fn(),
}));

const mockGetRandomRecordingForSpecies =
  getRandomRecordingForSpecies as jest.Mock;
const mockLoadSpeciesListById = loadSpeciesListById as jest.Mock;
const mockLoadSpeciesListForRegion = loadSpeciesListForRegion as jest.Mock;

const TEST_SPECIES = "Testus specieus";
const TEST_SOUND_URL = "https://xeno-canto.com/some-mp3.mp3";
const CACHE_CONTROL_HEADER_MAX_AGE_YEAR = "public, max-age=31536000";

const givenRecordingAvailable = () => {
  const response = mockRecordingResponse(TEST_SPECIES, TEST_SOUND_URL);
  mockGetRandomRecordingForSpecies.mockResolvedValue(response);
  return response;
};

describe("getRecording tests", () => {
  it("Should call through to getRandomRecordingForSpecies", async () => {
    const recordingData = givenRecordingAvailable();
    const recordingResponse = await getRecording(
      mockApiGatewayEvent(null, { species: TEST_SPECIES })
    );
    expect(getRandomRecordingForSpecies).toHaveBeenCalledWith(
      TEST_SPECIES,
      null
    );
    expect(recordingResponse.statusCode).toEqual(200);
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
    );
  });

  it("Should return a 400 status code when species isn't provided", async () => {
    const response = await getRecording(mockApiGatewayEvent(null));
    expect(getRandomRecordingForSpecies).not.toHaveBeenCalled();
    expect(response.statusCode).toEqual(400);
  });
});

describe("getSpeciesList tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when querying by region", () => {
    const TEST_REGION = "GB";
    const MOCK_SPECIES_LIST = [
      "Passer domesticus",
      "Turdus merula",
      "Erithacus rubecula",
    ];

    it("should return species list for valid region", async () => {
      mockLoadSpeciesListForRegion.mockResolvedValue(MOCK_SPECIES_LIST);

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { region: TEST_REGION })
      );

      expect(loadSpeciesListForRegion).toHaveBeenCalledWith(TEST_REGION);
      expect(loadSpeciesListById).not.toHaveBeenCalled();
      expect(response.statusCode).toEqual(200);
      expect(response.headers?.["Cache-Control"]).toEqual(
        CACHE_CONTROL_HEADER_MAX_AGE_YEAR
      );
      expect(JSON.parse(response.body)).toEqual({ species: MOCK_SPECIES_LIST });
    });

    it("should return 404 when no species list found for region", async () => {
      mockLoadSpeciesListForRegion.mockResolvedValue(null);

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { region: TEST_REGION })
      );

      expect(loadSpeciesListForRegion).toHaveBeenCalledWith(TEST_REGION);
      expect(response.statusCode).toEqual(404);
      expect(JSON.parse(response.body)).toEqual({
        message: "No species list found for region",
      });
    });
  });

  describe("when querying by listId", () => {
    const TEST_LIST_ID = "common-uk-garden";
    const MOCK_SPECIES_LIST = [
      "Passer domesticus",
      "Turdus merula",
      "Erithacus rubecula",
      "Fringilla coelebs",
    ];

    it("should return species list for valid listId", async () => {
      mockLoadSpeciesListById.mockResolvedValue(MOCK_SPECIES_LIST);

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { listId: TEST_LIST_ID })
      );

      expect(loadSpeciesListById).toHaveBeenCalledWith(
        TEST_LIST_ID.toLowerCase()
      );
      expect(loadSpeciesListForRegion).not.toHaveBeenCalled();
      expect(response.statusCode).toEqual(200);
      expect(response.headers?.["Cache-Control"]).toEqual(
        CACHE_CONTROL_HEADER_MAX_AGE_YEAR
      );
      expect(JSON.parse(response.body)).toEqual({ species: MOCK_SPECIES_LIST });
    });

    it("should convert listId to lowercase before querying", async () => {
      mockLoadSpeciesListById.mockResolvedValue(MOCK_SPECIES_LIST);

      const UPPERCASE_LIST_ID = "COMMON-UK-GARDEN";
      await getSpeciesList(
        mockApiGatewayEvent(null, { listId: UPPERCASE_LIST_ID })
      );

      expect(loadSpeciesListById).toHaveBeenCalledWith(
        UPPERCASE_LIST_ID.toLowerCase()
      );
    });

    it("should return 404 when no species list found for listId", async () => {
      mockLoadSpeciesListById.mockResolvedValue(null);

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { listId: TEST_LIST_ID })
      );

      expect(loadSpeciesListById).toHaveBeenCalledWith(TEST_LIST_ID);
      expect(response.statusCode).toEqual(404);
      expect(JSON.parse(response.body)).toEqual({
        message: "No species list found for given id",
      });
    });
  });

  describe("when both region and listId are provided", () => {
    it("should prioritize region parameter", async () => {
      const MOCK_SPECIES_LIST = ["Species 1", "Species 2"];
      mockLoadSpeciesListForRegion.mockResolvedValue(MOCK_SPECIES_LIST);

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, {
          region: "GB",
          listId: "some-list",
        })
      );

      expect(loadSpeciesListForRegion).toHaveBeenCalledWith("GB");
      expect(loadSpeciesListById).not.toHaveBeenCalled();
      expect(response.statusCode).toEqual(200);
    });
  });

  describe("when neither region nor listId are provided", () => {
    it("should return 400 with error message", async () => {
      const response = await getSpeciesList(mockApiGatewayEvent(null, {}));

      expect(loadSpeciesListForRegion).not.toHaveBeenCalled();
      expect(loadSpeciesListById).not.toHaveBeenCalled();
      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.body)).toEqual({
        message: "Must supply either 'region' or 'listId' parameters",
      });
    });

    it("should return 400 when queryStringParameters is null", async () => {
      const response = await getSpeciesList(mockApiGatewayEvent(null, null));

      expect(loadSpeciesListForRegion).not.toHaveBeenCalled();
      expect(loadSpeciesListById).not.toHaveBeenCalled();
      expect(response.statusCode).toEqual(400);
    });
  });

  describe("response headers", () => {
    it("should include CORS headers", async () => {
      const MOCK_SPECIES_LIST = ["Species 1"];
      mockLoadSpeciesListForRegion.mockResolvedValue(MOCK_SPECIES_LIST);

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { region: "GB" })
      );

      expect(response.headers).toMatchObject({
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      });
    });

    it("should include cache headers for successful responses", async () => {
      const MOCK_SPECIES_LIST = ["Species 1"];
      mockLoadSpeciesListForRegion.mockResolvedValue(MOCK_SPECIES_LIST);

      const response = await getSpeciesList(
        mockApiGatewayEvent(null, { region: "GB" })
      );

      expect(response.headers?.["Cache-Control"]).toEqual(
        CACHE_CONTROL_HEADER_MAX_AGE_YEAR
      );
    });

    it("should not include cache headers for error responses", async () => {
      const response = await getSpeciesList(mockApiGatewayEvent(null, {}));

      expect(response.headers?.["Cache-Control"]).toBeUndefined();
    });
  });
});
