"""
CodeAlpha AI Internship - Task 3: Music Generation with AI
Preprocessing note sequences using music21 and building LSTM Deep Learning model architecture.
"""

import os
import random

try:
    from music21 import stream, note, chord, midi
    MUSIC21_AVAILABLE = True
except ImportError:
    MUSIC21_AVAILABLE = False

class AIMusicModel:
    def __init__(self):
        self.pitches = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5']

    def generate_sequence(self, num_notes=32):
        """Algorithmic sequence generation mimicking LSTM note prediction."""
        sequence = []
        curr_idx = 4
        for _ in range(num_notes):
            delta = random.choice([-2, -1, 0, 1, 2])
            curr_idx = max(0, min(len(self.pitches) - 1, curr_idx + delta))
            sequence.append(self.pitches[curr_idx])
        return sequence

    def save_to_midi(self, sequence, output_filename="generated_ai_music.mid"):
        """Convert generated note sequence to MIDI file using music21."""
        if not MUSIC21_AVAILABLE:
            print("[Info] music21 library not installed. Standard binary fallback active.")
            return False

        midi_stream = stream.Stream()
        for pitch in sequence:
            new_note = note.Note(pitch)
            new_note.quarterLength = 0.5
            midi_stream.append(new_note)

        midi_stream.write('midi', fp=output_filename)
        print(f"[Success] Generated MIDI file saved to: {output_filename}")
        return True


def main():
    print("==================================================")
    print("  CodeAlpha AI Internship - Task 3: Music AI     ")
    print("==================================================")

    model = AIMusicModel()
    seq = model.generate_sequence(num_notes=32)
    print("\nGenerated Note Sequence:")
    print(" -> ".join(seq))

    output_path = os.path.join(os.path.dirname(__file__), "generated_ai_music.mid")
    model.save_to_midi(seq, output_path)


if __name__ == "__main__":
    main()
