import Building from "../../models/Building.js";

export const updateBuildingController = async (req, res) => {
  try {
    const updatedBuilding = await Building.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedBuilding) return res.status(404).json({ message: 'Building not found' });
    res.json(updatedBuilding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
