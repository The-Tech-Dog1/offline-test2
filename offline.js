function startRedirect() {
    if (navigator.onLine){
      // Define the loading content for the new tab
      const loadingContent = `
        <!DOCTYPE html>
        <html>
        <head><title>Redirecting...</title></head>

        <head><title>Redirecting...</title></head>
        <body>Loading...</body>
        </html>
      `;
      
      // Create a blob from the loading content
      const blob = new Blob([loadingContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Open new tab with the blob URL
      const newTab = window.open(blobUrl, '_blank');
      if (!newTab) {
        alert("Popup blocked! Please allow popups and try again.");
        URL.revokeObjectURL(blobUrl);
        return;
      }
      
      const urls = [
        "https://test-ip-api.github.io/",
        "https://mathhelp-drab.vercel.app/",
        "https://mathrevision.pages.dev/",
        "https://englishhelp.pages.dev/"
      ];
      
      const maxActive = 1;
      let urlQueue = [...urls];
      let activeIframes = new Set();
      let foundValidIP = false;
      
      function isValidIPv4(ip) {
        const parts = ip.split('.');
        return parts.length === 4 && parts.every(part => {
          const num = parseInt(part, 10);
          return !isNaN(num) && num >= 0 && num <= 255;
        });
      }
      
      function createIframe(url) {
        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.src = url;
        document.body.appendChild(iframe);
        activeIframes.add(iframe);
        return iframe;
      }
      
      // Create initial iframes
      for (let i = 0; i < maxActive && urlQueue.length > 0; i++) {
        createIframe(urlQueue.shift());
      }
      
      window.addEventListener("message", (event) => {
        if (foundValidIP) return;
        
        if (event.data === "port" && event.ports.length > 0) {
          const port = event.ports[0];
          // Find the iframe that sent this message
          const iframe = [...activeIframes].find(i => i.contentWindow === event.source);
          
          if (iframe) {
            port.postMessage("request_ip");
            port.onmessage = (e) => {
              if (foundValidIP) return;
              
              const ip = e.data;
              if (isValidIPv4(ip)) {
                foundValidIP = true;
                activeIframes.forEach(i => i.remove());
                activeIframes.clear();
                newTab.location.href = "http://" + ip + "/work/school/subject/maths";
                URL.revokeObjectURL(blobUrl);
              } else {
                iframe.remove();
                activeIframes.delete(iframe);
                if (!foundValidIP && urlQueue.length > 0) {
                  createIframe(urlQueue.shift());
                }
                if (!foundValidIP && urlQueue.length === 0 && activeIframes.size === 0) {
                  newTab.close();
                  URL.revokeObjectURL(blobUrl);
                }
              }
            };
          }
        }
      });
    }   else {
      alert("offline turn on wifi")
    }
}