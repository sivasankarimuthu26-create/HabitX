const SoundFX = {
  ctx: null,

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },

  play(type) {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'done') {
      // Success chime
      osc.frequency.setValueAtTime(523, this.ctx.currentTime);
      osc.frequency.setValueAtTime(659, this.ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.5);
    }

    if (type === 'add') {
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.setValueAtTime(550, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.3);
    }

    if (type === 'delete') {
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.setValueAtTime(200, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.3);
    }
  }
};