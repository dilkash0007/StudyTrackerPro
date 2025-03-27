import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Node class for our network
    class Node {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      pulseSpeed: number;
      pulseSize: number;
      maxSize: number;
      minSize: number;
      pulsing: boolean;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.minSize = Math.random() * 1.5 + 0.8;
        this.maxSize = this.minSize + Math.random() * 2;
        this.size = this.minSize;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.pulseSpeed = Math.random() * 0.05 + 0.02;
        this.pulseSize = 0;
        this.pulsing = Math.random() > 0.7; // Only some nodes pulse

        // More vibrant color palette
        const colorRandom = Math.random();
        if (colorRandom > 0.92) {
          // Orange highlights
          this.color = `rgba(${255}, ${165 + Math.random() * 50}, ${
            0 + Math.random() * 50
          }, ${0.7 + Math.random() * 0.3})`;
        } else if (colorRandom > 0.84) {
          // Yellow highlights
          this.color = `rgba(${255}, ${255}, ${50 + Math.random() * 100}, ${
            0.7 + Math.random() * 0.3
          })`;
        } else if (colorRandom > 0.7) {
          // Cyan highlights
          this.color = `rgba(${0}, ${220 + Math.random() * 35}, ${
            220 + Math.random() * 35
          }, ${0.7 + Math.random() * 0.3})`;
        } else {
          // Various greens - more vibrant
          const greenIntensity = 160 + Math.floor(Math.random() * 95);
          this.color = `rgba(${0}, ${greenIntensity}, ${greenIntensity / 2}, ${
            0.7 + Math.random() * 0.3
          })`;
        }
      }

      update() {
        // Move node
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
        if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

        // Pulse animation
        if (this.pulsing) {
          this.pulseSize += this.pulseSpeed;
          this.size =
            this.minSize +
            Math.sin(this.pulseSize) * (this.maxSize - this.minSize);
        }
      }

      draw() {
        if (!ctx) return;

        // Draw glow effect
        // Ensure radius values are positive and non-zero
        const glowRadius = Math.max(0.1, this.size * 3);
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0.1, // Starting radius (must be > 0)
          this.x,
          this.y,
          glowRadius // Ending radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw node
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Create nodes
    const nodes: Node[] = [];
    const nodeCount = Math.min(
      120,
      Math.floor((canvas.width * canvas.height) / 12000)
    );

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node());
    }

    // Draw connections between nodes with enhanced visuals
    function drawConnections() {
      if (!ctx) return;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Only connect nearby nodes
          if (distance < 180) {
            // Line opacity based on distance
            const opacity = 1 - distance / 180;

            // Get colors from nodes
            const color1 = nodes[i].color;
            const color2 = nodes[j].color;

            // Create gradient for line
            const gradient = ctx.createLinearGradient(
              nodes[i].x,
              nodes[i].y,
              nodes[j].x,
              nodes[j].y
            );
            gradient.addColorStop(
              0,
              color1.replace(/[^,]+(?=\))/, `${opacity * 0.6}`)
            );
            gradient.addColorStop(
              1,
              color2.replace(/[^,]+(?=\))/, `${opacity * 0.6}`)
            );

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = Math.max(0.3, opacity * 1.2);
            ctx.stroke();

            // Occasionally add small particles along the line
            if (Math.random() > 0.99) {
              const particleX =
                nodes[i].x + (nodes[j].x - nodes[i].x) * Math.random();
              const particleY =
                nodes[i].y + (nodes[j].y - nodes[i].y) * Math.random();

              ctx.beginPath();
              ctx.arc(particleX, particleY, 0.8, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
              ctx.fill();
            }
          }
        }
      }
    }

    // Animation loop
    function animate() {
      if (!ctx) return;

      // Clear canvas with a semi-transparent dark background
      ctx.fillStyle = "rgba(1, 8, 22, 0.1)"; // Darker, richer blue background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      for (const node of nodes) {
        node.update();
        node.draw();
      }

      // Draw connections
      drawConnections();

      requestAnimationFrame(animate);
    }

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: "rgb(1, 8, 22)" }} // Darker background
    />
  );
}
