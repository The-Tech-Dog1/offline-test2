function createParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 30;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    const size = Math.random() * 20 + 5;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particle.style.animationDuration = Math.random() * 10 + 5 + 's';
    particle.style.opacity = Math.random() * 0.5 + 0.1;
    particlesContainer.appendChild(particle);
  }
}

const toastSystem = {
  container: document.getElementById('toast-container'),
  show(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
  }
};

function checkWiFi() {
  const loaderMessage = document.getElementById('loader-message');
  const loaderWrapper = document.getElementById('loader-wrapper');
  const mainContent = document.getElementById('main-content');
  if (navigator.onLine) {
    loaderMessage.textContent = "WiFi Connected";
    if (loaderWrapper.style.display !== "none") {
      setTimeout(() => {
        loaderWrapper.style.display = "none";
        mainContent.style.display = "block";
        toastSystem.show('Connected to network', 'success');
      }, 500);
    }
  } else {
    loaderMessage.textContent = "Turn on WiFi to continue...";
    loaderWrapper.style.display = "block";
    mainContent.style.display = "none";
    if (window.wasOnline) {
      toastSystem.show('Network connection lost', 'error');
      window.wasOnline = false;
    }
  }
  if (navigator.onLine) { window.wasOnline = true; }
}

async function decryptData(e, p){
  let a = (s => {
    let b = atob(s), l = b.length, u = new Uint8Array(l);
    for(let i = 0; i < l; i++) u[i] = b.charCodeAt(i);
    return u.buffer;
  })(e),
  s = a.slice(0, 16), i = a.slice(16, 28), c = a.slice(28),
  k = await crypto.subtle.importKey("raw", new TextEncoder().encode(p), "PBKDF2", false, ["deriveKey"]);
  k = await crypto.subtle.deriveKey({name:"PBKDF2", salt: s, iterations: 100000, hash:"SHA-256"}, k, {name:"AES-GCM", length:256}, false, ["decrypt"]);
  let d = await crypto.subtle.decrypt({name:"AES-GCM", iv: i}, k, c);
  return new TextDecoder().decode(d);
}

