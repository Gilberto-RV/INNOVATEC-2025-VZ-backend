import Building from "../../models/Building.js";

export const getBuildingByIdController = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
      .populate('id_services')
      .populate('id_careers')
      .populate('subjects.id_subjects');

    if (!building) return res.status(404).json({ message: 'Building not found' });

    res.json(building);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
