const {
  COLLECTIONS,
  isOwnerScoped,
  isEmailKeyed,
  generateId,
  readCollection,
  writeCollection,
  pickCollectionData,
  getItemById
} = require('../models/collectionModel');

const health = (req, res) => {
  res.json({ ok: true, collections: COLLECTIONS, storage: 'file-json-per-collection' });
};

const listCollection = (req, res) => {
  const collection = req.params.collection;
  const collectionData = readCollection(collection);
  const user = req.query.user;
  const data = pickCollectionData(collectionData, collection, user);
  return res.json(data);
};

const getCollectionItem = (req, res) => {
  const collection = req.params.collection;
  const collectionData = readCollection(collection);
  const item = getItemById(collectionData, req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (isOwnerScoped(collection) && req.query.user && item.owner !== req.query.user) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return res.json(item);
};

const createCollectionItem = (req, res) => {
  const collection = req.params.collection;
  const payload = req.body || {};
  const collectionData = readCollection(collection);

  if (isEmailKeyed(collection)) {
    const email = String(payload.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email is required' });
    const exists = collectionData.find((u) => String(u.email || '').toLowerCase() === email);
    if (exists) return res.status(409).json({ error: 'User already exists' });
    const user = { id: generateId(), ...payload, email };
    collectionData.push(user);
    writeCollection(collection, collectionData);
    return res.status(201).json(user);
  }

  if (isOwnerScoped(collection) && !payload.owner) {
    return res.status(400).json({ error: 'owner is required for this collection' });
  }

  const item = { id: generateId(), ...payload };
  collectionData.push(item);
  writeCollection(collection, collectionData);
  return res.status(201).json(item);
};

const updateCollectionItem = (req, res) => {
  const collection = req.params.collection;
  const collectionData = readCollection(collection);
  const idx = collectionData.findIndex((item) => String(item.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const current = collectionData[idx];
  if (isOwnerScoped(collection) && req.body && req.body.owner && current.owner !== req.body.owner) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  collectionData[idx] = { ...current, ...req.body, id: current.id };
  writeCollection(collection, collectionData);
  return res.json(collectionData[idx]);
};

const deleteCollectionItem = (req, res) => {
  const collection = req.params.collection;
  const collectionData = readCollection(collection);
  const idx = collectionData.findIndex((item) => String(item.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const current = collectionData[idx];
  if (isOwnerScoped(collection) && req.query.user && current.owner !== req.query.user) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const removed = collectionData.splice(idx, 1)[0];
  writeCollection(collection, collectionData);
  return res.json(removed);
};

module.exports = {
  health,
  listCollection,
  getCollectionItem,
  createCollectionItem,
  updateCollectionItem,
  deleteCollectionItem
};
