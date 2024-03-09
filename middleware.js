
function hasUserChecker(req, res, next){
    const userName = req.query.userName
    if (!userName) return res.send({status: false, message: "Please Enter user name"});
    next();
}

module.exports = {
    hasUserChecker,
};