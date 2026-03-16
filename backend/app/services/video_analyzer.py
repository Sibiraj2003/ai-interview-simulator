import cv2
import numpy as np
import mediapipe as mp

# ---------------- FACE DETECTOR ----------------

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# ---------------- MEDIAPIPE FACE MESH ----------------

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=5,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

# ---------------- HEAD DIRECTION ----------------

def estimate_head_direction(landmarks):

    nose = landmarks[1]
    left_face = landmarks[234]
    right_face = landmarks[454]

    center_x = (left_face.x + right_face.x) / 2

    if nose.x < center_x - 0.02:
        return "looking_left"

    elif nose.x > center_x + 0.02:
        return "looking_right"

    else:
        return "looking_forward"


# ---------------- FRAME ANALYSIS ----------------

def analyze_frame(image_bytes):

    nparr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"error": "invalid_image"}

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    # Haar detection
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=4,
        minSize=(30, 30)
    )

    haar_count = len(faces)

    # MediaPipe detection
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb)

    mediapipe_count = 0

    if results.multi_face_landmarks:
        mediapipe_count = len(results.multi_face_landmarks)

    # Decide final face count
    if mediapipe_count > 0:
        face_count = mediapipe_count
    else:
        face_count = haar_count

    # Remove ghost detections
    if mediapipe_count == 0 and haar_count <= 1:
        face_count = 0

    # ---------------- ENGAGEMENT ----------------

    if face_count == 0:

        engagement = "no_face_detected"
        head_direction = "unknown"

    elif face_count > 1:

        engagement = "multiple_faces"
        head_direction = "unknown"

    else:

        if results.multi_face_landmarks:

            landmarks = results.multi_face_landmarks[0].landmark
            head_direction = estimate_head_direction(landmarks)

            if head_direction == "looking_forward":
                engagement = "focused"
            else:
                engagement = "distracted"

        else:

            head_direction = "unknown"
            engagement = "face_detected"

    return {
        "faces_detected": face_count,
        "engagement": engagement,
        "head_direction": head_direction,
        "face_count": face_count
    }