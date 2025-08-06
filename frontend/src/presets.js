const COUNTRY_TO_PRESETS_MAPPING = {
    "GB": [{
        "name": "Common UK garden birds",
        "id": "common-uk-garden"
    }]
}

const presetListsForCountry = (countryCode) => {
    const presets = COUNTRY_TO_PRESETS_MAPPING[countryCode]
    console.log("Found preset", presets)
    return presets
}

export { presetListsForCountry }