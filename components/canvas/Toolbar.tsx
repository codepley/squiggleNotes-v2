'use client';

/**
 * Toolbar — pen/highlighter/eraser/text toggle, color picker, stroke width.
 * Framer Motion: scale + opacity on hover/tap, layout animation for active indicator.
 */

import { motion } from 'framer-motion';
import { useNoteStore, type ActiveTool } from '@/store/noteStore';
import { useCanvas } from '@/hooks/useCanvas';
import { cn } from '@/lib/utils';

// ─── Tool Icon Components ─────────────────────────────────────────────────────

function EraserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      {/* Eraser body */}
      <path d="M7 18L3 14L14 3L18 7L7 18Z" />
      {/* Eraser tip corner */}
      <path d="M3 14L7 18" strokeWidth="2.5" />
    </svg>
  );
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

interface ToolDef {
  id: ActiveTool;
  label: string;
  icon: string | React.ReactNode;
}

const TOOLS: ToolDef[] = [
  { id: 'pen', label: 'Pen', icon: '✏️' },
  { id: 'highlighter', label: 'Highlight', icon: '🖍️' },
  { id: 'eraser', label: 'Eraser', icon: <EraserIcon /> },
  { id: 'text', label: 'Text', icon: '𝐓' },
  { id: 'review', label: 'Review', icon: '🔍' },
];

const COLORS = [
  '#1C1C1E', // ink black
  '#4F6EF7', // accent blue
  '#FF453A', // danger red
  '#30D158', // success green
  '#F5A623', // amber
  '#AF52DE', // purple
];

const STROKE_WIDTHS = [1, 2, 4, 6];

// ─── Component ────────────────────────────────────────────────────────────────

export function Toolbar() {
  const { activeTool, activeColor, strokeWidth, setActiveTool, setActiveColor, setStrokeWidth } =
    useNoteStore();
  const { undo, redo, canUndo, canRedo } = useCanvas();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#1A1A1C]/90 backdrop-blur-xl px-2 py-1.5 shadow-2xl"
    >
      {/* ── Tool buttons ─── */}
      <div className="flex items-center gap-0.5 border-r border-white/[0.06] pr-2">
        {TOOLS.map((tool) => (
          <motion.button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-lg text-sm transition-colors',
              activeTool === tool.id
                ? 'text-white'
                : 'text-[#F0EDE6]/50 hover:text-[#F0EDE6]/80',
            )}
            title={tool.label}
          >
            {/* Active indicator */}
            {activeTool === tool.id && (
              <motion.div
                layoutId="active-tool"
                className="absolute inset-0 rounded-lg bg-[#4F6EF7]/20 border border-[#4F6EF7]/30"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {typeof tool.icon === 'string' ? tool.icon : tool.icon}
            </span>
          </motion.button>
        ))}
      </div>

      {/* ── Color picker ─── */}
      <div className="flex items-center gap-1 border-r border-white/[0.06] px-2">
        {COLORS.map((color) => (
          <motion.button
            key={color}
            onClick={() => setActiveColor(color)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'w-5 h-5 rounded-full border-2 transition-all',
              activeColor === color
                ? 'border-white scale-110'
                : 'border-transparent hover:border-white/30',
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* ── Stroke width ─── */}
      <div className="flex items-center gap-1 border-r border-white/[0.06] px-2">
        {STROKE_WIDTHS.map((w) => (
          <motion.button
            key={w}
            onClick={() => setStrokeWidth(w)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-md transition-colors',
              strokeWidth === w
                ? 'bg-white/10'
                : 'hover:bg-white/[0.05]',
            )}
            title={`${w}px`}
          >
            <div
              className="rounded-full bg-[#F0EDE6]"
              style={{ width: w + 4, height: w + 4 }}
            />
          </motion.button>
        ))}
      </div>

      {/* ── Undo / Redo ─── */}
      <div className="flex items-center gap-0.5 pl-1">
        <motion.button
          onClick={undo}
          disabled={!canUndo}
          whileHover={canUndo ? { scale: 1.08 } : {}}
          whileTap={canUndo ? { scale: 0.92 } : {}}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors',
            canUndo ? 'text-[#F0EDE6]/70 hover:text-white' : 'text-[#F0EDE6]/20 cursor-not-allowed',
          )}
          title="Undo"
        >
          ↩
        </motion.button>
        <motion.button
          onClick={redo}
          disabled={!canRedo}
          whileHover={canRedo ? { scale: 1.08 } : {}}
          whileTap={canRedo ? { scale: 0.92 } : {}}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors',
            canRedo ? 'text-[#F0EDE6]/70 hover:text-white' : 'text-[#F0EDE6]/20 cursor-not-allowed',
          )}
          title="Redo"
        >
          ↪
        </motion.button>
      </div>
    </motion.div>
  );
}
