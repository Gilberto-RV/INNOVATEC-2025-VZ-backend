// application/usecases/EventoUseCases.js
import Event from "../../models/Event.js";
import mongoose from 'mongoose';

const event = new Event();
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: "building_assigned",
        select: "name" // 👈 solo lo que necesites
      }) // ✅ traer nombre/desc edificio
      .populate({
        path: "category",
        select: "nombre" // 👈 campos de la categoría
      }); // opcional, categorías
    res.json({ events });
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Obtener evento por ID
 */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("building_assigned", "name description")
      .populate("category", "name");
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * Crear evento
 */
export const createEvent = async (req, res) => {
  try {
    const newEvent = await event.createEvent(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Error al crear evento", error });
  }
};

/**
 * Actualizar evento
 */
export const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await event.updateEvent(req.params.id, req.body);
    if (!updatedEvent) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar evento", error });
  }
};

/**
 * Eliminar evento
 */
export const deleteEvent = async (req, res) => {
  try {
    const deleted = await event.deleteEvent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    res.json({ message: "Evento eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar evento", error });
  }
};

/**
 * Obtener estadísticas
 */
export const getEventStatistics = async (req, res) => {
  try {
    const stats = await event.getEventStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estadísticas", error });
  }
};

/**
 * Obtener categorías
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await event.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías", error });
  }
};