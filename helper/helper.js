export const sendError = (res,msg,code) => {
    res.status(code).send(msg)
}