import type { Rarity } from '@/lib/lgtm';
import type { CSSProperties } from 'react';
import type { MascotContext } from '@/lib/mascot-lines';
import { pickLine, contextFromPath } from '@/lib/mascot-lines';
import { useRef, useState, useEffect, useCallback, Fragment } from 'react';

export type MascotProps = {
  rarity?: Rarity;
  isIndex?: boolean;
};

const BOT_W = 56;
const BOT_H = 64;
const CHAR_MS = 38;
const SNAP_MS = 500;
const EDGE_GAP = 24;
const IDLE_QUIP_MS = 8000;
const BLINK_BASE_MS = 4200;
const BUBBLE_LINGER_MS = 4500;
const MASCOT_POS_KEY = 'lgtm-mascot-pos';

const BUBBLE_W = 200;

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Pos = { x: number; y: number };

function safeAreaBottom(): number {
  try {
    const el = document.createElement('div');
    el.style.height = 'env(safe-area-inset-bottom, 0px)';
    el.style.position = 'fixed';
    el.style.visibility = 'hidden';
    document.body.appendChild(el);

    const h = el.getBoundingClientRect().height;
    document.body.removeChild(el);
    return h;
  } catch {
    return 0;
  }
}

function defaultPos(): Pos {
  return {
    x: window.innerWidth - BOT_W - EDGE_GAP,
    y: window.innerHeight - BOT_H - EDGE_GAP - safeAreaBottom(),
  };
}

function isPosInViewport(p: Pos): boolean {
  return p.x >= 8 && p.y >= 8 && p.x <= window.innerWidth - BOT_W - 8 && p.y <= window.innerHeight - BOT_H - 8;
}

function loadSavedPos(): Pos | null {
  try {
    const raw = localStorage.getItem(MASCOT_POS_KEY);
    if (!raw) return null;

    const p = JSON.parse(raw) as Pos;
    if (typeof p.x === 'number' && typeof p.y === 'number') return p;
  } catch {
    // Safeguard against JSON parsing errors or if localStorage is unavailable.
  }
  return null;
}

function savePos(pos: Pos): void {
  try {
    localStorage.setItem(MASCOT_POS_KEY, JSON.stringify(pos));
  } catch {
    // Safeguard against QuotaExceededError or if localStorage is unavailable.
  }
}

function clamp(x: number, y: number, vw: number, vh: number): Pos {
  return {
    x: Math.max(8, Math.min(x, vw - BOT_W - 8)),
    y: Math.max(8, Math.min(y, vh - BOT_H - 8)),
  };
}

function accentForRarity(rarity: Rarity | undefined): string {
  const map: Record<Rarity, string> = {
    rare: 'var(--color-rare)',
    epic: 'var(--color-epic)',
    common: 'var(--color-common)',
    legendary: 'var(--color-legendary)',
  };

  return rarity ? map[rarity] : 'var(--color-accent)';
}

function resolvePageContext(rarity: Rarity | undefined): MascotContext {
  if (rarity) return rarity as MascotContext;
  return contextFromPath(window.location.pathname);
}

function bobOffset(tick: number): number {
  return Math.sin(tick * 0.08) * 3;
}

function isStillTyping(shown: string, full: string): boolean {
  return shown.length < full.length;
}

function containerStyle(pos: Pos, isDragging: boolean, isSnapping: boolean): CSSProperties {
  return {
    top: pos.y,
    left: pos.x,
    zIndex: 9999,
    position: 'fixed',
    userSelect: 'none',
    touchAction: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',

    transition: isSnapping
      ? `left ${SNAP_MS}ms cubic-bezier(0.34,1.56,0.64,1), top ${SNAP_MS}ms cubic-bezier(0.34,1.56,0.64,1)`
      : 'none',
  };
}

type BodyState = 'default' | 'hovered' | 'clicked' | 'lifted';

function resolveBodyState(isHovered: boolean, isClicked: boolean, isLifted: boolean): BodyState {
  if (isClicked) return 'clicked';
  if (isLifted) return 'lifted';
  if (isHovered) return 'hovered';
  return 'default';
}

