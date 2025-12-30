// scripts/importData.ts
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import connectDB from '../lib/mongodb';
import { User } from '../models/user';
import { Brand } from '../models/brand';
import { Prompt } from '../models/prompts';

async function importCSV(filePath: string, model: any, transform?: (row: any) => any) {
  const results: any[] = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Trim whitespace from all keys
        const trimmedData: any = {};
        for (const key in data) {
          trimmedData[key.trim()] = data[key];
        }
        const transformed = transform ? transform(trimmedData) : trimmedData;
        results.push(transformed);
      })
      .on('end', async () => {
        try {
          await model.deleteMany({}); // Clear existing data
          await model.insertMany(results);
          console.log(`Imported ${results.length} records to ${model.modelName}`);
          resolve(results);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

async function main() {
  try {
    await connectDB();
    
    const baseDir = path.join(process.cwd(), 'data');

    // Import Users
    await importCSV(
      path.join(baseDir, 'users.csv'),
      User
    );

    // Import Brands
    await importCSV(
      path.join(baseDir, 'brands.csv'),
      Brand
    );

    // Import Prompts
    await importCSV(
      path.join(baseDir, 'prompts.csv'),
      Prompt,
      (row) => {
        const { timeStamp, timestamp, evaluation, ...rest } = row;
        // Handle both timeStamp and timestamp column names, and validate the date
        const timestampValue = timeStamp || timestamp;
        const dateValue = timestampValue && timestampValue.trim() 
          ? new Date(timestampValue) 
          : new Date(); // Default to current date if missing or invalid
        
        // Validate the date
        const finalTimestamp = isNaN(dateValue.getTime()) ? new Date() : dateValue;
        
        return {
          ...rest,
          timestamp: finalTimestamp,
          evaluation: null, // Initially empty
        };
      }
    );

    console.log('All data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

main();