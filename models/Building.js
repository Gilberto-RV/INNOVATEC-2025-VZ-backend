// models/Building.js
import mongoose from 'mongoose';

const entranceSchema = new mongoose.Schema({
  entrance_id: String,
  description: String,
  location_hint: String
});

const subjectSchema = new mongoose.Schema({
  name: String,
  id_subjects: {
    type: String,
    ref: 'Service' // Asegúrate que este modelo también esté con import/export
  },
  floor: Number
});

const bathroomSchema = new mongoose.Schema({
  floor_1: Boolean,
  floor_2: Boolean,
  floor_3: Boolean,
  floor_4: Boolean,
  floor_5: Boolean
});

const BuildingSchema = new mongoose.Schema({
  _id: String,
  geo_id: String,
  name: String,
  description: String,
  media: String,
  accessibility: Boolean,
  floors: Number,
  availability: Boolean,
  student_frequency: String,
  id_services: [{
    type: String,
    ref: 'Service'
  }],
  bathrooms: bathroomSchema,
  entrances: [entranceSchema],
  id_careers: [{
    type: String,
    ref: 'Career' // Asegúrate de que coincide con el modelo exportado
  }],
  subjects: [subjectSchema],
  last_updated: Date
});

export default mongoose.model('Building', BuildingSchema, 'buildings');
