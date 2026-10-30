const fs = require('fs');

const content = fs.readFileSync('src/world/WorldEngine.tsx', 'utf-8');

function extractDivs(startLine) {
  let lines = content.split('\n');
  let text = lines.slice(startLine - 1).join('\n');
  
  let stack = [];
  let regex = /<(\/?)(div)[^>]*>/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
      if (match[0].endsWith('/>')) {
          continue; // Self closing
      }
      if (match[1] === '/') {
          if (stack.length === 0) {
              console.log("Unmatched closing div at index " + match.index);
              break;
          }
          stack.pop();
          if (stack.length === 0) {
            console.log("Root div closed gracefully.");
            return;
          }
      } else {
          stack.push(match.index);
      }
  }
  console.log("Unclosed divs left: ", stack.length);
}

extractDivs(967);
