import { getRandomRecordingForSpecies } from '../src/recording';
import { getRecording } from '../src/handlers'
import { mockApiGatewayEvent } from './mockObjects';

jest.mock('../src/recording', () => ({
  getRandomRecordingForSpecies: jest.fn()
}))

const TEST_SPECIES = "Testus specieus"
describe("getRecording tests", () => {
    it("Should call through to getRandomRecordingForSpecies", () => {
        getRecording(mockApiGatewayEvent(null, { species: TEST_SPECIES }))
        
    })
})