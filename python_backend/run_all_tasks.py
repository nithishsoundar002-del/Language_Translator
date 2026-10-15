"""
CodeAlpha AI Internship - Unified Python Tasks Launcher Hub
"""

import sys
import os

sys.path.append(os.path.dirname(__file__))

def print_menu():
    print("\n========================================================")
    print("   CodeAlpha Artificial Intelligence Internship Suite   ")
    print("========================================================")
    print("  [1] Task 1: Language Translation Tool")
    print("  [2] Task 2: Chatbot for FAQs (NLP & Cosine Similarity)")
    print("  [3] Task 3: Music Generation with AI (MIDI)")
    print("  [4] Task 4: Object Detection & Tracking (OpenCV)")
    print("  [5] Exit")
    print("========================================================")

def main():
    while True:
        print_menu()
        choice = input("Select a task number to run (1-5): ").strip()

        if choice == '1':
            from task1_translator.translator import main as task1_main
            task1_main()
        elif choice == '2':
            from task2_faq_chatbot.chatbot import main as task2_main
            task2_main()
        elif choice == '3':
            from task3_music_generator.generate_midi import main as task3_main
            task3_main()
        elif choice == '4':
            from task4_object_detection.object_tracker import run_tracker
            run_tracker(use_webcam=True)
        elif choice == '5':
            print("\nThank you for evaluating CodeAlpha AI Internship tasks!")
            break
        else:
            print("\nInvalid choice. Please select 1-5.")

if __name__ == "__main__":
    main()
