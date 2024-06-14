import mongoose from "mongoose";

const productFeatureSchema = new mongoose.Schema({
   feature:
   {
    type: String,
    required:true
   }
});
const projectSchema = new mongoose.Schema({
    projectImageOne: {
        type: String,
        required: true
    },
    projectImageTwo: {
        type: String,
        
    },
    projectImageThree: {
        type: String,
    },
    projectImageFour: {
        type: String,
    },
    projectName:
    {
        type: String,
        required: true
    },
    projectFeature:[productFeatureSchema],
    projectLink:
    {
        type: String
    }

}, { timestamps: true });

export const Project = mongoose.model("Project", projectSchema);
