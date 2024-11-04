// migrate.js

require('dotenv').config();
const mongoose = require('mongoose');
const sql = require('mssql');

// Import MongoDB Models
const Vendor = require('./models/Vendor'); 
const User = require('./models/User');
const RFQ = require('./models/RFQ');
const Quote = require('./models/Quote');
const Verification = require('./models/Verification');

// MSSQL Configuration
const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER, // e.g., 'localhost'
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
  },
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

// Connect to MSSQL
sql.connect(config)
.then(() => {
  console.log("MSSQL connected");
  performMigration();
})
.catch((err) => {
  console.error("MSSQL connection error:", err);
  process.exit(1);
});

// Function to perform migration
async function performMigration() {
  try {
    await migrateVendors();
    await migrateUsers();
    await migrateRFQs();
    await migrateQuotes();
    await migrateVerifications();

    console.log("Data migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

// Function to migrate Vendors
async function migrateVendors() {
  console.log("Migrating Vendors...");
  const vendors = await Vendor.find();

  for (const vendor of vendors) {
    // Check if Vendor already exists in MSSQL using MongoId
    const existing = await sql.query`SELECT * FROM Vendor WHERE MongoId = ${vendor._id.toString()}`;
    if (existing.recordset.length > 0) {
      console.log(`Vendor ${vendor.vendorName} already exists. Skipping.`);
      continue;
    }

    await sql.query`
      INSERT INTO Vendor (
        Username,
        VendorName,
        Password,
        Email,
        ContactNumber,
        MongoId
      ) VALUES (
        ${vendor.username},
        ${vendor.vendorName},
        ${vendor.password},
        ${vendor.email},
        ${vendor.contactNumber},
        ${vendor._id.toString()}
      )
    `;
    console.log(`Inserted Vendor: ${vendor.vendorName}`);
  }
}

// Function to migrate Users
async function migrateUsers() {
  console.log("Migrating Users...");
  const users = await User.find();

  for (const user of users) {
    // Check if User already exists in MSSQL using MongoId
    const existing = await sql.query`SELECT * FROM [User] WHERE MongoId = ${user._id.toString()}`;
    if (existing.recordset.length > 0) {
      console.log(`User ${user.username} already exists. Skipping.`);
      continue;
    }

    await sql.query`
      INSERT INTO [User] (
        Username,
        Password,
        Email,
        ContactNumber,
        Role,
        Status,
        MongoId
      ) VALUES (
        ${user.username},
        ${user.password},
        ${user.email},
        ${user.contactNumber},
        ${user.role},
        ${user.status},
        ${user._id.toString()}
      )
    `;
    console.log(`Inserted User: ${user.username}`);
  }
}

// Function to migrate RFQs
async function migrateRFQs() {
  console.log("Migrating RFQs...");
  const rfqs = await RFQ.find();

  for (const rfq of rfqs) {
    // Check if RFQ already exists in MSSQL using MongoId
    const existing = await sql.query`SELECT * FROM RFQ WHERE MongoId = ${rfq._id.toString()}`;
    if (existing.recordset.length > 0) {
      console.log(`RFQ ${rfq.RFQNumber} already exists. Skipping.`);
      continue;
    }

    // Insert RFQ
    await sql.query`
      INSERT INTO RFQ (
        RFQNumber,
        ShortName,
        CompanyType,
        SapOrder,
        ItemType,
        CustomerName,
        OriginLocation,
        DropLocationState,
        DropLocationDistrict,
        Address,
        Pincode,
        VehicleType,
        AdditionalVehicleDetails,
        NumberOfVehicles,
        Weight,
        BudgetedPriceBySalesDept,
        MaxAllowablePrice,
        eReverseDate,
        eReverseTime,
        VehiclePlacementBeginDate,
        VehiclePlacementEndDate,
        Status,
        InitialQuoteEndTime,
        EvaluationEndTime,
        FinalizeReason,
        l1Price,
        l1VendorId,
        RFQClosingDate,
        RFQClosingTime,
        eReverseToggle,
        rfqType,
        CreatedAt,
        UpdatedAt,
        MongoId
      ) VALUES (
        ${rfq.RFQNumber},
        ${rfq.shortName || null},
        ${rfq.companyType || null},
        ${rfq.sapOrder || null},
        ${rfq.itemType || null},
        ${rfq.customerName || null},
        ${rfq.originLocation || null},
        ${rfq.dropLocationState || null},
        ${rfq.dropLocationDistrict || null},
        ${rfq.address},
        ${rfq.pincode},
        ${rfq.vehicleType || null},
        ${rfq.additionalVehicleDetails || null},
        ${rfq.numberOfVehicles || null},
        ${rfq.weight || null},
        ${rfq.budgetedPriceBySalesDept || null},
        ${rfq.maxAllowablePrice || null},
        ${rfq.eReverseDate || null},
        ${rfq.eReverseTime || null},
        ${rfq.vehiclePlacementBeginDate || null},
        ${rfq.vehiclePlacementEndDate || null},
        ${rfq.status || 'initial'},
        ${rfq.initialQuoteEndTime},
        ${rfq.evaluationEndTime},
        ${rfq.finalizeReason || null},
        ${rfq.l1Price || null},
        ${rfq.l1VendorId ? await getMssqlVendorId(rfq.l1VendorId.toString()) : null},
        ${rfq.RFQClosingDate || null},
        ${rfq.RFQClosingTime},
        ${rfq.eReverseToggle ? 1 : 0},
        ${rfq.rfqType || 'D2D'},
        ${rfq.createdAt},
        ${rfq.updatedAt},
        ${rfq._id.toString()}
      )
    `;
    console.log(`Inserted RFQ: ${rfq.RFQNumber}`);

    // Retrieve the newly inserted RFQ's Id from MSSQL
    const insertedRFQ = await sql.query`SELECT Id FROM RFQ WHERE MongoId = ${rfq._id.toString()}`;
    const mssqlRFQId = insertedRFQ.recordset[0].Id;

    // Insert SelectedVendors into RFQ_SelectedVendors
    if (rfq.selectedVendors && rfq.selectedVendors.length > 0) {
      for (const vendorId of rfq.selectedVendors) {
        const mssqlVendorId = await getMssqlVendorId(vendorId.toString());
        if (mssqlVendorId) {
          // Check if the relation already exists
          const existingRelation = await sql.query`
            SELECT * FROM RFQ_SelectedVendors
            WHERE RFQId = ${mssqlRFQId} AND VendorId = ${mssqlVendorId}
          `;
          if (existingRelation.recordset.length === 0) {
            await sql.query`
              INSERT INTO RFQ_SelectedVendors (RFQId, VendorId)
              VALUES (${mssqlRFQId}, ${mssqlVendorId})
            `;
            console.log(`Linked RFQ ${rfq.RFQNumber} with Vendor ID ${mssqlVendorId}`);
          }
        } else {
          console.warn(`Vendor with MongoId ${vendorId} not found in MSSQL.`);
        }
      }
    }

    // Insert VendorActions into RFQ_VendorActions
    if (rfq.vendorActions && rfq.vendorActions.length > 0) {
      for (const action of rfq.vendorActions) {
        const mssqlVendorId = await getMssqlVendorId(action.vendorId.toString());
        if (mssqlVendorId) {
          // Check if the action already exists
          const existingAction = await sql.query`
            SELECT * FROM RFQ_VendorActions
            WHERE MongoId = ${action._id ? action._id.toString() : ''} 
               OR (RFQId = ${mssqlRFQId} AND VendorId = ${mssqlVendorId} AND Action = ${action.action} AND Timestamp = ${action.timestamp})
          `;
          if (existingAction.recordset.length === 0) {
            await sql.query`
              INSERT INTO RFQ_VendorActions (
                RFQId,
                Action,
                VendorId,
                Timestamp,
                MongoId
              ) VALUES (
                ${mssqlRFQId},
                ${action.action},
                ${mssqlVendorId},
                ${action.timestamp},
                ${action._id ? action._id.toString() : generateNewMongoId()}
              )
            `;
            console.log(`Inserted VendorAction: ${action.action} for Vendor ID ${mssqlVendorId}`);
          }
        } else {
          console.warn(`Vendor with MongoId ${action.vendorId} not found in MSSQL.`);
        }
      }
    }
  }
}

// Helper function to generate a new MongoId string if _id is missing
function generateNewMongoId() {
  return new mongoose.Types.ObjectId().toString();
}

// Helper function to get MSSQL Vendor ID based on MongoId
async function getMssqlVendorId(mongoId) {
  const result = await sql.query`SELECT Id FROM Vendor WHERE MongoId = ${mongoId}`;
  if (result.recordset.length > 0) {
    return result.recordset[0].Id;
  }
  return null;
}

// Function to migrate Quotes
async function migrateQuotes() {
  console.log("Migrating Quotes...");
  const quotes = await Quote.find();

  for (const quote of quotes) {
    // Check if Quote already exists in MSSQL using MongoId
    const existing = await sql.query`SELECT * FROM Quote WHERE MongoId = ${quote._id.toString()}`;
    if (existing.recordset.length > 0) {
      console.log(`Quote ID ${quote._id} already exists. Skipping.`);
      continue;
    }

    // Get MSSQL RFQId based on RFQ MongoId
    const mssqlRFQId = await getMssqlRFQId(quote.rfqId.toString());
    if (!mssqlRFQId) {
      console.warn(`RFQ with MongoId ${quote.rfqId} not found in MSSQL. Skipping Quote ID ${quote._id}.`);
      continue;
    }

    // Get MSSQL VendorId based on vendorName
    const mssqlVendorId = await getMssqlVendorIdByName(quote.vendorName);
    if (!mssqlVendorId) {
      console.warn(`Vendor with name ${quote.vendorName} not found in MSSQL. Skipping Quote ID ${quote._id}.`);
      continue;
    }

    await sql.query`
      INSERT INTO Quote (
        RFQId,
        VendorName,
        Price,
        Message,
        NumberOfTrucks,
        ValidityPeriod,
        Label,
        TrucksAllotted,
        NumberOfVehiclesPerDay,
        CreatedAt,
        UpdatedAt,
        MongoId
      ) VALUES (
        ${mssqlRFQId},
        ${quote.vendorName},
        ${quote.price},
        ${quote.message || null},
        ${quote.numberOfTrucks},
        ${quote.validityPeriod || null},
        ${quote.label || null},
        ${quote.trucksAllotted || 0},
        ${quote.numberOfVehiclesPerDay},
        ${quote.createdAt},
        ${quote.updatedAt},
        ${quote._id.toString()}
      )
    `;
    console.log(`Inserted Quote ID: ${quote._id}`);
  }
}

// Helper function to get MSSQL RFQ ID based on MongoId
async function getMssqlRFQId(mongoId) {
  const result = await sql.query`SELECT Id FROM RFQ WHERE MongoId = ${mongoId}`;
  if (result.recordset.length > 0) {
    return result.recordset[0].Id;
  }
  return null;
}

// Helper function to get MSSQL Vendor ID by VendorName
async function getMssqlVendorIdByName(vendorName) {
  const result = await sql.query`SELECT Id FROM Vendor WHERE VendorName = ${vendorName}`;
  if (result.recordset.length > 0) {
    return result.recordset[0].Id;
  }
  return null;
}

// Function to migrate Verifications
async function migrateVerifications() {
  console.log("Migrating Verifications...");
  const verifications = await Verification.find();

  for (const verification of verifications) {
    // Check if Verification already exists in MSSQL using MongoId
    const existing = await sql.query`SELECT * FROM Verification WHERE MongoId = ${verification._id.toString()}`;
    if (existing.recordset.length > 0) {
      console.log(`Verification for Email ${verification.email} already exists. Skipping.`);
      continue;
    }

    await sql.query`
      INSERT INTO Verification (
        Email,
        OTP,
        CreatedAt,
        MongoId
      ) VALUES (
        ${verification.email},
        ${verification.otp},
        ${verification.createdAt},
        ${verification._id.toString()}
      )
    `;
    console.log(`Inserted Verification for Email: ${verification.email}`);
  }
}

// Start Migration Process
// Migration functions are called in performMigration()
