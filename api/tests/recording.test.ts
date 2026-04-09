import { getApiJsonData } from "../src/api_helper"
import { getRandomRecordingForSpecies } from "../src/recording"
import { MOCK_XENO_CANTO_RESPONSE } from "./data/xeno_canto"

jest.mock("../src/api_helper", () => ({
  getApiJsonData: jest.fn(),
}))

const mockGetApiJsonData = getApiJsonData as jest.Mock

const TEST_SPECIES = "Turdus Merula"

describe("recordingData tests", () => {
  it.each([
    [
      null,
      'https://xeno-canto.org/api/3/recordings?key=undefined&query=sp:"Turdus%20Merula"%20q%3A%22A%22',
    ],
    [
      "call",
      'https://xeno-canto.org/api/3/recordings?key=undefined&query=sp:"Turdus%20Merula"%20q%3A%22A%22%20type%3A%22call%22',
    ],
    [
      "song",
      'https://xeno-canto.org/api/3/recordings?key=undefined&query=sp:"Turdus%20Merula"%20q%3A%22A%22%20type%3A%22song%22',
    ],
  ])("when the soundType is '%s'", async (soundType, expectedUrl) => {
    jest.spyOn(Math, "random").mockReturnValue(0.42)
    mockGetApiJsonData.mockResolvedValue(MOCK_XENO_CANTO_RESPONSE)
    const randomRecording = await getRandomRecordingForSpecies(
      TEST_SPECIES,
      soundType
    )
    expect(randomRecording).toEqual({
      recording: {
        en: "Common Blackbird",
        gen: "Turdus",
        id: "1011353",
        rec: "Olivier SWIFT",
        sp: "merula",
      },
      soundUrl:
        "https://xeno-canto.org/sounds/uploaded/JCPKCBKKAQ/XC1011353-TURMER_250617_5600_PontAuthou27_Camping_Marronniers_0544.mp3",
      species: TEST_SPECIES,
    })
    expect(mockGetApiJsonData).toHaveBeenCalledWith(expectedUrl)
  })
})
