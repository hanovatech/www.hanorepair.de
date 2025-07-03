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

async function parseMarkdownDirectory(dir) {
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.md'));
  const data = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const { data: frontmatter } = matter(content);
    data.push({ filename: file, ...frontmatter });
  }

  data.sort((a, b) => a.manufacturer?.localeCompare(b.manufacturer));

  return data;
}

async function writeToExcel(workbook, sheetName, rows) {
  const sheet = workbook.addWorksheet(sheetName);

  if (rows.length === 0) return;

  // Get all unique keys from all frontmatters
  const services = new Set();
  rows.forEach(row => {
    Object.keys(row.services).forEach(service => {
      services.add(service);
    });
  });

  // Setup columns: Manufacturer, Device, and all services
  const headers = Array.from(services);
  headers.sort((a, b) => a.localeCompare(b));
  headers.unshift("Gerät");
  headers.unshift("Hersteller");
  headers.unshift("filename");
  sheet.addRow(headers);
  sheet.getColumn(1).hidden = true;

  // Add rows to the sheet
  rows.forEach(row => {
    const rowData = headers.map(header => {
      switch (header) {
        case "filename":
          return row.filename;
        case "Hersteller":
          return row.manufacturer || "";
        case "Gerät":
          return row.name || "";
        default:
          return row.services[header]?.price || "";
      };
    });
    sheet.addRow(rowData);
  });
}

(async () => {
  try {
    const workbook = new ExcelJS.Workbook();
    for (let type of deviceTypes) {
      const data = await parseMarkdownDirectory(type.path);
      await writeToExcel(workbook, type.name, data);
    }
    await workbook.xlsx.writeFile(excelFile);
    console.log(`✅ Excel file created: ${excelFile}`);
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
