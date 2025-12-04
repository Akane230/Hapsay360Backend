import Blotter from "../models/Blotter.js";
import User from "../models/User.js";
import Officer from "../models/Officer.js";

/**
 * @route POST /api/blotters
 * create a new blotter
 */
export const createBlotter = async (req, res) => {
  try {
    const {
      userId,
      incidentType,
      incidentDate,
      incidentTime,
      incidentDescription,
      officerId,
    } = req.body;

    if (!userId || !incidentType || !incidentDate || !incidentTime || !incidentDescription) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (officerId) {
      const officer = await Officer.findById(officerId);
      if (!officer) return res.status(404).json({ success: false, message: "Officer not found" });
    }

    const incident = {
      type: incidentType,
      date: incidentDate,
      time: incidentTime,
      description: incidentDescription,
    };

    const blotter = new Blotter({
      user_id: userId,
      assigned_Officer: officerId,
      incident,
    });

    await blotter.save();

    res.status(201).json({ success: true, data: blotter });
  } catch (error) {
    console.error("Error creating blotter:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @route GET /api/blotters
 * Get all blotters
 */
export const getAllBlotters = async (req, res) => {
  try {
    const blotters = await Blotter.find()
      .populate("user_id", "personal_info email phone_number profile_picture")
      .populate("assigned_Officer", "first_name last_name")
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, count: blotters.length, data: blotters });
  } catch (error) {
    console.error("Error fetching blotters:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @route GET /api/blotters/user/:userId
 * Get blotters specific to a user
 */
export const getUserBlotters = async (req, res) => {
  try {
    const { userId } = req.params;

    const blotters = await Blotter.find({ user_id: userId })
      .populate("user_id", "personal_info email phone_number profile_picture")
      .populate("assigned_Officer", "first_name last_name")
      .sort({ created_at: -1 });

    res.status(200).json({ success: true, count: blotters.length, blotters });
  } catch (error) {
    console.error("Error fetching user blotters:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @route GET /api/blotters/:blotterId/attachments/:attachmentIndex
 * Fetch a blotter attachment
 */
export const getBlotterAttachment = async (req, res) => {
  try {
    const { blotterId, attachmentIndex } = req.params;
    const index = parseInt(attachmentIndex);

    const blotter = await Blotter.findById(blotterId);
    if (!blotter || !blotter.attachments || !blotter.attachments[index]) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    const attachment = blotter.attachments[index];

    res.set('Content-Type', attachment.mimetype || 'application/octet-stream');
    res.set('Content-Length', attachment.data?.length || 0);
    res.set('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.name || 'attachment')}"`);
    res.send(attachment.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

/**
 * @route PUT /api/blotters/update/:blotterId
 * Update a blotter
 */
export const updateBlotter = async (req, res) => {
  try {
    const { blotterId } = req.params;
    const { status, assigned_officer_id, notes } = req.body;

    const blotter = await Blotter.findById(blotterId);
    if (!blotter) {
      return res.status(404).json({ success: false, message: "Blotter not found" });
    }

    // Validate officer if provided
    if (assigned_officer_id) {
      const officer = await Officer.findById(assigned_officer_id);
      if (!officer) {
        return res.status(404).json({ success: false, message: "Officer not found" });
      }
      blotter.assigned_Officer = assigned_officer_id;
    } else {
      blotter.assigned_Officer = null;
    }

    // Update fields
    if (status) blotter.status = status;
    if (notes !== undefined) blotter.notes = notes;

    await blotter.save();

    // Populate before sending response
    await blotter.populate("user_id", "personal_info email phone_number profile_picture");
    await blotter.populate("assigned_Officer", "first_name last_name");

    res.status(200).json({ success: true, message: "Blotter updated successfully", data: blotter });
  } catch (error) {
    console.error("Error updating blotter:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * @route DELETE /api/blotters/delete/:blotterId
 * Delete a blotter
 */
export const deleteBlotter = async (req, res) => {
  try {
    const { blotterId } = req.params;

    const blotter = await Blotter.findById(blotterId);
    if (!blotter) {
      return res.status(404).json({ success: false, message: "Blotter not found" });
    }

    await Blotter.findByIdAndDelete(blotterId);

    res.status(200).json({ success: true, message: "Blotter deleted successfully" });
  } catch (error) {
    console.error("Error deleting blotter:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};