const express = require('express');
const router = express.Router();
const validateCollection = require('../middlewares/validateCollection');
const collectionController = require('../controllers/collectionController');

router.get('/health', collectionController.health);
router.get('/:collection', validateCollection, collectionController.listCollection);
router.get('/:collection/:id', validateCollection, collectionController.getCollectionItem);
router.post('/:collection', validateCollection, collectionController.createCollectionItem);
router.put('/:collection/:id', validateCollection, collectionController.updateCollectionItem);
router.delete('/:collection/:id', validateCollection, collectionController.deleteCollectionItem);

module.exports = router;
