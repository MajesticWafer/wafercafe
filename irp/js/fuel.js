// Fuel Gauge System
// Displays a visual fuel meter at the bottom right of the screen

export class FuelGauge {
  constructor(maxFuel = 100) {
    this.maxFuel = maxFuel;
    this.gaugeWidth = 150;
    this.gaugeHeight = 30;
    this.posX = 0; // Will be calculated based on canvas width
    this.posY = 0; // Will be calculated based on canvas height
    this.padding = 20;
  }

  // Update gauge position based on canvas dimensions
  updatePosition(canvasWidth, canvasHeight) {
    this.posX = canvasWidth - this.gaugeWidth - this.padding;
    this.posY = canvasHeight - this.gaugeHeight - this.padding;
  }

  // Draw the fuel gauge
  draw(ctx, currentFuel, canvasWidth, canvasHeight, gameQuality = 1) {
    this.updatePosition(canvasWidth, canvasHeight);

    const fuelPercentage = Math.max(0, Math.min(1, currentFuel / this.maxFuel));
    const fillWidth = this.gaugeWidth * fuelPercentage;

    // Determine color based on fuel level
    let fuelColor;
    if (fuelPercentage > 0.5) {
      fuelColor = '#00ff00'; // Green when healthy
    } else if (fuelPercentage > 0.25) {
      fuelColor = '#ffff00'; // Yellow when low
    } else {
      fuelColor = '#ff0000'; // Red when critical
    }

    ctx.save();

    // Draw background (empty gauge)
    ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
    ctx.fillRect(this.posX, this.posY, this.gaugeWidth, this.gaugeHeight);

    // Draw border
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.posX, this.posY, this.gaugeWidth, this.gaugeHeight);

    if (gameQuality === 3) {
      // High quality: Liquid glass effect
      // Main fuel gradient with glossy look
      const gradient = ctx.createLinearGradient(this.posX, this.posY, this.posX, this.posY + this.gaugeHeight);
      gradient.addColorStop(0, fuelColor);
      gradient.addColorStop(0.5, fuelColor);
      gradient.addColorStop(1, this.darkenColor(fuelColor, 0.7));
      
      ctx.fillStyle = gradient;
      ctx.fillRect(this.posX, this.posY, fillWidth, this.gaugeHeight);
      
      // Glossy highlight overlay
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(this.posX, this.posY, fillWidth, this.gaugeHeight * 0.35);
      
      // Soft inner shadow for depth
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(this.posX, this.posY + this.gaugeHeight * 0.65, fillWidth, this.gaugeHeight * 0.35);
      
      ctx.globalAlpha = 1.0;
    } else {
      // Low/Medium quality: Simple fill
      ctx.fillStyle = fuelColor;
      ctx.fillRect(this.posX, this.posY, fillWidth, this.gaugeHeight);
    }

    // Add glow effect when fuel is low
    if (fuelPercentage < 0.25) {
      ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.posX, this.posY, this.gaugeWidth, this.gaugeHeight);
    }

    // Draw text label and fuel amount
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Astrophage Reserve', this.posX, this.posY - 18);

    // Draw fuel percentage
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    
    // Add shadow for contrast
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(`${Math.round(fuelPercentage * 100)}%`, this.posX + this.gaugeWidth / 2, this.posY + this.gaugeHeight / 2);

    ctx.restore();
  }

  // Helper to darken a hex color
  darkenColor(hexColor, factor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    const newR = Math.floor(r * factor);
    const newG = Math.floor(g * factor);
    const newB = Math.floor(b * factor);
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  }
}
