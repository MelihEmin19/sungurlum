const sharp = require('sharp');
const path = 'C:\\Users\\MONSTER\\.gemini\\antigravity-ide\\brain\\3570bfba-c230-42d9-9c6d-135467a34584\\logo_embossed_s_v3_1787892071683.jpg';

async function processIcon() {
  try {
    await sharp(path)
      // apply median filter to remove AI generation noise and make it look vector-like
      .median(3)
      // slightly sharpen the edges for crispness
      .sharpen()
      // ensure it's a high quality PNG
      .png({ quality: 100 })
      .toFile('./assets/images/sungurlum_icon_v3.png');
    
    console.log("Image processed and saved as highly crisp PNG!");
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

processIcon();
