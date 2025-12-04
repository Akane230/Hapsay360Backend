import mongoose from "mongoose";
import { generateId } from "../lib/idGenerator.js";

// Personal Info subdocument
const personalInfoSchema = new mongoose.Schema(
  {
    givenName: String,
    middleName: String,
    surname: String,
    qualifier: String,
    sex: { type: String, enum: ["Male", "Female"] },
    civilStatus: String,
    birthdate: Date,
    isPWD: { type: Boolean, default: false },
    isFirstTimeJobSeeker: { type: Boolean, default: false },
    nationality: String,
    birthPlace: String,
    otherCountry: String,
  },
  { _id: false }
);

// Address subdocument
const addressSchema = new mongoose.Schema(
  {
    houseNo: String,
    street: String,
    city: String,
    barangay: String,
    province: String,
    postalCode: String,
    country: String,
    email: String,
    mobile: String,
    telephone: String,
  },
  { _id: false }
);

// Family Info subdocument
const familySchema = new mongoose.Schema(
  {
    father: {
      given: String,
      middle: String,
      surname: String,
      qualifier: String,
      birthPlace: String,
      otherCountry: String,
    },
    mother: {
      given: String,
      middle: String,
      surname: String,
      qualifier: String,
      birthPlace: String,
      otherCountry: String,
    },
    spouse: {
      given: String,
      middle: String,
      surname: String,
      qualifier: String,
    },
  },
  { _id: false }
);

// Main ApplicationProfile schema
const applicationProfileSchema = new mongoose.Schema(
  {
    custom_id: {
      type: String,
      unique: true,
      default: () => generateId("APF"),
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    personal_info: { type: personalInfoSchema },
    address: { type: addressSchema },
    family: { type: familySchema },
    other_info: {
      height: String,
      weight: String,
      complexion: String,
      identifyingMarks: String,
      bloodType: String,
      religion: String,
      education: String,
      occupation: String,
    },
  },
  { timestamps: true }
);

/* ---------------------------------------------
   POST-SAVE SYNC PROFILE → USER MODEL
---------------------------------------------- */
applicationProfileSchema.post("save", async function () {
  try {
    const User = mongoose.model("User");

    const user = await User.findById(this.user);
    if (!user) return;

    // Sync PERSONAL INFO
    if (this.personal_info) {
      user.personal_info = {
        given_name: this.personal_info.givenName,
        middle_name: this.personal_info.middleName,
        surname: this.personal_info.surname,
        qualifier: this.personal_info.qualifier,
        sex: this.personal_info.sex,
        civil_status: this.personal_info.civilStatus,
        birthday: this.personal_info.birthdate,
        pwd: this.personal_info.isPWD,
        nationality: this.personal_info.nationality,
      };
    }

    // Sync ADDRESS safely (avoid overwriting required fields with empty values)
    if (this.address) {
      const updatedAddress = { ...(user.address?.toObject() || {}) };

      const map = {
        houseNo: "house_no",
        street: "street",
        city: "city",
        barangay: "barangay",
        postalCode: "postal_code",
        province: "province",
        country: "country",
      };

      for (const key in map) {
        const apiFieldValue = this.address[key];
        const userField = map[key];

        // only update if value is NOT empty
        if (
          apiFieldValue !== "" &&
          apiFieldValue !== null &&
          apiFieldValue !== undefined
        ) {
          updatedAddress[userField] = apiFieldValue;
        }
      }

      user.address = updatedAddress;
    }

    await user.save();
  } catch (err) {
    console.error("Error syncing ApplicationProfile to User:", err);
  }
});

const ApplicationProfile = mongoose.model(
  "ApplicationProfile",
  applicationProfileSchema
);
export default ApplicationProfile;
