import Building from "../../models/Building.js";

export const deleteBuildingController = async (req, res) => {
  try {
    const deletedBuilding = await Building.findByIdAndDelete(req.params.id);
    if (!deletedBuilding) return res.status(404).json({ message: 'Building not found' });
    res.json({ message: 'Building deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
