// backend/helpers/uploadProfileHelper.js

const uploadProfilePhotoHelper = async (req, model, userIdField, photoField) => {
    // Check if the file exists in the request
    if (!req.file) {
      throw new Error('No file uploaded');
    }
  
    const photoPath = `/uploads/${req.file.filename}`;
  
    // Update the specified model with the photo path
    const updatedDocument = await model.findOneAndUpdate(
      { [userIdField]: req.user._id },
      { [photoField]: photoPath },
      { new: true }
    );
  
    if (!updatedDocument) {
      throw new Error(`No profile found for user ID: ${req.user._id}`);
    }
  
    return updatedDocument;
  };
  
  module.exports = uploadProfilePhotoHelper;
  