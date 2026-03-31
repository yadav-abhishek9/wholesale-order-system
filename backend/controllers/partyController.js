const Party = require('../models/Party');

const createParty = async (req, res) => {
  try {
    const party = new Party(req.body);
    await party.save();
    res.status(201).json(party);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getParties = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const parties = await Party.find(query).sort({ createdAt: -1 });
    res.json(parties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    res.json(party);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    res.json(party);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    res.json({ message: 'Party deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createParty,
  getParties,
  getPartyById,
  updateParty,
  deleteParty
};
