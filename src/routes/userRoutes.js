const router = require('express').Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/token', controller.token);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;