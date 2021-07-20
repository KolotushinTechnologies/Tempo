class UsersController {
    // * @route   GET http://localhost:5000/api/users/test
    // * @desc User route testing
    // * @access  Public
    async test(req, res) {
        try {
            res.status(200).json({
                statusCode: 200,
                stringStatus: "OK, Success",
                message: "Users route testing was successfully!",
            })
        } catch(err) {
            res.status(500).json({
            statusCode: 500,
                stringStatus: "Bad Request",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`
            });
            console.log({
                statusCode: 500,
                stringStatus: "Error",
                message: `Something went wrong or you entered incorrect data ${err}. Please try again!`,
            });
        }
    }
}

module.exports = new UsersController();
