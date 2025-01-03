import requests
import json
import time

def get_model_info(model_id, api_token):
    """
    Lấy thông tin model từ Sketchfab Data API dựa trên model ID.
    Lấy link embed thay vì link viewer.

    Args:
        model_id (str): ID của model.
        api_token (str): Sketchfab API token.

    Returns:
        dict: Thông tin model hoặc None nếu có lỗi.
    """
    url = f"https://api.sketchfab.com/v3/models/{model_id}"
    headers = {"Authorization": f"Token {api_token}"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()

        model_info = {
            "title": data["name"],
            "author": data["user"]["displayName"],
            "url": data["embedUrl"],
            "authorUrl": data["user"]["profileUrl"],
            "sketchfabUrl": "https://sketchfab.com",
            "downloadLink": None
        }

        for format in data.get("download", []):
            if format["format"] == "glb":
                model_info["downloadLink"] = format["url"]
                break
            elif model_info["downloadLink"] is None:
                model_info["downloadLink"] = format["url"]

        return model_info
    except requests.exceptions.RequestException as e:
        print(f"Lỗi khi lấy thông tin model {model_id}: {e}")
        if response:
            print(f"Status code: {response.status_code}, Response: {response.text}")
            if response.status_code == 429:
                print("Rate limit exceeded (429).")
                return "RATE_LIMIT" # Trả về thông báo rate limit
        return None

def process_model_urls(json_file, api_token, output_file="model_info.json"):
    """
    Đọc file JSON chứa các URL, lấy thông tin chi tiết qua API, in ra thông tin JSON và lưu vào file mới.
    Thoát và lưu file ngay lập tức khi gặp lỗi rate limit 429.

    Args:
        json_file (str): Đường dẫn đến file JSON chứa danh sách các URL.
        api_token (str): Sketchfab API token.
        output_file (str): Tên file để lưu thông tin model.
    """
    try:
        with open(json_file, "r") as f:
            model_urls = json.load(f)
    except FileNotFoundError:
        print(f"Lỗi: Không tìm thấy file {json_file}")
        return
    except json.JSONDecodeError:
        print(f"Lỗi: File {json_file} không đúng định dạng JSON.")
        return

    model_info_list = []
    for i, url in enumerate(model_urls):
        model_id = url.split('-')[-1]
        print(f"Đang lấy thông tin cho model: {url} (ID: {model_id})")
        model_info = get_model_info(model_id, api_token)
        
        if model_info == "RATE_LIMIT":
            print(f"Lưu thông tin vào file {output_file} (bị rate limit)")
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(model_info_list, f, indent=4, ensure_ascii=False)
            print("Đã lưu và thoát do rate limit.")
            return

        if model_info:
            model_info_list.append(model_info)
            print("Thông tin model đã lấy:")
            print(json.dumps(model_info, indent=4, ensure_ascii=False))  # In thông tin JSON
        else:
            print(f"Không thể lấy thông tin cho model: {url}")

        #time.sleep(1)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(model_info_list, f, indent=4, ensure_ascii=False)

    print(f"Đã lưu thông tin vào file {output_file}")

# Thay thế bằng API token của bạn
api_token = "871230499397425b93ba976d96d76a8d"
# Thay thế bằng đường dẫn đến file JSON chứa các URL
json_file = "featured_models.json"

process_model_urls(json_file, api_token)