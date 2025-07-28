const species_list = require("./species_list");

console.log(JSON.stringify(species_list.map(item => ({
    Species: item.Species,
    ScientificName: item.ScientificName
})), null, 2));