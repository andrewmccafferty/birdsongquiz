import { test, expect } from "@playwright/test";
import { invokeLambda } from "./aws_utils/lambda";

const API_ROOT = process.env.API_ROOT as string;
const APPROVE_PRESET_LIST_LAMBDA = process.env.APPROVE_PRESET_LIST_LAMBDA as string;

export interface SpeciesDetail {
  Species: string;
  ScientificName: string;
}

export interface PresetListSuggestion {
  region: string;
  listName: string;
  speciesList: SpeciesDetail[];
}

test("should get a list of species for country", async ({ request }) => {
  const speciesListResponse = await request.get(
    `${API_ROOT}/species?region=GB`
  );
  expect(speciesListResponse.status()).toEqual(200);
  const speciesList = await speciesListResponse.json();
  expect(speciesList.species).toBeInstanceOf(Array);
  expect(
    speciesList.species.length,
    "Species list should have more than 200 entries"
  ).toBeGreaterThan(200);
  expect(
    speciesList.species.some(
      (species: SpeciesDetail) =>
        species.Species === "Blackbird" &&
        species.ScientificName == "Turdus merula"
    ),
    "Species list should contain Blackbird"
  ).toBe(true);
});

test("should be able to submit a suggestion, and on approval it shows up in the preset lists", async ({
  request,
}) => {  
  const testPresetListName = `Test List ${Date.now()}`;
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
  } as PresetListSuggestion;
  const suggestionResponse = await request.post(
    `${API_ROOT}/presets/suggestion`,
    { data: presetListSuggestion }
  );
  expect(suggestionResponse.status()).toEqual(200);
  const suggestion = await suggestionResponse.json();
  expect(suggestion.suggestionId).toBeDefined();

  const suggestionId =  suggestion.suggestionId;
  
  await invokeLambda(APPROVE_PRESET_LIST_LAMBDA, {
    "suggestionId": suggestionId
  })
  
  const presetsListResponse = await request.get(
    `${API_ROOT}/presets/GB`
  );
  expect(presetsListResponse.status()).toEqual(200);
  const presetsList = await presetsListResponse.json();
  const newPresetList = presetsList.presets.find(
      (preset: { name: string}) =>
        preset.name === testPresetListName
    )
  expect(newPresetList).toBeDefined();
  
  const newPresetListGetResponse = await request.get(`${API_ROOT}/species?listId=${newPresetList.id}`)
  expect(newPresetListGetResponse.status()).toEqual(200)
  expect(await newPresetListGetResponse.json()).toEqual({
    species: testSpeciesList
  })

});
