import Blotter from "../models/Blotter.js";
import User from "../models/User.js";

// Format date for UI
const formatDate = (dateString) => {
  if (!dateString) return "Pending";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Generate status timeline
const generateTimeline = (blotter) => {
  const currentStatus = blotter.status;
  const updatedAt = formatDate(blotter.updated_at);
  const createdAt = formatDate(blotter.created_at);

  return [
    {
      title: "Report Submitted",
      date: createdAt,
      completed: true,
      color: "green",
    },
    {
      title: "Officer Assigned",
      date: ["Pending"].includes(currentStatus) ? "Waiting..." : updatedAt,
      completed: !["Pending"].includes(currentStatus),
      color: "blue",
    },
    {
      title: "Investigation Ongoing",
      date: ["Pending", "Under Review"].includes(currentStatus)
        ? "Waiting..."
        : updatedAt,
      completed: ["Investigating", "Resolved", "Closed"].includes(
        currentStatus
      ),
      color: "orange",
    },
    {
      title: "Case Resolved",
      date: ["Resolved", "Closed"].includes(currentStatus)
        ? updatedAt
        : "Waiting...",
      completed: ["Resolved", "Closed"].includes(currentStatus),
      color: "red",
    },
  ];
};

// Create a blotter (user or admin)
export const submitBlotter = async (req, res) => {
  try {
    const { reporter, incident, attachments, policeStation, userId } = req.body;

    // Admin can specify userId; users can only submit for themselves
    const ownerId = req.user.role === "admin" ? userId : req.user.id;
    if (!ownerId)
      return res.status(400).json({ message: "User ID is required" });

    const newBlotter = new Blotter({
      userId: ownerId,
      reporter,
      incident,
      attachments,
      policeStation,
    });
    await newBlotter.save();

    res
      .status(201)
      .json({ message: "Blotter submitted successfully", blotter: newBlotter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get blotters (users get their own, admins get all)
export const getBlotters = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    const blotters = await Blotter.find(query)
      .populate("userId", "-password")
      .sort({ created_at: -1 });

    const formatted = blotters.map((b) => ({
      _id: b._id,
      blotterNumber: b.blotterNumber,
      incidentType: b.incident.type,
      location: b.incident.location?.address || "Location Pending",
      date: formatDate(b.created_at),
      status: b.status,
    }));

    res.json({ blotters: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Track a blotter by blotterNumber
export const trackBlotter = async (req, res) => {
  try {
    const blotter = await Blotter.findOne({
      blotterNumber: req.params.number.trim(),
    });
    if (!blotter) return res.status(404).json({ message: "Blotter not found" });

    // RBAC: user can only access own blotters
    if (
      req.user.role !== "admin" &&
      blotter.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const timeline = generateTimeline(blotter);
    res.json({
      blotterNumber: blotter.blotterNumber,
      incidentType: blotter.incident.type,
      dateTime: formatDate(blotter.incident.date),
      location: blotter.incident.location?.address,
      description: blotter.incident.description,
      assignedOfficer: blotter.assignedOfficer || "Pending",
      policeStation: blotter.policeStation?.name,
      timeline,
      photoEvidence: blotter.attachments?.photos?.[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a blotter (user: own only, admin: any)
export const deleteBlotter = async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? { _id: req.params.id }
        : { _id: req.params.id, userId: req.user.id };

    const blotter = await Blotter.findOneAndDelete(query);
    if (!blotter)
      return res
        .status(404)
        .json({ message: "Blotter not found or not allowed" });

    res.json({ message: "Blotter deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
