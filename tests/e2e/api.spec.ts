import { test, expect } from '@playwright/test';

const API_ROOT = process.env.API_ROOT as string

export interface SpeciesDetail {
    Species: string
    ScientificName: string
}

test('should get a list of species for country', async({ request }) => {
    const speciesListResponse = await request.get(`${API_ROOT}/species?region=GB`)
    expect(speciesListResponse.status()).toEqual(200)
    const speciesList = await speciesListResponse.json()
    expect(speciesList.species).toBeInstanceOf(Array)
    expect(speciesList.species.length, "Species list should have more than 200 entries").toBeGreaterThan(200)
    expect(speciesList.species.some((species: SpeciesDetail) => species.Species === "Blackbird" && species.ScientificName == "Turdus merula"), 
    "Species list should contain Blackbird").toBe(true)
})