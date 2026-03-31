// replace-alerts.js
// Automated script to replace all alert() with showAlert()

const fs = require('fs');
const path = require('path');

// Replacement patterns
const replacements = [
  // Success alerts
  {
    find: /alert\('([^']*created successfully[^']*)'\)/gi,
    replace: "showAlert('success', '$1')",
    description: 'Created successfully'
  },
  {
    find: /alert\('([^']*updated successfully[^']*)'\)/gi,
    replace: "showAlert('success', '$1')",
    description: 'Updated successfully'
  },
  {
    find: /alert\('([^']*deleted successfully[^']*)'\)/gi,
    replace: "showAlert('success', '$1')",
    description: 'Deleted successfully'
  },
  {
    find: /alert\('([^']*saved successfully[^']*)'\)/gi,
    replace: "showAlert('success', '$1')",
    description: 'Saved successfully'
  },
  {
    find: /alert\('([^']*placed successfully[^']*)'\)/gi,
    replace: "showAlert('success', '$1')",
    description: 'Placed successfully'
  },
  {
    find: /alert\('([^']*copied successfully[^']*)'\)/gi,
    replace: "showAlert('success', '$1')",
    description: 'Copied successfully'
  },
  {
    find: /alert\('([^']*completed successfully[^']*)'\)/gi,
    replace: "showAlert('success', '$1')",
    description: 'Completed successfully'
  },
  {
    find: /alert\('([^']*cancelled successfully[^']*)'\)/gi,
    replace: "showAlert('success', '$1')",
    description: 'Cancelled successfully'
  },
  
  // Error alerts
  {
    find: /alert\('Error ([^']*)'\)/gi,
    replace: "showAlert('error', 'Error $1')",
    description: 'Error messages'
  },
  {
    find: /alert\('Failed ([^']*)'\)/gi,
    replace: "showAlert('error', 'Failed $1')",
    description: 'Failed messages'
  },
  {
    find: /alert\(error\.response\?\.data\?\.message \|\| '([^']*)'\)/g,
    replace: "showAlert('error', error.response?.data?.message || '$1')",
    description: 'API error handling'
  },
  
  // Warning alerts
  {
    find: /alert\('Please ([^']*)'\)/gi,
    replace: "showAlert('warning', 'Please $1')",
    description: 'Please messages'
  },
  {
    find: /alert\('([^']*required[^']*)'\)/gi,
    replace: "showAlert('warning', '$1')",
    description: 'Required field messages'
  },
  {
    find: /alert\('([^']*select[^']*)'\)/gi,
    replace: "showAlert('warning', '$1')",
    description: 'Select messages'
  },
  {
    find: /alert\('([^']*add[^']*)'\)/gi,
    replace: "showAlert('warning', '$1')",
    description: 'Add messages'
  },
  
  // Generic alerts (as info)
  {
    find: /alert\('([^']*)'\)/g,
    replace: "showAlert('info', '$1')",
    description: 'Generic alerts'
  }
];

// Track statistics
let stats = {
  filesProcessed: 0,
  filesChanged: 0,
  replacementsMade: 0,
  byType: {
    success: 0,
    error: 0,
    warning: 0,
    info: 0
  }
};

function addImport(content) {
  // Check if import already exists
  if (content.includes("from '../components/Alert'") || 
      content.includes("from '../../components/Alert'")) {
    return content;
  }

  // Determine correct import path based on file location
  let importPath = '../components/Alert';
  if (content.includes("from '../../")) {
    importPath = '../../components/Alert';
  }

  // Find the last import statement
  const importRegex = /import .+ from .+;/g;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const importLine = `import { showAlert } from '${importPath}';\n`;
    content = content.replace(lastImport, lastImport + '\n' + importLine);
  } else {
    // No imports found, add at the beginning
    const importLine = `import { showAlert } from '${importPath}';\n\n`;
    content = importLine + content;
  }

  return content;
}

function replaceInFile(filePath) {
  stats.filesProcessed++;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let changesInFile = 0;

  replacements.forEach(({find, replace, description}) => {
    const matches = content.match(find);
    if (matches) {
      content = content.replace(find, replace);
      changesInFile += matches.length;
      
      // Track by type
      if (replace.includes("'success'")) stats.byType.success += matches.length;
      else if (replace.includes("'error'")) stats.byType.error += matches.length;
      else if (replace.includes("'warning'")) stats.byType.warning += matches.length;
      else if (replace.includes("'info'")) stats.byType.info += matches.length;
      
      console.log(`   ✓ ${matches.length} × ${description}`);
    }
  });

  if (changesInFile > 0) {
    // Add import statement
    content = addImport(content);
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    
    stats.filesChanged++;
    stats.replacementsMade += changesInFile;
    
    console.log(`✅ ${path.basename(filePath)} - ${changesInFile} replacements\n`);
  }
}

function processDirectory(dir) {
  console.log(`\n🔍 Scanning: ${dir}\n`);
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Skip node_modules and other directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(file.name)) {
        processDirectory(fullPath);
      }
    } else if (file.name.endsWith('.jsx') || file.name.endsWith('.js')) {
      // Skip config files
      if (!file.name.includes('config') && 
          !file.name.includes('vite') &&
          !file.name.includes('replace-alerts')) {
        console.log(`📄 Processing: ${file.name}`);
        replaceInFile(fullPath);
      }
    }
  });
}

// Main execution
console.log('╔═══════════════════════════════════════════════════════╗');
console.log('║   🎨 AUTOMATED ALERT REPLACEMENT SCRIPT 🎨          ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

const srcDir = path.join(__dirname, 'src');

if (!fs.existsSync(srcDir)) {
  console.error('❌ Error: src directory not found!');
  console.error('   Make sure you run this script from the frontend directory.\n');
  process.exit(1);
}

// Start processing
processDirectory(srcDir);

// Print summary
console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║                    📊 SUMMARY                         ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');
console.log(`📁 Files processed:    ${stats.filesProcessed}`);
console.log(`✏️  Files changed:      ${stats.filesChanged}`);
console.log(`🔄 Total replacements: ${stats.replacementsMade}\n`);
console.log('By type:');
console.log(`   ✅ Success: ${stats.byType.success}`);
console.log(`   ❌ Error:   ${stats.byType.error}`);
console.log(`   ⚠️  Warning: ${stats.byType.warning}`);
console.log(`   ℹ️  Info:    ${stats.byType.info}\n`);

if (stats.filesChanged > 0) {
  console.log('✅ All alerts replaced successfully!\n');
  console.log('Next steps:');
  console.log('   1. Review the changes');
  console.log('   2. Test your application');
  console.log('   3. Commit the changes\n');
} else {
  console.log('ℹ️  No alerts found to replace.\n');
}