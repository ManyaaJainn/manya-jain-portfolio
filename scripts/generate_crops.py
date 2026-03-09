# scripts/generate_crops.py
from PIL import Image, ImageOps
import os, json, sys

try:
    import face_recognition
    FACE_LIB = 'face_recognition'
except Exception:
    FACE_LIB = None

ASSETS_DIR = 'assets'
ORIGS = {
    'photo1': 'assets/original_photo1.jpg',  # adjust extension if necessary
    'photo2': 'assets/original_photo2.jpg'
}
HERO_SIZES = [(2400,1350),(1600,900),(1024,576),(768,432),(480,270)]
PORTRAIT_SIZES = [(1200,1200),(600,600),(300,300)]

def detect_face_center(path):
    if FACE_LIB == 'face_recognition':
        img = face_recognition.load_image_file(path)
        boxes = face_recognition.face_locations(img)
        if boxes:
            # pick largest
            boxes_sorted = sorted(boxes, key=lambda b: (b[2]-b[0])*(b[1]-b[3]), reverse=True)
            top, right, bottom, left = boxes_sorted[0]
            cx = (left + right) / 2
            cy = (top + bottom) / 2
            h, w = img.shape[:2]
            return (cx*100.0/w, cy*100.0/h)
    # fallback -> center
    with Image.open(path) as im:
        w,h = im.size
    return (50.0, 50.0)

def smart_crop_and_save(src_path, out_prefix, target_w, target_h, focus_x_pct, focus_y_pct):
    with Image.open(src_path) as im:
        w,h = im.size
        target_ratio = target_w / target_h
        src_ratio = w / h
        if src_ratio > target_ratio:
            # crop width
            new_w = int(target_ratio * h)
            focus_x = focus_x_pct / 100.0
            left = int(max(0, min(w-new_w, int(w*focus_x - new_w/2))))
            box = (left, 0, left+new_w, h)
        else:
            # crop height
            new_h = int(w / target_ratio)
            focus_y = focus_y_pct / 100.0
            top = int(max(0, min(h-new_h, int(h*focus_y - new_h/2))))
            box = (0, top, w, top+new_h)
        cropped = im.crop(box).resize((target_w, target_h), Image.LANCZOS)
        jpg_path = f"{out_prefix}.jpg"
        webp_path = f"{out_prefix}.webp"
        cropped.save(jpg_path, 'JPEG', quality=85, optimize=True)
        cropped.save(webp_path, 'WEBP', quality=80, method=6)
        return jpg_path, webp_path

def ensure_outputs():
    os.makedirs(ASSETS_DIR, exist_ok=True)
    focal = {}
    for key, src in ORIGS.items():
        if not os.path.exists(src):
            print(f"Missing source: {src}. Please ensure asset exists.", file=sys.stderr)
            continue
        fx, fy = detect_face_center(src)
        focal[key] = {'focus_x_pct': round(fx,1), 'focus_y_pct': round(fy,1)}
        if key == 'photo1':
            for w,h in HERO_SIZES:
                out_prefix = f"{ASSETS_DIR}/{key}-{w}-{h}"
                smart_crop_and_save(src, out_prefix, w, h, fx, fy)
        else:
            for w,h in PORTRAIT_SIZES:
                out_prefix = f"{ASSETS_DIR}/{key}-{w}-{h}"
                smart_crop_and_save(src, out_prefix, w, h, fx, fy)
    with open(os.path.join(ASSETS_DIR, 'focal_points.json'), 'w', encoding='utf-8') as f:
        json.dump(focal, f, indent=2)
    print("done. focal_points.json written.")

if __name__ == '__main__':
    ensure_outputs()
