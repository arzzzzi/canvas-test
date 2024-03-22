import React, { useRef, useEffect, useState } from 'react';
import { Ball } from './Ball';

const BilliardsGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [selectedBall, setSelectedBall] = useState<Ball | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseDown = (event: MouseEvent) => {
      const mouseX = event.clientX - canvas.offsetLeft;
      const mouseY = event.clientY - canvas.offsetTop;

      balls.forEach((ball) => {
        const distX = ball.x - mouseX;
        const distY = ball.y - mouseY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        if (distance < ball.radius) {
          setSelectedBall(ball);
        }
      });
    };

    const handleMouseUp = () => {
      setSelectedBall(null);
    };

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX - canvas.offsetLeft, y: event.clientY - canvas.offsetTop });
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [balls]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      balls.forEach((ball) => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();

        ball.dx *= 0.995; 
        ball.dy *= 0.995; 

        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
          ball.dx *= -1;
        }
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
          ball.dy *= -1;
        }

        balls.forEach((otherBall) => {
          if (ball !== otherBall) {
            const dx = otherBall.x - ball.x;
            const dy = otherBall.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ball.radius + otherBall.radius) {
              const angle = Math.atan2(dy, dx);
              const targetX = ball.x + Math.cos(angle) * (ball.radius + otherBall.radius);
              const targetY = ball.y + Math.sin(angle) * (ball.radius + otherBall.radius);

              const ax = (targetX - otherBall.x) * 0.1;
              const ay = (targetY - otherBall.y) * 0.1;

              ball.dx -= ax;
              ball.dy -= ay;
              otherBall.dx += ax;
              otherBall.dy += ay;
            }
          }
        });
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [balls]);

  useEffect(() => {
    if (selectedBall && mousePosition) {
      const angle = Math.atan2(mousePosition.y - selectedBall.y, mousePosition.x - selectedBall.x);
      selectedBall.dx = Math.cos(angle) * 5;
      selectedBall.dy = Math.sin(angle) * 5;
    }
  }, [selectedBall, mousePosition]);

  const addBall = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ball: Ball = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 30 + 10,
      dx: Math.random() * 4 - 2,
      dy: Math.random() * 4 - 2,
      color: '#' + (Math.random() * 0xffffff << 0).toString(16),
    };

    setBalls((prevBalls) => [...prevBalls, ball]);
  };

  const changeColor = (color: string) => {
    if (selectedBall) {
      const updatedBalls = balls.map((ball) =>
        ball === selectedBall ? { ...ball, color } : ball
      );
      setBalls(updatedBalls);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid black' }} />
      <button onClick={addBall}>Add Ball</button>
      {selectedBall && (
        <div style={{ position: 'absolute', top: selectedBall.y, left: selectedBall.x }}>
          <select onChange={(e) => changeColor(e.target.value)}>
            <option value="#ff0000">Red</option>
            <option value="#00ff00">Green</option>
            <option value="#0000ff">Blue</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default BilliardsGame;
