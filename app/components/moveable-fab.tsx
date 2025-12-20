"use client";

import { useEffect, useRef, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

const STORAGE_KEY = "monorail:add-button-position";

const LONG_PRESS_DELAY = 0; // ms
const DRAG_THRESHOLD = 6; // px
const BUTTON_SIZE = 48;

type Position = { x: number; y: number };

export function MoveableFab({ onClick }: { onClick: () => void }) {
    const ref = useRef<HTMLButtonElement>(null);

    const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
    const posRef = useRef(pos);

    const dragging = useRef(false);
    const moved = useRef(false);
    const pressTimer = useRef<number | null>(null);
    const pointerStart = useRef({ x: 0, y: 0 });
    const offset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // const saved = localStorage.getItem(STORAGE_KEY);
        const saved = false;
        if (saved) {
            const parsed = JSON.parse(saved);
            setPos(parsed);
            posRef.current = parsed;
        } else {
            const defaultPos = getDefaultPosition();
            setPos(defaultPos);
            posRef.current = defaultPos;
        }

        const onResize = () => {
            setPos((prev) => ({
                x: Math.min(prev.x, window.innerWidth - BUTTON_SIZE - 16),
                y: Math.min(prev.y, window.innerHeight - BUTTON_SIZE - 16),
            }));
        };

        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        posRef.current = pos;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    }, [pos]);

    const getDefaultPosition = (): Position => ({
        x: window.innerWidth - BUTTON_SIZE - 16,
        y: window.innerHeight - BUTTON_SIZE - 16,
    });

    const onPointerDown = (e: React.PointerEvent) => {
        moved.current = false;
        dragging.current = false;

        pointerStart.current = { x: e.clientX, y: e.clientY };

        const rect = ref.current!.getBoundingClientRect();
        offset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        pressTimer.current = window.setTimeout(() => {
            dragging.current = true;
        }, LONG_PRESS_DELAY);

        ref.current!.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;

        if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
            moved.current = true;
            if (pressTimer.current) {
                clearTimeout(pressTimer.current);
                pressTimer.current = null;
            }
        }

        if (!dragging.current) return;

        const maxX = window.innerWidth - BUTTON_SIZE;
        const maxY = window.innerHeight - BUTTON_SIZE;

        setPos({
        x: Math.min(Math.max(0, e.clientX - offset.current.x), maxX),
        y: Math.min(Math.max(0, e.clientY - offset.current.y), maxY),
        });
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
        }

        ref.current!.releasePointerCapture(e.pointerId);

        if (dragging.current) {
        snapToEdge();
        }

        dragging.current = false;
    };

    const handleClick = () => {
        if (moved.current) return;
        onClick();
    };

    const snapToEdge = () => {
        const { innerWidth, innerHeight } = window;

        const targetX =
        posRef.current.x + BUTTON_SIZE / 2 < innerWidth / 2
            ? 16
            : innerWidth - BUTTON_SIZE - 16;

        const targetY = Math.min(
        Math.max(16, posRef.current.y),
        innerHeight - BUTTON_SIZE - 16
        );

        springAnimate({ x: targetX, y: targetY });
    };

    const springAnimate = (target: Position) => {
        const velocity = { x: 0, y: 0 };
        const stiffness = 0.15;
        const damping = 0.8;

        const animate = () => {
        const dx = target.x - posRef.current.x;
        const dy = target.y - posRef.current.y;

        velocity.x = velocity.x * damping + dx * stiffness;
        velocity.y = velocity.y * damping + dy * stiffness;

        const next = {
            x: posRef.current.x + velocity.x,
            y: posRef.current.y + velocity.y,
        };

        setPos(next);
        posRef.current = next;

        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            requestAnimationFrame(animate);
        } else {
            setPos(target);
            posRef.current = target;
        }
        };
        requestAnimationFrame(animate);
    };

    return (
        <button
            ref={ref}
            onClick={handleClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="
                fixed z-30
                w-12 h-12
                flex items-center justify-center
                rounded-full
                bg-mint-500 hover:bg-mint-600
                drop-shadow-lg
                touch-none
                transition-transform active:scale-95
            "
            style={{ left: pos.x, top: pos.y }}
        >
            <PlusIcon className="size-6" />
        </button>
    );
}
