import Building from "../../models/Building.js";

export const getAllBuildingsController = async (req, res) => {
    try {
    const buildings = await Building.find()
      .populate('id_services')
      .populate('id_careers')
      .populate('subjects.id_subjects');
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
