const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const dotenv = require("dotenv");
const fs = require("fs");
const { GoogleAuth } = require("google-auth-library");

dotenv.config();

const SHEET_ID = process.env.SHEET_ID;
const SERVICE_ACCOUNT_KEY = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const app = express();
app.use(cors());
app.use(bodyParser.json());

async function accessSpreadsheet(formData) {
    try {
        const doc = new GoogleSpreadsheet(SHEET_ID);
        const auth = new GoogleAuth({
            credentials: SERVICE_ACCOUNT_KEY,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const authClient = await auth.getClient();
        doc.auth = authClient;

        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
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