function startRedirect() {
  const button = document.getElementById('unblock-button');
  button.classList.add('loading');
  const urls = [
    "Vd4+eILwSSJHuNMHUTstewpqOY/LY6FbRUnY1lrgqKVIe/prNRrJ7qHRWIVVTtWsUGr+XxkxqwGrlYtXpEyOoofmFGvuLd4Jeb8V",
    "KLcL9MeS8UoQR90JPTPAcbGL2QxCA85qS+PVKSyBMVavSAp2ukfY6ujYoYXJNJCo38RHhASpdo5K8kLiwUEq5VMP7fOCTsBNQuA=",
    "LUtFFI10/hCi0a09AFtsIILVZXXB4nSgSyRVgBKnLCSbCMLyXAxoZQ7uDDVf2SJs+m6H42ANltPLni1FAquKtgPynmVMB4qALcE=",
    "KMuY5bIedC8XzLkTbxnOOGkbchi8Xh4Q/EoAWY7/kaQNqzWQAVVCoQVNCesGnUbzT3WAs7PGIvwI/td6OhXtbcr+gEA=",
    "RueuPDygAJ8QZi5o02cPFKzn1BOOiYGonngO/RVcF7x82PxY/rTZoinuXzIt6qnuake/JDjtopiDVXs+DW0jAd7FcN0=",
    "LuNocWr4PQtlGe2A15OXNwahb5+GxPxCZ1x17EIIYMH4ljshUimG60YN7FBjqJquq0wHKLGMvKlLTRV8Welyfei1Bciec+2g0ENv9w==",
    "GN+ujDX9UzbiNZZ9qrBzD/vdL46eHU6JLINhbhSbbgIWgbdbSvAGTiMvK4znCqVpQTzOqjQ50ARGubrxKntTAPQqvCKf7u4=",
    "CwOgGHIGL6ZkYivcEN7C4p27bCVxXH5AcuGQWlqvDZ8y5LzWUagiAnhD7miYeM9FEovV+OCK2BmR0jaAhUfA/cOu6lHX",
    "rbcJemDyK2ZVJHuZr7M1+bImYK6mV8M2O53Yvys4kaFPLIKzUExOGUtebIhnqOQ+iV9rPkG2J4f14W9pEC2r9CJHqKg9Bk9tX+LC/7Y=",
    "7dKMYAN8QUD7xQ86D+9qj/3O5MiQCAxbHcNyGqpszyitk6hsicmBavMQjrhJCZ+2kPAcRNI8a17YweRU2OOeOfYIjpku0LpGwmBPCQ==",
    "P5vNllCvJQybf0elF6tUv+DPcvn4X6Y9rc7fuRd9hKuknET++Q+Gw0Y4jV+f15RIkV7EU1BDU4iXs7wzYYAn1HFqHavAGTHIROoZfAtKPg==",
    "IGkwhSP4wZjShvQYmd3/W7dFoKQDl2NFTHYUJO5/ZVM8xn2ulyWG03hBB0pGTyT0PGyXPFZsOFhRMgCmntddwiIuK4mJaeckyw==",
    "pYL1xtpDksM85/0u6h8MAHX1vorh7gU7bN7S7Uy3s98CMMankj8IUDmD+HIyLGNAq1nsn6gspON7ozhzfzyuusfVDiv1Esloezmj",
    "08YnWYE9M3jGVdswpNa0m82tHcy3IhDLVYUzPYYa8VnAvQ/Recu1WikbGbjKDi/CdiEyR3eAHqq0zcuCIb+G1JR0+VI/2JsDHdJ2"
  ];
  const connectionOptions = {
    connectionTimeout: 3000,
    retryDelay: 1500,
    maxRetries: 3
  };
  function isValidIPv4(ip) {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
  }
  const connectionManager = {
    activeConnections: new Set(),
    urlQueue: [...urls],
    redirecting: false,
    retryCount: 0,
    loadingIndicator: document.getElementById('loader-message'),
    showStatus(message) {
      this.loadingIndicator.textContent = message;
      toastSystem.show(message, 'info');
    },
    async attemptConnection() {
      if (!navigator.onLine) {
        this.showStatus("Turn on WiFi to continue...");
        button.classList.remove('loading');
        toastSystem.show("You're offline. Please connect to WiFi", 'error');
        return;
      }
      if (this.retryCount >= connectionOptions.maxRetries) {
        this.showStatus("Connection attempts exhausted. Try again later.");
        button.classList.remove('loading');
        toastSystem.show("Couldn't find an unblocked service. Please try again later.", 'error');
        return;
      }
      this.showStatus(`Searching for unblocked service... (Attempt ${this.retryCount + 1}/${connectionOptions.maxRetries})`);
      this.initiateConnection();
    },
    initiateConnection() {
      if (!this.redirecting && this.activeConnections.size === 0 && this.urlQueue.length > 0) {
        const encUrl = this.urlQueue.shift();
        this.createConnection(encUrl);
      } else if (this.activeConnections.size === 0 && this.urlQueue.length === 0) {
        this.handleAllConnectionsFailed();
      }
    },
    async createConnection(encUrl) {
      const key = document.querySelector('.easter').id;
      try {
        const url = await decryptData(encUrl, key);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        this.activeConnections.add(iframe);
        const timeoutId = setTimeout(() => {
          if (this.activeConnections.has(iframe)) {
            this.cleanupConnection(iframe);
          }
        }, connectionOptions.connectionTimeout);
        iframe.timeoutId = timeoutId;
      } catch (e) {
        console.error("Decryption failed", e);
        this.checkConnectionStatus();
      }
    },
    cleanupConnection(iframe) {
      clearTimeout(iframe.timeoutId);
      iframe.remove();
      this.activeConnections.delete(iframe);
      this.checkConnectionStatus();
    },
    checkConnectionStatus() {
      if (!this.redirecting) {
        if (this.activeConnections.size === 0 && this.urlQueue.length > 0) {
          const encUrl = this.urlQueue.shift();
          this.createConnection(encUrl);
        } else if (this.activeConnections.size === 0 && this.urlQueue.length === 0) {
          this.handleAllConnectionsFailed();
        }
      }
    },
    handleAllConnectionsFailed() {
      this.retryCount++;
      if (this.retryCount >= connectionOptions.maxRetries) {
        this.showStatus("No service found. Please try again later.");
        button.classList.remove('loading');
        return;
      }
      this.showStatus(`No service found. Retrying (${this.retryCount}/${connectionOptions.maxRetries})...`);
      this.urlQueue = [...urls];
      setTimeout(() => this.attemptConnection(), connectionOptions.retryDelay);
    },
    handleSuccessfulConnection(ip) {
      if (!this.redirecting && isValidIPv4(ip)) {
        this.redirecting = true;
        this.showStatus("Unblocked service found! Opening...");
        toastSystem.show("Success! Opening unblocked browser...", 'success');
        this.activeConnections.forEach(conn => {
          clearTimeout(conn.timeoutId);
          conn.remove();
        });
        this.activeConnections.clear();
        setTimeout(() => {
          const targetUrl = `http://${ip}/`;
          window.open(targetUrl, "_blank");
          button.classList.remove('loading');
        }, 1);
        return true;
      }
      return false;
    }
  };
  window.addEventListener("message", function(event) {
    if (connectionManager.redirecting) return;
    const iframe = Array.from(connectionManager.activeConnections)
      .find(i => i.contentWindow === event.source);
    if (iframe && event.data === "port" && event.ports.length > 0) {
      console.log("Setting Up webpage");
      const port = event.ports[0];
      port.postMessage("request_ip");
      port.onmessage = function(e) {
        const ip = e.data;
        if (!connectionManager.handleSuccessfulConnection(ip)) {
          connectionManager.cleanupConnection(iframe);
        }
      };
    }
  });
  connectionManager.attemptConnection();
}

const countdownTimer = {
  timerElement: document.getElementById('timer'),
  init() {
    this.update();
    setInterval(() => this.update(), 1000);
  },
  getNextResetTime() {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setHours(6, 0, 0, 0);
    if (now >= nextReset) { nextReset.setDate(nextReset.getDate() + 1); }
    return nextReset;
  },
  formatTime(value) { return value.toString().padStart(2, '0'); },
  update() {
    const now = new Date();
    const nextReset = this.getNextResetTime();
    const diff = nextReset - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    this.timerElement.textContent = `${this.formatTime(hours)}:${this.formatTime(minutes)}:${this.formatTime(seconds)}`;
  }
};

window.addEventListener('load', () => {
  createParticles();
  window.wasOnline = navigator.onLine;
  checkWiFi();
  setInterval(checkWiFi, 1000);
  countdownTimer.init();
});