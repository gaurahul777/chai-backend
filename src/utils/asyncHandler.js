const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }




// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }

/**
 * state ko humne redux store me rkha jisne bhi ye caart subsribe kiya hoga jis component ne usko pta lag jayega and woh khud k updae ker lega
 * 
 * redux ke store me aap direclty kuch bhi update nhi ker sakte hain jaisse apne kise button per click kiya ek handler function chla woh ek event dispatch kerega jo jayega redux store me
 * 
 * ab redux store directly state ko update nhi keega now redux store ek action dispatch kerega reducer ke uper
 * 
 * basically reducer kya hain ki hum store ke ander function bnate hain usko hum reducer bolte hain ye reducer humare event ko read kerta hain aur ek new state ko return krta hain wps redux store me jaise he redux store update hua ui me changes reflect ho jayngye
 * 
 * react-redux ,redux pkg required
 * 
 * redux folder>> store.js
 */