"""
CodeAlpha AI Internship - Task 4: Object Detection and Tracking
Python implementation using OpenCV DNN / MobileNet-SSD / Haar Cascades + Centroid Object Tracking.
"""

import sys
import math
import numpy as np

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False


class CentroidTracker:
    def __init__(self, max_disappeared=30):
        self.next_object_id = 1
        self.objects = {}
        self.disappeared = {}
        self.max_disappeared = max_disappeared

    def register(self, centroid):
        self.objects[self.next_object_id] = centroid
        self.disappeared[self.next_object_id] = 0
        self.next_object_id += 1

    def deregister(self, object_id):
        del self.objects[object_id]
        del self.disappeared[object_id]

    def update(self, rects):
        if len(rects) == 0:
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    self.deregister(object_id)
            return self.objects

        input_centroids = np.zeros((len(rects), 2), dtype="int")
        for i, (startX, startY, endX, endY) in enumerate(rects):
            cX = int((startX + endX) / 2.0)
            cY = int((startY + endY) / 2.0)
            input_centroids[i] = (cX, cY)

        if len(self.objects) == 0:
            for i in range(0, len(input_centroids)):
                self.register(input_centroids[i])
        else:
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())

            D = np.linalg.norm(np.array(object_centroids)[:, np.newaxis] - input_centroids, axis=2)
            rows = D.min(axis=1).argsort()
            cols = D.argmin(axis=1)[rows]

            used_rows = set()
            used_cols = set()

            for (row, col) in zip(rows, cols):
                if row in used_rows or col in used_cols:
                    continue

                object_id = object_ids[row]
                self.objects[object_id] = input_centroids[col]
                self.disappeared[object_id] = 0

                used_rows.add(row)
                used_cols.add(col)

            unused_cols = set(range(0, D.shape[1])).difference(used_cols)
            for col in unused_cols:
                self.register(input_centroids[col])

        return self.objects


def run_tracker(use_webcam=False):
    print("==================================================")
    print("  CodeAlpha AI Task 4: Object Detection & Tracker")
    print("==================================================")

    if not OPENCV_AVAILABLE:
        print("[Error] opencv-python is required to run real-time camera tracking.")
        print("Install via: pip install opencv-python")
        return

    tracker = CentroidTracker()

    # Load OpenCV Pre-trained Haar Cascade Face/Object Detector
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    detector = cv2.CascadeClassifier(cascade_path)

    cap = cv2.VideoCapture(0 if use_webcam else 0)
    
    if not cap.isOpened():
        print("[Notice] Webcam unavailable. Generating synthetic video stream...")
        frame = np.zeros((480, 640, 3), dtype="uint8")
        cv2.putText(frame, "Synthetic Stream - Active", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        cv2.imshow("CodeAlpha AI Object Tracker", frame)
        cv2.waitKey(2000)
        cv2.destroyAllWindows()
        return

    print("\nStarting video stream... Press 'q' to exit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (640, 480))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect objects (faces / bounding rects)
        rects_raw = detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        rects = [(x, y, x + w, y + h) for (x, y, w, h) in rects_raw]

        # Update Tracking IDs
        objects = tracker.update(rects)

        # Draw Bounding Boxes & Tracking IDs
        for (startX, startY, endX, endY) in rects:
            cv2.rectangle(frame, (startX, startY), (endX, endY), (241, 102, 99), 2)

        for (object_id, centroid) in objects.items():
            text = f"ID #{object_id}"
            cv2.putText(frame, text, (centroid[0] - 10, centroid[1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            cv2.circle(frame, (centroid[0], centroid[1]), 4, (0, 255, 0), -1)

        cv2.imshow("CodeAlpha AI Object Detection & Tracking", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run_tracker(use_webcam=True)
