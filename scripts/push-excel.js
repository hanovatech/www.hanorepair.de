const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const ExcelJS = require('exceljs');

const excelFile = 'devices.xlsx';
const deviceTypes = [
  { name: 'smartphones', path: '../content/de/smartphones' },
  { name: 'tablets', path: '../content/de/tablets' },
  { name: 'mac-geraete', path: '../content/de/mac-geraete' },
  { name: 'wearables', path: '../content/de/wearables' },
  { name: 'konsolen', path: '../content/de/konsolen' }
];

(async function updateMarkdownFromExcel() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelFile);

  for (const [index, deviceType] of deviceTypes.entries()) {
    const sheet = workbook.getWorksheet(index + 1);

    if (!sheet) {
      console.error(`❌ Sheet not found: ${deviceType.name}`);
      continue;
    }

    const headers = sheet.getRow(1).values.slice(1); // Remove first empty cell
    const rows = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header row
      const rowValues = row.values.slice(1); // drop first empty cell
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = rowValues[index] || '';
      });
      rows.push(obj);
    });

    for (const row of rows) {
      const filePath = path.join(deviceType.path, row.filename);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${row.filename}`);
        continue;
      }
  
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(content);
  
      // Update frontmatter
      Object.keys(row).forEach((key) => {
        if (["filename", "Hersteller", "Gerät"].includes(key)) return;
        if (parsed.data.services[key]) parsed.data.services[key].price = row[key];
      });
  
      // Write updated markdown
      const newContent = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Updated: ${row.filename}`);
    }
  }

  return;


  


  console.log('🎉 All files updated!');
})()