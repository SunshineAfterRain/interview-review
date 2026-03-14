import { create } from 'zustand';
import { noteRepo } from '../db/repositories/noteRepo';
import type { Note, NoteState } from '../types';

interface NoteStore extends NoteState {
  // Actions
  loadNotes: () => Promise<void>;
  getNoteByQuestion: (questionId: string) => Note | undefined;
  createNote: (questionId: string, content: string, tags?: string[]) => Promise<Note>;
  updateNote: (id: string, content: string, tags?: string[]) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  deleteNoteByQuestion: (questionId: string) => Promise<void>;
  searchNotes: (query: string) => Promise<Note[]>;
  getNotesByTag: (tag: string) => Promise<Note[]>;
  getAllTags: () => string[];
  getNoteCount: () => Promise<number>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: {},
  isLoading: false,
  error: null,

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const allNotes = await noteRepo.getAll();
      const notesMap = allNotes.reduce((acc, note) => {
        acc[note.questionId] = note;
        return acc;
      }, {} as Record<string, Note>);
      
      set({ notes: notesMap, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  getNoteByQuestion: (questionId: string) => {
    return get().notes[questionId];
  },

  createNote: async (questionId: string, content: string, tags: string[] = []) => {
    try {
      const note = await noteRepo.create({ questionId, content, tags });
      set((state) => ({
        notes: { ...state.notes, [questionId]: note },
      }));
      return note;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateNote: async (id: string, content: string, tags?: string[]) => {
    try {
      const note = await noteRepo.update(id, { content, tags });
      set((state) => ({
        notes: { ...state.notes, [note.questionId]: note },
      }));
      return note;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    try {
      const notes = get().notes;
      const questionId = Object.keys(notes).find(k => notes[k].id === id);
      
      if (questionId) {
        await noteRepo.delete(id);
        set((state) => {
          const { [questionId]: _, ...rest } = state.notes;
          return { notes: rest };
        });
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteNoteByQuestion: async (questionId: string) => {
    try {
      await noteRepo.deleteByQuestionId(questionId);
      set((state) => {
        const { [questionId]: _, ...rest } = state.notes;
        return { notes: rest };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  searchNotes: async (query: string) => {
    return noteRepo.search(query);
  },

  getNotesByTag: async (tag: string) => {
    return noteRepo.getByTag(tag);
  },

  getAllTags: () => {
    const notes = Object.values(get().notes);
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  },

  getNoteCount: async () => {
    return noteRepo.count();
  },
}));
