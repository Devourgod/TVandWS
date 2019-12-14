
const successRes = data => {
    return {
        code: '000000',
        description: '请求成功',
        data
    }
}
const errorRes = () => {
    return {
        code: '000001',
        description: '失败原因',
        data: {}
    }
}


module.exports = {
    successRes,
    errorRes
}