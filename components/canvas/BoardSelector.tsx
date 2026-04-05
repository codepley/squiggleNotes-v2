'use client';

/**
 * BoardPanel — sidebar showing all boards with ability to switch, create, and delete
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNoteStore } from '@/store/noteStore';
import { cn } from '@/lib/utils';

export function BoardPanel() {
  const { boards, activeBoardId, createBoard, deleteBoard, switchBoard, renameBoard, duplicateBoard } =
    useNoteStore();
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  if (boards.length === 0) return null;

  const handleRename = (boardId: string, currentName: string) => {
    setEditingBoardId(boardId);
    setEditingName(currentName);
    setShowMenu(null);
  };

  const handleSaveRename = (boardId: string) => {
    if (editingName.trim()) {
      renameBoard(boardId, editingName.trim());
    }
    setEditingBoardId(null);
  };

  return (
    <div className="w-56 bg-[#0A0A0C] border-r border-white/[0.06] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F0EDE6]/70">Boards</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={createBoard}
            className="w-6 h-6 rounded-md flex items-center justify-center bg-[#4F6EF7]/20 text-[#4F6EF7] hover:bg-[#4F6EF7]/30 transition-colors text-xs font-bold"
            title="New board"
          >
            +
          </motion.button>
        </div>

        {/* Boards List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {boards.map((board, index) => (
              <motion.div
                key={board.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div
                onClick={() => switchBoard(board.id)}
                className={cn(
                  'w-full text-left px-4 py-3 border-l-2 transition-all flex items-center justify-between group/item cursor-pointer',
                  activeBoardId === board.id
                    ? 'bg-[#4F6EF7]/10 border-l-[#4F6EF7] text-[#F0EDE6]'
                    : 'border-l-transparent hover:bg-white/[0.02] text-[#F0EDE6]/60',
                )}
              >
                {editingBoardId === board.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleSaveRename(board.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(board.id);
                      if (e.key === 'Escape') setEditingBoardId(null);
                      e.stopPropagation();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-2 py-1 rounded bg-[#4F6EF7]/20 border border-[#4F6EF7] text-[#F0EDE6] text-xs focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]"
                  />
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{board.name}</p>
                      <p className="text-[10px] text-[#F0EDE6]/30">
                        {board.canvasData.strokes.length + board.canvasData.textBlocks.length} items
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Menu button - outside the main div */}
              <div
                className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 relative z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(showMenu === board.id ? null : board.id);
                  }}
                  className="p-1 rounded hover:bg-white/[0.1] text-[#F0EDE6]/50 hover:text-[#F0EDE6] transition-colors"
                >
                  <span className="text-sm">⋯</span>
                </motion.button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {showMenu === board.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 bg-[#1A1A1C] border border-white/[0.08] rounded-lg shadow-xl overflow-hidden z-50 min-w-max"
                    >
                      <button
                        onClick={() => handleRename(board.id, board.name)}
                        className="w-full text-left px-3 py-2 text-xs text-[#F0EDE6]/70 hover:bg-white/[0.05] hover:text-white transition-colors"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          duplicateBoard(board.id);
                          setShowMenu(null);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#F0EDE6]/70 hover:bg-white/[0.05] hover:text-white transition-colors"
                      >
                        Duplicate
                      </button>
                      {boards.length > 1 && (
                        <button
                          onClick={() => {
                            deleteBoard(board.id);
                            setShowMenu(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-[#FF453A]/70 hover:bg-[#FF453A]/5 hover:text-[#FF453A] transition-colors border-t border-white/[0.06]"
                        >
                          Delete
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
