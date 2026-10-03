const sharp = require('sharp');
const fs = require('fs');

const svgCode = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#0097A7" />
  
  <!-- Defs for inner shadow -->
  <defs>
    <!-- We create a drop shadow of the inverted alpha channel and composite it inside the text -->
    <filter id="innerShadow">
      <!-- Offset the shadow -->
      <feOffset dx="4" dy="8"/>
      <!-- Blur the shadow -->
      <feGaussianBlur stdDeviation="12" result="offset-blur"/>
      <!-- Invert the source alpha to get the 'hole' -->
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
      <!-- Color the shadow -->
      <feFlood flood-color="#004d56" flood-opacity="0.8" result="color"/>
      <!-- Clip the shadow to the original text shape -->
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <!-- Put the shadow over the original text -->
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>
  </defs>

  <!-- Letter S -->
  <text 
    x="512" 
    y="720" 
    font-family="Georgia, 'Times New Roman', serif" 
    font-size="650" 
    font-weight="bold" 
    font-style="italic"
    text-anchor="middle" 
    fill="#FFFFFF"
    filter="url(#innerShadow)"
  >
    S
  </text>
</svg>
`;

async function generateIcon() {
  try {
    const buffer = Buffer.from(svgCode);
    await sharp(buffer)
      .png()
      .toFile('./assets/images/sungurlum_icon_v2.png');
    console.log("High-res icon generated successfully!");
  } catch (error) {
    console.error("Error generating icon:", error);
  }
}

generateIcon();
