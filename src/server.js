const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const dotenv = require("dotenv");
const fs = require("fs");
const { GoogleAuth } = require("google-auth-library");

dotenv.config();

const SHEET_ID = process.env.SHEET_ID;
const SERVICE_ACCOUNT_KEY = JSON.parse(fs.readFileSync("google-credentials.json"));

const app = express();
app.use(cors());
app.use(bodyParser.json());

async function accessSpreadsheet(formData) {
    try {
        const doc = new GoogleSpreadsheet(SHEET_ID);

        // Set up the GoogleAuth instance to authenticate with the service account
        const auth = new GoogleAuth({
            credentials: SERVICE_ACCOUNT_KEY,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        // Get the authentication client
        const authClient = await auth.getClient();

        // Set the authentication client to the Google Spreadsheet instance
        doc.auth = authClient;

        await doc.loadInfo(); // Load the spreadsheet
        const sheet = doc.sheetsByIndex[0]; // First sheet
        await sheet.addRow(formData);

        console.log("Data added to Google Sheets");
    } catch (error) {
        console.error("Error accessing Google Sheets:", error);
    }
}



app.post("/submit-form", async (req, res) => {
    const formData = req.body;

    try {
        await accessSpreadsheet(formData);
        res.status(200).json({ message: "Form submitted successfully!" });
    } catch (error) {
        console.error("Error submitting form:", error);
        res.status(500).json({ message: "Server error. Try again later." });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
