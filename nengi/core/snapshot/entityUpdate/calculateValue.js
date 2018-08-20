function calculateValue(oldValue, newValue, isDelta) {

    if (isDelta) {
        return newValue - oldValue
    } else {
        return newValue
    }
}

module.exports = calculateValue