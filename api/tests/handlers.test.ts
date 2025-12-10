import { getRandomRecordingForSpecies } from '../src/recording';
import { getRecording } from '../src/handlers'
import { mockApiGatewayEvent, mockRecordingResponse } from './mockObjects';

jest.mock('../src/recording', () => ({
  getRandomRecordingForSpecies: jest.fn()
}))

const mockGetRandomRecordingForSpecies = getRandomRecordingForSpecies as jest.Mock

const givenRecordingAvailable = () => {
  const response = mockRecordingResponse(TEST_SPECIES, TEST_SOUND_URL)
  mockGetRandomRecordingForSpecies.mockResolvedValue(response)
  return response
}

const TEST_SPECIES = "Testus specieus"
const TEST_SOUND_URL = "https://xeno-canto.com/some-mp3.mp3"
describe("getRecording tests", () => {
    it("Should call through to getRandomRecordingForSpecies", async () => {
      const recordingData = givenRecordingAvailable();
      const recordingResponse = await getRecording(mockApiGatewayEvent(null, { species: TEST_SPECIES }))
      expect(getRandomRecordingForSpecies).toHaveBeenCalledWith(TEST_SPECIES, null);
      expect(recordingResponse.statusCode).toEqual(200)
      expect(recordingResponse.body).toEqual(JSON.stringify(recordingData))
    })

    it("Should return a 400 status code when species isn't provided", async () => {
        const response = await getRecording(mockApiGatewayEvent(null))
        expect(getRandomRecordingForSpecies).not.toHaveBeenCalled()
        expect(response.statusCode).toEqual(400)
    })

    
})