// Mission Log System
// Manages event messages displayed at the top center of the screen

export class MissionLog {
  constructor() {
    this.currentMessage = null;
    this.messageTimer = 0;
    this.messageDuration = 180; // frames (3 seconds at 60fps)
    this.fadeOutStart = 120; // Start fading out at this frame
    this.messageQueue = [];
    this.events = {};
    this.lastEventTime = {};
  }

  // Load mission events from JSON
  async loadEvents() {
    try {
      const response = await fetch('../mission.json');
      const data = await response.json();
      data.events.forEach(event => {
        this.events[event.id] = event;
        this.lastEventTime[event.id] = 0;
      });
    } catch (error) {
      console.error('Failed to load mission.json:', error);
    }
  }

  // Queue a message to be displayed
  queueMessage(eventId, customMessage = null, duration = null) {
    const event = this.events[eventId];
    if (!event && !customMessage) return; // Only return if both event and custom message are missing

    const message = customMessage || (event ? event.message : '');
    this.messageQueue.push({
      text: message,
      eventId: eventId,
      duration: duration || this.messageDuration
    });
  }

  // Process the message queue
  update() {
    if (this.messageTimer > 0) {
      this.messageTimer--;
    } else if (this.messageQueue.length > 0) {
      const nextMessage = this.messageQueue.shift();
      this.currentMessage = nextMessage.text;
      this.messageTimer = nextMessage.duration;
    }
  }

  // Draw the mission log message at top center of screen
  draw(ctx, canvasWidth, canvasHeight) {
    this.drawTopMessage(ctx, canvasWidth, canvasHeight);
    this.drawBottomMessages(ctx, canvasWidth, canvasHeight);
  }

  // Draw top message
  drawTopMessage(ctx, canvasWidth, canvasHeight) {
    if (!this.currentMessage || this.messageTimer <= 0) return;

    // Calculate alpha for fade out effect
    let alpha = 1.0;
    if (this.messageTimer < 30) {
      alpha = this.messageTimer / 30; // Fade out in last 0.5 seconds
    }

    // Setup text styling
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Add a subtle glow effect
    ctx.shadowColor = `rgba(255, 255, 0, ${alpha * 0.5})`;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw the message at top center
    const y = 80;
    ctx.fillText(this.currentMessage, canvasWidth / 2, y);

    ctx.restore();
  }

  // Trigger an event based on game conditions
  triggerEvent(trigger, gameState) {
    // Prevent spam by checking cooldown (0.5 seconds)
    const now = Date.now();
    
    switch (trigger) {
      case 'gameStart':
        this.queueMessage('start');
        break;
      
      case 'cloudHit':
        this.queueMessage('cloud_sampled', `Sample collected! (${gameState.samplesCollected}/${gameState.totalSamples})`);
        break;
      
      case 'asteroidSpawn':
        if (gameState.asteroidCount > 20) {
          this.queueMessage('wave3');
        } else if (gameState.asteroidCount > 10) {
          this.queueMessage('wave2');
        } else {
          this.queueMessage('wave1');
        }
        break;
      
      case 'waveClear':
        this.queueMessage('cleared');
        break;
      
      case 'lowFuel':
        if (gameState.fuel < 5) {
          this.queueMessage('lowfuel');
        }
        break;
      
      case 'scoreUpdate':
        this.queueMessage('highscore', `Asteroids destroyed: ${gameState.asteroidsDestroyed}`);
        break;
      
      case 'gameOver':
        this.queueMessage('gameover');
        break;
      
      case 'bonusPoints':
        this.queueMessage('bonus');
        break;
      
      case 'timeUpdate':
        if (gameState.gameTime > 0 && gameState.gameTime % 30 === 0) {
          this.queueMessage('survival', `Survived ${Math.floor(gameState.gameTime)} seconds!`);
        }
        break;
    }
  }

  // Clear all messages
  clear() {
    this.currentMessage = null;
    this.messageTimer = 0;
    this.messageQueue = [];
  }

  // Check if there's a message currently being displayed
  isDisplayingMessage() {
    return this.currentMessage !== null && this.messageTimer > 0;
  }

  // Queue a bottom message (for astrophage collection, doesn't pause game)
  queueBottomMessage(text, duration = 120) {
    this.bottomMessages = this.bottomMessages || [];
    this.bottomMessages.push({
      text: text,
      duration: duration,
      timer: duration
    });
  }

  // Update bottom messages
  updateBottomMessages() {
    this.bottomMessages = this.bottomMessages || [];
    this.bottomMessages = this.bottomMessages.filter(msg => {
      msg.timer--;
      return msg.timer > 0;
    });
  }

  // Draw bottom messages
  drawBottomMessages(ctx, canvasWidth, canvasHeight) {
    this.bottomMessages = this.bottomMessages || [];
    this.bottomMessages.forEach((msg, index) => {
      const alpha = msg.timer < 20 ? msg.timer / 20 : 1.0;
      
      ctx.save();
      ctx.fillStyle = `rgba(0, 255, 200, ${alpha})`;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      // Add subtle glow
      ctx.shadowColor = `rgba(0, 255, 200, ${alpha * 0.5})`;
      ctx.shadowBlur = 8;

      // Draw at bottom center, with spacing for multiple messages
      const y = canvasHeight - 50 - (index * 25);
      ctx.fillText(msg.text, canvasWidth / 2, y);

      ctx.restore();
    });
  }

}
