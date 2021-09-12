UModel = {
    _data: {},
    set(key, value) {
        UModel._data[key] = value
    },
    get(key) {
        return UModel._data[key]
    }
}

module.exports = UModel