const BODY_TRANSFORM: Record<BodyState, string> = {
  default: 'translateY(0) scale(1)',
  hovered: 'translateY(-2px) scale(1.02)',
  clicked: 'translateY(-10px) scale(1.08)',
  lifted: 'translateY(-4px) scale(1.04)',
};

const BODY_SHADOW: Record<BodyState, string> = {
  default: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
  hovered: 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))',
  clicked: 'drop-shadow(0 8px 16px rgba(0,0,0,0.28))',
  lifted: 'drop-shadow(0 8px 16px rgba(0,0,0,0.28))',
};

const BODY_TRANSITION: Record<BodyState, string> = {
  default: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
  hovered: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
  clicked: 'transform 0.12s cubic-bezier(0.34,1.56,0.64,1)',
  lifted: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
};

function bodyStyle(state: BodyState): CSSProperties {
  return {
    width: BOT_W,
    height: BOT_H,
    position: 'relative',
    filter: BODY_SHADOW[state],
    transform: BODY_TRANSFORM[state],
    transition: BODY_TRANSITION[state],
  };
}

function eyeStyle(isBlinking: boolean): CSSProperties {
  return {
    width: 6,
    height: isBlinking ? 2 : 6,
    background: 'var(--color-text)',
    transition: 'height 0.06s ease',
    borderRadius: isBlinking ? 1 : 2,
  };
}

type MouthState = 'default' | 'hovered' | 'clicked';

function resolveMouthState(isHovered: boolean, isClicked: boolean): MouthState {
  if (isClicked) return 'clicked';
  if (isHovered) return 'hovered';
  return 'default';
}

const MOUTH_WIDTH: Record<MouthState, number> = { default: 12, hovered: 16, clicked: 14 };
const MOUTH_HEIGHT: Record<MouthState, number> = { default: 3, hovered: 5, clicked: 6 };

const MOUTH_RADIUS: Record<MouthState, string> = {
  default: '0 0 4px 4px',
  hovered: '0 0 4px 4px',
  clicked: '0 0 8px 8px',
};

function mouthStyle(state: MouthState): CSSProperties {
  return {
    bottom: 8,
    left: '50%',
    position: 'absolute',
    width: MOUTH_WIDTH[state],
    height: MOUTH_HEIGHT[state],
    transition: 'all 0.15s ease',
    transform: 'translateX(-50%)',
    background: 'var(--color-text)',
    borderRadius: MOUTH_RADIUS[state],
  };
}

type ArmSide = 'left' | 'right';

const ARM_TRANSFORM_RAISED: Record<ArmSide, string> = {
  left: 'rotate(-40deg) translateY(-4px)',
  right: 'rotate(40deg) translateY(-4px)',
};

const ARM_TRANSFORM_REST: Record<ArmSide, string> = {
  left: 'rotate(10deg)',
  right: 'rotate(-10deg)',
};

function armStyle(side: ArmSide, isRaised: boolean): CSSProperties {
  return {
    top: 34,
    width: 10,
    height: 16,
    borderRadius: 3,
    position: 'absolute',
    transformOrigin: 'top center',
    background: 'var(--color-surface)',
    border: '2px solid var(--color-border-mascot)',
    ...(side === 'left' ? { left: 2 } : { right: 2 }),
    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
    transform: isRaised ? ARM_TRANSFORM_RAISED[side] : ARM_TRANSFORM_REST[side],
  };
}

function bubbleFixedStyle(visible: boolean, isDragging: boolean, pos: Pos): CSSProperties {
  const maxW = Math.min(BUBBLE_W, pos.x - 8);

  return {
    width: maxW,
    zIndex: 9999,
    top: pos.y - 80,
    position: 'fixed',
    pointerEvents: 'none',
    left: pos.x + BOT_W - maxW,
    transition: 'opacity 0.2s ease',
    opacity: visible && !isDragging ? 1 : 0,
  };
}

