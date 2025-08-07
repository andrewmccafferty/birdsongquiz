const COUNTRY_TO_PRESETS_MAPPING = {
  GB: [
    {
      name: "Common UK garden birds",
      id: "common-uk-garden",
    },
    {
      name: "Garden Warbler vs Blackcap",
      id: "garden-warbler-vs-blackcap",
    },
    {
      name: "Common UK Gulls",
      id: "common-uk-gulls",
    },
    {
      name: "All UK Gulls",
      id: "all-uk-gulls",
    },
  ],
};

const presetListsForCountry = (countryCode) => {
  const presets = COUNTRY_TO_PRESETS_MAPPING[countryCode];
  console.log("Found preset", presets);
  return presets;
};

export { presetListsForCountry };
