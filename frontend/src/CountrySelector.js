import React from 'react';

const countries = [
    { code: 'AU', name: 'Australia' },
    { code: 'CO', name: 'Colombia' },
    { code: 'EUR', name: 'Europe' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'US', name: 'United States' }
];

function CountrySelector({ onChange }) {
    return (
        <select data-testid="country" onChange={e => onChange(e.target.value)}>
            <option value="GB">United Kingdom</option>
            {countries.map(country => (
                <option key={country.code} value={country.code}>
                    {country.name}
                </option>
            ))}
        </select>
    );
}

export default CountrySelector;