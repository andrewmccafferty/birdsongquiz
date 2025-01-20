const getRandomArrayElement = (items) => {
    return items[Math.floor(Math.random()*items.length)];
}

module.exports = {
    getRandomArrayElement: getRandomArrayElement
};