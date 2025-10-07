import moment from "moment"

export default {
    formatDate(date) {
        return moment(date).format("DD.MM.YY, HH:mm")
    },
    formatDate_2(date) {
        return moment(date).format("DD-MM-YYYY")
    },
    formatDate_3(date) {
        return moment(date).format("DD.MM.YYYY")
    },
    ifequal(a, b, options) {
        if(a === b) {
            return options.fn(this)
        }
        return options.inverse(this)
    },
    ifeq(a, b, c, options) {
    if (a === b || a === c) {
        return options.fn(this);
    }
    return options.inverse(this);
    },
    toFixed1(value) {
        return Number(value).toFixed(1)
    }
}