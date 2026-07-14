import { jsx as _jsx } from "react/jsx-runtime";
// Solve-celebration scene — a real Phaser physics burst (not CSS confetti)
// for the moment a cipher is cracked: the 5 solved emojis fling outward with
// gravity/bounce, the XP counter tweens up, and First Crack gets an extra
// flourish. Lives in game.tsx only, never splash.tsx — Phaser is a heavy
// dependency and the inline feed card must stay light.
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
const DURATION_MS = 2200;
export const CipherBurst = ({ emojis, xpAwarded, firstCrack, onDone }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container)
            return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        class BurstScene extends Phaser.Scene {
            create() {
                const centerX = width / 2;
                const centerY = height / 2;
                // The 5 emojis burst outward in a ring, then fall under gravity and
                // bounce once off the bottom before fading out.
                emojis.forEach((emoji, i) => {
                    const text = this.add.text(centerX, centerY, emoji, { fontSize: '64px' }).setOrigin(0.5);
                    this.physics.add.existing(text);
                    const body = text.body;
                    body.setGravityY(900);
                    body.setBounce(0.5, 0.5);
                    body.setCollideWorldBounds(true);
                    const angle = (Math.PI * 2 * i) / emojis.length - Math.PI / 2;
                    const speed = 260 + Math.random() * 140;
                    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed - 260);
                    body.setAngularVelocity((Math.random() - 0.5) * 360);
                    this.tweens.add({
                        targets: text,
                        alpha: 0,
                        delay: DURATION_MS - 500,
                        duration: 450,
                        ease: 'Cubic.easeIn',
                    });
                });
                // XP counts up rather than just appearing, for a bit of extra juice.
                const xpProxy = { value: 0 };
                const xpText = this.add
                    .text(centerX, centerY - 90, '+0 XP', { fontSize: '32px', fontStyle: 'bold', color: '#22C55E' })
                    .setOrigin(0.5)
                    .setScale(0.5)
                    .setAlpha(0);
                this.tweens.add({ targets: xpText, alpha: 1, scale: 1, duration: 350, ease: 'Back.easeOut' });
                this.tweens.add({
                    targets: xpProxy,
                    value: xpAwarded,
                    duration: 700,
                    ease: 'Cubic.easeOut',
                    onUpdate: () => xpText.setText(`+${Math.round(xpProxy.value)} XP`),
                });
                if (firstCrack) {
                    const badge = this.add
                        .text(centerX, centerY - 150, '🥇 FIRST CRACK!', { fontSize: '28px', fontStyle: 'bold', color: '#F59E0B' })
                        .setOrigin(0.5)
                        .setScale(0)
                        .setAlpha(0);
                    this.tweens.add({ targets: badge, alpha: 1, scale: 1, delay: 300, duration: 400, ease: 'Back.easeOut' });
                }
            }
        }
        let game = null;
        try {
            game = new Phaser.Game({
                type: Phaser.CANVAS,
                transparent: true,
                width,
                height,
                parent: container,
                physics: { default: 'arcade', arcade: { debug: false } },
                scene: BurstScene,
            });
        }
        catch (err) {
            // The CSS-only celebrate-flash/correct-pop in game.tsx already fired
            // independently of this, so a Phaser init failure here is silent
            // degradation, not a broken celebration — see index.css.
            console.error('Phaser celebration scene failed to initialize (non-fatal)', err);
            onDone();
            return;
        }
        const timeout = setTimeout(onDone, DURATION_MS);
        return () => {
            clearTimeout(timeout);
            game?.destroy(true);
        };
        // Intentionally mount-once: this component is only ever rendered for a
        // single, short-lived celebration and is fully unmounted between solves.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return _jsx("div", { ref: containerRef, className: "pointer-events-none fixed inset-0 z-[100]", "aria-hidden": "true" });
};
//# sourceMappingURL=CipherBurst.js.map