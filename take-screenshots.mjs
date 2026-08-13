import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'] 
  });
  
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 1280, height: 800 });
  
  console.log("Navigating to Home Page...");
  await page1.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await page1.screenshot({ path: join(__dirname, '1_home_page.png') });
  console.log("Saved 1_home_page.png");

  // Click login
  console.log("Clicking Login to open AuthModal...");
  const loginButton = await page1.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('Login'));
  });
  if (loginButton) {
    await loginButton.click();
    await new Promise(r => setTimeout(r, 1000));
    await page1.screenshot({ path: join(__dirname, '2_auth_modal.png') });
    console.log("Saved 2_auth_modal.png");
    
    // close modal
    const cancelButton = await page1.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(b => b.textContent.includes('Cancel'));
    });
    if (cancelButton) await cancelButton.click();
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Create Room
  console.log("Creating room...");
  const createButton = await page1.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent.includes('Create Room'));
  });
  
  if (createButton) {
      await createButton.click();
      
      console.log("Waiting for Room Page...");
      await page1.waitForFunction(() => window.location.pathname.includes('/room'), { timeout: 10000 });
      await new Promise(r => setTimeout(r, 1000));
      
      await page1.screenshot({ path: join(__dirname, '3_room_page.png') });
      console.log("Saved 3_room_page.png");
      
      // Start Game
      const startButton = await page1.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(b => b.textContent.includes('Start Game'));
      });
      
      if (startButton) {
          console.log("Starting game...");
          await startButton.click();
          
          await page1.waitForFunction(() => window.location.pathname.includes('/game'), { timeout: 10000 });
          await new Promise(r => setTimeout(r, 1000));
          
          await page1.screenshot({ path: join(__dirname, '4_game_page.png') });
          console.log("Saved 4_game_page.png");
      }
  }

  await browser.close();
  
  // Copy to artifacts if running from workspace
  const artifactDir = '/Users/justinrosales/.gemini/antigravity/brain/7c525332-4c85-462f-9056-8f64788fc00b';
  ['1_home_page.png', '2_auth_modal.png', '3_room_page.png', '4_game_page.png'].forEach(file => {
      try {
          if (fs.existsSync(join(__dirname, file))) {
              fs.copyFileSync(join(__dirname, file), join(artifactDir, file));
          }
      } catch (e) {
          console.error("Failed to copy", file, e);
      }
  });

  console.log("Done.");
}

run().catch(console.error);
