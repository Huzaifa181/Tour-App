const httpError = require("../utils/http-error");

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin','lead-guide','user','guide']
    // req.user will be get to upper middle ware where we check th token
    if (!roles.includes(req.user.role)) {
      return next(
        new httpError("You dont have permission to perform this action", 401)
      );
    }
    next();
  };
};
