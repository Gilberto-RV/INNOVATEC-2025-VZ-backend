import Building from "../../models/Building.js";

export const createBuildingController = async (req, res) => {
  try {
    const newBuilding = new Building(req.body);
    const savedBuilding = await newBuilding.save();
    res.status(201).json(savedBuilding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
