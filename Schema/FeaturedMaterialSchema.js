import mongoose from "mongoose";
import { type } from "os";

const featuredMaterialSchema = new mongoose.Schema({
    productId:{
        type:String,
        required:true
    },
    productName: {
        type: String,
        required: true
    },
    materialType: {
        type: String,
        required: true
    },
    materialSpecification: {
        type: String,
        required: true
    },
    qualityString:{
        type: String,
        required: true
    }
},{collection: 'featured_material'});
const FeaturedMaterial = mongoose.model('FeaturedMaterial', featuredMaterialSchema);
export default FeaturedMaterial;