function bubbleBoxStyle(): CSSProperties {
  return {
    fontSize: 11,
    lineHeight: 1.5,
    borderRadius: 10,
    padding: '8px 12px',
    position: 'relative',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-mono)',
    background: 'var(--color-surface)',
    border: '1.5px solid var(--color-border-mascot)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
  };
}

function bubbleArrowOuterStyle(): CSSProperties {
  return {
    width: 0,
    height: 0,
    right: 16,
    bottom: -10,
    position: 'absolute',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '9px solid var(--color-border-mascot)',
  };
}

function bubbleArrowInnerStyle(): CSSProperties {
  return {
    width: 0,
    right: 16,
    height: 0,
    bottom: -8,
    position: 'absolute',
    borderLeft: '7px solid transparent',
    borderRight: '7px solid transparent',
    borderTop: '8px solid var(--color-surface)',
  };
}

function antennaTipStyle(rarity: Rarity | undefined): CSSProperties {
  const color = accentForRarity(rarity);

  return {
    top: -14,
    width: 8,
    height: 8,
    left: '50%',
    background: color,
    position: 'absolute',
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    boxShadow: `0 0 6px 2px color-mix(in srgb, ${color} 60%, transparent)`,
  };
}

function cursorStyle(visible: boolean): CSSProperties {
  return {
    width: 8,
    display: 'inline-block',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.1s',
  };
}

