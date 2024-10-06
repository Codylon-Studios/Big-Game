//
//This is a backend file
//
//DON'T TOUCH UNLESS YOU KNOW WHAT YOU ARE DOING
//
//Installing manual: https://flint-zenith-b13.notion.site/424c21ffbb5648f4b674cb9a1472c43a?v=8377e7b70ae842dc91e2261c80e4ac75
// Copyright (c) 2024 Codylon Studios.
// 
const fs = require('fs');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const saltRounds = 10;

// Create a PostgreSQL connection pool
const dbConfig = JSON.parse(fs.readFileSync('db_config.json'));
// Load environment variables from .env file
dotenv.config();
// Connect to the PostgreSQL database
const pool = new Pool(dbConfig);


// Export necessary components for use in other modules, e.g. account.js
module.exports = { pool, saltRounds};