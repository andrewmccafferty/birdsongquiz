import React from "react";

type CountryCode = "AU" | "CO" | "EUR" | "MY" | "ZA" | "US" | "GB";

const countries: { code: Exclude<CountryCode, "GB">; name: string }[] = [
  { code: "AU", name: "Australia" },
  { code: "CO", name: "Colombia" },
  { code: "EUR", name: "Europe" },
  { code: "MY", name: "Malaysia" },
  { code: "ZA", name: "South Africa" },
  { code: "US", name: "United States" },
];

interface CountrySelectorProps {
  onChange: (countryCode: CountryCode) => void;
}

function CountrySelector({ onChange }: CountrySelectorProps) {
  return (
    <select
      data-testid="country"
      onChange={(e) => onChange(e.target.value as CountryCode)}
    >
      <option value="GB">United Kingdom</option>
      {countries.map((country) => (
        <option key={country.code} value={country.code}>
          {country.name}
        </option>
      ))}
    </select>
  );
}

export default CountrySelector;
