
class authController {
    
    index(req, res, next) {
        res.send('hello');
    }
}

module.exports = new authController();