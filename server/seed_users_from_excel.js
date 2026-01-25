const mongoose = require('mongoose');
const dotenv = require('dotenv');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('./src/models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'server.env') });
if (!process.env.MONGODB_URI) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const EXCEL_PATH = "C:\\Users\\user\\OneDrive\\Desktop\\roll no.xlsx";

const seedUsers = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Read Excel File
        console.log(`Reading Excel file from: ${EXCEL_PATH}`);
        const workbook = xlsx.readFile(EXCEL_PATH);

        const usersToInsert = [];
        const salt = await bcrypt.genSalt(10);
        console.log('Hashing passwords... (this might take a moment)');

        let totalSheetsProcessed = 0;

        for (const sheetName of workbook.SheetNames) {
            console.log(`--- Processing Sheet: ${sheetName} ---`);
            const sheet = workbook.Sheets[sheetName];

            // Read all rows
            const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            if (rawRows.length === 0) {
                console.log(`Sheet "${sheetName}" is empty. Skipping.`);
                continue;
            }

            let headerRowIndex = -1;
            let htnoIndex = -1;
            let nameIndex = -1;

            // Scan first 20 rows each sheet to find header
            for (let i = 0; i < Math.min(20, rawRows.length); i++) {
                const row = rawRows[i];
                if (!row || !Array.isArray(row)) continue;

                row.forEach((cell, colIndex) => {
                    if (typeof cell === 'string') {
                        const val = cell.toLowerCase().trim();
                        // Match variations of Roll No
                        if (val.includes('htno') || val.includes('roll') || val === 'ht no' || val === 'h.t.no') {
                            htnoIndex = colIndex;
                        }
                        // Match variations of Name
                        if (val.includes('student name') || val === 'name' || val.includes('student_name')) {
                            nameIndex = colIndex;
                        }
                    }
                });

                if (htnoIndex !== -1 && nameIndex !== -1) {
                    headerRowIndex = i;
                    console.log(`Found headers at row ${i}: HTNO (Col ${htnoIndex}), Name (Col ${nameIndex})`);
                    break;
                } else {
                    htnoIndex = -1;
                    nameIndex = -1;
                }
            }

            if (headerRowIndex === -1) {
                console.log(`[WARN] Could not find header row in sheet "${sheetName}". Skipping.`);
                continue;
            }

            // Extract users from this sheet
            let sheetUserCount = 0;
            for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
                const row = rawRows[i];
                if (!row || row.length === 0) continue;

                const rawRoll = row[htnoIndex];
                const rawName = row[nameIndex];

                if (!rawRoll || !rawName) continue;

                const rollNumber = String(rawRoll).trim();
                const name = String(rawName).trim();

                if (rollNumber && name) {
                    // Avoid duplicates in memory
                    if (!usersToInsert.find(u => u.rollNumber === rollNumber)) {
                        usersToInsert.push({
                            rollNumber,
                            name,
                            // Placeholder pass, hashed later if needed or hash now
                            // Hashing takes time, doing it sequentially inside loop
                            password: await bcrypt.hash(rollNumber, salt),
                            isAdmin: false,
                            isFirstLogin: true,
                            score: 0,
                            solvedQuestions: [],
                            activeDays: []
                        });
                        sheetUserCount++;
                    }
                }
            }
            console.log(`Extracted ${sheetUserCount} new users from "${sheetName}".`);
            totalSheetsProcessed++;
        }

        console.log(`\nTotal unique users prepared: ${usersToInsert.length}`);

        if (usersToInsert.length === 0) {
            console.log('No users found in any sheet. Exiting.');
            process.exit(0);
        }

        // Delete existing non-admin users
        console.log('Clearing existing non-admin users...');
        const deleteResult = await User.deleteMany({ isAdmin: { $ne: true } });
        console.log(`Deleted ${deleteResult.deletedCount} existing non-admin users.`);

        // Bulk Insert
        console.log('Inserting new users...');
        try {
            await User.insertMany(usersToInsert, { ordered: false });
        } catch (e) {
            console.log('Partial insertion error (duplicates ignored):', e.message);
        }

        console.log(`Successfully processed user insertion.`);
        const totalUsers = await User.countDocuments();
        console.log(`Total users in DB: ${totalUsers}`);

        console.log('Seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedUsers();