export function Mascot({ rarity, isIndex }: MascotProps) {
  const [pos, setPos] = useState<Pos>(() => {
    const saved = loadSavedPos();
    return saved && isPosInViewport(saved) ? saved : defaultPos();
  });

  const homePos = useRef<Pos>(pos);
  const [isLifted, setIsLifted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [idleTick, setIdleTick] = useState(0);
  const [isTalking, setIsTalking] = useState(false);
  const [fullLine, setFullLine] = useState('');
  const [shownLine, setShownLine] = useState('');

  const dragOffset = useRef<Pos>({ x: 0, y: 0 });
  const dragStart = useRef<Pos>({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const lastLine = useRef('');

  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const say = useCallback((ctx: MascotContext) => {
    if (typeTimer.current) clearInterval(typeTimer.current);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);

    const line = pickLine(ctx, lastLine.current);
    lastLine.current = line;

    setFullLine(line);
    setIsTalking(true);

    if (prefersReducedMotion) {
      setShownLine(line);
      bubbleTimer.current = setTimeout(() => setIsTalking(false), BUBBLE_LINGER_MS);
      return;
    }

    setShownLine('');
    let i = 0;

    typeTimer.current = setInterval(() => {
      i += 1;
      setShownLine(line.slice(0, i));

      if (i >= line.length) {
        clearInterval(typeTimer.current!);
        typeTimer.current = null;
        bubbleTimer.current = setTimeout(() => setIsTalking(false), BUBBLE_LINGER_MS);
      }
    }, CHAR_MS);
  }, []);

  useEffect(() => {
    function onResize() {
      const next = defaultPos();
      homePos.current = next;
      setPos(next);
      savePos(next);
    }

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!isIndex) return;
    const t = setTimeout(() => say('greeting'), 800);
    return () => clearTimeout(t);
  }, [say, isIndex]);

  useEffect(() => {
    const t = setTimeout(() => say(resolvePageContext(rarity)), 3200);
    return () => clearTimeout(t);
  }, [say, rarity]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    idleAnimRef.current = setInterval(() => setIdleTick((t) => t + 1), 50);

    return () => {
      if (idleAnimRef.current) clearInterval(idleAnimRef.current);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    function scheduleBlink() {
      const delay = BLINK_BASE_MS + Math.random() * 2000;

      blinkTimer.current = setTimeout(() => {
        setIsBlinking(true);

        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, delay);
    }

    scheduleBlink();

    return () => {
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isDragging) return;

    const t = setInterval(() => {
      if (!isTalking) say('idle');
    }, IDLE_QUIP_MS);

    return () => clearInterval(t);
  }, [isDragging, isTalking, say]);

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    dragStart.current = { x: e.clientX, y: e.clientY };
    hasDragged.current = false;

    setIsLifted(true);
    setIsDragging(true);
    setIsSnapping(false);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging) return;

    const dx = Math.abs(e.clientX - dragStart.current.x);
    const dy = Math.abs(e.clientY - dragStart.current.y);
    if (dx > 4 || dy > 4) hasDragged.current = true;

    setPos(
      clamp(e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y, window.innerWidth, window.innerHeight),
    );
  }

  function onPointerUp() {
    if (!isDragging) return;
    setIsLifted(false);
    setIsDragging(false);

    if (hasDragged.current) {
      setIsSnapping(true);
      setPos(homePos.current);
      savePos(homePos.current);
      setTimeout(() => setIsSnapping(false), SNAP_MS + 50);
    }
  }

  function onClick() {
    if (hasDragged.current) return;
    setIsClicked(true);
    say('click');
    setTimeout(() => setIsClicked(false), 320);
  }

  function onMouseEnter() {
    setIsHovered(true);
    if (!isTalking) say('hover');
  }

  function onMouseLeave() {
    setIsHovered(false);
  }

  const bodyState = resolveBodyState(isHovered, isClicked, isLifted);
  const mouthState = resolveMouthState(isHovered, isClicked);
  const isArmsRaised = isHovered || isClicked;

  const bobY = prefersReducedMotion ? 0 : bobOffset(idleTick);
  const showCursor = isTalking && isStillTyping(shownLine, fullLine);

  return (
    <Fragment>
      <div style={bubbleFixedStyle(isTalking, isDragging, pos)}>
        <div style={bubbleBoxStyle()}>
          {shownLine || fullLine}
          <span style={cursorStyle(showCursor)}>|</span>
        </div>

        <div style={bubbleArrowOuterStyle()} />
        <div style={bubbleArrowInnerStyle()} />
      </div>

      <div
        role="img"
        onClick={onClick}
        onPointerUp={onPointerUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        aria-label="LGTM's Mascot Pierre"
        style={containerStyle(pos, isDragging, isSnapping)}
      >
        <div style={{ transform: `translateY(${bobY}px)` }}>
          <div style={bodyStyle(bodyState)}>
            <div style={armStyle('left', isArmsRaised)} />
            <div style={armStyle('right', isArmsRaised)} />

            <div
              style={{
                top: 0,
                left: 8,
                width: 40,
                height: 36,
                borderRadius: 6,
                position: 'absolute',
                imageRendering: 'pixelated',
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border-mascot)',
              }}
            >
              <div
                style={{
                  top: -10,
                  left: '50%',
                  width: 4,
                  height: 10,
                  borderRadius: 2,
                  position: 'absolute',
                  transform: 'translateX(-50%)',
                  background: 'var(--color-border-mascot)',
                }}
              />

              <div style={antennaTipStyle(rarity)} />

              <div
                style={{
                  top: 10,
                  left: 0,
                  right: 0,
                  gap: 8,
                  display: 'flex',
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={eyeStyle(isBlinking)} />
                <div style={eyeStyle(isBlinking)} />
              </div>

              <div style={mouthStyle(mouthState)} />
            </div>

            <div
              style={{
                top: 32,
                left: 12,
                width: 32,
                height: 28,
                borderRadius: 4,
                position: 'absolute',
                border: '2px solid var(--color-border-mascot)',
                background: 'var(--color-surface-raised)',
              }}
            >
              <div
                style={{
                  top: 6,
                  width: 14,
                  height: 8,
                  left: '50%',
                  opacity: 0.9,
                  borderRadius: 2,
                  position: 'absolute',
                  transform: 'translateX(-50%)',
                  background: accentForRarity(rarity),
                }}
              />
            </div>

            <div
              style={{
                left: 14,
                bottom: 0,
                width: 10,
                height: 10,
                borderRadius: 2,
                position: 'absolute',
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border-mascot)',
              }}
            />

            <div
              style={{
                bottom: 0,
                right: 14,
                width: 10,
                height: 10,
                borderRadius: 2,
                position: 'absolute',
                background: 'var(--color-surface)',
                border: '2px solid var(--color-border-mascot)',
              }}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
